import React, {useState} from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import axios from "axios";
import {ToastBottomEnd, ToastLongBottomEnd} from "../components/Toast";
import {
    toastErrorMessageWithParameterConfig, toastSuccessMessageWithParameterConfig
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import InputRequire from "../components/InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const StaffImportPage = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = (ready ? t("Satis client - Importation objet de réclamation") : "");
    if (!(verifyPermission(props.userPermissions, 'store-staff-from-any-unit') || verifyPermission(props.userPermissions, 'store-staff-from-my-unit') || verifyPermission(props.userPermissions, 'store-staff-from-maybe-no-unit')))
        window.location.href = ERROR_401;

    const defaultData = {
        file: "",
        stop_identite_exist: 0,
        etat_update: 0
    };
    const defaultError = {
        file: [],
        stop_identite_exist: [],
        etat_update: []
    };
    const optionOne = 1;
    const optionTwo = 0;
    const optionThree = 1;
    const optionFour = 0;
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [errorFile, setErrorFile] = useState([])
    const [startRequest, setStartRequest] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        const newData = {...data};
        newData.file = Object.values(e.target.files)[0];
        setFileName(e.target.value);
        setData(newData);
    };

    const handleOptionOneChange = (e) => {
        const newData = {...data};
        newData.stop_identite_exist = parseInt(e.target.value);
        setData(newData);
    };

    const handleOptionTwoChange = (e) => {
        const newData = {...data};
        newData.etat_update = parseInt(e.target.value);
        setData(newData);
    };

    const formatFormData = (newData) => {
        const formData = new FormData();
        formData.append("_method", "post");
        for (const key in newData) {
            if (key === "file")
                formData.append("file", newData.file);
            else
                formData.set(key, newData[key]);
        }
        return formData;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        let endpoint = "";
        if (verifyPermission(props.userPermissions, 'store-staff-from-any-unit'))
            endpoint = `${appConfig.apiDomaine}/any/import-staffs`;
        else if (verifyPermission(props.userPermissions, 'store-staff-from-my-unit'))
            endpoint = `${appConfig.apiDomaine}/my/import-staffs`;
        else if (verifyPermission(props.userPermissions, 'store-staff-from-maybe-no-unit'))
            endpoint = `${appConfig.apiDomaine}/maybe/no/import-staffs`;
        if (endpoint.length) {
            setStartRequest(true);
            if (verifyTokenExpire()) {
                await axios.post(endpoint, formatFormData(data))
                    .then((response) => {
                        setStartRequest(false);
                        setError(defaultError);
                        if (response.data.status) {
                            setFileName("");
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
                        }
/*                        setData(defaultData);
                        ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(t("Succès de l'importation")));*/
                    })
                    .catch(({response}) => {
                        //console.log(response.data);
                        setStartRequest(false);
                        if(response.data["errors"] && response.data["errors"].length) {
                            setFileName("");
                            setErrorFile(response.data["errors"]);
                            ToastLongBottomEnd.fire(toastErrorMessageWithParameterConfig(response.data["errors"].length + " " + t("erreurs identifiées. Veuillez supprimer les lignes correctes puis corriger les lignes erronées avant de renvoyer le fichier")));
                        }
                        else if (response.data.code === 422) {
                            setError({...defaultError, ...response.data.error});
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Echec de l'importation")));
                        }
                        else
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Echec de l'importation")));
                    })
                ;
            }
        } else {
            window.location.href = ERROR_401;
        }
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, 'store-staff-from-any-unit') || verifyPermission(props.userPermissions, "store-staff-from-my-unit") || verifyPermission(props.userPermissions, "store-staff-from-maybe-no-unit") ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Paramètre")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <Link to="/settings/staffs" className="kt-subheader__breadcrumbs-link">
                                        {t("Agents")}
                                    </Link>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
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
                                                {t("Importation d'agent au format excel")}
                                            </h3>
                                        </div>
                                    </div>

                                    <form method="POST" className="kt-form">
                                        <div className="kt-form kt-form--label-right">
                                            <div className="kt-portlet__body">
                                                <div className="form-group validated row">
                                                    <label className="col-3 col-form-label">{t("Stop identité existe")} <InputRequire/></label>
                                                    <div className="col-9">
                                                        <div className="kt-radio-inline">
                                                            <label className="kt-radio">
                                                                <input type="radio" value={optionOne} onChange={handleOptionOneChange} checked={optionOne === data.stop_identite_exist}/> {t("Oui")}<span/>
                                                            </label>
                                                            <label className="kt-radio">
                                                                <input type="radio" value={optionTwo} onChange={handleOptionOneChange} checked={optionTwo === data.stop_identite_exist}/> {t("Non")}<span/>
                                                            </label>
                                                        </div>
                                                        {
                                                            error.stop_identite_exist.length ? (
                                                                error.stop_identite_exist.map((error, index) => (
                                                                    <spann key={index} className="form-text text-danger">
                                                                        {error}
                                                                    </spann>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className="form-group row">
                                                    <label className="col-3 col-form-label">{t("État update")} <InputRequire/></label>
                                                    <div className="col-9">
                                                        <div className="kt-radio-inline">
                                                            <label className="kt-radio">
                                                                <input type="radio"  value={optionThree} onChange={handleOptionTwoChange} checked={optionThree === data.etat_update}/> {t("Oui")}<span/>
                                                            </label>
                                                            <label className="kt-radio">
                                                                <input type="radio"  value={optionFour} onChange={handleOptionTwoChange} checked={optionFour === data.etat_update}/> {t("Non")}<span/>
                                                            </label>
                                                        </div>
                                                        {
                                                            error.etat_update.length ? (
                                                                error.etat_update.map((error, index) => (
                                                                    <spann key={index} className="form-text text-danger">
                                                                        {error}
                                                                    </spann>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className={error.file.length ? "form-group row validated" : "form-group row"}>
                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="senderID">{t("Fichier")} <InputRequire/></label>
                                                    <div className="col-lg-9 col-xl-6">
                                                        <input
                                                            id="senderID"
                                                            type="file"
                                                            className={error.file.length || errorFile.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder={t("Veuiller choisier le fichier")}
                                                            value={fileName}
                                                            onChange={(e) => handleFileChange(e)}
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
                                                            <Link to="/settings/staffs" className="btn btn-secondary mx-2">
                                                                {t("Quitter")}
                                                            </Link>
                                                        ) : (
                                                            <Link to="/settings/staffs" className="btn btn-secondary mx-2" disabled>
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

export default connect(mapStateToProps)(StaffImportPage);
