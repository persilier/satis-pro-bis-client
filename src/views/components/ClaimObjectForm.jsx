import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {
    useParams,
    Link
} from "react-router-dom";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig
} from "../../config/toastConfig";
import {ToastBottomEnd} from "./Toast";
import Select from "react-select";
import {formatSelectOption} from "../../helpers/function";
import appConfig from "../../config/appConfig";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import InputRequire from "./InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const ClaimObjectForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (id) {
        if (!verifyPermission(props.userPermissions, 'update-claim-object'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'store-claim-object'))
            window.location.href = ERROR_401;
    }

    const [claimCategories, setClaimCategories] = useState([]);
    const [claimCategory, setClaimCategory] = useState(null);
    const [severityLevels, setSeverityLevels] = useState([]);
    const [severityLevel, setSeverityLevel] = useState(null);

    const defaultData = {
        name: "",
        description: "",
        claim_category_id: claimCategories.length ? claimCategories[0].id : "",
        severity_levels_id: "",
        time_limit: "",
    };
    const defaultError = {
        name: [],
        description: [],
        claim_category_id: [],
        severity_levels_id: [],
        time_limit: []
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        async function fetchData () {
            if (id) {
                await axios.get(`${appConfig.apiDomaine}/claim-objects/${id}/edit`)
                    .then( response => {
                        setClaimCategories(formatSelectOption(response.data.claimCategories, "name", "fr"));
                        setSeverityLevels(formatSelectOption(response.data.severityLevels, "name", "fr"));
                        const newData = {
                            name: response.data.claimObject.name["fr"],
                            description: response.data.claimObject.description["fr"],
                            claim_category_id: response.data.claimObject.claim_category_id,
                            severity_levels_id: response.data.claimObject.severity_levels_id === null ? "" : response.data.claimObject.severity_levels_id,
                            time_limit: response.data.claimObject.time_limit === null ? 0 : response.data.claimObject.time_limit,
                        };
                        setData(newData);
                        setClaimCategory({value: response.data.claimObject.claim_category_id, label: response.data.claimObject.claim_category.name["fr"]});
                        setSeverityLevel(
                            response.data.claimObject.severity_levels_id === null ? {} : {value: response.data.claimObject.severity_levels_id, label: response.data.claimObject.severity_level.name["fr"]}
                        );
                    })
                    .catch(error => {
                        //console.log("Something is wrong");
                    })
                ;
            } else {
                await axios.get(`${appConfig.apiDomaine}/claim-objects/create`)
                    .then(response => {
                        setClaimCategories(formatSelectOption(response.data.claimCategories, "name", "fr"));
                        setSeverityLevels(formatSelectOption(response.data.severityLevels, "name", "fr"));
                    })
                    .catch(error => {
                        //console.log("something is wrong");
                    })
                ;
            }
        }
        if (verifyTokenExpire())
            fetchData();
    }, []);

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

    const onChangeClaimCategory = (selected) => {
        const newData = {...data};
        newData.claim_category_id = selected ? selected.value : "";
        setClaimCategory(selected);
        setData(newData);
    };

    const onChangeTimeLimit = (e) => {
        const newData = {...data};
        newData.time_limit = e.target.value;
        setData(newData);
    };

    const onChangeSeverityLevel = (selected) => {
        const newData = {...data};
        newData.severity_levels_id = selected ? selected.value : "";
        setSeverityLevel(selected);
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (id) {
                axios.put(`${appConfig.apiDomaine}/claim-objects/${id}`, data)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    })
                    .catch(errorRequest => {
                        setStartRequest(false);
                        setError({...defaultError, ...errorRequest.response.data.error});
                        ToastBottomEnd.fire(toastEditErrorMessageConfig());
                    })
                ;
            } else {
                axios.post(`${appConfig.apiDomaine}/claim-objects`, data)
                    .then(response => {
                        setStartRequest(false);
                        setClaimCategory({});
                        setSeverityLevel({});
                        setError(defaultError);
                        setData(defaultData);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    })
                    .catch(errorRequest => {
                        setStartRequest(false);
                        setError({...defaultError, ...errorRequest.response.data.error});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig());
                    })
                ;
            }
        }
    };

    const printJsx = () => (
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
                            <Link to="/settings/claim_objects" className="kt-subheader__breadcrumbs-link">
                                {t("Objet de réclamation")}
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
                                            id ? t("Modification d'objet de réclamation") : t("Ajout d'objet de réclamation")
                                        }
                                    </h3>
                                </div>
                            </div>

                            <form method="POST" className="kt-form">
                                <div className="kt-form kt-form--label-right">
                                    <div className="kt-portlet__body">
                                        <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Objet de réclamation")} <InputRequire/></label>
                                            <div className="col-lg-9 col-xl-6">
                                                <input
                                                    id="name"
                                                    type="text"
                                                    className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                    placeholder={t("Nom de l'objet de réclamation")}
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

                                        <div className={error.claim_category_id.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="unit_type">{t("Catégorie de l'objet")} <InputRequire/></label>
                                            <div className="col-lg-9 col-xl-6">
                                                <Select
                                                    isClearable
                                                    value={claimCategory}
                                                    placeholder={t("Catégorie de l'objet de réclamation")}
                                                    onChange={onChangeClaimCategory}
                                                    options={claimCategories}
                                                />
                                                {
                                                    error.claim_category_id.length ? (
                                                        error.claim_category_id.map((error, index) => (
                                                            <div key={index} className="invalid-feedback">
                                                                {error}
                                                            </div>
                                                        ))
                                                    ) : null
                                                }
                                            </div>
                                        </div>

                                        <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="timeLimite">{t("Délai de traitement (en jours)")} <InputRequire/></label>
                                            <div className="col-lg-9 col-xl-6">
                                                <input
                                                    id="timeLimite"
                                                    type="number"
                                                    className={error.time_limit.length ? "form-control is-invalid" : "form-control"}
                                                    placeholder={t("Temps limite de l'objet")}
                                                    value={data.time_limit}
                                                    onChange={(e) => onChangeTimeLimit(e)}
                                                />
                                                {
                                                    error.time_limit.length ? (
                                                        error.time_limit.map((error, index) => (
                                                            <div key={index} className="invalid-feedback">
                                                                {error}
                                                            </div>
                                                        ))
                                                    ) : null
                                                }
                                            </div>
                                        </div>

                                        <div className={error.severity_levels_id.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="timeLimite">{t("Niveau de gravité")} <InputRequire/></label>
                                            <div className="col-lg-9 col-xl-6">
                                                <Select
                                                    isClearable
                                                    value={severityLevel}
                                                    placeholder={t("Selectioner le niveau de gravité")}
                                                    onChange={onChangeSeverityLevel}
                                                    options={severityLevels}
                                                />
                                                {
                                                    error.severity_levels_id.length ? (
                                                        error.severity_levels_id.map((error, index) => (
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
                                                    placeholder={t("Description")}
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
                                                    <Link to="/settings/claim_objects" className="btn btn-secondary mx-2">
                                                        {t("Quitter")}
                                                    </Link>
                                                ) : (
                                                    <Link to="/settings/claim_objects" className="btn btn-secondary mx-2" disabled>
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

    return (
        ready ? (
            id ? (
                verifyPermission(props.userPermissions, 'update-claim-object') ? (
                    printJsx()
                ) : null
            ) : (
                verifyPermission(props.userPermissions, 'store-claim-object') ? (
                    printJsx()
                ) : null
            )
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
    };
};

export default connect(mapStateToProps)(ClaimObjectForm);
