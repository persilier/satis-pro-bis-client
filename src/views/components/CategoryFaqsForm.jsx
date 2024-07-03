import React, {useEffect, useState} from "react";
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
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import {connect} from "react-redux";
import InputRequire from "./InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


const CategoryFaqsForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id}=useParams();

    if (!id) {
        if (!verifyPermission(props.userPermissions, 'store-faq-category'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'update-faq-category'))
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
        if (id){
            if (verifyTokenExpire()) {
                axios.get(appConfig.apiDomaine+`/faq-categories/${id}`)
                    .then(response => {

                        const newCategory={
                            name:response.data.name.fr,
                        };
                        setData(newCategory)
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

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if(id){
                axios.put(appConfig.apiDomaine+`/faq-categories/${id}`, data)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                        window.location.href="/settings/faqs/category"
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError({...defaultError,...error.response.data.error});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig());
                    })
                ;
            }else{
                axios.post(appConfig.apiDomaine+`/faq-categories`, data)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        setData(defaultData);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError({...defaultError,...error.response.data.error});
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
                                <a href="#" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to="/settings/faqs/category" className="kt-subheader__breadcrumbs-link">
                                    {t("Catégorie FAQ")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
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
                                                id?
                                                    t("Modification des catégories de FAQ"): t("Ajout des catégories de FAQ")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-portlet__body">

                                        <div className={error.name.length ? "form-group  validated" : "form-group"}>
                                            <label htmlFor="name">{t("Libellé")} <InputRequire/></label>
                                            <div className="col-md-6 mb-3">
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
                                        <div className="kt-form__actions">
                                            {
                                                !startRequest ? (
                                                    <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{id?t("Modifier"):t("Enregistrer")}</button>
                                                ) : (
                                                    <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                        {t("Chargement")}...
                                                    </button>
                                                )
                                            }
                                            {
                                                !startRequest ? (
                                                    <Link to="/settings/faqs/category" className="btn btn-secondary mx-2">
                                                        {t("Quitter")}
                                                    </Link>
                                                ) : (
                                                    <Link to="/settings/faqs/category" className="btn btn-secondary mx-2" disabled>
                                                        {t("Quitter")}
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
        ready ? (
            id ?
                verifyPermission(props.userPermissions, 'update-faq-category') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'store-faq-category') ? (
                    printJsx()
                ) : null
        ): null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    }
};

export default connect(mapStateToProps)(CategoryFaqsForm);
