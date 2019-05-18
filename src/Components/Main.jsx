import React from 'react';
import { Route, Switch, withRouter } from "react-router-dom";

import Oidc from "../Libs/Oidc";
import Browse from "../Pages/Browse";
import About from "../Pages/About";
import Albums from "../Pages/Albums";
import Album from "../Pages/Album";

import classes from "../Styles/Main.module.css";
import SelectedImages from "../Pages/SelectedImages";
import ManageAlbums from "../Pages/Manage/ManageAlbums";

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.oidc = new Oidc();
    }

    renderCallback() {
        this.oidc.fetchTokensAndLogin();
        return <div><p>Logging in. Please wait...</p></div>;
    }

    renderLoggedOut() {
        this.oidc.logout(false);
        return <div>You are logged out.</div>;
    }

    render() {
        return (
            <div className={classes.app}>
                <Switch>
                    {/*<Route exact path="/" render={(props) => <Home {...props} />} />*/}
                    <Route exact path="/" render={() => <div>Home</div>} />
                    <Route path="/loginError" render={() => <div>An error occurred while logging in.</div>} />
                    <Route path="/loggedout" render={() => this.renderLoggedOut()} />
                    <Route path="/callback" render={() => this.renderCallback()} />
                    <Route path="/albums" render={(props) => <Albums {...props} />} />
                    <Route path="/album/:albumId" render={(props) => <Album {...props} />} />
                    <Route path="/browse" render={(props) => <Browse {...props} />} />
                    <Route path="/selected" render={(props) => <SelectedImages {...props} />} />
                    <Route path="/about" render={(props) => <About {...props} />} />

                    <Route path="/manage/albums" render={(props) => <ManageAlbums {...props} />} />

                    <Route render={() => <div>Page not found!</div>} />
                </Switch>
            </div>
        );
    }

}

export default withRouter(Main);
