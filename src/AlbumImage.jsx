import React from 'react';
import { withRouter } from 'react-router-dom';

import { withStyles } from "@material-ui/core/styles";
import CircularProgress from '@material-ui/core/CircularProgress';

import './AlbumImage.css';
import ShuttreApiClient from "./ShuttreApiClient";

class AlbumImage extends React.Component {

    static get LOADING() {
        return "https://na.shutt.re/waiting";
    }

    constructor(props) {
        super(props);
        this.albumId = props.albumId;
        this.imageId = props.imageId;
        this.imageName = props.imageName;
        this.state = {
            image: AlbumImage.LOADING
        };
        this.api = new ShuttreApiClient();
    }

    componentDidMount() {
        this.fetchImageAndUpdateState();
    }

    async fetchImageAndUpdateState() {
        let imgDataObject = await this.api.fetchAlbumImage(this.albumId, this.imageId);
        if (imgDataObject == null) {
            alert("Failed to fetch image");
            this.setState({ image: AlbumImage.LOADING });
        }
        else {
            this.setState({ image: imgDataObject });
        }
    }

    getLoadingToRender() {
        const { classes } = this.props;
        return <CircularProgress className={classes.modalProgress} size={50} />
    }

    render() {

        let img;
        if (this.state.image === AlbumImage.LOADING) {
            img = this.getLoadingToRender();
        }
        else {
            img = this.getImageToRender();
        }

        return img;
    }

    getImageToRender() {
        return <div><img src={this.state.image} width="300" height="300" alt={`${this.imageName}`} /></div>;
    }

}

const styles = theme => ({
    modalProgress: {
        // margin: theme.spacing.unit * 2,
        position: "absolute",
        margin: "auto",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    }
});

export default withRouter(withStyles(styles)(AlbumImage));
