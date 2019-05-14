import React from 'react';
import { withRouter } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress/index';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import ShuttreApiClient from "../Libs/ShuttreApiClient";
import AlbumImage from "../Components/AlbumImage";

import classes from "../Styles/Album.module.css";

class Album extends React.Component {

    static get LOADING() {
        return "https://na.shutt.re/waiting";
    }

    constructor(props) {
        super(props);
        this.state = {
            images: Album.LOADING
        };
        this.albumId = props.match.params.albumId;
        this.api = new ShuttreApiClient();
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchImagesAndUpdateState();
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
                        <GridListTile key={image.imageId} cols={1}>
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

        return imageList;
    }

}

export default withRouter(Album);