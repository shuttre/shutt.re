import React from "react";
import { withRouter } from 'react-router'

import Drawer from "@material-ui/core/Drawer/index";
import AppBar from "@material-ui/core/AppBar/index";
import Toolbar from "@material-ui/core/Toolbar/index";
import Typography from "@material-ui/core/Typography/index";
import IconButton from "@material-ui/core/IconButton/index";
import Divider from "@material-ui/core/Divider/index";
import ListItem from "@material-ui/core/ListItem/index";
import ListItemIcon from "@material-ui/core/ListItemIcon/index";
import ListItemText from "@material-ui/core/ListItemText/index";

import IconMenu from "@material-ui/icons/Menu";
import IconHome from "@material-ui/icons/Home";
import IconAlbums from "@material-ui/icons/Photo";
import IconAbout from "@material-ui/icons/People";
import IconLogin from "@material-ui/icons/MeetingRoom";
import IconLogout from "@material-ui/icons/NoMeetingRoom";
import IconBrowse from "@material-ui/icons/Folder";
import IconSelected from "@material-ui/icons/CheckBoxRounded";
import IconSettings from "@material-ui/icons/Settings";

import classes from "../Styles/Header.module.css";

import Oidc from "../Libs/Oidc";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
        this.closeDrawer = this.closeDrawer.bind(this);
        this.openDrawer = this.openDrawer.bind(this);
        this.oidc = new Oidc();
    }

    closeDrawer(open) {
        this.setState({ open: false });
    }

    openDrawer(open) {
        this.setState({ open: true });
    }

    handleClick(to, e) {
        e.stopPropagation();
        this.props.history.push(to);
        this.setState({
            open: false
        });
    }

    getMenuContent() {

        let loginItem = (
            <ListItem button onClick={e => this.oidc.logout()}>
                <ListItemIcon>
                    <IconLogout />
                </ListItemIcon>
                <ListItemText primary="Logout" />
            </ListItem>
        );

        if (!Oidc.isAuthenticated()) {
            loginItem = (
                <ListItem button onClick={async (e) => await this.oidc.authenticateRedirect()}>
                    <ListItemIcon>
                        <IconLogin />
                    </ListItemIcon>
                    <ListItemText primary="Login" />
                </ListItem>
            );
        }

        return (
            <div>
                <ListItem button onClick={e => this.handleClick("/", e)}>
                    <ListItemIcon>
                        <IconHome />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem button onClick={e => this.handleClick("/albums", e)}>
                    <ListItemIcon>
                        <IconAlbums />
                    </ListItemIcon>
                    <ListItemText primary="Albums" />
                    <ListItemIcon>
                        <IconSettings
                            className={classes.settingsIcon}
                            onClick={e => this.handleClick("/manage/albums", e)}
                        />
                    </ListItemIcon>
                </ListItem>
                <ListItem button onClick={e => this.handleClick("/browse", e)}>
                    <ListItemIcon>
                        <IconBrowse />
                    </ListItemIcon>
                    <ListItemText primary="Browse storage" />
                </ListItem>
                <ListItem button onClick={e => this.handleClick("/selected", e)}>
                    <ListItemIcon>
                        <IconSelected />
                    </ListItemIcon>
                    <ListItemText primary="Selected images" />
                </ListItem>
                <Divider />
                {loginItem}
                <ListItem button onClick={e => this.handleClick("/about", e)}>
                    <ListItemIcon>
                        <IconAbout />
                    </ListItemIcon>
                    <ListItemText primary="About" />
                </ListItem>
            </div>
        );
    }

    render() {
        let sideDrawerContent = this.getMenuContent();
        return (
            <div>
                <Drawer open={this.state.open} onClose={this.closeDrawer}>
                    <div
                        role="button"
                        onClick={this.closeDrawer}
                        onKeyDown={this.closeDrawer}
                    >
                        {sideDrawerContent}
                    </div>
                </Drawer>{" "}
                <div className={classes.root}>
                    <AppBar position="static">
                        <Toolbar>
                            <IconButton
                                className={classes.menuButton}
                                onClick={this.openDrawer}
                                color="inherit"
                                aria-label="Menu"
                            >
                                <IconMenu />
                            </IconButton>
                            <Typography
                                variant="title"
                                color="inherit"
                                className={classes.flex}
                            >
                                Shutt.re
                            </Typography>
                        </Toolbar>
                    </AppBar>
                </div>
            </div>
        );
    }
}

export default withRouter(Header);