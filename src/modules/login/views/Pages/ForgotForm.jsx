import React, {useState} from 'react';
import axios from "axios";
import appConfig from "../../../../config/appConfig";
import {ToastBottomEnd} from "../../../../views/components/Toast";
import {
    toastAddErrorMessageConfig,
    toastErrorMessageWithParameterConfig,
    toastSuccessMessageWithParameterConfig
} from "../../../../config/toastConfig";
import {Link} from "react-router-dom";

import {useTranslation} from "react-i18next";

const ForgotForm = () => {
    const [email, setEmail] = useState('');
    const [startRequestForgot, setStartRequestForgot] = useState(false);

    const {t, ready} = useTranslation();

    const onClickForgotPassword = (e) => {
        setStartRequestForgot(true);
        const data = {
            email: email
        };
        axios.post(appConfig.apiDomaine + `/forgot-password`, data)
            .then(response => {
                setStartRequestForgot(false);
                ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(response.data.message));
                setEmail('')
            })
            .catch(error => {
                console.log("HERE5", error.response.data.code)
                setStartRequestForgot(false);
                if( error.response.data.error && error.response.data.code === 422){
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.error.email));
                } else if (error.response.data.code === 404){
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.error));
                } else {
                    ToastBottomEnd.fire(toastAddErrorMessageConfig);
                }

            })
        ;
    };

    return (

        <div>
            {ready ? (<div className="kt-login__form " style={{paddingTop: "43%"}}>
                <div className="kt-login__head" style={{marginTop: '70px'}}>
                    <h3 className="kt-login__title">{t("Mot de Passe oublié")}?</h3>
                    <div className="kt-login__desc text-center">
                        {t("Entrer votre email pour récupérer votre mot de passe")} :
                    </div>
                </div>
                <form className="kt-form" id="kt_login__form" style={{marginBottom: '90px'}}>
                    <div className="form-group row">
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="kt-login__actions">

                        {
                            !startRequestForgot ? (
                                <button type="submit"
                                        id="kt_login_forgot_submit"
                                        className="btn btn-brand btn-pill btn-elevate"
                                        onClick={onClickForgotPassword}>{t("Envoyer")}
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
};

export default ForgotForm;