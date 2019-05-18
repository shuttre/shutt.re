import React from 'react';
import Button from '@material-ui/core/Button';
import ListItem from "@material-ui/core/ListItem/index";
import ListItemIcon from "@material-ui/core/ListItemIcon/index";
import ListItemText from "@material-ui/core/ListItemText/index";

import IconRemove from "@material-ui/icons/ClearRounded";
import IconSelectedYes from "@material-ui/icons/CheckBoxRounded";
import IconSelectedNo from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import IconImage from "@material-ui/icons/Image";

import SelectedImagesHelper from "../Libs/SelectedImagesHelper";
import AddToAlbumDialog from "../Components/AddToAlbumDialog";
import Utils from "../Libs/Utils";

class About extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showAddToAlbumDialog: false
        };
        this.selectedImagesHelper = new SelectedImagesHelper();
    }

    clear(e) {
        this.selectedImagesHelper.clear();
        this.forceUpdate();
    }

    addSelectedImagesToAlbum() {
        this.setState({showAddToAlbumDialog: true});
    }

    handleCloseAddToAlbumDialog() {
        this.setState({
            showAddToAlbumDialog: false
        });
    }

    handleImagesQueued(imageQueue) {
        for (let image of imageQueue) {
            if (image.status === 1) {
                let path = Utils.b64DecodeUnicode(image.path);
                this.selectedImagesHelper.removeSelectedBrowsableImage(path);
            }
        }
        this.forceUpdate(); // TODO: Should we redirect to album (remember it's empty at first)?
    }

    getAddToAlbumDialog() {
        return <AddToAlbumDialog
            open={this.state.showAddToAlbumDialog}
            onClose={() => this.handleCloseAddToAlbumDialog()}
            browsableImagePaths={this.selectedImagesHelper.getSelectedBrowsableImages(true)}
            onError={(e) => alert("Failed to add images to queue.")}
            onQueued={(imageQueue) => this.handleImagesQueued(imageQueue)}
    />;
    }

    render() {

        this.selectedImagesHelper.load();

        let sai = this.selectedImagesHelper.getSelectedAlbumImages(false);
        let sbi = this.selectedImagesHelper.getSelectedBrowsableImages(false);

        let pathRowsA = sai.map(x => this.getPathRowA(x[0], x[1]));
        let pathRowsB = sbi.map(path => this.getPathRowB(path));

        let addToAlbumDialog = this.getAddToAlbumDialog();

        let headingA;
        if (pathRowsA.length !== 0) {
            headingA = <p>Functionality to add the following images to an album is not implemented:</p>;
        }

        return  <>
                    <div>
                        <Button onClick={e => this.clear(e)}>Clear</Button>&nbsp;
                        <Button onClick={() => this.addSelectedImagesToAlbum()}>Add to album</Button><br />
                        <ul>
                            {pathRowsB}
                            {headingA}
                            {pathRowsA}
                        </ul>
                    </div>
                    {addToAlbumDialog}
                </>;
    }

    static handleAlbumImageClick(e, albumId, imageId) {
        e.stopPropagation();
        alert("View (album) image. albumId: " + albumId + ", imageId: " + imageId);
    }

    static handlePathImageClick(e, path) {
        e.stopPropagation();
        alert("View (path) image: " + path);
    }

    handleRemoveA(e, albumId, imageId) {
        e.stopPropagation();
        this.selectedImagesHelper.removeSelectedAlbumImage(albumId, imageId);
        this.forceUpdate();
    }

    handleRemoveB(e, path) {
        e.stopPropagation();
        this.selectedImagesHelper.removeSelectedBrowsableImage(path);
        this.forceUpdate();
    }

    handleSelectA(e, albumId, imageId) {
        e.stopPropagation();
        this.selectedImagesHelper.toggleSelectAlbumImage(albumId, imageId);
        this.forceUpdate();
    }

    handleSelectB(e, path) {
        e.stopPropagation();
        this.selectedImagesHelper.toggleSelectBrowsableImage(path);
        this.forceUpdate();
    }

    getSelectedIconA(albumId, imageId) {
        if (this.selectedImagesHelper.isAlbumImageSelected(albumId, imageId)) {
            return <IconSelectedYes onClick={e => this.handleSelectA(e, albumId, imageId)} />;
        }
        else {
            return <IconSelectedNo onClick={e => this.handleSelectA(e, albumId, imageId)} />;
        }
    }

    getSelectedIconB(path) {
        if (this.selectedImagesHelper.isBrowsableImageSelected(path)) {
            return <IconSelectedYes onClick={e => this.handleSelectB(e, path)} />;
        }
        else {
            return <IconSelectedNo onClick={e => this.handleSelectB(e, path)} />;
        }
    }

    getPathRowA(albumId, imageId) {

        let selectedIcon = this.getSelectedIconA(albumId, imageId);
        let key = this.selectedImagesHelper.getKeyForAlbumImage(albumId, imageId);

        return <ListItem
            disabled={true}
            key={key}
            button
            onClick={e => About.handleAlbumImageClick(e, albumId, imageId)}>
            <ListItemIcon>
                <IconRemove onClick={e => this.handleRemoveA(e, albumId, imageId)} />
            </ListItemIcon>
            <ListItemIcon>
                {selectedIcon}
            </ListItemIcon>
            <ListItemIcon>
                <IconImage />
            </ListItemIcon>
            <ListItemText primary={key} />
        </ListItem>;
    }

    getPathRowB(path) {

        let selectedIcon = this.getSelectedIconB(path);

        return <ListItem key={path} button onClick={e => About.handlePathImageClick(e, path)}>
            <ListItemIcon>
                <IconRemove onClick={e => this.handleRemoveB(e, path)} />
            </ListItemIcon>
            <ListItemIcon>
                {selectedIcon}
            </ListItemIcon>
            <ListItemIcon>
                <IconImage />
            </ListItemIcon>
            <ListItemText primary={path} />
        </ListItem>;
    }

}

export default About;
