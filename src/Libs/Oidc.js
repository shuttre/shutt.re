import { codec, hash } from "sjcl";
import ShuttreApiClient from "./ShuttreApiClient";

class Oidc {

    constructor() {
        this.api = new ShuttreApiClient();
    }

    generateAndStoreCodeVerifier() {
        let array = new Uint8Array(64);
        window.crypto.getRandomValues(array);
        let verifier = btoa(String.fromCharCode.apply(null, array))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        let challenge = codec.base64.fromBits(hash.sha256.hash(verifier))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        let pkce = {
            "verifier": verifier,
            "challenge": challenge
        };

        localStorage.setItem("pkce", JSON.stringify(pkce));

        return pkce;
    }

    getAuthenticateUrl(
        auth_endpoint,
        client_id,
        aud,
        callback,
        challenge) {

        return `${auth_endpoint}?` +
            `audience=${aud}&` +
            "scope=openid profile email&" +
            `response_type=code&` +
            `client_id=${client_id}&` +
            `code_challenge=${challenge}&` +
            `code_challenge_method=S256&` +
            `redirect_uri=${callback}`;
    }

    loginError() {
        window.location.href = "/loginError";
    }

    static getAccessToken() {
        if (!Oidc.isAuthenticated()) { return null; }
        return localStorage.getItem("access_token");
    }

    static getJwtStr() {
        if (!Oidc.isAuthenticated()) { return null; }
        let jwt = localStorage.getItem("jwt");
        return jwt;
    }

    static getJwt() {
        try {
            let jwt = Oidc.getJwtStr();
            if (jwt == null) { return null; }
            return JSON.parse(jwt);
        }
        catch {
            return null;
        }
    }

    async authenticateRedirectIfNeeded() {
        // TODO: Login again if close to end of jwt.exp and long time no seen (or something similar)
        if (!Oidc.isAuthenticated()) {
            await this.authenticateRedirect();
        }
    }

    async authenticateRedirect() {
        try {
            let config = await this.api.getConfig();
            let pkce = await this.generateAndStoreCodeVerifier();

            if (config == null ||
                config.auth_endpoint == null ||
                config.client_id == null ||
                config.aud == null ||
                config.callback == null)
            {
                this.loginError();
            }

            let authenticate_url = this.getAuthenticateUrl(
                config.auth_endpoint,
                config.client_id,
                config.aud,
                config.callback,
                pkce.challenge);

            localStorage.setItem("hrefWhenInitLogin", window.location.href);

            window.location.href = authenticate_url;
        }
        catch (e) {
            this.loginError();
        }
    }

    async fetchTokensAndLogin() {

        let config = await this.api.getConfig();

        if (config == null ||
            config.auth_endpoint == null ||
            config.client_id == null ||
            config.aud == null ||
            config.callback == null)
        {
            this.loginError();
        }

        let url = new URL(window.location.href);
        let code = url.searchParams.get("code");

        if (code == null || code.length === 0) {
            console.error("code was null or empty");
            this.loginError();
        }

        let pkce = localStorage.getItem("pkce");
        if (pkce == null) { return false; }
        pkce = JSON.parse(pkce);

        if (pkce == null) {
            console.error("pkce was null");
            this.loginError();
        }

        let body = {
            "grant_type": "authorization_code",
            "client_id": config.client_id,
            "code_verifier": pkce.verifier,
            "code": code,
            "redirect_uri": config.callback
        };

        try {
            let response = await fetch(config.token_endpoint, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: new Headers({
                    "Content-Type": "application/json"
                })
            });

            if (response.status !== 200) {
                console.debug("fetchTokensAndLogin(): response.status !== 200");
                return false;
            }

            let token_response = await response.json();

            console.debug("token_response");
            console.debug(token_response);

            let r = this.saveTokens(token_response);

            if (r) {
                let formerHref = localStorage.getItem("hrefWhenInitLogin");
                if (formerHref == null || formerHref.endsWith("/loggedout")) {
                    formerHref = "/";
                }
                window.location.href = formerHref;
            }
            else {
                window.location.href = "/loginFailed";
            }

            return true;
        }
        catch (error) {
            console.error("Error in fetchTokensAndLogin(): " + error);
            return false;
        }


    }

    saveTokens(token_response) {
        let at = token_response.access_token;
        let jwt = this.getJwtFromAccessToken(at);

        if (jwt == null) return false;

        localStorage.setItem("access_token", at);
        localStorage.setItem("jwt", JSON.stringify(jwt));
        return true;
    }

    getJwtFromAccessToken(access_token) {
        try {
            let base64Url = access_token.split('.')[1];
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(window.atob(base64));
        }
        catch (e) {
            return null;
        }
    };

    static isAuthenticated() {
        try {
            let jwt = JSON.parse(localStorage.getItem("jwt"));
            return Date.now() / 1000 < jwt.exp;
        }
        catch (e) {
            return false;
        }
    }

    logout(redirect = true) {
        localStorage.clear();
        if (redirect) {
            window.location.href = "/loggedout";
        }
    }

}

export default Oidc;