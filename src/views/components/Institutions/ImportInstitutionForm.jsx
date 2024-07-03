import React, {useState} from "react";
import axios from "axios";
import {
    Link,
} from "react-router-dom";
import {ToastBottomEnd} from "../Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
} from "../../../config/toastConfig";
import appConfig from "../../../config/appConfig";
import InputRequire from "../InputRequire";
import {connect} from "react-redux";
import {verifyPermission} from "../../../helpers/permission";
import {ERROR_401} from "../../../config/errorPage";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


const ImportInstitutionForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    document.title = (ready ? t("Satis institution - Importation de fichier excel") : "");

    if (!verifyPermission(props.userPermissions, 'store-any-institution'))
        window.location.href = ERROR_401;

    const defaultData = {
        file: "",
    };
    const defaultError = {
        file: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    const onChangeFile = (e) => {
        const newData = {...data};
        newData.file = Object.values(e.target.files)[0];
        setData(newData);
    };


    const formatFormData = (newData) => {
        const formData = new FormData();
        formData.append("_method", "post");
        for (const key in newData) {
            // //console.log(`${key}:`, newData[key]);
            if (key === "file") {
                formData.append("file", newData.file);
            } else
                formData.set(key, newData[key]);
        }
        //console.log(formData.get('file'), 'FORMDATA');
        return formData;

    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);

        if (verifyTokenExpire()) {
            if (verifyTokenExpire()) {
                axios.post(`${appConfig.apiDomaine}/any/import-institutions`, formatFormData(data))
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        setData(defaultData);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError({...defaultError, ...error.response.data.error});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig());
                    })
                ;
            }
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
                                    {t("Importation")}
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
                                            {t("Importation de clients")}
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-portlet__body">

                                        <div
                                            className={error.file.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label"
                                                   htmlFor="file">{t("Fichier")} <InputRequire/></label>
                                            <div className="col-md-9 mb-3">
                                                <input
                                                    id="file"
                                                    type="file"
                                                    className={error.file.length ? "form-control is-invalid" : "form-control"}
                                                    placeholder={t("Veuillez télécharger le fichier excel")}
                                                    onChange={(e) => onChangeFile(e)}
                                                />
                                                {
                                                    error.file.length ? (
                                                        error.file.map((error, index) => (
                                                            <div key={index} className="invalid-feedback">
                                                                {error}
                                                            </div>
                                                        ))
                                                    ) : null
                                                }
                                            </div>
                                        </div>

                                    </div>
                                    <div className="kt-portlet__foot text-right">
                                        <div className="kt-form__actions">
                                            {
                                                !startRequest ? (
                                                    <button type="submit" onClick={(e) => onSubmit(e)}
                                                            className="btn btn-primary">{t("Enregistrer")}</button>
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
                                                    <Link to="/settings/institution"
                                                          className="btn btn-secondary mx-2">
                                                        {t("Quitter")}
                                                    </Link>
                                                ) : (
                                                    <Link to="/settings/institution"
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
            verifyPermission(props.userPermissions, 'store-any-institution') ?
                printJsx()
                : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        plan: state.plan.plan,
    }
};

export default connect(mapStateToProps)(ImportInstitutionForm);
