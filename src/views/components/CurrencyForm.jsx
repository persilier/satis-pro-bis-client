import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    useParams,
    Link
} from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import appConfig from "../../config/appConfig";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig
} from "../../config/toastConfig";
import {ERROR_401, redirectError401Page} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import currencies from "../../constants/currencyContry";
import InputRequire from "./InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const CurrencyForm = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (id) {
        if (!verifyPermission(["update-currency"], 'update-currency'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(["store-currency"], 'store-currency'))
            window.location.href = ERROR_401;
    }

    const [listCurrency, setListCurrency] = useState(currencies());
    const [currency, setCurrency] = useState(null);

    const defaultData = {
        name: "",
        iso_code: "",
    };
    const defaultError = {
        name: [],
        iso_code: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        async function fetchData () {
            if (id) {
                await axios.get(`${appConfig.apiDomaine}/currencies/${id}`)
                    .then(({data}) => {
                        const newData = {
                            name: data.currency.name["fr"],
                            iso_code: data.currency.iso_code
                        };
                        setData(newData);
                        setListCurrency(filterCurrency(data.currencies));
                    })
                    .catch(error => {
                        //console.log("Something is wrong");
                    })
                ;
            } else {
                await axios.get(`${appConfig.apiDomaine}/currencies`)
                    .then(({data}) => {
                        setListCurrency(filterCurrency(data));
                    })
                    .catch(error => {
                        //console.log("Something is wrong");
                    })
            }
        }
        if (verifyTokenExpire())
            fetchData();
    }, [appConfig.apiDomaine, id]);

    const filterCurrency = (removeElement) => {
        let newCurrencyList = [...listCurrency];

        for (let i = 0; i < removeElement.length; i++) {
            newCurrencyList = newCurrencyList.filter(e => e.iso_code !== removeElement[i].iso_code);
        }

        return newCurrencyList;
    };

    const onChangeCurrency = (selected) => {
        if (error.iso_code.length || error.name.length)
            setError(defaultError);
        const newData = {...data};
        newData.iso_code = selected ? selected.iso_code : null;
        newData.name = selected ? selected.label : null;
        setCurrency(selected);
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (id) {
                axios.put(`${appConfig.apiDomaine}/currencies/${id}`, data)
                    .then(response => {
                        setStartRequest(false);
                        setCurrency(null);
                        setError(defaultError);
                        setListCurrency(filterCurrency([data]));
                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    })
                    .catch(errorRequest => {
                        setStartRequest(false);
                        setError({...defaultError, ...errorRequest.response.data.error});
                        ToastBottomEnd.fire(toastEditErrorMessageConfig());
                    })
                ;
            } else {
                axios.post(`${appConfig.apiDomaine}/currencies`, data)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        setData(defaultData);
                        setCurrency(null);
                        setListCurrency(filterCurrency([data]));
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
                                    {t("Devise")}
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
                                                id ? t("Modification de la devise") : t("Ajout de la devise")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-form kt-form--label-right">
                                        <div className="kt-portlet__body">
                                            <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Devise")} <InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <Select
                                                        isClearable
                                                        value={currency}
                                                        placeholder={t("Veillez selectioner la devise")}
                                                        onChange={onChangeCurrency}
                                                        options={listCurrency}
                                                    />
                                                </div>
                                            </div>

                                            <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Nom")} <InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <input
                                                        disabled={true}
                                                        id="name"
                                                        type="text"
                                                        className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder=""
                                                        value={data.name}
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

                                            <div className={error.iso_code.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="iso_code">ISO code <InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <input
                                                        disabled={true}
                                                        id="iso_code"
                                                        type="text"
                                                        className={error.iso_code.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder=""
                                                        value={data.iso_code}
                                                    />
                                                    {
                                                        error.iso_code.length ? (
                                                            error.iso_code.map((error, index) => (
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
                                                        <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{t("Enregistrer")}</button>
                                                    ) : (
                                                        <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                            {t("Chargement")}...
                                                        </button>
                                                    )
                                                }
                                                {
                                                    !startRequest ? (
                                                        <Link to="/settings/currencies" className="btn btn-secondary mx-2">
                                                            {t("Quitter")}
                                                        </Link>
                                                    ) : (
                                                        <Link to="/settings/currencies" className="btn btn-secondary mx-2" disabled>
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
                verifyPermission(["update-currency"], 'update-currency') ? (
                    printJsx()
                ) : null
                : verifyPermission(["store-currency"], 'store-currency') ? (
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

export default connect(mapStateToProps)(CurrencyForm);
