import React, {useState} from "react";
import axios from "axios";
import {
    Link,
} from "react-router-dom";
import {ToastBottomEnd, ToastLongBottomEnd} from "../Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig, toastErrorMessageWithParameterConfig, toastSuccessMessageWithParameterConfig,
} from "../../../config/toastConfig";
import appConfig from "../../../config/appConfig";
import InputRequire from "../InputRequire";
import {connect} from "react-redux";
import {verifyPermission} from "../../../helpers/permission";
import {ERROR_401} from "../../../config/errorPage";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const endPointConfig = {
    PRO: {
        plan: "PRO",
        store: `${appConfig.apiDomaine}/my/import-clients`,
    },
    MACRO: {
        holding: {
            store: `${appConfig.apiDomaine}/any/import-clients`,
        },
        filial: {
            store: `${appConfig.apiDomaine}/my/import-clients`,
        }
    },
    HUB: {
        plan: "HUB",
        store: `${appConfig.apiDomaine}/any/import-clients `,
    }
};

const ImportClientForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    document.title = (ready ? t("Satis client - Importation de fichier excel") : null);

    if (!(verifyPermission(props.userPermissions, 'store-client-from-any-institution') ||
        verifyPermission(props.userPermissions, 'store-client-from-my-institution')))
        window.location.href = ERROR_401;

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'store-client-from-any-institution'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'store-client-from-my-institution'))
            endPoint = endPointConfig[props.plan].filial
    } else
        endPoint = endPointConfig[props.plan];


    const option1 = 1;
    const option2 = 0;

    const defaultData = {
        file: null,
        etat_update: null,
        stop_identite_exist: null,
    };
    const defaultError = {
        file: [],
        etat_update: "",
        stop_identite_exist: "",
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [errorFile, setErrorFile] = useState([])
    const [startRequest, setStartRequest] = useState(false);

    const onChangeFile = (e) => {
        const newData = {...data};
        newData.file = Object.values(e.target.files)[0];
        setData(newData);
    };

    const onChangeOption = (e) => {
        const newData = {...data};
        newData.stop_identite_exist = e.target.value;
        setData(newData);
    };
    const onChangeEtatOption = (e) => {
        const newData = {...data};
        newData.etat_update = e.target.value;
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
            axios.post(endPoint.store, formatFormData(data))
                .then(response => {
                    console.log(response)
                    setStartRequest(false);
                    setError(defaultError);
                 /*   if (response.data.status) {
                        setData(defaultData);
                        if(response.data["errors"] && response.data["errors"].length) {
                            setErrorFile(response.data["errors"]);
                            ToastLongBottomEnd.fire(toastErrorMessageWithParameterConfig(response.data["errors"].length + " " + t("erreurs identifiées. Veuillez supprimer les lignes correctes puis corriger les lignes erronées avant de renvoyer le fichier")));
                        } else
                            ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(t("Succès de l'importation")));
                    } else {
                        if(response.data["errors"] && response.data["errors"].length) {
                            setErrorFile(response.data["errors"]);
                            ToastLongBottomEnd.fire(toastErrorMessageWithParameterConfig(response.data["errors"].length + " " + t("erreurs identifiées. Veuillez supprimer les lignes correctes puis corriger les lignes erronées avant de renvoyer le fichier")));
                        } else
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veuillez verifier le fichier")));
                    }*/
                    if (response.status === 201) {
                        ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(t("Veuillez patienter le processus d'importation est en cours")));
                    }

                    setData(defaultData);
                    document.getElementById("etatupdatetrue").checked=0
                    document.getElementById("etatupdatefalse").checked=0
                    document.getElementById("stopidentitetrue").checked=0
                    document.getElementById("stopidentitefalse").checked=0
                    document.getElementById("file").value = null
                })
                .catch(response => {
                    console.log(response)
                    setStartRequest(false);
                   // if(response.data["errors"] && response.data["errors"].length) {
                    if(response.response.data.error) {
                       setErrorFile(response.response.data.error);
                      // ToastLongBottomEnd.fire(toastErrorMessageWithParameterConfig(response.data.error.length + " " + t("erreurs identifiées. Veuillez supprimer les lignes correctes puis corriger les lignes erronées avant de renvoyer le fichier")));
                       ToastLongBottomEnd.fire(toastErrorMessageWithParameterConfig(response.response.data.error.file[0]));
                    }
                    else if (response.data.code === 422) {
                        setError({...defaultError, ...response.data.error});
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Echec de l'importation")));
                    }
                    else {
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Echec de l'importation")));
                    }

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
                                            className={error.stop_identite_exist.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label">{t("Identité existe déjà")}
                                                ? <InputRequire/></label>
                                            <div className="kt-radio-inline col-lg-9 col-xl-6">

                                                <label className="kt-radio kt-radio--bold kt-radio--success">
                                                    <input
                                                        className={error.stop_identite_exist.length ? "form-control is-invalid" : "form-control"}
                                                        type="radio"
                                                        name="radio3"
                                                        id="stopidentitetrue"
                                                        value={option1}
                                                        onChange={(e) => onChangeOption(e)}
                                                    /> Oui
                                                    <span/>
                                                </label>
                                                <label className="kt-radio kt-radio--bold kt-radio--danger">
                                                    <input
                                                        className={error.stop_identite_exist.length ? "form-control is-invalid" : "form-control"}
                                                        type="radio"
                                                        name="radio3"
                                                        id="stopidentitefalse"
                                                        value={option2}
                                                        onChange={(e) => onChangeOption(e)}
                                                    /> Non
                                                    <span/>
                                                </label>
                                            </div>
                                            {
                                                error.stop_identite_exist.length ? (
                                                    error.stop_identite_exist.map((error, index) => (
                                                        <div key={index}
                                                             className="invalid-feedback">
                                                            {error}
                                                        </div>
                                                    ))
                                                ) : null
                                            }
                                        </div>

                                        <div
                                            className={error.etat_update.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label">{t("Est ce une mise a jour?")} <InputRequire/></label>
                                            <div className="kt-radio-inline col-lg-9 col-xl-6">

                                                <label className="kt-radio kt-radio--bold kt-radio--success">
                                                    <input
                                                        className={error.etat_update.length ? "form-control is-invalid" : "form-control"}
                                                        type="radio"
                                                        name="radio4"
                                                        id="etatupdatetrue"
                                                        value={option1}
                                                        onChange={(e) => onChangeEtatOption(e)}
                                                    /> Oui
                                                    <span/>
                                                </label>
                                                <label className="kt-radio kt-radio--bold kt-radio--danger">
                                                    <input
                                                        className={error.etat_update.length ? "form-control is-invalid" : "form-control"}
                                                        type="radio"
                                                        name="radio4"
                                                        id="etatupdatefalse"
                                                        value={option2}
                                                        onChange={(e) => onChangeEtatOption(e)}
                                                    /> Non
                                                    <span/>
                                                </label>
                                            </div>
                                            {
                                                error.etat_update.length ? (
                                                    error.etat_update.map((error, index) => (
                                                        <div key={index}
                                                             className="invalid-feedback">
                                                            {error}
                                                        </div>
                                                    ))
                                                ) : null
                                            }
                                        </div>

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

                                                {
                                                    /*{index + 1}-  {error}*/
                                                    errorFile.length ? (
                                                        errorFile.map((element, index) => (
                                                            element.messages ? (
                                                                <div key={index} className="invalid-feedback">
                                                                    {
                                                                        Object.keys(element.messages).map((message, idx) => (
                                                                            message.length ? (
                                                                                element.messages[message].map((error, id) => {
                                                                                    return (
                                                                                        <>
                                                                                            {(" " + (idx === 0 ? t("ligne ") + element.line + " - " : "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0") + error)}
                                                                                            <br/>
                                                                                        </>
                                                                                    )
                                                                                })
                                                                            ) :null
                                                                        ))
                                                                    }
                                                                </div>
                                                            ) : null
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
                                                    <Link to="/settings/clients"
                                                          className="btn btn-secondary mx-2">
                                                        {t("Quitter")}
                                                    </Link>
                                                ) : (
                                                    <Link to="/settings/clients"
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
            verifyPermission(props.userPermissions, 'store-client-from-any-institution') ||
            verifyPermission(props.userPermissions, 'store-client-from-my-institution') ?
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

export default connect(mapStateToProps)(ImportClientForm);
