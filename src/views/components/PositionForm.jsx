import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {
    useParams,
    Link
} from "react-router-dom";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";



const PositionForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (!id) {
        if (!verifyPermission(props.userPermissions, 'store-position'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'update-position'))
            window.location.href = ERROR_401;
    }

    const defaultData = {
        name: "",
    };
    const defaultError = {
        name: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        async function fetchData () {
            if (id) {
                await axios.get(`${appConfig.apiDomaine}/positions/${id}`)
                    .then(response => {
                        const newData = {
                            name: response.data.name.fr,
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
    }, [id]);

    const onChangeName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (id) {
                axios.put(`${appConfig.apiDomaine}/positions/${id}`, data)
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
                axios.post(`${appConfig.apiDomaine}/positions`, data)
                    .then(response => {
                        setStartRequest(false);
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
                                <a href="#fonctions" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to="/settings/positions" className="kt-subheader__breadcrumbs-link">
                                    {t("Fonctions")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#ajout" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
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
                                                id ? t("Modification d'une fonction") : t("Ajout d'une fonction")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-form kt-form--label-right">
                                        <div className="kt-portlet__body">
                                            <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Libellé")}(<strong className="text-danger">*</strong>)</label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={"Ex:" + t("Comptable")}
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
                                                        <Link to="/settings/positions" className="btn btn-secondary mx-2">
                                                            {t("Quitter")}
                                                        </Link>
                                                    ) : (
                                                        <Link to="/settings/positions" className="btn btn-secondary mx-2" disabled>
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
                verifyPermission(props.userPermissions, 'update-position') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'store-position') ? (
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

export default connect(mapStateToProps)(PositionForm);
