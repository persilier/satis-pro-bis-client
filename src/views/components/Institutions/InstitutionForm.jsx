import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    useParams,
    Link
} from "react-router-dom";
import {ToastBottomEnd} from "../Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig, toastEditSuccessMessageConfig,
} from "../../../config/toastConfig";
import appConfig from "../../../config/appConfig";
import Select from "react-select";
import {ERROR_401} from "../../../config/errorPage";
import {verifyPermission} from "../../../helpers/permission";
import {connect} from "react-redux";
import InputRequire from "../InputRequire";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


const InstitutionForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (!id) {
        if (!verifyPermission(props.userPermissions, 'store-any-institution'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'update-any-institution'))
            window.location.href = ERROR_401;
    }
    const defaultData = {
        institution_type_id: "",
        name: "",
        acronyme: "",
        iso_code: "",
        logo: "/assets/media/users/Icon.png",
        default_currency_slug:""
    };
    const defaultError = {
        institution_type_id: [],
        name: [],
        acronyme: [],
        iso_code: [],
        logo: "/assets/media/users/Icon.png",
        default_currency_slug:[]
    };
    const [data, setData] = useState(defaultData);
    const [logo, setLogo] = useState(undefined);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [defaultCurrency, setDefaultCurrency] = useState(null);
    const [defaultCurrencyData, setDefaultCurrencyData] = useState([]);

    useEffect(() => {
        if (verifyTokenExpire()) {
            if (verifyPermission(props.userPermissions, 'store-any-institution')) {
                axios.get(appConfig.apiDomaine + '/any/institutions/create')
                    .then(response => {
                        setDefaultCurrencyData(response.data.currencies.length ?
                            response.data.currencies.map((currencie) => ({
                                value: currencie.slug,
                                label: currencie.name.fr
                            })) : null
                        )
                        // setDefaultCurrencyData(options);
                    })
                ;
            }

            if (id) {
                axios.get(appConfig.apiDomaine + `/any/institutions/${id}`)
                    .then(response => {
                        const newInstitution = {
                            default_currency_slug: (response.data.default_currency_slug !== null) ? (response.data.default_currency_slug) : '',
                            name: response.data.name,
                            acronyme: response.data.acronyme,
                            iso_code: response.data.iso_code,
                            logo: response.data.logo,
                        };
                        setData(newInstitution);
                        if (response.data.default_currency_slug !== null) {
                            setDefaultCurrency({
                                value: response.data.default_currency.slug,
                                label: response.data.default_currency.name.fr
                            });
                        }
                    })
                ;
            }
        }
    }, []);

    const onChangeName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };
    const onChangeCurrencies = (selected) => {
        const newData = {...data};
        newData.default_currency_slug = selected.value;
        setDefaultCurrency(selected);
        setData(newData);
    };

    const onChangeAcronyme = (e) => {
        const newData = {...data};
        newData.acronyme = e.target.value;
        setData(newData);
    };

    const onChangeIsoCode = (e) => {
        const newData = {...data};
        newData.iso_code = e.target.value;
        setData(newData);
    };

    const onChangeFile = (e) => {
        const newData = {...data};
        newData.logo = e.target.files[0];
        setData(newData);
        setLogo(newData);
        var reader = new FileReader();
        reader.onload = function (e) {
            var image = document.getElementById('Image1');
            image.src = e.target.result;
        };
        reader.readAsDataURL(newData.logo);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (logo) {
            formData.append('logo', data.logo);
        }
        formData.set('name', data.name);
        formData.set('default_currency_slug', data.default_currency_slug);
        formData.set('acronyme', data.acronyme);
        formData.set('iso_code', data.iso_code);
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (id) {
                formData.append("_method", "put");
                axios.post(appConfig.apiDomaine + `/any/institutions/${id}`, formData)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError({...defaultError});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig());
                    })
                ;
            } else {
                axios.post(appConfig.apiDomaine + `/any/institutions`, formData)
                    .then(response => {
                        setError(defaultError);
                        setStartRequest(false);
                        setData(defaultData);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    })
                    .catch(error => {
                        setError({...defaultError, ...error.response.data.error});
                        setStartRequest(false);
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
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to="/settings/institution" className="kt-subheader__breadcrumbs-link">
                                    {t("Institution")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()}
                                   className="kt-subheader__breadcrumbs-link">
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
                                                id ?
                                                    t("Modification d'une institution") : t("Ajout d'une institution")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-portlet__body">
                                        <div className="tab-content">
                                            <div className="tab-pane active" id="kt_user_edit_tab_1" role="tabpanel">
                                                <div className="kt-form kt-form--label-right">
                                                    <div className="kt-form__body">
                                                        <div className="kt-section kt-section--first">
                                                            <div className="kt-section__body">
                                                                <div className="form-group row">
                                                                    <label
                                                                        className="col-xl-3 col-lg-3 col-form-label">Logo</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <div className="kt-avatar kt-avatar--outline"
                                                                             id="kt_user_add_avatar">
                                                                            <div className="kt-avatar__holder"
                                                                                 style={{textAlign: 'center'}}>
                                                                                {
                                                                                    data.logo?(
                                                                                        <img
                                                                                            id="Image1"
                                                                                            src={data.logo}
                                                                                            alt="logo"
                                                                                            style={{
                                                                                                maxWidth: "115px",
                                                                                                maxHeight: "115px",
                                                                                                textAlign: 'center'
                                                                                            }}
                                                                                        />
                                                                                )
                                                                                :(
                                                                                            <img
                                                                                                id="Image1"
                                                                                                src={"/assets/media/users/Icon.png"}
                                                                                                alt="logo"
                                                                                                style={{
                                                                                                    maxWidth: "115px",
                                                                                                    maxHeight: "115px",
                                                                                                    textAlign: 'center'
                                                                                                }}
                                                                                            />
                                                                                        )}


                                                                            </div>
                                                                            <label className="kt-avatar__upload"
                                                                                   id="files"
                                                                                   data-toggle="kt-tooltip"
                                                                                   title="Change avatar">
                                                                                <i className="fa fa-pen"/>
                                                                                <input type="file"
                                                                                       id="file"
                                                                                       name="kt_user_add_user_avatar"
                                                                                       onChange={(e) => onChangeFile(e)}
                                                                                />
                                                                            </label>
                                                                            <span className="kt-avatar__cancel"
                                                                                  data-toggle="kt-tooltip"
                                                                                  title="Cancel avatar">
                                                                            <i className="fa fa-times"/>
                                                                        </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {defaultCurrencyData ? (
                                                                    <div
                                                                        className={error.default_currency_slug.length ? "form-group row validated" : "form-group row"}>
                                                                        <label
                                                                            className="col-xl-3 col-lg-3 col-form-label"
                                                                            htmlFor="exampleSelect1">{t("Devise")}</label>
                                                                        <div className="col-lg-9 col-xl-6">

                                                                            <Select
                                                                                value={defaultCurrency}
                                                                                onChange={onChangeCurrencies}
                                                                                options={defaultCurrencyData.length ? defaultCurrencyData.map(name => name) : ''}
                                                                            />
                                                                            {
                                                                                error.default_currency_slug.length ? (
                                                                                    error.default_currency_slug.map((error, index) => (
                                                                                        <div key={index}
                                                                                             className="invalid-feedback">
                                                                                            {error}
                                                                                        </div>
                                                                                    ))
                                                                                ) : null
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                ) : ''
                                                                }
                                                                <div
                                                                    className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="name">{t("Nom")} <InputRequire/></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="name"
                                                                            type="text"
                                                                            className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder="Ex:  Satis"
                                                                            value={data.name}
                                                                            onChange={(e) => onChangeName(e)}
                                                                        />
                                                                        {
                                                                            error.name.length ? (
                                                                                error.name.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={error.acronyme.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="Acronyme">{t("Acronyme")} <InputRequire/></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="Acronyme"
                                                                            className={error.acronyme.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder="Ex:  Satis Acronyme"
                                                                            type="text"
                                                                            value={data.acronyme}
                                                                            onChange={(e) => onChangeAcronyme(e)}
                                                                        />
                                                                        {
                                                                            error.acronyme.length ? (
                                                                                error.acronyme.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={error.iso_code.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="value">{t("Code Iso")} <InputRequire/></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="value"
                                                                            type="text"
                                                                            className={error.iso_code.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder="Ex: 0000-Satis"
                                                                            value={data.iso_code}
                                                                            onChange={(e) => onChangeIsoCode(e)}
                                                                        />
                                                                        {
                                                                            error.iso_code.length ? (
                                                                                error.iso_code.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
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
                                                                            <button type="submit"
                                                                                    onClick={(e) => onSubmit(e)}
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
                                                                                  className="btn btn-secondary mx-2"
                                                                                  disabled>
                                                                                {t("Quitter")}
                                                                            </Link>
                                                                        )
                                                                    }

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
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
                verifyPermission(props.userPermissions, 'update-any-institution') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'store-any-institution') ? (
                    printJsx()
                ) : null
        ) : null
    );

};
const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    }
};

export default connect(mapStateToProps)(InstitutionForm);
