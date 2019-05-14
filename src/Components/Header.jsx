import React from "react";
import { withRouter } from 'react-router'

import Drawer from "@material-ui/core/Drawer/index";
import { withStyles } from "@material-ui/core/styles/index";
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
import IconPhotoLibrary from "@material-ui/icons/PhotoLibrary";
import IconPeople from "@material-ui/icons/People";
import IconMeetingRoom from "@material-ui/icons/MeetingRoom";
import IconNoMeetingRoom from "@material-ui/icons/NoMeetingRoom";
import IconSdStorage from "@material-ui/icons/SdStorage";
import IconSelected from "@material-ui/icons/CheckBoxRounded";

import Oidc from "../Libs/Oidc";

const styles = {
    root: {
        flexGrow: 1
    },
    flex: {
        flexGrow: 1
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20
    },
    list: {
        width: 250
    },
    fullList: {
        width: "auto"
    }
};

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
        e.preventDefault();
        this.props.history.push(to);
    }

    getMenuContent() {

        let loginItem = (
            <ListItem button onClick={e => this.oidc.logout()}>
                <ListItemIcon>
                    <IconNoMeetingRoom />
                </ListItemIcon>
                <ListItemText primary="Logout" />
            </ListItem>
        );

        if (!Oidc.isAuthenticated()) {
            loginItem = (
                <ListItem button onClick={async (e) => await this.oidc.authenticateRedirect()}>
                    <ListItemIcon>
                        <IconMeetingRoom />
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
                        <IconPhotoLibrary />
                    </ListItemIcon>
                    <ListItemText primary="Albums" />
                </ListItem>
                <ListItem button onClick={e => this.handleClick("/browse", e)}>
                    <ListItemIcon>
                        <IconSdStorage />
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
                        <IconPeople />
                    </ListItemIcon>
                    <ListItemText primary="About" />
                </ListItem>
            </div>
        );
    }

    render() {
        let { classes } = this.props;
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

// const HeaderWithPapi = withPapi(Header);

export default withRouter(withStyles(styles)(Header));