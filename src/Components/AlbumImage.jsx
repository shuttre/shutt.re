import React from 'react';
import { withRouter } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress/index';

import ShuttreApiClient from "../Libs/ShuttreApiClient";

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
            width: null,
            height: null,
            image: AlbumImage.LOADING
        };
        this.api = new ShuttreApiClient();
    }

    componentDidMount() {
        this.fetchImageAndUpdateState();
    }

    async fetchImageAndUpdateState() {
        let {width, height, dataUrl} = await this.api.fetchAlbumImage(this.albumId, this.imageId);
        if (dataUrl == null) {
            alert("Failed to fetch image");
            this.setState({ image: AlbumImage.LOADING });
        }
        else {
            this.setState({
                width: width,
                height: height,
                image: dataUrl
            });
        }
    }

    getLoadingToRender() {
        if (this.props.showLoading != null && this.props.showLoading === true) {
            const style = {
                position: "absolute",
                margin: "auto",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };
            return <CircularProgress style={style} size={50} />
        }
        return null;
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
        return <img
                src={this.state.image}
                width={this.state.width}
                height={this.state.height}
                alt={`${this.imageName}`} />;
    }

}

export default withRouter(AlbumImage);
