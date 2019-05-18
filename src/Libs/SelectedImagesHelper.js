export default class SelectedImagesHelper {

    constructor() {
        this.selectedAlbumImages = null;
        this.selectedBrowsableImages = null;
        this.load();
    }

    load() {
        let saiStr = localStorage.getItem("selectedAlbumImages");
        if (saiStr == null) {
            this.selectedAlbumImages = {};
        }
        else {
            try {
                this.selectedAlbumImages = JSON.parse(saiStr);
            }
            catch {
                this.selectedAlbumImages = {};
            }
        }

        let sbiStr = localStorage.getItem("selectedBrowsableImages");
        if (sbiStr == null) {
            this.selectedBrowsableImages = {};
        }
        else {
            try {
                this.selectedBrowsableImages = JSON.parse(sbiStr);
            }
            catch {
                this.selectedBrowsableImages = {};
            }
        }
    }

    save() {
        localStorage.setItem("selectedAlbumImages", JSON.stringify(this.selectedAlbumImages));
        localStorage.setItem("selectedBrowsableImages", JSON.stringify(this.selectedBrowsableImages));
    }

    clear() {
        this.selectedAlbumImages = {};
        this.selectedBrowsableImages = {};
        this.save();
    }

    getKeyForAlbumImage(albumId, imageId) {
        return `${albumId}-${imageId}`;
    }

    toggleSelectAlbumImage(albumId, imageId) {
        let key = this.getKeyForAlbumImage(albumId, imageId);
        this.selectedAlbumImages[key] = !this.isAlbumImageSelected(albumId, imageId);
        this.save();
    }

    toggleSelectBrowsableImage(path) {
        this.selectedBrowsableImages[path] = !this.isBrowsableImageSelected(path);
        this.save();
    }

    removeSelectedAlbumImage(albumId, imageId) {
        let key = this.getKeyForAlbumImage(albumId, imageId);
        delete this.selectedAlbumImages[key];
        this.save();
    }

    removeSelectedBrowsableImage(path) {
        delete this.selectedBrowsableImages[path];
        this.save();
    }

    isAlbumImageSelected(albumId, imageId) {
        let key = this.getKeyForAlbumImage(albumId, imageId);
        return Object.keys(this.selectedAlbumImages).includes(key) && this.selectedAlbumImages[key] === true;
    }

    isBrowsableImageSelected(path) {
        return Object.keys(this.selectedBrowsableImages).includes(path) && this.selectedBrowsableImages[path] === true;
    }

    getSelectedAlbumImages(onlyActiveSelections) {
        if (onlyActiveSelections) {
            return Object.keys(this.selectedAlbumImages)
                .filter(x => this.selectedBrowsableImages[x] === true)
                .map(x => x.split("-"));
        }
        else {
            return Object.keys(this.selectedAlbumImages).map(x => x.split("-"));
        }
    }

    getSelectedBrowsableImages(onlyActiveSelections) {
        if (onlyActiveSelections) {
            return Object.keys(this.selectedBrowsableImages)
                .filter(x => this.selectedBrowsableImages[x] === true);
        }
        else {
            return Object.keys(this.selectedBrowsableImages);
        }
    }

}