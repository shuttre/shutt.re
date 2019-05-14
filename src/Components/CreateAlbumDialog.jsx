import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress/index';

import ShuttreApiClient from "../Libs/ShuttreApiClient";

export default class CreateAlbumDialog extends React.Component {

    constructor(props) {
        super(props);
        this.api = new ShuttreApiClient();
        this.abortController = null;
        this.state = {
            newAlbumName: null,
            waitingForResponse: false
        };
    }

    componentWillUnmount() {
        this.abortFetch();
    }

    abortFetch() {
        if (this.abortController != null) { this.abortController.abort(); }
    }

    async createAlbum() {
        this.abortFetch();
        this.abortController = new window.AbortController();

        let newAlbum = null;
        try {
            newAlbum = await this.api.createNewAlbum(this.state.newAlbumName, this.abortController.signal);
        }
        catch (e) {
            if (e.name !== 'AbortError') {
                console.error("Error in api.createNewAlbum(): " + e);
                this.props.onError(e);
            }
            return;
        }
        this.props.onNewAlbum(newAlbum);
        this.handleCloseDialog();
    }

    static getLoading() {
        return <CircularProgress />
    }

    handleCloseDialog() {
        this.abortFetch();
        this.setState({
            newAlbumName: null,
            waitingForResponse: false
        });
        this.props.onClose();
    }

    handleNewAlbumNameChanged(e) {
        let v = e.target.value;
        this.setState({
            newAlbumName: v === "" ? null : v
        });
    }

    handleCreateNewAlbum() {
        this.setState({
            waitingForResponse: true
        });
        // noinspection JSIgnoredPromiseFromCall
        this.createAlbum();
    }

    render() {

        let dialogContent;
        if (this.state.waitingForResponse) {
            dialogContent = CreateAlbumDialog.getLoading();
        }
        else {
            dialogContent = <TextField
                autoFocus
                margin="dense"
                id="newAlbumName"
                label="Name of new album"
                type="text"
                fullWidth
                onChange={e => this.handleNewAlbumNameChanged(e)}
                value={this.state.newAlbumName == null ? "" : this.state.newAlbumName}
            />;

        }

        return <Dialog
            open={this.props.open}
            onClose={() => this.handleCloseDialog()}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">Create new album</DialogTitle>
            <DialogContent>
                {dialogContent}
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={this.state.newAlbumName == null || this.state.waitingForResponse}
                    onClick={() => this.handleCreateNewAlbum()} color={"primary"}
                >
                    Create album
                </Button>
                <Button onClick={() => this.handleCloseDialog()} color={"secondary"}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>;
    }

}
