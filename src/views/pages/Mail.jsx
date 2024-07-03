import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import InputRequire from "../components/InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const Mail = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - " + (ready ? t("Paramètre envoie de mail") : "");
    if (!verifyPermission(props.userPermissions, 'update-mail-parameters'))
        window.location.href = ERROR_401;

    const defaultData = {
        senderID: "",
        username: "",
        password: "",
        "from": "",
        server: "",
        port: "",
        security: ""
    };
    const defaultError = {
        senderID: [],
        username: [],
        password: [],
        "from": [],
        server: [],
        port: [],
        security: []
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        async function fetchData () {
            await axios.get(`${appConfig.apiDomaine}/configurations/mail`)
                .then(response => {
                    const newData = {
                        senderID: response.data.senderID,
                        username: response.data.username,
                        password: "",
                        "from": response.data["from"],
                        server: response.data.server,
                        port: response.data.port,
                        security: response.data.security.toLowerCase()
                    };
                    setData(newData);
                })
                .catch(error => {
                    console.log("Something is wrong");
                })
            ;
        }
        if (verifyTokenExpire()) {}
            fetchData();
    }, []);

    const onChangeSenderID = (e) => {
        const newData = {...data};
        newData.senderID = e.target.value;
        setData(newData);
    };

    const onChangeUsername = (e) => {
        const newData = {...data};
        newData.username = e.target.value;
        setData(newData);
    };

    const onChangePassword = (e) => {
        const newData = {...data};
        newData.password = e.target.value;
        setData(newData);
    };

    const onChangeFrom = (e) => {
        const newData = {...data};
        newData["from"] = e.target.value;
        setData(newData);
    };

    const onChangeServer = (e) => {
        const newData = {...data};
        newData.server = e.target.value;
        setData(newData);
    };

    const onChangePort = (e) => {
        const newData = {...data};
        newData.port = e.target.value;
        setData(newData);
    };

    const onChangeSecurity = (e) => {
        const newData = {...data};
        newData.security = e.target.value.toLowerCase();
        setData(newData);
    };

    const onSubmit = async (e) => {
        const sendData = {...data};
        e.preventDefault();

        if (!sendData.password.length)
            delete sendData.password;

        setStartRequest(true);
        if (verifyTokenExpire()) {
            await axios.put(`${appConfig.apiDomaine}/configurations/mail`, sendData)
                .then(response => {
                    setStartRequest(false);
                    setError(defaultError);
                    const newData = {...data};
                    newData.password = "";
                    setData(newData);
                    ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                })
                .catch(errorRequest => {
                    setStartRequest(false);
                    setError({...defaultError, ...errorRequest.response.data.error});
                    ToastBottomEnd.fire(toastEditErrorMessageConfig());
                })
            ;
        }
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, 'update-mail-parameters') ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Paramètre")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#link" className="kt-subheader__breadcrumbs-home">
                                        <i className="flaticon2-shelter"/>
                                    </a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#link" className="kt-subheader__breadcrumbs-link">
                                        {t("Envoie de mail")}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <div className="row">
                            <div className="col">
                                <div className="kt-portlet">
                                    <div className="kt-portlet__head">
                                        <div className="kt-portlet__head-label">
                                            <h3 className="kt-portlet__head-title">
                                                {t("Envoie de mail")}
                                            </h3>
                                        </div>
                                    </div>

                                    <form method="POST" className="kt-form">
                                        <div className="kt-form kt-form--label-right">
                                            <div className="kt-portlet__body">
                                                <div className={error.senderID.length ? "form-group row validated" : "form-group row"}>
                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="senderID">{t("Nom de l'expéditeur")} <InputRequire/></label>
                                                    <div className="col-lg-9 col-xl-6">
                                                        <input
                                                            id="senderID"
                                                            type="text"
                                                            className={error.senderID.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder="dmd"
                                                            value={data.senderID}
                                                            onChange={(e) => onChangeSenderID(e)}
                                                        />
                                                        {
                                                            error.senderID.length ? (
                                                                error.senderID.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className={error.username.length ? "form-group row validated" : "form-group row"}>
                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor={"username"}>{t("Email de l'expéditeur")} <InputRequire/></label>
                                                    <div className="col-lg-9 col-xl-6">
                                                        <input
                                                            id="username"
                                                            type="text"
                                                            className={error.username.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder="dmdconsult"
                                                            value={data.username}
                                                            onChange={(e) => onChangeUsername(e)}
                                                        />
                                                        {
                                                            error.username.length ? (
                                                                error.username.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className={error.password.length ? "form-group row validated" : "form-group row"}>
                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="password">{t("Mot de passe SMTP")} <InputRequire/></label>
                                                    <div className="col-lg-9 col-xl-6">
                                                        <input
                                                            id="password"
                                                            type="password"
                                                            className={error.password.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder="************"
                                                            value={data.password}
                                                            onChange={(e) => onChangePassword(e)}
                                                        />
                                                        {
                                                            error.password.length ? (
                                                                error.password.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className={error["from"].length ? "form-group row validated" : "form-group row"}>
                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="from">{t("Identifiant SMTP")} <InputRequire/></label>
                                                    <div className="col-lg-9 col-xl-6">
                                                        <input
                                                            id="from"
                                                            type="text"
                                                            className={error["from"].length ? "form-control is-invalid" : "form-control"}
                                                            placeholder="agent@dmdconsult.com"
                                                            value={data["from"]}
                                                            onChange={(e) => onChangeFrom(e)}
                                                        />
                                                        {
                                                            error["from"].length ? (
                                                                error["from"].map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className={error.server.length ? "form-group row validated" : "form-group row"}>
                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="server">{t("Serveur")} <InputRequire/></label>
                                                    <div className="col-lg-9 col-xl-6">
                                                        <input
                                                            id="server"
                                                            type="text"
                                                            className={error.server.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder="www.mailtrap.io"
                                                            value={data.server}
                                                            onChange={(e) => onChangeServer(e)}
                                                        />
                                                        {
                                                            error.server.length ? (
                                                                error.server.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className={error.port.length ? "form-group row validated" : "form-group row"}>
                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="port">{t("Port")} <InputRequire/></label>
                                                    <div className="col-lg-9 col-xl-6">
                                                        <input
                                                            id="port"
                                                            type="number"
                                                            className={error.port.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder="2525"
                                                            value={data.port}
                                                            onChange={(e) => onChangePort(e)}
                                                        />
                                                        {
                                                            error.port.length ? (
                                                                error.port.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className={error.security.length ? "form-group row validated" : "form-group row"}>
                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="security">{t("Sécurité")} <InputRequire/></label>
                                                    <div className="col-lg-9 col-xl-6">
                                                        <select
                                                            id="security"
                                                            className={error.security.length ? "form-control is-invalid" : "form-control"}
                                                            value={data.security.toUpperCase()}
                                                            onChange={(e) => onChangeSecurity(e)}
                                                        >
                                                            <option value="SSL">SSL</option>
                                                            <option value="TLS">TLS</option>
                                                        </select>
                                                        {
                                                            error.security.length ? (
                                                                error.security.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="kt-portlet__foot">
                                                <div className="kt-form__actions text-right">
                                                    {
                                                        !startRequest ? (
                                                            <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{t("Enregistrer")}</button>
                                                        ) : (
                                                            <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                                {t("Chargement")}...
                                                            </button>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(Mail);
