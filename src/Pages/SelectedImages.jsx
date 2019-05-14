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
            browsableImagePaths={this.selectedImagesHelper.getActiveSelectedBrowsableImagePaths()}
            onError={(e) => alert("Failed to add images to queue.")}
            onQueued={(imageQueue) => this.handleImagesQueued(imageQueue)}
    />;
    }

    render() {

        let sbi = this.selectedImagesHelper.getSelectedBrowsableImages();

        let pathRows = this.getPathRows(sbi);

        let addToAlbumDialog = this.getAddToAlbumDialog();

        return  <>
                    <div>
                        <Button onClick={e => this.clear(e)}>Clear</Button>&nbsp;
                        <Button onClick={() => this.addSelectedImagesToAlbum()}>Add to album</Button><br />
                        <ul>
                            {pathRows}
                        </ul>
                    </div>
                    {addToAlbumDialog}
                </>;
    }

    handlePathClick(e, path) {
        e.stopPropagation();
        alert("View image: " + path);
    }

    handleRemove(e, path) {
        e.stopPropagation();
        this.selectedImagesHelper.removeSelectedBrowsableImage(path);
        this.forceUpdate();
    }

    handleSelect(e, path) {
        e.stopPropagation();
        this.selectedImagesHelper.toggleSelectBrowsableImage(path);
        this.forceUpdate();
    }

    getSelectedIcon(path) {
        if (this.selectedImagesHelper.isBrowsableImageSelected(path)) {
            return <IconSelectedYes onClick={e => this.handleSelect(e, path)} />;
        }
        else {
            return <IconSelectedNo onClick={e => this.handleSelect(e, path)} />;
        }
    }

    getPathRow(path) {

        let selectedIcon = this.getSelectedIcon(path);

        return <ListItem key={path} button onClick={e => this.handlePathClick(e, path)}>
            <ListItemIcon>
                <IconRemove onClick={e => this.handleRemove(e, path)} />
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

    getPathRows(sbi) {
        return Object.keys(sbi).map(path => this.getPathRow(path));
    }
}

export default About;
