import React, {useState, useEffect} from "react";
import axios from "axios";
import {connect} from "react-redux";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import appConfig from "../../config/appConfig";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import InputRequire from "../components/InputRequire";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig, toastErrorMessageWithParameterConfig, toastSuccessMessageWithParameterConfig
} from "../../config/toastConfig";
import Select from "react-select";
import {useTranslation} from "react-i18next";


const endPointConfig = {
    PRO: {
        plan: "PRO",
        create: `${appConfig.apiDomaine}/proxy-metadata`,
        store: `${appConfig.apiDomaine}/update-proxy-metadata`,
        delete: `${appConfig.apiDomaine}/delete-proxy-metadata`,
    },
    MACRO: {
        holding: {
            create: `${appConfig.apiDomaine}/my/email-claim-configuration`,
            store: `${appConfig.apiDomaine}/my/email-claim-configuration`,
            storeKnowingIdentity: id => `${appConfig.apiDomaine}/my/email-claim-configuration/${id}`,
        },
        filial: {
            create: `${appConfig.apiDomaine}/my/email-claim-configuration`,
            store: `${appConfig.apiDomaine}/my/email-claim-configuration`,
            storeKnowingIdentity: id => `${appConfig.apiDomaine}/my/email-claim-configuration/${id}`,
        }
    },
    HUB: {
        plan: "HUB",
        create: `${appConfig.apiDomaine}/any/email-claim-configuration`,
        store: `${appConfig.apiDomaine}/any/email-claim-configuration`,
        storeKnowingIdentity: id => `${appConfig.apiDomaine}/any/email-claim-configuration/${id}`,
    }
};

const ProxyConfig = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - " + (ready ? t("Proxy Configuration") : "");

    if (
            !((verifyPermission(props.userPermissions, "update-proxy-config") && (verifyPermission(props.userPermissions, "show-proxy-config"))))
    )
        window.location.href = ERROR_401;

    let endPoint = "";
    if (props.plan === "HUB") {
        endPoint = endPointConfig[props.plan];
    } else if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'my-email-claim-configuration'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'my-email-claim-configuration'))
            endPoint = endPointConfig[props.plan].filial;
    } else
        endPoint = endPointConfig[props.plan];

    const defaultErrorProxy = {
        proxy_http_server:[],
        proxy_https_server : [],
        proxy_http_port : [],
        proxy_https_port: [],
        proxy_modules: [],
        institution_id: [],
    };

    const defaultDataProxy = {
        proxy_http_server: "",
        proxy_https_server : "",
        proxy_http_port : "",
        proxy_https_port: "",
        proxy_modules: ["sms"],
        institution_id: "",
    }

    const [reload, setReload] = useState(false);
    const [loadingProxy, setLoadingProxy] = useState(false);
    const [loadingProxyDisable, setLoadingProxyDisable] = useState(false);
    const [error, setError] = useState(defaultErrorProxy);
    const [data, setData] = useState(defaultDataProxy);
    const [configuration, setConfiguration] = useState({});
    const [institution, setInstitution] = useState(null);
    const [institutions, setInstitutions] = useState([])
    const [InputEmail, setInputEmail] = useState(false);
    const [InputSms, setInputSms] = useState(true);
    const [InputIncoming, setInputIncoming] = useState(false);
    const [disable, setDisable] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if ((verifyPermission(props.userPermissions, 'show-proxy-config')) ||  (verifyPermission(props.userPermissions, 'update-proxy-config'))) {
                await axios.get(endPoint.create)
                    .then(response => {
                        console.log(response.data);
                        const newData = {
                            proxy_http_server: response.data.proxy_http_server ? response.data.proxy_http_server : "",
                            proxy_https_server: response.data.proxy_https_server ? response.data.proxy_https_server : "",
                            proxy_http_port: response.data.proxy_http_port ? response.data.proxy_http_port : "",
                            proxy_https_port: response.data.proxy_https_port ? response.data.proxy_https_port : "",
                            proxy_modules: response.data.proxy_modules ? response.data.proxy_modules : [],
                        }
                        if (response?.data?.proxy_modules && response.data.proxy_modules.includes("sms"))
                            setInputSms(true);
                        if (response?.data?.proxy_modules && response.data.proxy_modules.includes("mail"))
                            setInputEmail(true);
                        if (response?.data?.proxy_modules && response.data.proxy_modules.includes("incoming_mail_service"))
                            setInputIncoming(true);
                        if (Object.keys(response.data).length === 0)
                            setDisable(true);
                        setConfiguration(response.data);
                        setData(newData);
                    })
                    .catch(error => {
                        console.log("Something is wrong");
                    });
            }
            else if (verifyPermission(props.userPermissions, 'any-email-claim-configuration')) {
                await axios.get(endPoint.create)
                    .then(async response => {
                        setInstitutions(formatOptions(response.data, "name", false, "email_claim_configuration"));
                    })
                    .catch(error => {
                        console.log("Something is wrong");
                    });

            }
        }

        if (verifyTokenExpire()) {
            fetchData();
        }
    }, [reload]);

    const onChangeServerHTTP = (e) => {
        const newData = {...data};
        newData.proxy_http_server = e.target.value;
        setData(newData);
    };
    const onChangeServerHTTPS = (e) => {
        const newData = {...data};
        newData.proxy_https_server = e.target.value;
        setData(newData);
    };

    const onChangePortHTTP = (e) => {
        const newData = {...data};
        newData.proxy_http_port = e.target.value;
        setData(newData);
    };

    const onChangePortHTTPS = (e) => {
        const newData = {...data};
        newData.proxy_https_port = e.target.value;
        setData(newData);
    };

    const onChangeInstitution = (selected) => {
        const newData = {...data};
        if (selected) {
            setInstitution(selected);
            if (selected.configuration !== null) {
                newData.institution_id = selected.configuration.institution_id ? selected.configuration.institution_id : "";
                selected.configuration.id && setConfiguration(selected.configuration.id);
            }
            else {
                setConfiguration("");
                newData.institution_id = selected.value;
            }
        } else {
            setInstitution(null);
            setConfiguration("");
            newData.institution_id = "";

        }
        setData(newData);
    };

    const onStore = async (e) => {
        e.preventDefault();
        const sendData = {...data};
        if (props.plan !== "HUB")
            delete sendData.institution_id;


        setLoadingProxy(true);
        if (verifyTokenExpire()) {
            sendData.proxy_modules = ["sms"]
                await axios.put(endPoint.store, sendData)
                    .then(response => {
                        console.log(response.data)
                        setLoadingProxy(false);
                        setError(defaultErrorProxy);
                    const newData = {...data};
                    setData(newData);
                    ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    setReload(!reload);
                })
                    .catch(error => {
                    setLoadingProxy(false);
                    setData(sendData);
                    if (error.response.data.code === 400)
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.error));
                    else {
                        setError({...defaultErrorProxy, ...error.response.data.error});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig);
                    }

                })
                ;
        }
    };

    const onDisable = async (e) => {
        e.preventDefault();
        const oldDisable = disable;
        if (oldDisable !== true) {
            if (verifyTokenExpire()) {
                setLoadingProxyDisable(true);
                await axios.delete(endPoint.delete)
                    .then(response => {
                        setData(defaultDataProxy);
                        setConfiguration({});
                        setInputSms(false);
                        setInputEmail(false);
                        setInputIncoming(false);
                        ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig("Configurations désactivées avec succès"));
                    })
                    .catch(error => {
                        console.log(error.message);
                        })
                    .finally(() => setLoadingProxyDisable(false)) ;
            }
        }
        setDisable(!oldDisable);

    };

    const onUpdate = async (e) => {
        const sendData = {...data};
        e.preventDefault();

        if (props.plan !== "HUB")
            delete sendData.institution_id;

        setLoadingProxy(true);
        if (verifyTokenExpire()) {
            await axios.post(endPoint.store, sendData)
                .then(response => {
                    setLoadingProxy(false);
                    setError(defaultErrorProxy);
                    const newData = {...data};
                    setData(newData);
                    ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    setReload(!reload);
                })
                .catch(error => {
                    setLoadingProxy(false);
                    if (error.response.data.code === 400)
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.error));
                    else {
                        setError({...defaultErrorProxy, ...error.response.data.error});
                        ToastBottomEnd.fire(toastEditErrorMessageConfig);
                    }
                })
            ;
        }
    };

    const handleDisabledInputChangeEmail = (e) => {
        const newData = {...data};
        if (e.target.checked === true)
            newData.proxy_modules.push("mail");
        else
            newData.proxy_modules.splice(newData.proxy_modules.indexOf("mail"), 1);
        setData(newData);
        setInputEmail(e.target.checked);
    };
    const handleDisabledInputChangeSms = (e) => {
        let newData = {...data};
        if (e.target.checked === true)
            newData.proxy_modules.push("sms");
        else
            newData.proxy_modules.splice(newData.proxy_modules.indexOf("sms"), 1);
        setData(newData);
        setInputSms(e.target.checked);
    };
    const handleDisabledInputChangeIncoming = (e) => {
        const newData = {...data};
        if (e.target.checked === true)
            newData.proxy_modules.push("incoming_mail_service");
        else
            newData.proxy_modules.splice(newData.proxy_modules.indexOf("incoming_mail_service"), 1);
        setData(newData);
        setInputIncoming(e.target.checked);
    };


    const formatOptions = (options, labelKey, translate, configuration, valueKey = "id") => {
        const newOptions = [];
        for (let i = 0; i < options.length; i++) {
            if (translate)
                newOptions.push({value: (options[i])[valueKey], label: ((options[i])[labelKey])[translate], configuration: (options[i])[configuration]});
            else
                newOptions.push({value: (options[i])[valueKey], label: (options[i])[labelKey], configuration: (options[i])[configuration]});
        }
        return newOptions;
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, "update-proxy-config") ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Paramètres")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#link" className="kt-subheader__breadcrumbs-home">
                                        <i className="flaticon2-shelter"/>
                                    </a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#link" className="kt-subheader__breadcrumbs-link">
                                        Proxy configuration
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
                                                Proxy configuration
                                            </h3>
                                        </div>
                                            <div style={{textAlign: "right",}}>
                                                {
                                                    !loadingProxyDisable ? (
                                                        <button type="submit" onClick={(e) => onDisable(e)} style={{marginTop:"10px"}} className="btn btn-danger">{disable ? t("Réactiver") : t("Désactiver")}</button>
                                                    ) : (
                                                        <button className="btn btn-danger  kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"  style={{marginTop:"10px"}} type="button" disabled>
                                                            {t("Chargement")}...
                                                        </button>
                                                    )

                                                }
                                            </div>

                                    </div>



                                    <form method="POST" className="kt-form">
                                        <div className="kt-form kt-form--label-right">

                                            <div className="kt-portlet">
                                                <div className="kt-portlet__body  kt-portlet__body--fit">

                                                    <div className="row row-no-padding row-col-separator-lg">
                                                        <div className="col-md-12 col-lg-6 col-xl-3">


                                                            <div className="kt-widget24">
                                                                <div className="kt-widget24__details">
                                                                    <div className="kt-widget24__info">
                                                                        <h4 className="kt-widget24__stats kt-font-brand kt-widget24__title" style={{marginBottom: "30px"}}>
                                                                           Proxy HTTP
                                                                        </h4>
                                                                    </div>
                                                                </div>

                                                                <div className="kt-widget24__action" style={{display:"block"}}>

															   <div className={error.proxy_http_server.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="host">{t("Serveur")} <InputRequire/></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="senderID"
                                                                            type="text"
                                                                            disabled={disable}
                                                                            className={error.proxy_http_server.length ? "form-control is-invalid" : "form-control"}
                                                                            value={data.proxy_http_server}
                                                                            onChange={(e) => onChangeServerHTTP(e)}
                                                                        />
                                                                        {
                                                                            error.proxy_http_server.length ? (
                                                                                error.proxy_http_server.map((error, index) => (
                                                                                    <div key={index} className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                      </div>
															   </div>

                                                               <div className={error.proxy_http_port.length ? "form-group row validated" : "form-group row"}>
                                                                        <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="port">Port </label>
                                                                        <div className="col-lg-9 col-xl-6">
                                                                            <input
                                                                                id="port"
                                                                                type="number"
                                                                                disabled={disable}
                                                                                className={error.proxy_http_port.length ? "form-control is-invalid" : "form-control"}
                                                                                value={data.proxy_http_port}
                                                                                onChange={(e) => onChangePortHTTP(e)}
                                                                            />
                                                                            {
                                                                                error.proxy_http_port.length ? (
                                                                                    error.proxy_http_port.map((error, index) => (
                                                                                        <div key={index} className="invalid-feedback">
                                                                                            {error}
                                                                                        </div>
                                                                                    ))
                                                                                ) : null
                                                                            }
                                                                        </div>
                                                                    </div>


                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div className="col-md-12 col-lg-6 col-xl-3">

                                                            <div className="kt-widget24">
                                                                <div className="kt-widget24__details">
                                                                    <div className="kt-widget24__info">
                                                                        <h4 className="kt-widget24__title kt-widget24__stats kt-font-brand"  style={{marginBottom: "30px"}}>
                                                                           Proxy HTTPS
                                                                        </h4>
                                                                    </div>

                                                                </div>
                                                                <div className="kt-widget24__action" style={{display:"block"}}>

                                                                    <div className={error.proxy_https_server.length ? "form-group row validated" : "form-group row"}>
                                                                        <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="hosthttps">{t("Serveur")} <InputRequire/></label>
                                                                        <div className="col-lg-9 col-xl-6">
                                                                            <input
                                                                                id="senderID"
                                                                                type="text"
                                                                                disabled={disable}
                                                                                className={error.proxy_https_server.length ? "form-control is-invalid" : "form-control"}
                                                                                value={data.proxy_https_server}
                                                                                onChange={(e) => onChangeServerHTTPS(e)}
                                                                            />
                                                                            {
                                                                                error.proxy_https_server.length ? (
                                                                                    error.proxy_https_server.map((error, index) => (
                                                                                        <div key={index} className="invalid-feedback">
                                                                                            {error}
                                                                                        </div>
                                                                                    ))
                                                                                ) : null
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                    <div className={error.proxy_https_port.length ? "form-group row validated" : "form-group row"}>
                                                                        <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="port">Port </label>
                                                                        <div className="col-lg-9 col-xl-6">
                                                                            <input
                                                                                id="port"
                                                                                type="number"
                                                                                disabled={disable}
                                                                                className={error.proxy_https_port.length ? "form-control is-invalid" : "form-control"}
                                                                                value={data.proxy_https_port}
                                                                                onChange={(e) => onChangePortHTTPS(e)}
                                                                            />
                                                                            {
                                                                                error.proxy_https_port.length ? (
                                                                                    error.proxy_https_port.map((error, index) => (
                                                                                        <div key={index} className="invalid-feedback">
                                                                                            {error}
                                                                                        </div>
                                                                                    ))
                                                                                ) : null
                                                                            }
                                                                        </div>
                                                                    </div>


                                                                </div>
                                                            </div>


                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                       {/*     <div className="form-group row" >
                                                <label className="col-form-label col-lg-4 col-sm-12 pt-0">{t("Utiliser pour")} :
                                                     </label>
                                                <div className="col-lg-8 col-md-8 col-sm-12" style={{verticalAlign: "middle", margin: "auto"}}>
                                                    <div className="kt-checkbox-list" style={{display: "flex"}}>
                                                        <label className="kt-checkbox" style={{marginRight: "20px"}}>
                                                            <input id="is_client" type="checkbox"
                                                                   checked={InputEmail}
                                                                   disabled={disable}
                                                                   onChange={handleDisabledInputChangeEmail}/>
                                                            {t("Mail")} <span/>

                                                        </label>
                                                        <label className="kt-checkbox" style={{marginRight: "20px"}}>
                                                            <input id="is_client" type="checkbox"
                                                                   checked={InputSms}
                                                                   disabled={disable}
                                                                   onChange={handleDisabledInputChangeSms}/>
                                                            {t("SMS")} <span/>

                                                        </label>
                                                        <label className="kt-checkbox" style={{marginRight: "20px"}}>
                                                            <input id="is_client" type="checkbox"
                                                                   checked={InputIncoming}
                                                                   disabled={disable}
                                                                   onChange={handleDisabledInputChangeIncoming}/>
                                                            {t(" Incoming mail service")} <span/>

                                                        </label>
                                                    </div>
                                                </div>
                                            </div>*/}


                                            <div className="kt-portlet__foot">
                                                <div className="kt-form__actions text-right">
                                                    {
                                                        !loadingProxy ? (
                                                            (Object.keys(configuration).length === 0) ? (
                                                                <button type="submit" onClick={(e) => onStore(e)} className="btn btn-primary">{t("Enregistrer")}</button>
                                                            ) : (
                                                                <button type="submit" onClick={(e) => onStore(e)} className="btn btn-primary">{t("Modifier")}</button>
                                                            )
                                                        ) : (
                                                            <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                                {t("Chargement")}...
                                                            </button>
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
        userPermissions: state.user.user.permissions,
        plan: state.plan.plan,
    };
};

export default connect(mapStateToProps)(ProxyConfig);
