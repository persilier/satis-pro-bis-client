import React from 'react';
import appConfig from "../../../../config/appConfig";
import {Link, Switch} from "react-router-dom";
import {ToastBottomEnd} from "../../../../views/components/Toast";
import {toastErrorMessageWithParameterConfig} from "../../../../config/toastConfig";

import { useTranslation } from "react-i18next";

const ConnexionForm = ({componentData, data, error, startRequest, onChangeUserName, onViewPassword, onChangePassword, onClickConnectButton, alert, expires_in}) => {

    const {t, ready} = useTranslation();

    return (
        ready ? (<div className="kt-login__form" style={{paddingTop: '8.5%'}}>
            <div className="kt-login__title">
                <div className="form-group row"
                     style={{marginTop: '11%'}}>

                    <div className="col-lg-12 col-xl-6">
                        <img
                            id="Image1"
                            src={componentData && componentData.params.fr.owner_logo.value ? appConfig.apiDomaine + componentData.params.fr.owner_logo.value.url : null}
                            alt="logo"
                            style={{
                                maxWidth: "65px",
                                maxHeight: "65px",
                                textAlign: 'center'
                            }}
                        />
                    </div>
                </div>
                <h3> {componentData ? componentData.params.fr.title.value : ""}</h3>
            </div>

            {/*Alert connexion nouveau mot de passe*/}
            {
                alert ? (
                    <div className="alert alert-outline-warning fade show" role="alert">
                        <div className="alert-icon"><i className="flaticon-warning"></i></div>
                        <div className="alert-text">{t("Veuillez vous connecter avec votre nouveau mot de passe")}!</div>
                        <div className="alert-close">
                            <button type="button" className="close" data-dismiss="alert"
                                    aria-label="Close">
                                <span aria-hidden="true"><i className="la la-close"></i></span>
                            </button>
                        </div>
                    </div>
                ) : null

            }
            <form className="kt-form" id="kt_login__form" style={{marginBottom: '90px'}}>
                {
                    error.password.length ? (
                        <div className="alert alert-danger alert-bold" role="alert">
                            <div className="alert-text text-center">{error.password}</div>
                        </div>
                    ) : null
                }
                { (expires_in !== null) && (
                    <div className="alert alert-dark" role="alert">
                        <div className="alert-text ">{t("Votre compte a été désactivé, réessayez ultérieurement dans")} <b> {expires_in.minute < 10 ? 0 : null}{expires_in.minute}:{expires_in.second < 10 ? 0 : null}{expires_in.second} </b> </div>
                    </div>
                )}

                <div className={"form-group row"}>
                    <input
                        className={"form-control"}
                        type="email"
                        placeholder={t("Votre Email")}
                        name="username"
                        onChange={(e) => onChangeUserName(e)}
                        value={data.username}
                    />
                </div>
                <div className={"form-group row input_container"}>
                    <span className="input_icon">
                        <i id="icon" className="fa fa-eye-slash" aria-hidden="true" onClick={(e) => onViewPassword(e)}/>
                    </span>
                    <input
                        className={"form-control"}
                        type="password"
                        id="password"
                        placeholder={t("Votre Mot de Passe")}
                        name="password"
                        onChange={(e) => onChangePassword(e)}
                        value={data.password}
                    />
                </div>

                <div className="kt-login__extra text-right mt-2">

                    <Link to="/login/forgot" id="forgot_btn">
                        {t("Mot de passe oublié")}?
                    </Link>
                </div>

                <div className="kt-login__actions">

                    {
                        !startRequest ? (
                            <button type="submit"
                                    id="kt_login_signin_submit"
                                    className="btn btn-primary btn-elevate kt-login__btn-primary"
                                    onClick={onClickConnectButton}>
                                {t("Se connecter")}
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                type="button" disabled>
                                {t("Chargement")}...
                            </button>
                        )
                    }
                </div>
            </form>
        </div>) : null

    );
};
export default ConnexionForm;