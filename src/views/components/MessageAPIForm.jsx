import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import axios from "axios";
import {connect} from "react-redux";
import Select from "react-select";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401, redirectError401Page} from "../../config/errorPage";
import appConfig from "../../config/appConfig";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig
} from "../../config/toastConfig";
import InputRequire from "./InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const MessageAPIForm = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (id) {
        if (!verifyPermission(props.userPermissions, 'update-message-apis'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'store-message-apis'))
            window.location.href = ERROR_401;
    }

    const defaultData = {
        name: "",
    };
    const defaultError = {
        name: [],
        method: [],
    };

    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [method, setMethod] = useState(null);
    const [methods, setMethods] = useState([]);

    const formatMethodOptions = ({methods}) => {
        const methodOptions = [];
        methods.map((method, index) => methodOptions.push({value: index, label: method}) );
        return methodOptions;
    };

    const formatSelectMethod = (methods, option) => {
        let formatOption;
        formatOption = methods.filter(el => el.label === option);
        return formatOption[0];
    };

    useEffect(() => {
        async function fetchData () {
            if (id) {
                await axios.get(`${appConfig.apiDomaine}/message-apis/${id}/edit`)
                    .then(response => {
                        const newData = {
                            name: response.data.messageApi.name,
                        };
                        setData(newData);
                        setMethod(formatSelectMethod(formatMethodOptions(response.data), response.data.messageApi.method));
                        setMethods(formatMethodOptions(response.data));
                    })
                    .catch(error => {
                        //console.log("Something is wrong");
                    })
                ;
            } else {
                await axios.get(`${appConfig.apiDomaine}/message-apis/create`)
                    .then(({data}) => {
                        setMethods(formatMethodOptions(data));
                    })
                    .catch(({response}) => {
                        //console.log("Something is wrong");
                    })
                ;
            }
        }
        if (verifyTokenExpire())
            fetchData();
    }, [appConfig.apiDomaine, id]);

    const onChangeName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };

    const handleMethodChange = (selected) => {
        setMethod(selected);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        const submitData = {name: data.name, method: method ? method.label : ""};
        if (verifyTokenExpire()) {
            if (id) {
                axios.put(`${appConfig.apiDomaine}/message-apis/${id}`, submitData)
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
                axios.post(`${appConfig.apiDomaine}/message-apis`, submitData)
                    .then(response => {
                        setStartRequest(false);
                        const oldMethod = method;
                        let newMethods = [...methods];
                        newMethods = newMethods.filter(el => el.label !== oldMethod.label );
                        setMethod(null);
                        setMethods(newMethods);
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
                                <Link to="/settings/message-apis" className="kt-subheader__breadcrumbs-link">
                                    {t("Message API")}
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
                                                id ? t("Modification d'un méssage API") : t("Ajout d'un méssage API")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-form kt-form--label-right">
                                        <div className="kt-portlet__body">
                                            <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Message API")} <InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le nom du Méssage API")}
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

                                            <div className={error.method.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Méthode")} <InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <Select
                                                        isClearable
                                                        value={method}
                                                        placeholder={t("Veuillez selectionner la méthod")}
                                                        onChange={handleMethodChange}
                                                        options={methods}
                                                    />
                                                    {
                                                        error.method.length ? (
                                                            error.method.map((error, index) => (
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
                                                        <Link to="/settings/message-apis" className="btn btn-secondary mx-2">
                                                            {t("Quitter")}
                                                        </Link>
                                                    ) : (
                                                        <Link to="/settings/message-apis" className="btn btn-secondary mx-2" disabled>
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
                verifyPermission(props.userPermissions, 'update-message-apis') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'store-message-apis') ? (
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

export default connect(mapStateToProps)(MessageAPIForm);
