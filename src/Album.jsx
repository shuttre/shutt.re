import React from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from '@material-ui/core/CircularProgress';

import './Album.css';
import ShuttreApiClient from "./ShuttreApiClient";
import AlbumImage from "./AlbumImage";

class Album extends React.Component {

    static get LOADING() {
        return "https://na.shutt.re/waiting";
    }

    constructor(props) {
        super(props);
        this.state = { images: Album.LOADING };
        this.albumId = props.match.params.albumId;
        this.api = new ShuttreApiClient();
    }

    componentDidMount() {
        this.fetchImagesAndUpdateState();
    }

    render() {

        let imageList;
        if (this.state.images === Album.LOADING) {
            imageList = this.getLoadingToRender();
        }
        else {
            imageList = this.getImagesToRender();
        }

        return imageList;
    }

    getLoadingToRender() {
        const { classes } = this.props;
        return <CircularProgress className={classes.modalProgress} size={50} />
    }

    async fetchImagesAndUpdateState() {

        let images = await this.api.fetchImages(this.albumId);
        if (images == null) {
            alert("Failed to fetch images");
            this.setState({ images: null });
        }
        else {
            this.setState({ images: images });
        }

    }

    getImagesToRender() {
        if (this.state.images == null || this.state.images.length === 0) {
            return <div></div>;
        }
        else {
            let imageList = this.state.images.map(image => (
                <li key={image.imageId}>
                    {/*<img src={`/api/image/${image.imageId}/img`} width="600" height="600" alt={`${image.imageName}`} />*/}
                    {/*src: {`/.../${image.imageId}/img`} name: {`${image.imageName}`}*/}
                    <AlbumImage albumId={image.albumId} imageId={image.imageId} imageName={image.imageName} />
                </li>
            ));

            return (
                <div>
                    <ul>
                        {imageList}
                    </ul>
                </div>
            );
        }
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

export default withRouter(withStyles(styles)(Album));