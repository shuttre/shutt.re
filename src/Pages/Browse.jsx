import React from 'react';
import { withRouter } from 'react-router-dom';

import ListItem from "@material-ui/core/ListItem/index";
import ListItemIcon from "@material-ui/core/ListItemIcon/index";
import ListItemText from "@material-ui/core/ListItemText/index";
import CircularProgress from '@material-ui/core/CircularProgress/index';

import IconFolder from "@material-ui/icons/Folder";
import IconMovie from "@material-ui/icons/Movie";
import IconImage from "@material-ui/icons/Image";
import IconSelectedYes from "@material-ui/icons/CheckBoxRounded";
import IconSelectedNo from "@material-ui/icons/CheckBoxOutlineBlankRounded";

import ShuttreApiClient from "../Libs/ShuttreApiClient";
import ImageModal from "../Components/ImageModal";
import SelectedImagesHelper from "../Libs/SelectedImagesHelper";

class Browse extends React.Component {

    static get LOADING() {
        return "https://na.shutt.re/waiting";
    }

    constructor(props) {
        super(props);
        this.state = {
            iNodes: Browse.LOADING,
            hash: null,
            modalImgSrc: Browse.LOADING
        };
        this.api = new ShuttreApiClient();
        this.abortControllerImg = null;
        this.abortControllerDir = null;
        this.selectedImagesHelper = new SelectedImagesHelper();
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchDirectoryContent();
        this.showHideModal();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            // noinspection JSIgnoredPromiseFromCall
            this.fetchDirectoryContent();
        }
        if (this.props.location.hash !== prevProps.location.hash) {
            this.showHideModal();
        }
    }

    componentWillUnmount() {
        this.abortFetchDir();
        this.abortFetchImg();
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
            hash: this.getLocationHash(),
            modalImgSrc: Browse.LOADING
        });
        // noinspection JSIgnoredPromiseFromCall
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

    getLocationHash() {
        return decodeURI(this.props.location.hash.replace("#", ""));
    }

    getCurrentVirtualPath(includeHash) {
        let virtualPath = this.props.location.pathname.substring(7); // cut away "/browse"
        while (virtualPath.endsWith('/')) {
            virtualPath = virtualPath.substring(0, virtualPath.length - 1);
        }
        let hash = this.getLocationHash();
        if (includeHash && hash !== "") {
            virtualPath += "/" + hash;
        }
        return virtualPath;
    }



    abortFetchImg() {
        if (this.abortControllerImg != null) {
            this.abortControllerImg.abort();
        }
    }

    abortFetchDir() {
        if (this.abortControllerDir != null) {
            this.abortControllerDir.abort();
        }
    }

    async fetchImageAndUpdateModal() {
        this.abortFetchImg();
        this.abortControllerImg = new window.AbortController();


        let virtualPath = this.getCurrentVirtualPath(true);

        let imgDataObject;
        try {
            imgDataObject = await this.api.fetchBrowsableImage(virtualPath, this.abortControllerImg.signal);
        }
        catch (e) {
            if (e.name !== 'AbortError') {
                console.error("Error in api.fetchBrowsableImage(): " + e);
                alert("Failed to fetch image: " + virtualPath);
                this.props.history.push({
                    pathname: this.props.location.pathname,
                    hash: null,
                });
            }
            return;
        }
        
        this.setState({
            modalImgSrc: imgDataObject
        });
    }

    async fetchDirectoryContent() {
        this.abortFetchDir();
        this.abortControllerDir = new window.AbortController();

        let virtualPath = this.getCurrentVirtualPath(false);

        this.setState({iNodes: Browse.LOADING});

        let iNodes;
        try {
            iNodes = await this.api.fetchBrowsablePath(virtualPath, this.abortControllerDir.signal);
        }
        catch (e) {
            if (e.name !== 'AbortError') {
                console.error("Error in api.fetchBrowsablePath(): " + e);
                alert("Failed to fetch content of directory: " + virtualPath);
                this.setState({
                    iNodes: []
                });
            }
            return;
        }

        this.setState({
            iNodes: iNodes
        });
    }



    handleCloseModal() {
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

    hasINodesAndHash() {
        if (this.state.iNodes == null || this.state.iNodes === Browse.LOADING || this.state.iNodes.length === 0) {
            return false;
        }
        if (this.state.hash == null || this.state.hash.length === 0) {
            return false;
        }
        return true;
    }

    handleGotoNext(backwards = false) {
        if (this.hasINodesAndHash()) {

            let images = this.state.iNodes.filter(x => x.type === 'image').map(x => x.name);
            if (images.length === 0) {
                console.info("No images");
                return;
            }

            let i = images.indexOf(this.state.hash);

            i += backwards ? -1 : 1;

            if (i < 0 || i > images.length-1) {
                return;
            }

            this.handleImageClick(images[i]);
        }
    }

    toggleSelect(e, path) {
        e.stopPropagation();
        this.selectedImagesHelper.toggleSelectBrowsableImage(path);
        this.forceUpdate();
    }

    getSelectIcon(path) {
        if (this.selectedImagesHelper.isBrowsableImageSelected(path)) {
            return <div onClick={(e) => this.toggleSelect(e, path)}>
                <IconSelectedYes />
            </div>;
        }
        else {
            return <div onClick={(e) => this.toggleSelect(e, path)}>
                <IconSelectedNo />
            </div>;
        }
    }

    getFSEntriesToRender() {

        if (this.state.iNodes === Browse.LOADING) {
            return this.getLoadingDir();
        }

        let virtualPath = this.getCurrentVirtualPath(false);

        let backPath = virtualPath;
        backPath = backPath.substring(0, backPath.lastIndexOf("/"));

        this.selectedImagesHelper.load();

        return this.state.iNodes.map(
            (iNode) => {
                let theIcon = null;
                let name = iNode.name;

                let newPath = iNode.name;
                while (newPath.startsWith('/')) {
                    newPath = newPath.substring(1);
                }
                let imageVirtualPath = virtualPath + "/" + newPath;
                let path = "/browse" + imageVirtualPath;

                let selectedIcon = null;
                if (iNode.type === "image" || iNode.type === "video") {
                    selectedIcon = this.getSelectIcon(imageVirtualPath);
                }
                else {
                    selectedIcon = <div style={{width: "25px", height: "25px"}}>&nbsp;</div>;
                }

                if (iNode.name === "..") {
                    path = "/browse" + backPath;
                }

                let onClickEvent;
                if (iNode.type === "directory") {
                    theIcon = <IconFolder />;
                    name += "/";
                    onClickEvent = () => this.handleDirectoryClick(path);
                }
                else if (iNode.type === "image") {
                    theIcon = <IconImage />;
                    onClickEvent = () => this.handleImageClick(name);
                }
                if (iNode.type === "video") {
                    theIcon = <IconMovie />;
                    onClickEvent = () => alert("Video player is not yet implemented!");
                }

                return (
                    <ListItem key={iNode.name} button onClick={onClickEvent}>
                        <ListItemIcon>
                            {selectedIcon}
                        </ListItemIcon>
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

    getModal() {
        let loading = this.state.modalImgSrc === Browse.LOADING;
        let open = this.state.hash !== null;
        let path = this.getCurrentVirtualPath(true);

        return <ImageModal
            type={ImageModal.ImageType.browsable}
            loading={loading}
            imageSrc={loading ? null : this.state.modalImgSrc}
            path={path}
            open={open}
            onClose={() => this.handleCloseModal()}
            onPrevAction={() => this.handleGotoNext(true)}
            onNextAction={() => this.handleGotoNext()} />;

    }

    render() {
        let fsEntries = this.getFSEntriesToRender();

        let currentPath = this.getCurrentVirtualPath(false);
        if (currentPath === "") {
            currentPath = "/";
        }
        let cwd = <>CWD: {currentPath}</>;

        let modal = this.getModal();

        return (
            <div>
                {cwd}
                <ul>
                    {fsEntries}
                </ul>
                {modal}
            </div>
        );
    }
}

export default withRouter(Browse);
