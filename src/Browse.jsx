import React from 'react';
import { withRouter } from 'react-router-dom';

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { withStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import CircularProgress from '@material-ui/core/CircularProgress';

import FolderIcon from "@material-ui/icons/Folder";
import MovieIcon from "@material-ui/icons/Movie";
import ImageIcon from "@material-ui/icons/Image";

import './Browse.css';
import ShuttreApiClient from "./ShuttreApiClient";

class Browse extends React.Component {

    static get LOADING() {
        return "https://na.shutt.re/waiting";
    }

    constructor(props) {
        super(props);
        this.api = new ShuttreApiClient();
        this.state = {
            iNodes: Browse.LOADING,
            hash: null,
            modalImgSrc: Browse.LOADING
        };

        this.htmlIds = {
            modalContainerDiv: "_modalContainerDiv",
            modalLoading: "_modalLoading",
            modalImage: "_modalImage",
        };
    }

    componentDidMount() {
        this.fetchDirectoryContent();
        this.showHideModal();
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.fetchDirectoryContent();
        }
        if (this.props.location.hash !== prevProps.location.hash) {
            this.showHideModal();
        }
    }

    shouldShowModal() {
        return this.props.location.hash != null && this.props.location.hash !== "";
    }

    hideImageModal() {
        this.setState({
            hash: null,
            modalImgSrc: Browse.LOADING
        });
    }

    showImageModal() {
        this.setState({
            hash: this.props.location.hash,
            modalImgSrc: Browse.LOADING
        });
        this.fetchImageAndUpdateModal();
    }

    showHideModal() {
        if (this.shouldShowModal()) {
            this.showImageModal();
        }
        else {
            this.hideImageModal();
        }
    }

    getCurrentVirtualPath(includeHash) {
        let virtualPath = this.props.location.pathname.substring(7); // cut away "/browse"
        while (virtualPath.endsWith('/')) {
            virtualPath = virtualPath.substring(0, virtualPath.length - 1);
        }
        let hash = decodeURI(this.props.location.hash.replace("#", ""));
        if (includeHash && hash !== "") {
            virtualPath += "/" + hash;
        }
        return virtualPath;
    }

    async fetchImageAndUpdateModal() {
        let virtualPath = this.getCurrentVirtualPath(true);
        let imgDataObject = await this.api.fetchBrowsableImage(virtualPath);
        if (imgDataObject === null) {
            alert("Failed to fetch image: " + virtualPath);
            this.props.history.push({
                pathname: this.props.location.pathname,
                hash: null,
            });
        }
        else {
            this.setState({
                modalImgSrc: imgDataObject
            });
        }
    }

    async fetchDirectoryContent() {

        let virtualPath = this.getCurrentVirtualPath(false);

        this.setState({iNodes: Browse.LOADING});

        let iNodes = await this.api.fetchBrowsablePath(virtualPath);

        if (iNodes == null) {
            alert("Failed to fetch content of directory: " + virtualPath);
            this.setState({
                iNodes: []
            });
        }
        else {
            this.setState({
                iNodes: iNodes
            });
        }
    }

    handleModalClick(e) {
        e = e || window.event;
        let target = e.target || e.srcElement;
        if (target.id === this.htmlIds.modalContainerDiv) {
            this.handleClose();
        }
        else if (target.id === this.htmlIds.modalImage) {
            this.handleGotoNext();
        }
    }

    handleClose() {
        console.warn("handleClose()");
        this.props.history.push({
            hash: null
        });
    };

    handleDirectoryClick(path) {
        this.props.history.push(path);
    }

    handleImageClick(name) {
        this.props.history.push({
            hash: '#' + encodeURI(name)
        });
    }

    handleGotoNext() {
        let i = 0;
        let ai = -1;
        this.state.iNodes.forEach(iNode => {
            let name = iNode.name;

            if (iNode.type === "directory") {
                return;
            }
            if (iNode.type === "video") {
                return;
            }

            if (this.state.hash.replace("#", "") === name) {
                ai = i;
            }

            i++;
        });

        console.debug("min i: " + (this.state.iNodes.length > 0 ? "0" : "-1"));
        console.debug("active i: " + ai);
        console.debug("max i: " + (this.state.iNodes.length > 0 ? this.state.iNodes.length-1 : "-1"));
    }

    handleGotoPrev() {
        console.debug("handleGotoPrev()");
    }

    getFSEntriesToRender() {

        if (this.state.iNodes === Browse.LOADING) {
            return this.getLoadingDir();
        }

        let virtualPath = this.getCurrentVirtualPath(false);

        let backPath = virtualPath;
        backPath = backPath.substring(0, backPath.lastIndexOf("/"));

        return this.state.iNodes.map(
            (iNode) => {
                let theIcon = null;
                let name = iNode.name;

                let newPath = iNode.name;
                while (newPath.startsWith('/')) {
                    newPath = newPath.substring(1);
                }
                let path = "/browse" + virtualPath + "/" + newPath;

                if (iNode.name === "..") {
                    path = "/browse" + backPath;
                }

                let onClickEvent;
                if (iNode.type === "directory") {
                    theIcon = <FolderIcon />
                    name += "/";
                    onClickEvent = (e) => this.handleDirectoryClick(path);
                }
                else if (iNode.type === "image") {
                    theIcon = <ImageIcon />
                    onClickEvent = (e) => this.handleImageClick(name);
                }
                if (iNode.type === "video") {
                    theIcon = <MovieIcon />
                    onClickEvent = (e) => alert("Video player is not yet implemented!");
                }

                return (
                    <ListItem key={iNode.name} button onClick={onClickEvent}>
                        <ListItemIcon>
                            {theIcon}
                        </ListItemIcon>
                        <ListItemText primary={name} />
                    </ListItem>
                )
            }
        );
    }

    getLoadingDir() {
        const { classes } = this.props;
        return <CircularProgress className={classes.modalProgress} size={50} />
    }

    getLoadingImg() {
        const { classes } = this.props;
        return <CircularProgress id={this.htmlIds.modalLoading} className={classes.modalProgress} size={50} />
    }

    getModal() {
        const { classes } = this.props;

        let imgOrProgress = null;
        if (this.state.modalImgSrc === Browse.LOADING) {
            imgOrProgress = this.getLoadingImg();
        }
        else {
            imgOrProgress = (<img id={this.htmlIds.modalImage} className={classes.modalImg} src={this.state.modalImgSrc} alt="" />);
        }
        return (
            <Modal
                open={this.state.hash !== null}
                onClose={(e) => this.handleClose()}
                onKeyDown={
                    (e) => {
                        if (e.key === "ArrowLeft") {
                            this.handleGotoPrev();
                        }
                        else if (e.key === "ArrowRight") {
                            this.handleGotoNext();
                        }
                        else if (e.key === "Escape") {
                            this.handleClose();
                        }
                    }
                } >
                <div id={this.htmlIds.modalContainerDiv} onClick={(e) => this.handleModalClick(e)} className={classes.modalPaper}>
                    {imgOrProgress}
                </div>
            </Modal>
        );
    }

    render() {
        let fsEntries = this.getFSEntriesToRender();

        let currentPath = this.getCurrentVirtualPath(false);
        if (currentPath === "") {
            currentPath = "/";
        }
        let p = (<p>CWD: {currentPath}</p>);

        let modal = this.getModal();

        return (
            <div>
                {p}
                <ul>
                    {fsEntries}
                </ul>
                {modal}
            </div>
        );
    }
}

const styles = theme => ({
    modalImg: {
        maxWidth: "100%",
        maxHeight: "100%",
        position: "absolute",
        margin: "auto",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    modalPaper: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        padding: theme.spacing.unit * 2
    },
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

export default withRouter(withStyles(styles)(Browse));
