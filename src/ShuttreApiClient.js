/* global spaConfigApiUrl */

import Utils from "./Utils"
import Oidc from "./Oidc";

class ShuttreApiClient {

    constructor() {
        this.access_token = Oidc.getAccessToken();
        this.jwt = Oidc.getJwt();
    }

    apiUrl(pathAndQueryStr = "") {
        let url = spaConfigApiUrl;
        if (url == null ||
            pathAndQueryStr == null ||
            (pathAndQueryStr.length > 0 && !pathAndQueryStr.startsWith("/")))
        {
            throw new Error(
                `apiUrl() failed. spaConfigApiUrl: "${spaConfigApiUrl}", pathAndQueryStr: "${pathAndQueryStr}"`
            );
        }
        return url + pathAndQueryStr;
    }

    async getConfig() {

        if (ShuttreApiClient.cachedConfig != null) { return ShuttreApiClient.cachedConfig; }

        try {
            if (ShuttreApiClient.cachedConfigPromise == null) {
                let url = this.apiUrl("/spa/config");
                ShuttreApiClient.cachedConfigPromise = fetch(url);
            }
            let response = await ShuttreApiClient.cachedConfigPromise;

            if (!response.ok) {
                ShuttreApiClient.cachedConfig = null;
                ShuttreApiClient.cachedConfigPromise = null;
                throw new Error('Network response was not ok.');
            }

            let config = await response.json();
            if (config == null) {
                ShuttreApiClient.cachedConfig = null;
                ShuttreApiClient.cachedConfigPromise = null;
                throw new Error('response.json() returned null');
            }

            ShuttreApiClient.cachedConfig = config;
            ShuttreApiClient.cachedConfigPromise = null;

            return config;
        }
        catch (error) {
            console.error("Error in getConfig(): " + error);
            return null;
        }
    }

    async fetchBrowsableSources() {
        let theUrl = this.apiUrl("/source/list");
        try {
            let response = await fetch(theUrl, {
                headers: new Headers({
                    "Accept": "application/json",
                    "Authorization": `Bearer ${this.access_token}`
                })
            });

            if (response.status === 404) { // STATUS_CODE_NOT_FOUND
                return null;
            }
            if (response.status === 204) { // STATUS_CODE_NO_CONTENT
                return [];
            }

            let sources = await response.json();

            let iNodes = sources.map(s => ({
                type: "directory",
                name: s
            }));

            return iNodes;
        }
        catch (error) {
            console.error("Error in fetchBrowsableSources(): " + error);
            return null;
        }
    }

    async fetchBrowsableDirectory(virtualPath) {
        let encodedPath = Utils.b64EncodeUnicode(virtualPath + "/");
        let theUrl = this.apiUrl(`/source/dir?path=${encodedPath}`);

        try {
            let response = await fetch(theUrl, {
                headers: new Headers({
                    "Accept": "application/json",
                    "Authorization": `Bearer ${this.access_token}`
                })
            });

            if (response.status === 404) { // STATUS_CODE_NOT_FOUND
                return null;
            }

            let iNodes = [];
            if (response.status !== 204) { // STATUS_CODE_NO_CONTENT
                let dirContent = await response.json();

                iNodes = dirContent.map(x => ({
                    type: x.endsWith("/") ? "directory" : "image",
                    name: x.endsWith("/") ? x.substr(0, x.length-1) : x
                }));
            }

            iNodes.unshift({type: "directory", name: ".."});

            return iNodes;
        }
        catch (error) {
            console.error("Error in fetchBrowsableDirectory(): " + error);
            return null;
        }
    }

    async fetchBrowsablePath(virtualPath) {
        // await Utils.sleep(2000); // simulate slow api response
        if (virtualPath == null || virtualPath === "" || virtualPath === "/") {
            return await this.fetchBrowsableSources();
        }
        else {
            return await this.fetchBrowsableDirectory(virtualPath);
        }
    }

    async fetchBrowsableImage(virtualPath) {
        let encodedPath = Utils.b64EncodeUnicode(virtualPath);
        let cc = this.getCachePerUserParameter();
        let theUrl = this.apiUrl(`/source/file?path=${encodedPath}${cc}`);

        try {
            let response = await fetch(theUrl, {
                headers: new Headers({
                    "Accept": "application/json",
                    "Authorization": `Bearer ${this.access_token}`
                })
            });

            if (response.status === 404) { // STATUS_CODE_NOT_FOUND
                return null;
            }

            let imageBlob = await response.blob();
            return URL.createObjectURL(imageBlob);
        }
        catch (error) {
            console.error("Error in fetchBrowsableImage(): " + error);
            return null;
        }
    }

    async fetchAlbums() {
        let theUrl = this.apiUrl("/album/list");

        try {
            let response = await fetch(theUrl, {
                headers: new Headers({
                    "Accept": "application/json",
                    "Authorization": `Bearer ${this.access_token}`
                })
            });

            if (response.status === 404) { // STATUS_CODE_NOT_FOUND
                return null;
            }

            if (response.status === 204) { // STATUS_CODE_NO_CONTENT
                return [];
            }

            return await response.json()
        }
        catch (error) {
            console.error("Error in fetchAlbums(): " + error);
            return null;
        }
    }

    async fetchImages(albumId) {
        let theUrl = this.apiUrl(`/image/list/${albumId}`);

        try {
            let response = await fetch(theUrl, {
                headers: new Headers({
                    "Accept": "application/json",
                    "Authorization": `Bearer ${this.access_token}`
                })
            });

            if (response.status === 404) { // STATUS_CODE_NOT_FOUND
                return null;
            }

            if (response.status === 204) { // STATUS_CODE_NO_CONTENT
                return [];
            }

            return await response.json()
        }
        catch (error) {
            console.error("Error in fetchImages(): " + error);
            return null;
        }
    }

    async fetchAlbumImage(albumId, imageId) {
        let theUrl = this.apiUrl(`/image/${albumId}/${imageId}?size=icon`);
        console.warn("theUrl: " + theUrl);
        try {

            let response = await fetch(theUrl, {
                headers: new Headers({
                    "Accept": "application/json",
                    "Authorization": `Bearer ${this.access_token}`
                })
            });

            if (response.status === 404) { // STATUS_CODE_NOT_FOUND
                return null;
            }

            let imageBlob = await response.blob();
            return URL.createObjectURL(imageBlob);
        }
        catch (error) {
            console.error("Error in fetchBrowsableImage(): " + error);
            return null;
        }
    }

    getCachePerUserParameter() {
        if (this.jwt == null || this.jwt.sub == null) { return "&cpu=shared"; }
        return `&cpu=${Utils.b64EncodeUnicode(this.jwt.sub)}`;
    }
}

ShuttreApiClient.cachedConfig = null;
ShuttreApiClient.cachedConfigPromise = null;

export default ShuttreApiClient;