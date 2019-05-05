import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from '@material-ui/core/CircularProgress';

import './Albums.css';
import ShuttreApiClient from "./ShuttreApiClient";

class Albums extends React.Component {

    static get LOADING() {
        return "https://na.shutt.re/waiting";
    }

    constructor(props) {
        super(props);
        this.state = { albums: Albums.LOADING };
        this.api = new ShuttreApiClient();
    }

    componentDidMount() {
        this.fetchAlbumsAndUpdateState()
    }

    render() {

        let albumList;
        if (this.state.albums === Albums.LOADING) {
            albumList = this.getLoadingToRender();
        }
        else {
            albumList = this.getAlbumsToRender();
        }

        return albumList;
    }

    async fetchAlbumsAndUpdateState() {
        let albums = await this.api.fetchAlbums();
        if (albums == null) {
            alert("Failed to fetch albums");
            this.setState({
                albums: null
            });
        }
        else {
            this.setState({albums: albums});
        }
    }

    getLoadingToRender() {
        const { classes } = this.props;
        return <CircularProgress className={classes.modalProgress} size={50} />
    }

    getAlbumsToRender() {
        let albumList = this.state.albums.map(
            (album) => (
                <li key={album.albumId}>
                    <Link to={`/album/${album.albumId}`}>
                        {/*<img width="150" height="150" src={`/api/image/${album.frontImageId}/img`} alt="" />*/}
                        {album.albumId}: {album.albumName}
                    </Link>
                </li>
            ));

        if (albumList.length === 0) {
            albumList.push(<li>You do not have any albums of your own,
                and do not have access to anyone else's albums either.</li>)
        }

        return <ul>{albumList}</ul>;

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

export default withRouter(withStyles(styles)(Albums));
