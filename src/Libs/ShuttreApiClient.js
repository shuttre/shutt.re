/* global shuttreApiBaseUrl */

import Utils from "./Utils"
import Oidc from "./Oidc";

// TODO: Check what happens when method returns null and fetch is not aborted, for all methods.

class ShuttreApiClient {

    static AlbumImageSize = {
        icon: "icon",
        small: "small",
        medium: "medium",
        large: "large",
        fullsize: "fullsize",
        original: "original"
    };

    constructor() {
        this.access_token = Oidc.getAccessToken();
        this.jwt = Oidc.getJwt();
    }

    apiUrl(pathAndQueryStr = "") {
        let url = shuttreApiBaseUrl;
        if (url == null ||
            pathAndQueryStr == null ||
            (pathAndQueryStr.length > 0 && !pathAndQueryStr.startsWith("/")))
        {
            throw new Error(
                `apiUrl() failed. shuttreApiBaseUrl: "${shuttreApiBaseUrl}", pathAndQueryStr: "${pathAndQueryStr}"`
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

    async fetchWritableAlbums(signal) {
        let theUrl = this.apiUrl("/album/list/write");
        let response = await fetch(theUrl, {
            signal: signal,
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

        let albums = await response.json();

        return albums.map(album => ({albumId: album.albumId, albumName: album.albumName}));
    }

    async createNewAlbum(newAlbumName, signal) {
        let theUrl = this.apiUrl("/album/new");
        let response = await fetch(theUrl, {
            method: "POST",
            signal: signal,
            headers: new Headers({
                "Accept": "application/json",
                "Authorization": `Bearer ${this.access_token}`,
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({ albumName: newAlbumName })
        });

        if (response.status === 404) { // STATUS_CODE_NOT_FOUND
            return null;
        }
        if (response.status === 400) { // STATUS_CODE_BAD_REQUEST
            return null;
        }

        let newAlbum = await response.json();

        return newAlbum;
    }

    async AddBrowsableImagesToQueue(albumId, browsableImagePaths, signal) {
        let theUrl = this.apiUrl("/source/addToAlbum");

        let body = [];
        for (let path of browsableImagePaths) {
            body.push({albumId: albumId, path: Utils.b64EncodeUnicode(path)});
        }

        let response = await fetch(theUrl, {
            method: "POST",
            signal: signal,
            headers: new Headers({
                "Accept": "application/json",
                "Authorization": `Bearer ${this.access_token}`,
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(body)
        });

        if (response.status === 404) { // STATUS_CODE_NOT_FOUND
            return null;
        }

        let queueEntries = await response.json();

        return queueEntries;
    }

    async fetchBrowsableSources(signal) {
        let theUrl = this.apiUrl("/source/list");
        let response = await fetch(theUrl, {
            signal: signal,
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

    async fetchBrowsableDirectory(virtualPath, signal) {
        let encodedPath = Utils.b64EncodeUnicode(virtualPath + "/");
        let theUrl = this.apiUrl(`/source/dir?path=${encodedPath}`);

        let response = await fetch(theUrl, {
            signal: signal,
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

    async fetchBrowsablePath(virtualPath, signal) {
        if (virtualPath == null || virtualPath === "" || virtualPath === "/") {
            return await this.fetchBrowsableSources(signal);
        }
        else {
            return await this.fetchBrowsableDirectory(virtualPath, signal);
        }
    }

    async fetchBrowsableImage(virtualPath, signal) {
        let encodedPath = Utils.b64EncodeUnicode(virtualPath);
        let cc = this.getCachePerUserParameter();
        let theUrl = this.apiUrl(`/source/file?path=${encodedPath}${cc}`);

        let response = await fetch(theUrl, {
            signal: signal,
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

    async fetchAlbumImages(albumId, signal) {
        let theUrl = this.apiUrl(`/image/list/${albumId}`);

        let response = await fetch(theUrl, {
            signal: signal,
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

    async fetchAlbumImage(albumId, imageId, size, signal) {
        let theUrl = this.apiUrl(`/image/${albumId}/${imageId}?size=${size}`);
        let response = await fetch(theUrl, {
            signal: signal,
            headers: new Headers({
                "Accept": "application/json",
                "Authorization": `Bearer ${this.access_token}`
            })
        });

        if (response.status === 404) { // STATUS_CODE_NOT_FOUND
            return null;
        }

        let imageBlob = await response.blob();
        let width = response.headers.get("X-Width");
        let height = response.headers.get("X-Height");
        return {
            width: width,
            height: height,
            dataUrl: URL.createObjectURL(imageBlob)
        };
    }

    getCachePerUserParameter() {
        if (this.jwt == null || this.jwt.sub == null) { return "&cpu=shared"; }
        return `&cpu=${Utils.b64EncodeUnicode(this.jwt.sub)}`;
    }
}

ShuttreApiClient.cachedConfig = null;
ShuttreApiClient.cachedConfigPromise = null;

export default ShuttreApiClient;