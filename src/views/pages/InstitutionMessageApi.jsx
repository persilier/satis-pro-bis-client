import React, {useEffect, useState} from "react";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import axios from "axios";
import {connect} from "react-redux";
import appConfig from "../../config/appConfig";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig, toastErrorMessageWithParameterConfig,
} from "../../config/toastConfig";
import {Link, useParams} from "react-router-dom";
import Select from "react-select";
import {debug} from "../../helpers/function";
import InputRequire from "../components/InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


const InstitutionMessageApi = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const {id} = useParams();
    if (id) {
        if (!verifyPermission(props.userPermissions, 'update-institution-message-api'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'update-my-institution-message-api'))
            window.location.href = ERROR_401;
    }

    const [defaultData, setDefaultData] = useState({});
    const [defaultError, setDefaultError] = useState({});

    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [messageApis, setMessageApis] = useState([]);
    const [messageApi, setMessageApi] = useState(null);
    const [editData, setEditData] = useState(null);

    const formatMessageApiOptions = (messageApis) => {
        const messageApiOptions = [];
        messageApis.map(messageApi => messageApiOptions.push({value: messageApi.id, label: messageApi.method, params: messageApi.params}));
        return messageApiOptions;
    };

    const formatState = (params, paramData = null) => {
        const newState = {};
        const newError = {};
        console.log(paramData,"PARAMS");
        params.map(param => {
            if (param !== "to" && param !== "text") {
                newState[param] = paramData ? paramData[param] : "";
                newError[`params.${param}`] = [];
            }
        });
        setData(newState);
        setDefaultData(newState);
        setError(newError);
        setDefaultError(newError);
    };

    const initialState = (stateData) => {
        setEditData({...stateData.params, value: stateData.message_api.id});
        formatState(stateData.message_api.params, stateData.params);
        setMessageApi({
            value: stateData.message_api.id,
            label: stateData.message_api.method,
            params: stateData.message_api.params
        });
    };

    useEffect(() => {
        async function fetchData () {
            if (id) {
                await axios.get(`${appConfig.apiDomaine}/any/institutions/${id}/message-apis/create`)
                    .then(({data}) => {
                        setMessageApis(formatMessageApiOptions(data.messageApis));
                        if (data.institutionMessageApi) {
                            initialState(data.institutionMessageApi);
                        }
                    })
                    .catch(error => {
                        console.log("Something is wrong");
                    })
                ;
            } else {
                await axios.get(`${appConfig.apiDomaine}/my/institutions/message-apis/create`)
                    .then(({data}) => {
                        debug(data, "data");
                        setMessageApis(formatMessageApiOptions(data.messageApis));
                        if (data.institutionMessageApi) {
                            initialState(data.institutionMessageApi);
                        }
                    })
                    .catch(({response}) => {
                        console.log("Something is wrong");
                    })
                ;
            }
        }
        if (verifyTokenExpire())
            fetchData();
    }, []);

    const handleMessageApiChange = (selected) => {
        if (selected)
            formatState(selected.params, editData ? selected.value === editData.value ? editData : null : null);
        else {
            setData({});
            setDefaultData({});
            setError({});
            setDefaultError({});
        }
        setMessageApi(selected);
    };

    const handleChange = (e, param) => {
        const newData = {...data};
        newData[param] = e.target.value;
        setData(newData);
    };

    const executeSave = (url, saveData) => {
        if (verifyTokenExpire()) {
            axios.post(url, saveData)
                .then(() => {
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
        }
    };

    const saveData = (e) => {
        e.preventDefault();
        const sendData = {
            "message_api_id": messageApi ? messageApi.value : "",
            "params": data
        };
        debug(!sendData.message_api_id.length, "sendData");
        if (sendData.message_api_id.length) {
            setStartRequest(true);
            if (id)
                executeSave(`${appConfig.apiDomaine}/any/institutions/${id}/message-apis`, sendData);
            else
                executeSave(`${appConfig.apiDomaine}/my/institutions/message-apis`, sendData);
        } else
            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veuillez renseigner les informations")));
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
                                <a href="#button" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
                                    {t("Fournisseur SMS")}
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
                                            {t("Modification Fournisseur SMS")}
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-form kt-form--label-right">
                                        <div className="kt-portlet__body">

                                            <div className={"form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Fournisseur SMS")} <InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <Select
                                                        isClearable
                                                        value={messageApi}
                                                        placeholder="oceanique"
                                                        onChange={handleMessageApiChange}
                                                        options={messageApis}
                                                    />
                                                </div>
                                            </div>

                                            {
                                                Object.keys(error).length ? (
                                                    Object.keys(data).map((param, index) => (
                                                        <div key={index} className={ error[Object.keys(error)[index]].length ? "form-group row validated" : "form-group row"}>
                                                            <label className="col-xl-3 col-lg-3 col-form-label" htmlFor={Object.keys(data)[index]}>{Object.keys(data)[index]} <InputRequire/></label>
                                                            <div className="col-lg-9 col-xl-6">
                                                                <input
                                                                    id={Object.keys(data)[index]}
                                                                    type={Object.keys(data)[index] === "password" ? "password" : "text"}
                                                                    className={error[Object.keys(error)[index]].length ? "form-control is-invalid" : "form-control"}
                                                                    placeholder={Object.keys(data)[index]}
                                                                    value={data[Object.keys(data)[index]]}
                                                                    onChange={(e) => handleChange(e, param)}
                                                                />
                                                                {
                                                                    error[Object.keys(error)[index]].length ? (
                                                                        error[Object.keys(error)[index]].map((error, index) => (
                                                                            <div key={index} className="invalid-feedback">
                                                                                {error}
                                                                            </div>
                                                                        ))
                                                                    ) : null
                                                                }
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : null
                                            }
                                        </div>
                                        <div className="kt-portlet__foot">
                                            <div className="kt-form__actions text-right">
                                                {
                                                    !startRequest ? (
                                                        <button type="submit" onClick={(e) => saveData(e)} className="btn btn-primary">{id ? t("Modifier") : t("Enregistrer")}</button>
                                                    ) : (
                                                        <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                            {t("Chargement")}...
                                                        </button>
                                                    )
                                                }
                                                {/*{
                                                    !startRequest ? (
                                                        <Link to="/settings/institution" className="btn btn-secondary mx-2">
                                                            Quitter
                                                        </Link>
                                                    ) : (
                                                        <Link to="/settings/institution" className="btn btn-secondary mx-2" disabled>
                                                            Quitter
                                                        </Link>
                                                    )
                                                }*/}
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
                verifyPermission(props.userPermissions, 'update-institution-message-api') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'update-my-institution-message-api') ? (
                    printJsx()
                ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(InstitutionMessageApi);
