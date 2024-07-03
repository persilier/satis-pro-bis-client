import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    Link,
    useParams
} from "react-router-dom";
import {ToastBottomEnd} from "../Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastErrorMessageWithParameterConfig,
} from "../../../config/toastConfig";
import appConfig from "../../../config/appConfig";
import '../staff/react-tagsinput.css'
import IdentityForm from "../IdentityForm";
import Select from "react-select";
import {formatSelectOption} from "../../../helpers/function";
import {connect} from "react-redux";
import {addIdentity} from "../../../store/actions/IdentityAction";
import {verifyPermission} from "../../../helpers/permission";
import {ERROR_401} from "../../../config/errorPage";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const EditClients = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (!id) {
        if (!verifyPermission(props.userPermissions, 'store-client-from-my-institution'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'update-client-from-my-institution'))
            window.location.href = ERROR_401;
    }
    const defaultData = {
        account_type_id: "",
        number: "",
        category_client_id: "",


    };
    const defaultError = {
        account_type_id: [],
        number: [],
        category_client_id: [],

    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [identity, setIdentity] = useState(undefined);
    const [accountType, setAccountTypes] = useState(undefined);
    const [categoryClient, setCategoryClient] = useState(undefined);
    const [type, setType] = useState([]);
    const [category, setCategory] = useState([]);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + '/my/clients/create')
                .then(response => {
                    setAccountTypes(response.data.AccountTypes);
                    setCategoryClient(response.data.clientCategories);
                })
            ;

            if (id) {
                axios.get(appConfig.apiDomaine + `/my/clients/${id}/edit`)
                    .then(response => {
                        const newClient = {
                            number: response.data.client_institution.accounts[0].number,
                            account_type_id: response.data.client_institution.accounts[0].account_type_id,
                            category_client_id: response.data.client_institution.category_client_id,

                        };
                        setData(newClient);
                        const newIdentity = {
                            firstname: response.data.client_institution.client.identite.firstname,
                            lastname: response.data.client_institution.client.identite.lastname,
                            sexe: response.data.client_institution.client.identite.sexe,
                            telephone: response.data.client_institution.client.identite.telephone,
                            email: response.data.client_institution.client.identite.email,
                            ville: response.data.client_institution.client.identite.ville === null ? "" : response.data.client_institution.client.identite.ville,
                        };
                        setIdentity(newIdentity);
                        props.addIdentite(newIdentity);
                        setType({
                            value: response.data.client_institution.accounts[0].account_type.id,
                            label: response.data.client_institution.accounts[0].account_type.name.fr
                        });
                        setCategory({
                            value: response.data.client_institution.category_client.id,
                            label: response.data.client_institution.category_client.name.fr
                        });

                    });
            }
        }
    }, []);

    const onChangeAccountType = (selected) => {
        const newData = {...data};
        newData.account_type_id = selected.value;
        setType(selected);
        setData(newData);
    };
    const onChangeAccount = (e) => {
        const newData = {...data};
        newData.number = e.target.value;
        setData(newData);

    };

    const onChangeCategoryClient = (selected) => {
        const newData = {...data};
        newData.category_client_id = selected.value;
        setCategory(selected);
        setData(newData);
    };


    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        {
            //console.log(...props.identite, "props")
        }
        const formData = {...props.identite, ...data};
        //console.log(formData, "FORM_DATA");
        if (verifyTokenExpire()) {
            if (id) {
                axios.put(appConfig.apiDomaine + `/my/clients/${id}`, formData)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    })
                    .catch((errorRequest) => {
                        setStartRequest(false);
                        setError({...defaultError, ...errorRequest.response.data.error});
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(
                            errorRequest.response.data.identite.lastname + " " + errorRequest.response.data.identite.firstname + ": " + errorRequest.response.data.message)
                        );
                    })
                ;
            } else {
                //console.log(props.identite.client_id, "CLIENT_ID");
                if (props.identite.client_id) {
                    axios.post(appConfig.apiDomaine + `/my/accounts/${props.identite.client_id}/clients`, formData)
                        .then(response => {
                            setStartRequest(false);
                            setError(defaultError);
                            setData(defaultData);
                            setType({});
                            setCategory({});
                            setIdentity({});
                            ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                        })
                        .catch((errorRequest) => {
                            setStartRequest(false);
                            setError({...defaultError, ...errorRequest.response.data.error});
                            ToastBottomEnd.fire(toastAddErrorMessageConfig());
                        })
                    ;
                } else {
                    axios.post(appConfig.apiDomaine + `/my/clients`, formData)
                        .then(response => {
                            setStartRequest(false);
                            setError(defaultError);
                            setData(defaultData);
                            setType({});
                            setCategory({});
                            setIdentity({});
                            ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                        })
                        .catch(async (errorRequest) => {

                            //console.log(errorRequest.response.data.identite, 'ERROR');

                            if (errorRequest.response.data.identite) {
                                await axios.post(appConfig.apiDomaine + `/my/identites/${errorRequest.response.data.identite.id}/client`, formData)
                                    .then(response => {
                                        setStartRequest(false);
                                        setError(defaultError);
                                        setData(defaultData);
                                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                                    })
                            } else if (errorRequest.response.data.client) {
                                setStartRequest(false);
                                ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(
                                    errorRequest.response.data.client.identite.lastname + " " + errorRequest.response.data.client.identite.firstname + ": " + errorRequest.response.data.message)
                                );
                            } else {
                                setStartRequest(false);
                                setError({...defaultError, ...errorRequest.response.data.error});
                                ToastBottomEnd.fire(toastAddErrorMessageConfig());
                            }
                        });
                }
            }
        }
    };

    return (
        ready ? (
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
                                <Link to="/settings/clients" className="kt-subheader__breadcrumbs-link">
                                    {t("Client")}
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
                                                id ?
                                                    t("Modification de Clients") : t("Ajout de Clients")
                                            }
                                        </h3>
                                    </div>
                                </div>
                                <form method="POST" className="kt-form">

                                    <div className="kt-portlet">

                                        {

                                            !id ? (
                                                <IdentityForm/>

                                            ) : (
                                                identity ?
                                                    <IdentityForm
                                                        getIdentite={identity}
                                                        getLoading={true}
                                                    />
                                                    : null
                                            )
                                        }

                                        <div className="kt-portlet__body">
                                            <div className="kt-section kt-section--first">
                                                <h5 className="kt-section__title kt-section__title-lg">
                                                    {t("Informations Techniques")}
                                                </h5>

                                                <div className="form-group row">
                                                    <div className={error.account_type_id.length ? "col validated" : "col"}>
                                                        <label htmlFor="exampleSelect1">{t("Type de compte")}</label>
                                                        {accountType ? (
                                                            <Select
                                                                value={type}
                                                                onChange={onChangeAccountType}
                                                                placeholder={t("Veuillez selectionner le type de compte")}
                                                                options={formatSelectOption(accountType, 'name', 'fr')}
                                                            />
                                                        ) : (<select name="typeClient"
                                                                     className={error.account_type_id.length ? "form-control is-invalid" : "form-control"}
                                                                     id="typeClient">
                                                            <option value=""/>
                                                        </select>)
                                                        }

                                                        {
                                                            error.account_type_id.length ? (
                                                                error.account_type_id.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                    <div
                                                        className={error.category_client_id.length ? "col validated" : "col"}>
                                                        <label htmlFor="exampleSelect1">{t("Catégorie Client")}</label>

                                                        {categoryClient ? (
                                                            <Select
                                                                value={category}
                                                                onChange={onChangeCategoryClient}
                                                                placeholder={t("Veuillez selectionner la catégorie client")}
                                                                options={formatSelectOption(categoryClient, 'name', 'fr')}
                                                            />
                                                        ) : (<select name="category"
                                                                     className={error.category_client_id.length ? "form-control is-invalid" : "form-control"}
                                                                     id="category">
                                                            <option value=""/>
                                                        </select>)
                                                        }

                                                        {
                                                            error.category_client_id.length ? (
                                                                error.category_client_id.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className="form-group row">

                                                    <div className={error.number.length ? "col validated" : "col"}>
                                                        <label htmlFor="number">{t("Numéro de Compte")}</label>
                                                        <input
                                                            id="number"
                                                            type="text"
                                                            className={error.number.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder={t("Veuillez entrer le numero de compte")}
                                                            value={data.number}
                                                            onChange={(e) => onChangeAccount(e)}
                                                        />
                                                        {
                                                            error.number.length ? (
                                                                error.number.map((error, index) => (
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
                                    <div className="kt-portlet__foot">
                                        <div className="kt-form__actions text-right">
                                            {
                                                !startRequest ? (
                                                    <button type="submit" onClick={(e) => onSubmit(e)}
                                                            className="btn btn-primary">{t("Envoyer")}</button>
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
                                                    <Link to="/settings/clients" className="btn btn-secondary mx-2">
                                                        {t("Quitter")}
                                                    </Link>
                                                ) : (
                                                    <Link to="/settings/clients" className="btn btn-secondary mx-2"
                                                          disabled>
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
        ) : null
    );
};
const mapStateToProps = state => {
    return {
        identite: state.identity,
        userPermissions: state.user.user.permissions
    }
};

export default connect(mapStateToProps, {addIdentite: addIdentity})(EditClients);
