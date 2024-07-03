import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    Link,
    useParams
} from "react-router-dom";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig, toastEditErrorMessageConfig, toastEditSuccessMessageConfig,
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {formatSelectOption} from "../../helpers/function";
import Select from "react-select";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import {connect} from "react-redux";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const FaqsForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const defaultData = {
        faq_category_id: "",
        question: "",
        answer: "",
    };
    const defaultError = {
        faq_category_id: [],
        question: [],
        answer: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [categorieData, setCategorieData] = useState([]);
    const [category, setCategory] = useState([]);
    const [startRequest, setStartRequest] = useState(false);
    const {editfaqid} = useParams();

    if (!editfaqid) {
        if (!verifyPermission(props.userPermissions, 'store-faq'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'update-faq'))
            window.location.href = ERROR_401;
    }

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + '/faq-categories')
                .then(response => {
                    setCategorieData(response.data)
                });
            if (editfaqid) {
                axios.get(appConfig.apiDomaine + `/faqs/${editfaqid}`)
                    .then(response => {
                        // console.log(response.data, "FAQS_Edit")
                        const newFaq = {
                            faq_category_id: response.data.faq_category.id,
                            question: response.data.question["fr"],
                            answer: response.data.answer["fr"]
                        };
                        setData(newFaq);
                        setCategory({value: response.data.faq_category.id, label: response.data.faq_category.name.fr});
                    })
            }
        }
    }, []);
    const onChangeCategory = (selected) => {
        const newData = {...data};
        newData.faq_category_id = selected.value;
        setCategory(selected);
        setData(newData);
    };

    const onChangeQuiz = (e) => {
        const newData = {...data};
        newData.question = e.target.value;
        setData(newData);
    };

    const onChangeAnswers = (e) => {
        const newData = {...data};
        newData.answer = e.target.value;
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if(editfaqid){
                axios.put(appConfig.apiDomaine + `/faqs/${editfaqid}`, data)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError({...defaultError,...error.response.data.error});
                        ToastBottomEnd.fire(toastEditErrorMessageConfig());
                    })
                ;
            }else {
                axios.post(appConfig.apiDomaine + `/faqs`, data)
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
        return(
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
                                <Link to="/settings/faqs/faq" className="kt-subheader__breadcrumbs-link">
                                    {t("FAQs")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
                                    {
                                        editfaqid ? t("Modification") : t("Ajout")
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
                                                editfaqid? t("Modifier une FAQ") : t("Ajout de FAQs")

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
                                                                <div
                                                                    className={error.faq_category_id.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="exampleSelect1">{t("Catégorie")}</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        {categorieData ? (
                                                                            <Select
                                                                                value={category}
                                                                                onChange={onChangeCategory}
                                                                                options={formatSelectOption(categorieData, 'name', "fr")}
                                                                            />
                                                                        ) : ''
                                                                        }

                                                                        {
                                                                            error.faq_category_id.length ? (
                                                                                error.faq_category_id.map((error, index) => (
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
                                                                    className={error.question.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="quiz">{t("Question")}</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="quiz"
                                                                            type="text"
                                                                            className={error.question.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder={t("Veuillez entrer la question")}
                                                                            value={data.question}
                                                                            onChange={(e) => onChangeQuiz(e)}
                                                                        />
                                                                        {
                                                                            error.question.length ? (
                                                                                error.question.map((error, index) => (
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
                                                                    className={error.answer.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="answer">{t("Réponse")}</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                <textarea
                                                                    id="answer"
                                                                    className={error.answer.length ? "form-control is-invalid" : "form-control"}
                                                                    placeholder={t("Veuillez entrer la réponse")}
                                                                    cols="30"
                                                                    rows="5"
                                                                    value={data.answer}
                                                                    onChange={(e) => onChangeAnswers(e)}
                                                                />
                                                                        {
                                                                            error.answer.length ? (
                                                                                error.answer.map((error, index) => (
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
                                                                                    className="btn btn-primary">{editfaqid?t("Modifier"):t("Enregistrer")}</button>
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
                                                                            <Link to="/settings/faqs/add"
                                                                                  className="btn btn-secondary mx-2">
                                                                                {t("Quitter")}
                                                                            </Link>
                                                                        ) : (
                                                                            <Link to="/settings/faqs/add"
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
    }
    return (
        ready ? (
            editfaqid ?
                verifyPermission(props.userPermissions, 'update-faq') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'store-faq') ? (
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

export default connect(mapStateToProps)(FaqsForm);
