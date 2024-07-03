import React, {useState} from 'react';
import axios from "axios";
import appConfig from "../../../../config/appConfig";
import {Link} from "react-router-dom";
import {ToastBottomEnd} from "../../../../views/components/Toast";
import {toastEditErrorMessageConfig, toastEditSuccessMessageConfig,} from "../../../../config/toastConfig";
import "./LoginCss.css"
import {useTranslation} from "react-i18next";


const ReinitialisationForm = (props) => {

    const {t, ready} = useTranslation();

    const defaultData = {
        email: "",
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
    };
    const defaultError = {
        email: [],
        current_password: [],
        new_password: [],
        new_password_confirmation: []
    };
    const [getDataReset, setGetDataReset] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequestForgot, setStartRequestForgot] = useState(false);


    const onChangeEmail = (e) => {
        const newData = {...getDataReset};
        newData.email = e.target.value;
        setGetDataReset(newData);
    };
    const onChangePasswordOld = (e) => {
        const newData = {...getDataReset};
        newData.new_password = e.target.value;
        setGetDataReset(newData);
    };
    const onChangePassword = (e) => {
        const newData = {...getDataReset};
        newData.current_password = e.target.value;
        setGetDataReset(newData);
    };
    const onChangePasswordConfirm = (e) => {
        const newData = {...getDataReset};
        newData.new_password_confirmation = e.target.value;
        setGetDataReset(newData);
    };
    const onViewPassword = (e) => {
        let input = document.getElementById("password");
        let inputConfirm = document.getElementById("password_confirm");
        let icon = document.getElementById("icon");
        if (input.type === "password" || inputConfirm.type === "password") {
            input.type = "text";
            inputConfirm.type = "text";
            icon.className = "fa fa-eye"
        } else {
            input.type = "password";
            inputConfirm.type = "password";
            icon.className = "fa fa-eye-slash"
        }
    };

    const onClick = (e) => {
        let invitation = false

        setStartRequestForgot(true);

        axios.put(appConfig.apiDomaine + `/reset-password-expired`, getDataReset)
            .then(response => {
                setStartRequestForgot(false);
                setError(defaultError);
                ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                invitation = true
                localStorage.setItem("successInvitation", invitation)
                window.location.href = '/login';
            })
            .catch(error => {
                setStartRequestForgot(false);
                setError({...defaultError, ...error.response.data.error});
                ToastBottomEnd.fire(toastEditErrorMessageConfig());
            })
        ;

    };
    return (
        <div>
            {ready ? (<div className="kt-login__form " style={{paddingTop: "15.5%"}}>
                <div className="kt-login__head">
                    <h3 className="kt-login__title">{t("Réinitialisation du Mot de Passe")} </h3>
                    <div className="kt-login__desc text-center">{t("Entrer votre nouveau mot de passe")}:
                    </div>
                </div>
                <form className="kt-form" id="kt_login__form" style={{marginBottom: '5%'}}>

                    <div className="form-group row input_container">
                        <input
                            id="email"
                            className="form-control"
                            type="email"
                            placeholder="Email"
                            value={getDataReset.email}
                            onChange={e => onChangeEmail(e)}
                        />
                        {
                            error.email.length ? (
                                <div className="invalid-feedback">
                                    {error.email}
                                </div>
                            ) : null
                        }
                    </div>
                    <div
                        className={error.current_password.length ? "form-group row input_container validated" : "form-group row input_container"}>
                        <input
                            id="password"
                            className="form-control"
                            type="password"
                            placeholder={t("Ancien mot de passe")}
                            value={getDataReset.current_password}
                            onChange={e => onChangePassword(e)}
                        />
                        {
                            error.current_password.length ? (
                                <div className="invalid-feedback">
                                    {error.current_password}
                                </div>
                            ) : null
                        }
                    </div>
                    <div
                        className={error.new_password.length ? "form-group row input_container validated" : "form-group row input_container"}>

                        <input
                            id="new_password"
                            className="form-control"
                            type="password"
                            placeholder={t("Nouveau mot de passe")}
                            value={getDataReset.new_password}
                            onChange={e => onChangePasswordOld(e)}
                        />
                        {
                            error.new_password.length ? (
                                <div className="invalid-feedback">
                                    {error.new_password}
                                </div>
                            ) : null
                        }
                    </div>
                    <div
                        className={error.new_password_confirmation.length ? "form-group row input_container validated" : "form-group row input_container"}>

                        <input
                            id="password_confirm"
                            className="form-control"
                            type="password"
                            placeholder={t("Confirmer le nouveau mot de passe")}
                            value={getDataReset.new_password_confirmation}
                            onChange={e => onChangePasswordConfirm(e)}
                        />
                        {
                            error.new_password_confirmation.length ? (
                                <div className="invalid-feedback">
                                    {error.new_password_confirmation}
                                </div>
                            ) : null
                        }
                    </div>
                    <div className="kt-login__actions">

                        {
                            !startRequestForgot ? (
                                <button type="submit"
                                        id="kt_login_forgot_submit"
                                        className="btn btn-brand btn-pill btn-elevate"
                                        onClick={onClick}>{t("Modifier")}
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary btn-pill btn-elevate kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                    type="button" disabled>
                                    {t("Chargement")}...
                                </button>
                            )
                        }
                        <Link to={"/login"} id="kt_login_forgot_cancel"
                              className="btn btn-outline-brand btn-pill">{t("Quitter")}
                        </Link>
                    </div>

                </form>
            </div>) : null}
        </div>
    );

}

export default ReinitialisationForm;