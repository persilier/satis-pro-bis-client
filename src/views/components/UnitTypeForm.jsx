import React, {useState, useEffect} from "react";
import axios from "axios";
import {connect} from "react-redux";
import {
    useParams,
    Link
} from "react-router-dom";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig, toastErrorMessageWithParameterConfig
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {ERROR_401, redirectError401Page} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import InputRequire from "./InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


const UnitTypeForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (id) {
        if (!verifyPermission(props.userPermissions, 'update-unit-type'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'store-unit-type'))
            window.location.href = ERROR_401;
    }
    const defaultData = {
        name: "",
        can_be_target: false,
        can_treat: false,
        description: "",
    };
    const defaultError = {
        name: [],
        can_be_target: [],
        can_treat: [],
        description: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        async function fetchData () {
            if (id) {
                await axios.get(`${appConfig.apiDomaine}/unit-types/${id}/edit`)
                    .then(({data}) => {
                        const newData = {
                            name: data.unitType.name ? data.unitType.name.fr : "",
                            can_be_target: data.unitType.can_be_target == 1,
                            can_treat: data.unitType.can_treat == 1,
                            description: data.unitType.description ? data.unitType.description.fr : "",
                        };
                        setData(newData);
                    })
                    .catch(error => {
                        //console.log("Something is wrong");
                    })
                ;
            }
        }
        if (verifyTokenExpire())
            fetchData();
    }, [id, appConfig.apiDomaine]);

    const onChangeName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };

    const onChangeDescription = (e) => {
        const newData = {...data};
        newData.description = e.target.value;
        setData(newData);
    };

    const handleCanBeTargetChange = e => {
        const newData = {...data, can_be_target: e.target.checked};
        setData(newData);
    };

    const handleCanTreatChange = e => {
        const newData = {...data, can_treat: e.target.checked};
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        let defaultDataPost = {
            name: data.name,
            can_be_target: data.can_be_target ? 1 : 0,
            can_treat: data.can_treat ? 1 : 0,
            description: data.description,
        };
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (id) {
                axios.put(`${appConfig.apiDomaine}/unit-types/${id}`, defaultDataPost)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    })
                    .catch(errorRequest => {
                        setStartRequest(false);
                        if (errorRequest.response.data.error.is_editable)
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(errorRequest.response.data.error.is_editable[0]));
                        else {
                            setError({...defaultError, ...errorRequest.response.data.error});
                            ToastBottomEnd.fire(toastEditErrorMessageConfig());
                        }
                    })
                ;
            } else {
                let defaultDataPost = {
                    name: data.name,
                    can_be_target: data.can_be_target ? 1 : 0,
                    can_treat: data.can_treat ? 1 : 0,
                    description: data.description,
                };
                axios.post(`${appConfig.apiDomaine}/unit-types`, defaultDataPost)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        setData(defaultData);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    })
                    .catch(errorRequest => {
                        redirectError401Page(errorRequest.response.data.code);
                        setStartRequest(false);
                        setError({...defaultError, ...errorRequest.response.data.error});
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
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to="/settings/unit_type" className="kt-subheader__breadcrumbs-link">
                                    {t("Type d'unité")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                    {
                                        id ? t("Modification") : t("Ajout")
                                    }
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
                                            {
                                                id ? t("Modification de type d'unité") : t("Ajout d'un type d'unité")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-form kt-form--label-right">
                                        <div className="kt-portlet__body">
                                            <div className={error.can_be_target.length || error.can_treat.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Type d'unité")}<InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <div className="kt-checkbox-inline">
                                                        <label className="kt-checkbox">
                                                            <input type="checkbox" checked={data.can_be_target} onChange={handleCanBeTargetChange}/> {t("Peut - être visé par une réclamation ?")}
                                                            <span/>
                                                            {
                                                                error.can_be_target.length ? (
                                                                    error.can_be_target.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </label>
                                                        <label className="kt-checkbox">
                                                            <input type="checkbox" checked={data.can_treat} onChange={handleCanTreatChange}/> {t("Peut résoudre une réclamation ?")}
                                                            <span/>

                                                            {
                                                                error.can_treat.length ? (
                                                                    error.can_treat.map((error, index) => (
                                                                            <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                            </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Type d'unité")}<InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le nom du type d'unité")}
                                                        value={data.name}
                                                        onChange={(e) => onChangeName(e)}
                                                    />
                                                    {
                                                        error.name.length ? (
                                                            error.name.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>
                                            </div>

                                            <div className={error.description.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="description">{t("Description")}</label>
                                                <div className="col-lg-9 col-xl-6">
                                                <textarea
                                                    id="description"
                                                    className={error.description.length ? "form-control is-invalid" : "form-control"}
                                                    placeholder={t("Veuillez entrer la description")}
                                                    cols="30"
                                                    rows="5"
                                                    value={data.description}
                                                    onChange={(e) => onChangeDescription(e)}
                                                />
                                                    {
                                                        error.description.length ? (
                                                            error.description.map((error, index) => (
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
                                                        <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{id ? t("Modifier") : t("Enregistrer")}</button>
                                                    ) : (
                                                        <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                            {t("Chargement")}...
                                                        </button>
                                                    )
                                                }
                                                {
                                                    !startRequest ? (
                                                        <Link to="/settings/unit_type" className="btn btn-secondary mx-2">
                                                            {t("Quitter")}
                                                        </Link>
                                                    ) : (
                                                        <Link to="/settings/unit_type" className="btn btn-secondary mx-2" disabled>
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
        );
    };

    return (
        ready ? (
            id ?
                verifyPermission(props.userPermissions, 'update-unit-type') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'store-unit-type') ? (
                    printJsx()
                ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
    };
};

export default connect(mapStateToProps)(UnitTypeForm);
