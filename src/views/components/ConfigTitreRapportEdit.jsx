import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    Link,
    useParams
} from "react-router-dom";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,toastErrorMessageWithParameterConfig
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import {connect} from "react-redux";
import InputRequire from "./InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";

const ConfigTitreRapportEdit = (props) => {
    const {name}=useParams();

    if (!name) {
      if  ( !verifyPermission(props.userPermissions, 'edit-reporting-titles-configs'))
        window.location.href = ERROR_401;
    } else {
       if ( !verifyPermission(props.userPermissions, 'edit-reporting-titles-configs'))
        window.location.href = ERROR_401;
    }



console.log(props.userPermissions)
    const defaultData = {
        name: "",
        title: "",
        description: "",
    };
    const defaultError = {
        name: [],
        title: [],
        description: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        if (name){
            if (verifyTokenExpire()) {
                axios.get(appConfig.apiDomaine+`/reporting-metadata/${name}`)
                    .then(response => {

                        const newTitle={
                            name:response.data.name,
                            title:response.data.title,
                            description:response.data.description,
                        };
                        setData(newTitle)
                    })
                    .catch(error => {
                        console.log(error.response)
                        if (error.response.status === 404) {
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig('Vous ne pouvez pas effectuer cette opération.'))
                            window.location.href="/settings/config-rapport"
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
    const onChangeTitle = (e) => {
        const newData = {...data};
        newData.title = e.target.value;
        setData(newData);
    };
    const onChangeDescription = (e) => {
        const newData = {...data};
        newData.description = e.target.value;
        setData(newData);
    };


    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if(name){
                axios.put(appConfig.apiDomaine+`/reporting-metadata`, data)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig);
                        window.location.href="/settings/config-rapport"
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError({...defaultError,...error.response.data.error});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig);
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
                                Paramètres
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to="/settings/config-rapport" className="kt-subheader__breadcrumbs-link">
                                    Configuration Titre Rapport
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
                                    {
                                        name ? "Modification" : "Ajout"
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
                                                name?
                                                    "Modification des Titres de Rapport":" Ajout des Titres de Rapport"
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-portlet__body">

                                        <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label" style={{display:"right"}} htmlFor="name">Type de rapport <InputRequire/></label>
                                            <div className="col-lg-9 col-xl-6">
                                                <input
                                                    id="name"
                                                    type="text"
                                                    disabled={true}
                                                    className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                    placeholder="Veuillez entrer le nom"
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

                                        <div className={error.title.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label" style={{display:"right"}} htmlFor="name">Titre rapport <InputRequire/></label>
                                            <div className="col-lg-9 col-xl-6">
                                                <input
                                                    id="title"
                                                    type="text"
                                                    className={error.title.length ? "form-control is-invalid" : "form-control"}
                                                    placeholder="Veuillez entrer le titre"
                                                    value={data.title}
                                                    onChange={(e) => onChangeTitle(e)}
                                                />
                                                {
                                                    error.title.length ? (
                                                        error.title.map((error, index) => (
                                                            <div key={index} className="invalid-feedback">
                                                                {error}
                                                            </div>
                                                        ))
                                                    ) : null
                                                }
                                            </div>
                                        </div>

                                        <div className={error.description.length ? "form-group row validated" : "form-group row"}>
                                            <label className="col-xl-3 col-lg-3 col-form-label" style={{display:"right"}} htmlFor="name">Description <InputRequire/></label>
                                            <div className="col-lg-9 col-xl-6">
                                                <textarea  rows="5"
                                                    id="description"
                                                    type="text"
                                                    className={error.description.length ? "form-control is-invalid" : "form-control"}
                                                    placeholder="Veuillez entrer la description"
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
                                    <div className="kt-portlet__foot" style={{float:"right", borderTop:"1px solid transparent"}}>
                                        <div className="kt-form__actions">
                                            {
                                                !startRequest ? (
                                                    <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{name?"Modifier":"Enregistrer"}</button>
                                                ) : (
                                                    <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                        Chargement...
                                                    </button>
                                                )
                                            }
                                            {
                                                !startRequest ? (
                                                    <Link to="/settings/config-rapport" className="btn btn-secondary mx-2">
                                                        Quitter
                                                    </Link>
                                                ) : (
                                                    <Link to="/settings/config-rapport" className="btn btn-secondary mx-2" disabled>
                                                        Quitter
                                                    </Link>
                                                )
                                            }

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
        name ?
            verifyPermission(props.userPermissions, 'edit-reporting-titles-configs') ? (
                printJsx()
            ) : null
            : verifyPermission(props.userPermissions, 'edit-reporting-titles-configs') ? (
                printJsx()
            ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    }
};

export default connect(mapStateToProps)(ConfigTitreRapportEdit);
