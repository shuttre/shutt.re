import React from "react";
import { withRouter } from 'react-router'

import Drawer from "@material-ui/core/Drawer";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import MenuIcon from "@material-ui/icons/Menu";
import HomeIcon from "@material-ui/icons/Home";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import PeopleIcon from "@material-ui/icons/People";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import NoMeetingRoomIcon from "@material-ui/icons/NoMeetingRoom";
import SdStorageIcon from "@material-ui/icons/SdStorage";

import Oidc from "./Oidc";

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
                    <NoMeetingRoomIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
            </ListItem>
        );

        if (!Oidc.isAuthenticated()) {
            loginItem = (
                <ListItem button onClick={async (e) => await this.oidc.authenticateRedirect()}>
                    <ListItemIcon>
                        <MeetingRoomIcon />
                    </ListItemIcon>
                    <ListItemText primary="Login" />
                </ListItem>
            );
        }

        return (
            <div>
                <ListItem button onClick={e => this.handleClick("/", e)}>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem button onClick={e => this.handleClick("/albums", e)}>
                    <ListItemIcon>
                        <PhotoLibraryIcon />
                    </ListItemIcon>
                    <ListItemText primary="Albums" />
                </ListItem>
                <ListItem button onClick={e => this.handleClick("/browse", e)}>
                    <ListItemIcon>
                        <SdStorageIcon />
                    </ListItemIcon>
                    <ListItemText primary="Browse storage" />
                </ListItem>
                <Divider />
                {loginItem}
                <ListItem button onClick={e => this.handleClick("/about", e)}>
                    <ListItemIcon>
                        <PeopleIcon />
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
                                <MenuIcon />
                            </IconButton>
                            <Typography
                                variant="title"
                                color="inherit"
                                className={classes.flex}
                            >
                                News
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