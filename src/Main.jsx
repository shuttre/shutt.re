import React from 'react';
import { Route, Switch, withRouter } from "react-router-dom";

import './Main.css';
import Oidc from "./Oidc";
import Browse from "./Browse";
import About from "./About";
import Albums from "./Albums";
import Album from "./Album";

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
            <div className="App">
                <Switch>
                    {/*<Route exact path="/" render={(props) => <Home {...props} />} />*/}
                    <Route exact path="/" render={() => <div>Home</div>} />
                    <Route path="/loginError" render={() => <div>An error occurred while logging in.</div>} />
                    <Route path="/loggedout" render={() => this.renderLoggedOut()} />
                    <Route path="/callback" render={() => this.renderCallback()} />
                    <Route path="/albums" render={(props) => <Albums {...props} />} />
                    <Route path="/album/:albumId" render={(props) => <Album {...props} />} />
                    <Route path="/browse" render={(props) => <Browse {...props} />} />
                    <Route path="/about" render={(props) => <About {...props} />} />
                    <Route render={() => <div>Page not found!</div>} />
                </Switch>
            </div>
        );
    }

}

export default withRouter(Main);
