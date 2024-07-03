import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {
    Link,
    useParams
} from "react-router-dom";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {debug} from "../../helpers/function";
import {useTranslation} from "react-i18next";


const ParametersComponentForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    const defaultData = {
        logo: {
            value: "/assets/images/satisLogo.png",
            type: "image"
        },
        title:{
            value:t("Bienvenue sur"),
            type: "text"
        },
        description:{
            value: t("Votre nouvel outil de gestion des Réclamations"),
            type:"text"
        },
        background: {
            value:"/assets/media/bg/bg-4.jpg",
            type:"image"
        },
        version: {
            value:"Macro 2020.1",
            type:"text"
        },
        name: {
            value: t("CONNEXION"),
            type:"text"
        },
    };
    const defaultError = {
        logo: [],
        title: [],
        description: [],
        background: [],
        version: [],
        name: [],
    };
    const [data, setData] = useState(defaultData);
    const [logo, setLogo] = useState(undefined);
    const [backG, setBackG] = useState(undefined);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    const formatState=(attribut)=>{
        const newState = {};
        const newError = {};

    };

    useEffect(() => {

        if (id) {
            axios.get(appConfig.apiDomaine + `/components/${id}`)
                .then(response => {
                    let componentsData = response.data.params.fr;
                    let componentParams = [];
                    for (const param in componentsData) {
                        componentParams.push(param);
                    }
                    //console.log(componentParams,"COMPONENTS_DATA")

                    const newComponent = {
                        logo: {
                            value:response.data.params.fr.logo.value.url,
                            type:response.data.params.fr.logo.type
                        },
                        title:  {
                            value:response.data.params.fr.header.value,
                            type:response.data.params.fr.header.type
                        },
                        description: {
                            value:response.data.params.fr.description.value,
                            type:response.data.params.fr.description.type
                        },
                        background:  {
                            value:response.data.params.fr.background.value,
                            type:response.data.params.fr.background.type
                        },
                        version:  {
                            value:response.data.params.fr.version.value,
                            type:response.data.params.fr.version.type
                        },
                        name: {
                            value:response.data.params.fr.title.value,
                            type:response.data.params.fr.title.type
                        },
                    };
                    setData(newComponent);
                    //console.log(newComponent,"newComponent")

                })
        }
    },[]);

    const onChangeFile = (e) => {
        const newData = {...data};
        newData.logo = e.target.files[0];
        setData(newData);
        setLogo(newData);
        var reader = new FileReader();
        reader.onload = function (e) {
            var image = document.getElementById('Image1');
            //console.log(image, 'image');
            image.src = e.target.result;
        };
        reader.readAsDataURL(newData.logo);
    };

    const onChangeTitle = (e) => {
        const newData = {...data};
        newData.title = e.target.value;
        setData(newData);
    };
    const onChangeVersion = (e) => {
        const newData = {...data};
        newData.version = e.target.value;
        setData(newData);
    };
    const onChangeName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };
    const onChangeBackground = (e) => {
        const newData = {...data};
        newData.background = e.target.files[0];
        setData(newData);
        setBackG(newData);
        var reader = new FileReader();
        reader.onload = function (e) {
            var image = document.getElementById('Image2');
            //console.log(image, 'image');
            image.src = e.target.result;
        };
        reader.readAsDataURL(newData.background);
    };

    const onChangeDescription = (e) => {
        const newData = {...data};
        newData.description = e.target.value;
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        axios.post(appConfig.apiDomaine + `/components`, data)
            .then(response => {
                setStartRequest(false);
                setError(defaultError);
                setData(defaultData);
                ToastBottomEnd.fire(toastAddSuccessMessageConfig());
            })
            .catch(error => {
                setStartRequest(false);
                setError({...defaultError, ...error.response.data.error});
                ToastBottomEnd.fire(toastAddErrorMessageConfig());
            })
        ;

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
                                {/*<span className="kt-subheader__breadcrumbs-separator"/>*/}
                                <a href="#button" onClick={e => e.preventDefault()}
                                   className="kt-subheader__breadcrumbs-link">
                                    {t("Connexion")}
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
                                            {t("Paramétrage de la connexion")}
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

                                                                                <img
                                                                                    id="Image1"
                                                                                    src={data.logo.value}
                                                                                    alt="logo"
                                                                                    style={{
                                                                                        maxWidth: "115px",
                                                                                        maxHeight: "115px",
                                                                                        textAlign: 'center'
                                                                                    }}
                                                                                />
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

                                                                <div className="form-group row">
                                                                    <label
                                                                        className="col-xl-3 col-lg-3 col-form-label">{t("Arrière plan")}</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <div className="kt-avatar kt-avatar--outline"
                                                                             id="kt_user_add_avatar">
                                                                            <div className="kt-avatar__holder"
                                                                                 style={{textAlign: 'center'}}>

                                                                                <img
                                                                                    id="Image2"
                                                                                    src={data.background.value}
                                                                                    alt="backG"
                                                                                    style={{
                                                                                        maxWidth: "115px",
                                                                                        maxHeight: "115px",
                                                                                        textAlign: 'center'
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <label className="kt-avatar__upload"
                                                                                   id="files"
                                                                                   data-toggle="kt-tooltip"
                                                                                   title="Change avatar">
                                                                                <i className="fa fa-pen"/>
                                                                                <input type="file"
                                                                                       id="file"
                                                                                       name="kt_user_add_user_avatar"
                                                                                       onChange={(e) => onChangeBackground(e)}
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

                                                                <div
                                                                    className={error.version.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="version">{t("Version")}</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="version"
                                                                            type="text"
                                                                            className={error.version.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder={t("Veuillez entrer la version")}
                                                                            value={data.version.value}
                                                                            onChange={(e) => onChangeVersion(e)}
                                                                        />
                                                                        {
                                                                            error.version.length ? (
                                                                                error.version.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : ""
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={error.title.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="title">{t("Titre")}</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="title"
                                                                            type="text"
                                                                            className={error.title.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder={t("Veuillez entrer le titre")}
                                                                            value={data.title.value}
                                                                            onChange={(e) => onChangeTitle(e)}
                                                                        />
                                                                        {
                                                                            error.title.length ? (
                                                                                error.title.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : ""
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="name">{t("Libellé")}</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="name"
                                                                            type="text"
                                                                            className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder={t("Veuillez entrer le nom")}
                                                                            value={data.name.value}
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
                                                                            ) : ""
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={error.description.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="description">{t("Description")}</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                <textarea
                                                                    id="description"
                                                                    className={error.description.length ? "form-control is-invalid" : "form-control"}
                                                                    placeholder={t("Veuillez entrer la description")}
                                                                    cols="30"
                                                                    rows="5"
                                                                    value={data.description.value}
                                                                    onChange={(e) => onChangeDescription(e)}
                                                                />
                                                                        {
                                                                            error.description.length ? (
                                                                                error.description.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : ""
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
                                                                            <Link to="/settings/clients/category"
                                                                                  className="btn btn-secondary mx-2">
                                                                                {t("Quitter")}
                                                                            </Link>
                                                                        ) : (
                                                                            <Link to="/settings/clients/category"
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
            printJsx()
        ) : null

    );

};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    }
};

export default connect(mapStateToProps)(ParametersComponentForm);
