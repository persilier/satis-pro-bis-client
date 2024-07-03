import React, {useEffect, useState} from "react";
import {getToken, loadCss, loadScript} from "../../../../helpers/function";
import appConfig from "../../../../config/appConfig";
import axios from "axios";
import {connect} from 'react-redux';
import {ToastBottomEnd} from "../../../../views/components/Toast";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import {
    toastConnectErrorMessageConfig,
    toastConnectSuccessMessageConfig,
    toastErrorMessageWithParameterConfig,
} from "../../../../config/toastConfig";
import Loader from "../../../../views/components/Loader";
import "./LoginCss.css"
import ForgotForm from "./ForgotForm";
import ReinitialisationForm from "./ReinitialisationForm";
import ConnexionForm from "./ConnexionForm";
import {PasswordConfirmation} from "../../../../views/components/ConfirmationAlert";
import {passwordExpireConfig} from "../../../../config/confirmConfig";
import {useTranslation} from "react-i18next";
import ForgotPasswordForm from "./ForgotPasswordForm";

loadCss("/assets/css/pages/login/login-1.css");
loadScript("/assets/js/pages/custom/login/login-1.js");

const LoginPage = (props) => {
    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const tokenData = getToken(window.location.href);
    const defaultError = {
        username: "",
        password: ""
    };
    const defaultData = {
        username: "",
        password: ""
    };
    const [load, setLoad] = useState(true);
    const [data, setData] = useState(defaultData);
    const [componentData, setComponentData] = useState(undefined);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [expiresIn, setExpireIn] = useState(null);

    useEffect(() => {
        let mounted = true;
        // let invitation = localStorage.getItem("successInvitation")

        async function fetchData() {
            await axios.get(appConfig.apiDomaine + "/components/retrieve-by-name/connection")
                .then(response => {
                    if (mounted) {
                        setComponentData(response.data);
                        setLoad(false);
                        localStorage.removeItem("Dtimeout")
                    }
                })
                .catch(error => {
                    if (mounted) {
                        setLoad(false);
                        localStorage.removeItem("Dtimeout")
                        console.log("Something is wrong");
                    }
                })
            ;
        }

        fetchData().catch(console.error);
        return () => mounted = false;
    }, []);

    useEffect(() => {
        const decount = JSON.parse(localStorage.getItem('decount'));
        if (decount) {
            startDecounter(decount.minute, decount.second);
        }
    }, []);

    const onChangeUserName = (e) => {
        const newData = {...data};
        newData.username = e.target.value;
        setData(newData);
    };

    const onChangePassword = (e) => {
        const newData = {...data};
        newData.password = e.target.value;
        setData(newData);
    };
    const onViewPassword = (e) => {
        let input = document.getElementById("password");
        let icon = document.getElementById("icon");
        if (input.type === "password") {
            input.type = "text";
            icon.className = "fa fa-eye"
        } else {
            input.type = "password";
            icon.className = "fa fa-eye-slash"
        }
    };

    const startDecounter = (minute, second = 0) => {
        setExpireIn({
            minute: minute,
            second: second
        });
        localStorage.setItem('decount', JSON.stringify({
            minute: minute,
            second: second
        }));

        window.timeIntervale = setInterval(() => {
            const decount = JSON.parse(localStorage.getItem('decount'));
            if (decount) {
                if (decount.second === 0 && decount.minute === 0) {
                    setExpireIn(null);
                    localStorage.removeItem('decount');
                    clearInterval(window.timeIntervale);
                } else {
                    if (decount.second === 0) {
                        decount.minute = decount.minute - 1;
                        decount.second = 59;
                    } else {
                        decount.second = decount.second - 1;
                    }
                    setExpireIn(decount);
                    localStorage.setItem('decount', JSON.stringify(decount));
                }
            } else {
                localStorage.removeItem('decount');
                setExpireIn(null);
                clearInterval(window.timeIntervale);
            }
        }, 1000);
    };

    const onClickConnectButton = async (e) => {
        e.preventDefault(e);
        setStartRequest(true);

        const formData = {
            grant_type: appConfig.listConnectData[props.plan].grant_type,
            client_id: appConfig.listConnectData[props.plan].client_id,
            client_secret: appConfig.listConnectData[props.plan].client_secret,
            username: data.username,
            password: data.password
        };
        await axios.post(appConfig.apiDomaine + `/login`, formData)
            .then(response => {
                const token = response.data.access_token;
                const refresh_token = response.data.refresh_token;
                const expire_in = response.data.expires_in;
                axios.get(appConfig.apiDomaine + `/login`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }).then(response => {
                    // setError(defaultError);
                    // setStartRequest(false);
                    ToastBottomEnd.fire(toastConnectSuccessMessageConfig());
                    const user = response.data;
                    localStorage.setItem("userData", JSON.stringify(response.data));
                    localStorage.setItem('token', token);
                    localStorage.setItem('expire_in', expire_in);
                    localStorage.setItem('debug', JSON.stringify({user: 'Kilian', old: 15}));
                    var date = new Date();
                    date.setSeconds(date.getSeconds() + expire_in - 180);
                    localStorage.setItem('date_expire', date);
                    localStorage.setItem('refresh_token', refresh_token);

                    setTimeout(()=>{
                        window.location.href = "/dashboard";
                    },500)
                });
            })
            .catch(error => {
                setStartRequest(false);
                setError(defaultError);
                if (error.response.data.status === 403) {
                    localStorage.removeItem('decount');
                    if (window.timeIntervale) {
                        clearInterval(window.timeIntervale);
                    }
                    startDecounter(Math.trunc(error.response.data.expire_in/60), error.response.data.expire_in%60);
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.message));
                } else if (error.response.data.status === 400) {
                    setExpireIn(null);
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.message));
                } else if (error.response.status === 401 || error.response.status === 422) {
                    setExpireIn(null);
                    setError({
                        username: ready ? t("Email ou mot de passe incorrect") : "",
                        password: ready ? t("Email ou mot de passe incorrect") : ""
                    });
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Email ou mot de passe incorrect")));
                } else if (error.response.data.status === 423) {
                    setExpireIn(null);
                    PasswordConfirmation.fire(passwordExpireConfig(error.response.data.message))
                        .then(response => {
                            window.location.pathname = (`/reset-password`)
                        })
                } else if (error.response.data.status === 406) {
                    setExpireIn(null);
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Désolé, vous etes déjà connecté sur un autre appareil")));
                } else {
                    setExpireIn(null);
                    if (data.username === "" || data.password === "") {
                        setError({
                            username: ready ? t("Email ou mot de passe incorrect") : "",
                            password: ready ? t("Email ou mot de passe incorrect") : ""
                        });
                    }
                    ToastBottomEnd.fire(toastConnectErrorMessageConfig());
                }
            })
        ;
    };
    return (
        load ? (
            <Loader/>
        ) : (
            <BrowserRouter>
                <div className="kt-grid kt-grid--ver kt-grid--root kt-page">
                    <div className="kt-grid kt-grid--hor kt-grid--root  kt-login kt-login--v1" id="kt_login">
                        <div
                            className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--desktop kt-grid--ver-desktop kt-grid--hor-tablet-and-mobile">

                            <div className="kt-grid kt-grid--ver kt-grid--root kt-page">
                                <div className="kt-grid kt-grid--hor kt-grid--root  kt-login kt-login--v1"
                                     id="kt_login">

                                    <div
                                        className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--desktop kt-grid--ver-desktop kt-grid--hor-tablet-and-mobile">
                                        <div className="kt-grid__item kt-grid__item--order-tablet-and-mobile-2 kt-grid kt-grid--hor kt-login__aside"
                                             style={
                                                 {
                                                     backgroundImage: `url(${(componentData && componentData.params.fr.background.value) ? appConfig.apiDomaine + componentData.params.fr.background.value.url : " "})`
                                                 }
                                             }>
                                            <div className="kt-grid__item">
                                            <span className="kt-login__logo">
                                                <img
                                                    src={
                                                        (componentData && componentData.params.fr.logo.value) ? appConfig.apiDomaine + componentData.params.fr.logo.value.url : "/assets/images/satisLogo.png"
                                                    }/>
                                                <span style={{
                                                    color: "white",
                                                    fontSize: "1em",
                                                    paddingLeft: "5px"
                                                }}>
                                                {componentData ? componentData.params.fr.version.value : props.plan + appConfig.version}
                                            </span>
                                            </span>
                                            </div>
                                            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver">
                                                <div className="kt-grid__item kt-grid__item--middle">
                                                    <h3 className="kt-login__title"> {componentData ? componentData.params.fr.header.value + componentData.params.fr.version.value : null}</h3>
                                                    <h4 className="kt-login__subtitle"> {componentData ? componentData.params.fr.description.value + " " : null}</h4>
                                                </div>
                                            </div>
                                            <div className="kt-grid__item">
                                                <div className="kt-login__info">
                                                    <div className="kt-login__copyright">
                                                        © {appConfig.appFullName(props.year)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className="kt-grid__item kt-grid__item--fluid kt-grid__item--order-tablet-and-mobile-1  kt-login__wrapper">
                                            <div className="kt-login__body">

                                                <Switch>
                                                    <Route exact path="/">
                                                        <ConnexionForm
                                                            alert={localStorage.getItem('successInvitation')}
                                                            componentData={componentData}
                                                            data={data}
                                                            error={error}
                                                            startRequest={startRequest}
                                                            onChangeUserName={onChangeUserName}
                                                            onViewPassword={onViewPassword}
                                                            onChangePassword={onChangePassword}
                                                            onClickConnectButton={onClickConnectButton}
                                                            expires_in={expiresIn}
                                                        />
                                                    </Route>
                                                    <Route exact path="/login">
                                                        <ConnexionForm
                                                            alert={localStorage.getItem('successInvitation')}
                                                            componentData={componentData}
                                                            data={data}
                                                            error={error}
                                                            startRequest={startRequest}
                                                            onChangeUserName={onChangeUserName}
                                                            onViewPassword={onViewPassword}
                                                            onChangePassword={onChangePassword}
                                                            onClickConnectButton={onClickConnectButton}
                                                            expires_in={expiresIn}
                                                        />
                                                    </Route>
                                                    <Route exact path="/login/forgot">
                                                        <ForgotForm/>
                                                    </Route>

                                                    <Route exact path={`/forgot-password`}>
                                                        <ReinitialisationForm/>
                                                    </Route>

                                                    <Route exact path={`/forgot-password/${tokenData}`}>
                                                        <ForgotPasswordForm
                                                            token={tokenData}
                                                        />
                                                    </Route>


                                                </Switch>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </BrowserRouter>
        )
    );
};

const mapStateToProps = state => {
    return {
        plan: state.plan.plan,
        year: state.year.year
    };
};

export default connect(mapStateToProps)(LoginPage);
