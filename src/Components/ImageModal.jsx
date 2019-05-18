import React from 'react';
import Modal from "@material-ui/core/Modal/index";
import CircularProgress from '@material-ui/core/CircularProgress/index';

import IconNavigatePrev from "@material-ui/icons/NavigateBeforeRounded";
import IconNavigateNext from "@material-ui/icons/NavigateNextRounded";
import IconClose from "@material-ui/icons/CloseRounded";
import IconSelectedYes from "@material-ui/icons/CheckBoxRounded";
import IconSelectedNo from "@material-ui/icons/CheckBoxOutlineBlankRounded";

import SelectedImagesHelper from "../Libs/SelectedImagesHelper";

import classes from "../Styles/ImageModal.module.css";

class ImageModal extends React.Component {

    static ImageType = {
        browsable: 1,
        album: 2
    };

    constructor(props) {
        super(props);
        this.htmlIds = {
            background: "_modalPaperBackgroundDiv_1fd853e0",
            loadingImg: "_modalLoadingCircular_1fd853e0",
            image: "_modalImgTag_1fd853e0",
            prev: "_modalPrevArrow_1fd853e0",
            next: "_modalNextArrow_1fd853e0",
            close: "_modalCloseIcon_1fd853e0",
        };
        this.state = {
            showIcons: false
        };
        this.selectedImagesHelper = new SelectedImagesHelper();
    }



    isLoading() {
        return this.props.loading != null && this.props.loading === true;
    }

    hasImage() {
        return this.props.imageSrc != null && this.props.imageSrc.length > 0;
    }

    getLoadingImg() {
        return <CircularProgress id={this.htmlIds.loadingImg} className={classes.modalProgress} size={50} />
    }

    getImage() {
        if (!this.hasImage()) { return null; }
        return <img id={this.htmlIds.image} className={classes.modalImg} src={this.props.imageSrc} alt="" />;
    }



    prev(e) {
        e.stopPropagation();
        this.props.onPrevAction(e);
    }

    next(e) {
        e.stopPropagation();
        this.props.onNextAction(e);
    }

    close(e) {
        e.stopPropagation();
        this.props.onClose(e);
    }

    toggleSelect(e) {
        e.stopPropagation();
        if (this.props.type === ImageModal.ImageType.album) {
            this.selectedImagesHelper.toggleSelectAlbumImage(this.props.albumId, this.props.imageId);
        }
        else {
            this.selectedImagesHelper.toggleSelectBrowsableImage(this.props.path);
        }
        this.forceUpdate();
    }

    handleModalClick(e) {
        e.stopPropagation();
        this.setState((prevState) => ({
            showIcons: !prevState.showIcons
        }));
    }

    handleKeyDown(e) {
        if (e.key === "ArrowLeft") {
            this.prev(e);
        }
        else if (e.key === "ArrowRight") {
            this.next(e);
        }
        else if (e.key === "Escape") {
            this.close(e);
        }
    }



    getOverlayElements() {
        let navIcons = this.getNavIcons();
        let topBar = this.getTopBar();
        return {
            navIcons:  navIcons,
            topBar: topBar
        };
    }

    getModal(child) {

        let navIcons = null;
        let topBar = null;

        if (this.state.showIcons) {
            ({ navIcons, topBar } = this.getOverlayElements());
        }

        return <Modal
            open={this.props.open}
            onClose={(e) => this.props.onClose(e)}
            onKeyDown={(e) => this.handleKeyDown(e)} >
            <div id={this.htmlIds.background} onClick={(e) => this.handleModalClick(e)} className={classes.modalPaper}>
                {child}
                {topBar}
                {navIcons}
            </div>
        </Modal>;
    }

    getNavIcons() {
        return <>
            <div onClick={(e) => this.prev(e)} className={classes.modalPrevArrow}>
                <IconNavigatePrev id={this.htmlIds.prev} style={{width: "100%", height: "100%"}}/>
            </div>

            <div onClick={(e) => this.next(e)} className={classes.modalNextArrow}>
                <IconNavigateNext id={this.htmlIds.next} style={{width: "100%", height: "100%"}}/>
            </div>
        </>;
    }

    getTopBar() {
        let selectIcon = this.getSelectIcon();
        let closeIcon = this.getCloseIcon();
        return  <div onClick={(e) => e.stopPropagation()} className={classes.modalTopBar}>
                    {selectIcon}{closeIcon}
                </div>;
    }

    getCloseIcon() {
        return <div onClick={(e) => this.close(e)} className={classes.modalCloseX}>
            <IconClose style={{width: "100%", height: "100%"}}/>
        </div>;
    }

    getSelectIcon() {

        let isSelected;
        if (this.props.type === ImageModal.ImageType.album) {
            isSelected = this.selectedImagesHelper.isAlbumImageSelected(this.props.albumId, this.props.imageId);
        }
        else {
            isSelected = this.selectedImagesHelper.isBrowsableImageSelected(this.props.path);
        }

        if (isSelected) {
            return <div onClick={(e) => this.toggleSelect(e)} className={classes.modalToggleSelect}>
                <IconSelectedYes style={{width: "100%", height: "100%"}}/>
            </div>;
        }
        else {
            return <div onClick={(e) => this.toggleSelect(e)} className={classes.modalToggleSelect}>
                <IconSelectedNo style={{width: "100%", height: "100%"}}/>
            </div>;
        }
    }

    render() {
        this.selectedImagesHelper.load();
        let img = null;
        if (this.isLoading() || !this.hasImage()) {
            img = this.getLoadingImg();
        }
        else {
            img = this.getImage();
        }
        return this.getModal(img);
    }

}

export default ImageModal;