import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    Link,
} from "react-router-dom";
import {ToastBottomEnd} from "./Toast";
import {
    toastEditErrorMessageConfig, toastEditSuccessMessageConfig,
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import InputRequire from "./InputRequire";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {connect} from "react-redux";
import {useTranslation} from "react-i18next";

const ConfigCoefficient = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    if (!verifyPermission(props.userPermissions, "update-relance-parameters"))
        window.location.href = ERROR_401;

    const defaultData = {
        coef: "",
    };
    const defaultError = {
        coef: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + `/configurations/relance`)
                .then(response => {
                    //console.log(response.data, "Data");
                    const newConfig = {
                        coef: response.data.coef,
                    };
                    setData(newConfig)
                })
            ;
        }
    }, []);

    const onChangeCoef = (e) => {
        const newData = {...data};
        newData.coef = e.target.value;
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            axios.put(appConfig.apiDomaine + `/configurations/relance`, data)
                .then(response => {
                    setStartRequest(false);
                    setError(defaultError);
                    ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                })
                .catch(error => {
                    setStartRequest(false);
                    setError({...defaultError, ...error.response.data.error});
                    ToastBottomEnd.fire(toastEditErrorMessageConfig());
                })
            ;
        }
    };
    const printJsx = () => {
        return (
            <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-container  kt-container--fluid ">
                        <div className="kt-subheader__main">
                            <h3 className="kt-subheader__title">
                                {t("Paramètres")}
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
                                    {t("Coefficient")}
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
                                            {t("Coefficient")}
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-portlet__body">

                                        <div className={error.coef.length ? "form-group  validated" : "form-group"}>
                                            <label htmlFor="coef"
                                                   title={t("Coefficient de la relance")}
                                                   data-toggle="tooltip"
                                                   data-placement="bottom">
                                                {t("Coefficient")} <InputRequire/><i className="fa fa-info-circle"/>
                                            </label>
                                            <div className="col-md-6 mb-3">
                                                <input
                                                    id="coef"
                                                    type="text"
                                                    className={error.coef.length ? "form-control is-invalid" : "form-control"}
                                                    placeholder={t("Veillez entrer le Coefficient")}
                                                    value={data.coef}
                                                    onChange={(e) => onChangeCoef(e)}
                                                />
                                                {
                                                    error.coef.length ? (
                                                        error.coef.map((error, index) => (
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
                                        <div className="kt-form__actions">
                                            {
                                                !startRequest ? (
                                                    <button type="submit" onClick={(e) => onSubmit(e)}
                                                            className="btn btn-primary">{t("Modifie")}r</button>
                                                ) : (
                                                    <button
                                                        className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                        type="button" disabled>
                                                        {t("Chargement")}...
                                                    </button>
                                                )
                                            }
                                            {
                                                !startRequest ? (
                                                    <Link to="/dashbord"
                                                          className="btn btn-secondary mx-2">
                                                        {t("Quitter")}
                                                    </Link>
                                                ) : (
                                                    <Link to="/dashbord"
                                                          className="btn btn-secondary mx-2" disabled>
                                                        {t("Quitter")}
                                                    </Link>
                                                )
                                            }

                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    return (
        ready ? (
            verifyPermission(props.userPermissions, "update-relance-parameters") ?
                printJsx()
                : null
        ) : null
    );
};

const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(ConfigCoefficient);
