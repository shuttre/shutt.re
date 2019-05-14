export default class SelectedImagesHelper {

    constructor() {
        // this.selectedAlbumImages = null;
        this.selectedBrowsableImages = null;
        this.load();
    }

    load() {
        // let saiStr = localStorage.getItem("selectedAlbumImages");
        // if (saiStr == null) {
        //     this.selectedAlbumImages = {};
        // }
        // try {
        //     this.selectedAlbumImages = JSON.parse(saiStr);
        // }
        // catch {
        //     this.selectedAlbumImages = {};
        // }

        let sbiStr = localStorage.getItem("selectedBrowsableImages");
        if (sbiStr == null) {
            this.selectedBrowsableImages = {};
            return;
        }
        try {
            this.selectedBrowsableImages = JSON.parse(sbiStr);
        }
        catch {
            this.selectedBrowsableImages = {};
        }
    }

    save() {
        // localStorage.setItem("selectedAlbumImages", this.selectedAlbumImages);
        localStorage.setItem("selectedBrowsableImages", JSON.stringify(this.selectedBrowsableImages));
    }

    clear() {
        //     this.selectedAlbumImages = {};
        this.selectedBrowsableImages = {};
        this.save();
    }

    // toggleSelectedAlbumImages() {
    //
    // }

    toggleSelectBrowsableImage(path) {
        this.selectedBrowsableImages[path] = !this.isBrowsableImageSelected(path);
        this.save();
    }

    // removeSelectedAlbumImage(path) {
    //
    // }

    removeSelectedBrowsableImage(path) {
        delete this.selectedBrowsableImages[path];
        this.save();
    }

    // isAlbumImageSelected(path) {
    //
    // }

    isBrowsableImageSelected(path) {
        return Object.keys(this.selectedBrowsableImages).includes(path) && this.selectedBrowsableImages[path] === true;
    }

    getSelectedBrowsableImages() {
        return this.selectedBrowsableImages;
    }

    getActiveSelectedBrowsableImagePaths() {
        return Object.keys(this.selectedBrowsableImages).filter(x => this.selectedBrowsableImages[x] === true);
    }

}