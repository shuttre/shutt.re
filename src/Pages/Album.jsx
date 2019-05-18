import React from 'react';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress/index';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import ShuttreApiClient from "../Libs/ShuttreApiClient";
import AlbumImage from "../Components/AlbumImage";

import classes from "../Styles/Album.module.css";
import ImageModal from "../Components/ImageModal";
import SelectedImagesHelper from "../Libs/SelectedImagesHelper";

class Album extends React.Component {

    static get LOADING() {
        return "https://na.shutt.re/waiting";
    }

    constructor(props) {
        super(props);
        this.state = {
            hash: null,
            images: Album.LOADING,
            modalImgSrc: null,
            modalImageId: null
        };
        this.api = new ShuttreApiClient();
        this.albumId = props.match.params.albumId;
        this.abortControllerImg = null;
        this.abortControllerAlbum = null;
        this.selectedImagesHelper = new SelectedImagesHelper();
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchAlbumImagesAndUpdateState();
        this.showHideModal();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            // noinspection JSIgnoredPromiseFromCall
            this.fetchAlbumImagesAndUpdateState();
        }
        if (this.props.location.hash !== prevProps.location.hash) {
            this.showHideModal();
        }
    }

    componentWillUnmount() {
        this.abortFetchAlbum();
        this.abortFetchImg();
    }



    shouldShowModal() {
        return this.props.location.hash != null && this.props.location.hash !== "";
    }

    hideImageModal() {
        this.setState({
            hash: null,
            modalImgSrc: Album.LOADING
        });
    }

    showImageModal() {
        this.setState({
            hash: this.getImageIdHash(),
            modalImgSrc: Album.LOADING
        });
        // noinspection JSIgnoredPromiseFromCall
        this.fetchAlbumImageAndUpdateModal();
    }

    showHideModal() {
        if (this.shouldShowModal()) {
            this.showImageModal();
        }
        else {
            this.hideImageModal();
        }
    }

    getImageIdHash() {
        return this.props.location.hash.replace("#", "");
    }

    hasImagesAndHash() {
        if (this.state.images == null || this.state.images === Album.LOADING || this.state.images.length === 0) {
            return false;
        }
        if (this.state.hash == null || this.state.hash.length === 0) {
            return false;
        }
        return true;
    }



    abortFetchImg() {
        if (this.abortControllerImg != null) {
            this.abortControllerImg.abort();
        }
    }

    abortFetchAlbum() {
        if (this.abortControllerAlbum != null) {
            this.abortControllerAlbum.abort();
        }
    }

    async fetchAlbumImagesAndUpdateState() {
        this.abortFetchAlbum();
        this.abortControllerAlbum = new window.AbortController();

        let images = null;
        try {
            images = await this.api.fetchAlbumImages(this.albumId, this.abortControllerAlbum.signal);
        }
        catch (e) {
            if (e.name !== 'AbortError') {
                console.error("Error in api.fetchImages(): " + e);
                alert("Failed to fetch images");
                this.props.history.push({
                    pathname: this.props.location.pathname,
                    hash: null,
                });
            }
        }

        this.setState({
            images: images
        });

    }

    async fetchAlbumImageAndUpdateModal() {
        this.abortFetchImg();
        this.abortControllerImg = new window.AbortController();

        let imageId = this.getImageIdHash();

        let response;
        try {
            response =
                await this.api.fetchAlbumImage(
                    this.albumId,
                    imageId,
                    ShuttreApiClient.AlbumImageSize.medium,
                    this.abortControllerImg.signal);
        }
        catch (e) {
            if (e.name !== 'AbortError') {
                console.error("Error in api.fetchAlbumImage(): " + e);
                alert("Failed to fetch image");
            }
            return;
        }

        let { dataUrl } = response;

        this.setState({
            modalImgSrc: dataUrl,
            modalImageId: imageId
        });
    }




    handleImageClick(imageId) {
        this.props.history.push({
            hash: '#' + imageId
        });
    }

    handleCloseModal() {
        this.props.history.push({
            hash: null
        });
    };

    handleGotoNext(backwards = false) {
        if (this.hasImagesAndHash()) {

            let imageIds = this.state.images.map(x => x.imageId.toString());
            if (imageIds.length === 0) {
                console.error("Found no images when handleGotoNext(). Next from what then?");
                return;
            }

            let i = imageIds.indexOf(this.state.hash);

            i += backwards ? -1 : 1;

            if (i < 0 || i > imageIds.length-1) {
                return;
            }

            this.handleImageClick(imageIds[i]);
        }
    }



    getLoadingToRender() {
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

    getImagesToRender() {

        return (
            <div className={classes.root}>
                <GridList cellHeight={160} className={classes.gridList} cols={3}>
                    {this.state.images.map(image => (
                        <GridListTile onClick={() => this.handleImageClick(image.imageId)} key={image.imageId} cols={1}>
                            <AlbumImage showLoading={false} albumId={image.albumId} imageId={image.imageId} imageName={image.imageName} />
                        </GridListTile>
                    ))}
                </GridList>
            </div>
        );
        //
        //
        // let imageList = this.state.images.map(image => (
        //     <li key={image.imageId}>
        //         {/*<img src={`/api/image/${image.imageId}/img`} width="600" height="600" alt={`${image.imageName}`} />*/}
        //         {/*src: {`/.../${image.imageId}/img`} name: {`${image.imageName}`}*/}
        //
        //     </li>
        // ));
        //
        // return (
        //     <div>
        //         <ul>
        //             {imageList}
        //         </ul>
        //     </div>
        // );
    }

    getModal() {
        let loading = this.state.modalImgSrc === Album.LOADING;
        let open = this.state.hash !== null;

        return <ImageModal
            type={ImageModal.ImageType.album}
            albumId={this.albumId}
            imageId={this.state.modalImageId}
            loading={loading}
            imageSrc={loading ? null : this.state.modalImgSrc}
            open={open}
            onClose={() => this.handleCloseModal()}
            onPrevAction={() => this.handleGotoNext(true)}
            onNextAction={() => this.handleGotoNext()} />;

    }

    render() {

        let imageList;
        if (this.state.images === Album.LOADING) {
            imageList = this.getLoadingToRender();
        }
        else {
            if (this.state.images == null || this.state.images.length === 0) {
                imageList = <div></div>;
            }
            else {
                imageList = this.getImagesToRender();
            }
        }

        let modal = this.getModal();

        return  <>
                    {imageList}
                    {modal}
                </>;
    }

}

export default withRouter(Album);