import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    Link
} from "react-router-dom";
import {ToastBottomEnd} from "../../views/components/Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import {connect} from "react-redux";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";
import Select from "react-select";
import {formatSelectOption} from "../../helpers/function";




const FilialeInstitutionForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    if (!verifyPermission(props.userPermissions, 'update-my-institution'))
        window.location.href = ERROR_401;

    const defaultData = {
        name: "",
        acronyme: "",
        iso_code: "",
        country_id: "",
        logo: ""
    };
    const defaultError = {
        name: [],
        acronyme: [],
        iso_code: [],
        country_id: [],
        logo: [],
    };
    const [data, setData] = useState(defaultData);
    const [country, setCountry] = useState(null);
    const [countries, setCountries] = useState([]);
    const [logo, setLogo] = useState(undefined);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + `/my/institutions`)
                .then(response => {
                    const newInstitution = {
                        name: response.data.institution?.name ?? "",
                        acronyme: response.data.institution?.acronyme ?? "",
                        iso_code: response.data.institution?.iso_code ?? "",
                        country_id: response.data.institution?.country_id ?? "",
                        logo: response.data.institution?.logo ?? ""
                    };
                    setCountry(response.data.institution?.country ? {label: response.data.institution.country?.name  ?? "", value: response.data.institution.country?.id ?? "" } : null);
                    setCountries(formatSelectOption(response.data?.countries ?? [], 'name', null, 'id'));
                    setData(newInstitution);
                })
                .catch(error => {
                    console.log("Something Wrong");
                })
            ;
        }
    }, []);

    const onChangeName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
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

    const onChangeCountry = (e) => {
        const newData = {...data};
        setCountry({label: e.label, value: e.value})
        newData.country_id = e.value;
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
        if (newData.logo) {
            reader.readAsDataURL(newData.logo);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (logo) {
            formData.append('logo', data.logo);
        }
        formData.set('name', data.name);
        formData.set('acronyme', data.acronyme);
        formData.set('iso_code', data.iso_code);
        formData.set('country_id', data.country_id);
        setStartRequest(true);

        formData.append("_method", "put");
        if (verifyTokenExpire()) {
            axios.post(appConfig.apiDomaine + `/my/institutions`, formData)
                .then(response => {
                    setStartRequest(false);
                    setError(defaultError);
                    ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                })
                .catch(error => {
                    console.log(error.response.data.error)
                    setStartRequest(false);
                    setError({...defaultError, ...error.response.data.error});
                    ToastBottomEnd.fire(toastAddErrorMessageConfig());
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
                                        t("Modification")
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
                                            {t("Modification d'une institution")}
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

                                                                <div className={error.logo.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label">Logo</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <div className="kt-avatar kt-avatar--outline"
                                                                             id="kt_user_add_avatar">
                                                                            <div className="kt-avatar__holder" style={{textAlign: 'center'}}>
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
                                                                            </div>
                                                                            <label className="kt-avatar__upload" id="files" data-toggle="kt-tooltip" title="Change avatar">
                                                                                <i className="fa fa-pen"/>
                                                                                <input type="file" id="file" name="kt_user_add_user_avatar" onChange={(e) => onChangeFile(e)}/>
                                                                            </label>
                                                                            <span className="kt-avatar__cancel" data-toggle="kt-tooltip" title="Cancel avatar">
                                                                            <i className="fa fa-times"/>
                                                                            </span>
                                                                        </div>
                                                                        {
                                                                            error.logo.length ? (
                                                                                error.logo.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name"> {t("Nom")} <span style={{color:"red"}}>*</span></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="name"
                                                                            type="text"
                                                                            className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder={t("Veuillez entrer le nom")}
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

                                                                <div className={error.acronyme.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="Acronyme">{t("Acronyme")} <span style={{color:"red"}}>*</span></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="Acronyme"
                                                                            className={error.acronyme.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder={t("Veuillez entrer l'acronyme")}
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
                                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="value">{t("Code Iso")} <span style={{color:"red"}}>*</span></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="value"
                                                                            type="text"
                                                                            className={error.iso_code.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder={t("Veuillez entrer le code ISO")}
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

                                                                <div
                                                                    className={error.country_id.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="value">{t("Pays")} <span style={{color:"red"}}>*</span></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <Select
                                                                            id="value"
                                                                            placeholder={t("Veuillez entrer le pays")}
                                                                            value={country}
                                                                            isClearable={true}
                                                                            onChange={e => onChangeCountry(e)}
                                                                            options={countries}
                                                                        />
                                                                        {
                                                                            error.country_id.length ? (
                                                                                error.country_id.map((error, index) => (
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
                                                                                    className="btn btn-primary">{t("Modifier")}</button>
                                                                        ) : (
                                                                            <button
                                                                                className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                                                type="button" disabled>
                                                                                {t("Chargement")}...
                                                                            </button>
                                                                        )
                                                                    }
                                                                    {/*<Link to={'/setting/dashboard'} className="btn btn-secondary mx-2">
                                                                        Quitter
                                                                    </Link>*/}
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
        verifyPermission(props.userPermissions, 'update-my-institution') ?
            printJsx()
            : null
    );

};
const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    }
};

export default connect(mapStateToProps)(FilialeInstitutionForm);
