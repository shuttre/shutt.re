import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import CircularProgress from '@material-ui/core/CircularProgress/index';

import ShuttreApiClient from "../Libs/ShuttreApiClient";
import CreateAlbumDialog from "./CreateAlbumDialog";

export default class AddToAlbumDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showCreateNewAlbumDialog: false,
            albumToAddTo: null,
            albums: null,
            waitingForResponse: false
        };
        this.api = new ShuttreApiClient();
        this.abortControllerFetchAlbums = null;
        this.abortControllerAddToQueue = null;
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchAlbums();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.albums != null && this.state.albums == null) {
            // noinspection JSIgnoredPromiseFromCall
            this.fetchAlbums();
        }
    }

    componentWillUnmount() {
        this.abortFetch();
    }



    abortFetch() {
        if (this.abortControllerFetchAlbums != null) { this.abortControllerFetchAlbums.abort(); }
        if (this.abortControllerAddToQueue != null) { this.abortControllerAddToQueue.abort(); }
    }

    async fetchAlbums() {
        this.abortFetch();
        this.abortControllerFetchAlbums = new window.AbortController();

        let albums = null;
        try {
            albums = await this.api.fetchWritableAlbums(this.abortControllerFetchAlbums.signal);
        }
        catch (e) {
            if (e.name !== 'AbortError') {
                console.error("Error in api.fetchWritableAlbums(): " + e);
                alert("Failed to fetch writable albums");
            }
        }
        this.setState({
            albums: albums
        });
    }

    async addToAlbum() {
        this.abortFetch();
        this.abortControllerAddToQueue = new window.AbortController();

        let imageQueue = null;
        try {
            imageQueue =
                await this.api.AddBrowsableImagesToQueue(
                    this.state.albumToAddTo,
                    this.props.browsableImagePaths,
                    this.abortControllerAddToQueue.signal);
        }
        catch (e) {
            if (e.name !== 'AbortError') {
                console.error("Error in api.AddBrowsableImagesToQueue(): " + e);
                this.props.onError(e);
            }
        }
        this.props.onQueued(imageQueue);
        this.handleCloseDialog();
    }



    static getLoading() {
        return <CircularProgress />
    }

    getDialogContent(){
        let currentAlbumId = 0;
        if (this.state.albumToAddTo != null) {
            let selectedAlbum = this.state.albums.filter(x => x.albumId === this.state.albumToAddTo);
            if (selectedAlbum.length === 1) {
                currentAlbumId = selectedAlbum[0].albumId;
            }
        }

        let menuItems =
            this.state.albums.map(x => <MenuItem key={x.albumId} value={x.albumId}>{x.albumName}</MenuItem>);

        return {menuItems: menuItems, currentAlbumId: currentAlbumId};
    }

    createNewAlbum() {
        this.setState({
            showCreateNewAlbumDialog: true
        });
    }


    handleCloseDialog() {
        this.abortFetch();
        this.setState({
            albumToAddTo: null,
        });
        this.props.onClose();
    }

    handleChangeAlbum(e) {
        let aId = e.target.value;
        if (aId === -1) {
            this.createNewAlbum();
        }
        else if (aId === 0) {
            this.setState({albumToAddTo: null});
        }
        else {
            this.setState({albumToAddTo: aId});
        }
    }

    handleAddToAlbum() {
        this.setState({
            waitingForResponse: true
        });
        // noinspection JSIgnoredPromiseFromCall
        this.addToAlbum();
    }



    shouldEnableAddToAlbumButton() {
        return ![null, -1, 0].includes(this.state.albumToAddTo) && !this.state.waitingForResponse;
    }



    render() {

        let dialogContent;
        if (this.state.albums == null || this.state.waitingForResponse) {
            dialogContent = AddToAlbumDialog.getLoading();
        }
        else {
            let {menuItems, currentAlbumId} = this.getDialogContent();
            dialogContent =     <Select
                                    value={currentAlbumId}
                                    onChange={e => this.handleChangeAlbum(e)}
                                    style={{minWidth: "200px"}}
                                >
                                    <MenuItem value={0}>
                                        <b>Select album</b>
                                    </MenuItem>
                                    <MenuItem value={-1}>
                                        <em>+ [Create new album]</em>
                                    </MenuItem>
                                    {menuItems}
                                </Select>;
        }

        return <>
            <Dialog
                open={this.props.open}
                onClose={() => this.handleCloseDialog()}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Which album do you want to add these images to?</DialogTitle>
                <DialogContent>
                    {dialogContent}
                </DialogContent>
                <DialogActions>
                    <Button disabled={!this.shouldEnableAddToAlbumButton()} onClick={() => this.handleAddToAlbum()} color={"primary"}>
                        Add to album
                    </Button>
                    <Button onClick={() => this.handleCloseDialog()} color={"secondary"}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            <CreateAlbumDialog
                open={this.state.showCreateNewAlbumDialog}
                onError={e => alert("Failed to create new album")}
                onNewAlbum={newAlbum => this.handleNewAlbumCreated(newAlbum)}
                onClose={() => this.setState({showCreateNewAlbumDialog: false})}
            />
        </>;
    }

    handleNewAlbumCreated(newAlbum) {
        this.setState({
            showCreateNewAlbumDialog: false,
            albumToAddTo: newAlbum.albumId,
            albums: null,
        });
    }

}
