import React, {Component} from "react";
import NatureAppChoice from "./NatureAppChoice";
import {connect} from "react-redux";
import Echo from "laravel-echo";
import RouteApp from "./routeApp";
import {loadPlan} from "./store/actions/planAction";
import {loadYear} from "./store/actions/yearAction";
import appConfig from "./config/appConfig";
import {AUTH_TOKEN} from "./constants/token";
import axios from "axios";
import Loader from "./views/components/Loader";

window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'e0acb5bac6ddb3b710f4',
    cluster: 'mt1',
    forceTLS: true,
    wsHost: appConfig.host,
    wsPort: appConfig.port,
    disableStats: false,
    authEndpoint: appConfig.apiDomaine + '/api/broadcasting/auth',
    auth: {
        headers: {
            Authorization: AUTH_TOKEN
        }
    }
});

class AppContainer extends Component {
    constructor(props) {
        super(props);
        if (localStorage.getItem("plan"))
            this.props.loadPlan(localStorage.getItem("plan"));
        this.state = {
            load: true
        };
    }

    componentDidMount() {
        axios.get(`${appConfig.apiDomaine}/plan`)
            .then(response => {
                console.log(response.data, "plan");
                this.setState({load: false});
                localStorage.setItem('plan', response.data.plan);
                if (response.data.year_installation!==null){
                    localStorage.setItem('year_installation', response.data.year_installation);
                }
                this.props.loadPlan(response.data.plan);
                this.props.loadYear(response.data.year_installation!==null?response.data.year_installation:"")
            })
            .catch(error => {
                this.setState({load: false});
                console.log("Something is wrong");
            });
    }

    render() {
        const plan = this.props.plan;
        const load = this.state.load;
        return (
            !plan ? (
                load ? (
                        <Loader/>
                    ) :
                    <NatureAppChoice/>
            ) : (
                <RouteApp/>
            )
        );
    }
}

const mapStateToProps = (state) => {
    return {
        plan: state.plan.plan
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadPlan: (plan) => dispatch(loadPlan(plan)),
        loadYear: (plan) => dispatch(loadYear(plan))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
