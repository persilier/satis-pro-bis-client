import React, {Component} from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import LoginPage from "./modules/login/views/Pages/LoginPage.jsx";
import App from "./views/layouts/App";
import {connect} from 'react-redux';
import {updateUser} from "./store/actions/authActions";


class RouteApp extends Component {
    constructor(props) {
        super(props);
        if (localStorage.getItem('token'))
            this.props.updateUser();
    }

    render() {
        return (
            <Router>
                    {
                        !this.props.user.token ? (
                            <LoginPage/>
                            ) : <App />
                    }
            </Router>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateUser: () => {
            dispatch(updateUser())
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RouteApp);
