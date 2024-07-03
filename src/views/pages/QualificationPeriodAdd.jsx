import React, {useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastAddSuccessMessageConfig,
    toastErrorMessageWithParameterConfig, toastSuccessMessageWithParameterConfig
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import {Link} from "react-router-dom";
import PeriodForm from "../components/PeriodForm";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const QualificationPeriodAdd = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = (ready ? t("Satis client - Paramètre délai de qualification") : null);
    if (!verifyPermission(props.userPermissions, 'store-delai-qualification-parameters'))
        window.location.href = ERROR_401;

    const defaultData = {
        borne_inf: "",
        borne_sup: "",
    };
    const defaultError = {
        borne_inf: [],
        borne_sup: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [infinite, setInfinite] = useState(false);

    const handleBorneInfChange = (e) => {
        const newData = {...data};
        if (e.target.value) {
            if (parseInt(e.target.value) < 0 ) {
                newData.borne_inf = "";
                ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Borne inférieure invalide")));
            } else {
                if (data.borne_sup) {
                    if (parseInt(e.target.value) < parseInt(data.borne_sup)) {
                        newData.borne_inf = e.target.value;
                    } else {
                        newData.borne_inf = "";
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Borne inférieure invalide")));
                    }
                } else
                    newData.borne_inf = e.target.value;
            }
        } else {
            newData.borne_inf = "";
        }
        setData(newData);
    };

    const handleBorneSupChange = (e) => {
        const newData = {...data};
        if (e.target.value) {
            if (parseInt(e.target.value) < 0 ) {
                newData.borne_sup = "";
                ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Borne supérieur invalide")));
            } else {
                if (parseInt(e.target.value) <= parseInt(data.borne_inf))
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Borne supérieur invalide")));
                else
                    ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(t("Borne supérieur valide")));
                newData.borne_sup = e.target.value;
            }
        } else {
            newData.borne_sup = "";
        }
        setData(newData);
    };

    const handleInfiniteChange = (e) => {
        setInfinite(e.target.checked);
        if (e.target.checked) {
            const newData = {...data};
            newData.borne_sup = "";
            setData(newData);
        }
    };

    const validPeriod = () => {
        if ((data.borne_sup && data.borne_inf) || (data.borne_inf && infinite)) {
            if (infinite)
                return true;
            else {
                if (parseInt(data.borne_inf) < parseInt(data.borne_sup))
                    return true;
                else {
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veuillez renseigner correctement la borne supérieure")));
                    return false;
                }
            }
        }
        else {
            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veuillez renseigner les bornes")));
            return false;
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const newData = {borne_inf: parseInt(data.borne_inf), borne_sup: infinite ? "+" : parseInt(data.borne_sup)};
        if (validPeriod()) {
            setStartRequest(true);
            if (verifyTokenExpire()) {
                axios.post(`${appConfig.apiDomaine}/delai-qualification-parameters`, newData)
                    .then(({data}) => {
                        setStartRequest(false);
                        setError(defaultError);
                        setData(defaultError);
                        setInfinite(false);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig())
                    })
                    .catch(({response}) => {
                        setStartRequest(false);
                        if (typeof response.data.error === "object")
                            setError(response.data.error);
                        if (typeof response.data.error === "string") {
                            setError(defaultError);
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(response.data.error));
                        }
                        //console.log("Something is wrong");
                    })
                ;
            }
        }
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, 'store-delai-qualification-parameters') ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Paramètres")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <Link to="/settings/qualification-period" className="kt-subheader__breadcrumbs-link">
                                        {t("Délai qualification")}
                                    </Link>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                        {t("Ajout période")}
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
                                                {t("Période")}
                                            </h3>
                                        </div>
                                    </div>

                                    <form method="POST" className="kt-form">
                                        <div className="kt-form kt-form--label-right">
                                            <div className="kt-portlet__body">
                                                <PeriodForm
                                                    infinite={infinite}
                                                    handleInfiniteChange={handleInfiniteChange}
                                                    error={error}
                                                    data={data}
                                                    handleBorneInfChange={handleBorneInfChange}
                                                    handleBorneSupChange={handleBorneSupChange}
                                                />
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

                                                    {
                                                        !startRequest ? (
                                                            <Link to="/settings/qualification-period" className="btn btn-secondary mx-2">
                                                                {t("Quitter")}
                                                            </Link>
                                                        ) : (
                                                            <Link to="/settings/qualification-period" className="btn btn-secondary mx-2" disabled>
                                                                {t("Quitter")}
                                                            </Link>
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

export default connect(mapStateToProps)(QualificationPeriodAdd);
