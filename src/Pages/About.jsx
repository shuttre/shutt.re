import React from 'react';
import Oidc from "../Libs/Oidc";

class About extends React.Component {

    render() {

        if (Oidc.isAuthenticated()) {
            return <div>
                    <div style={{wordWrap: "anywhere"}}>{Oidc.getAccessToken()}</div>
                    <hr />
                    <div>{Oidc.getJwtStr()}</div>
                </div>;
        }
        else {
            return <div>Not logged in.</div>;
        }
    }
}

export default About;
