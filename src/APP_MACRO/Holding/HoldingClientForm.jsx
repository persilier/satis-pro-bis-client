import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    Link,
    useParams
} from "react-router-dom";
import {ToastBottomEnd} from "../../views/components/Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig,
    toastErrorMessageWithParameterConfig,
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import '../../views/components/staff/react-tagsinput.css';
import Select from "react-select";
import {formatSelectOption} from "../../helpers/function";
import {connect} from "react-redux";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import TagsInput from "react-tagsinput";
import InputRequire from "../../views/components/InputRequire";
import WithoutCode from "../../views/components/WithoutCode";
import ConfirmClientSaveForm from "../../views/components/Clients/ConfirmClientSaveForm";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";
import Loader from "../../views/components/Loader";

const endPointConfig = {
    PRO: {
        plan: "PRO",
        store: `${appConfig.apiDomaine}/my/clients`,
        storeAccount: id=> `${appConfig.apiDomaine}/my/accounts/${id}/clients`,
        update: id => `${appConfig.apiDomaine}/my/clients/${id}`,
        create: `${appConfig.apiDomaine}/my/clients/create`,
        edit: id => `${appConfig.apiDomaine}/my/clients/${id}/edit`
    },
    MACRO: {
        holding: {
            store: `${appConfig.apiDomaine}/any/clients`,
            storeAccount: id=> `${appConfig.apiDomaine}/any/accounts/${id}/clients`,
            update: id => `${appConfig.apiDomaine}/any/clients/${id}`,
            create: `${appConfig.apiDomaine}/any/clients/create`,
            edit: id => `${appConfig.apiDomaine}/any/clients/${id}/edit`
        },
        filial: {
            store: `${appConfig.apiDomaine}/my/clients`,
            storeAccount: id=> `${appConfig.apiDomaine}/my/accounts/${id}/clients`,
            update: id => `${appConfig.apiDomaine}/my/clients/${id}`,
            create: `${appConfig.apiDomaine}/my/clients/create`,
            edit: id => `${appConfig.apiDomaine}/my/clients/${id}/edit`
        }
    },
};

const HoldingClientForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (!id) {
        if (!(verifyPermission(props.userPermissions, 'store-client-from-any-institution') || verifyPermission(props.userPermissions, 'store-client-from-my-institution')))
            window.location.href = ERROR_401;
    } else {
        if (!(verifyPermission(props.userPermissions, 'update-client-from-any-institution') || verifyPermission(props.userPermissions, 'update-client-from-my-institution')))
            window.location.href = ERROR_401;
    }

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'store-client-from-any-institution') || verifyPermission(props.userPermissions, 'update-client-from-any-institution'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'store-client-from-my-institution') || verifyPermission(props.userPermissions, 'update-client-from-my-institution'))
            endPoint = endPointConfig[props.plan].filial
    } else
        endPoint = endPointConfig[props.plan];

    const defaultData = {
        firstname: "",
        lastname: "",
        sexe: "",
        ville: "",
        telephone: [],
        email: [],
        client_id: "",
        institution_id: [],
        account_type_id: "",
        number: [],
        category_client_id: "",
    };

    const defaultError = {
        firstname: [],
        lastname: [],
        sexe: [],
        ville: [],
        telephone: [],
        email: [],
        client_id: [],
        institution_id: [],
        account_type_id: [],
        number: [],
        category_client_id: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [accountType, setAccountTypes] = useState(undefined);
    const [accounts, setAccounts] = useState([]);
    const [account, setAccount] = useState(null);
    const [disabledInputTel, setDisabledInputTel] = useState(false);
    const [disabledInputEmail, setDisabledInputEmail] = useState(false);
    const [clientCash, setClientCash] = useState({searchInputValue: "", clients: []});
    const [tag, setTag] = useState({name: "", label: "", className: "", show: false});
    const [categoryClient, setCategoryClient] = useState(undefined);
    const [type, setType] = useState([]);
    const [category, setCategory] = useState([]);
    const [nameClient, setNameClient] = useState(undefined);
    const [client, setClient] = useState([]);
    const [institutionData, setInstitutionData] = useState(undefined);
    const [institution, setInstitution] = useState([]);
    const [foundIdentity, setFoundIdentity] = useState(undefined);
    const [searchList, setSearchList] = useState([]);
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [searchInputValue, setSearchInputValue] = useState("");
    const [startSearch, setStartSearch] = useState(false);
    const [disabledInput, setDisabledInput] = useState(false);


    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(endPoint.create)
                .then(response => {
                    // console.log(response.data,"RESPONSE")
                    if (verifyPermission(props.userPermissions, 'store-client-from-any-institution') || verifyPermission(props.userPermissions, 'update-client-from-any-institution')){
                        const options =
                            response.data.institutions.length ? response.data.institutions.map((institution) => ({
                                value: institution.id,
                                label: institution.name
                            })) : "";
                        setInstitutionData(options);
                    }
                    if (verifyPermission(props.userPermissions, 'store-client-from-my-institution') || verifyPermission(props.userPermissions, 'update-client-from-my-institution')) {
                        const clientOptions =
                            response.data.client_institutions?.data ? response.data.client_institutions.data.map((client) => ({
                                value: client.client_id,
                                label: client.client.identite.firstname + ' ' + client.client.identite.lastname
                            })) : "";
                        setNameClient(clientOptions);
                    }
                    setAccountTypes(response.data.accountTypes);
                    setCategoryClient(response.data.clientCategories);
                })
            ;

            if (id) {
                axios.get(endPoint.edit(id))
                    .then(response => {
                        const newClient = {
                            firstname: response.data.client_institution.client.identite.firstname,
                            lastname: response.data.client_institution.client.identite.lastname,
                            sexe: response.data.client_institution.client.identite.sexe,
                            telephone: response.data.client_institution.client.identite.telephone,
                            email: response.data.client_institution.client.identite.email,
                            institution_id: response.data.client_institution.institution_id,
                            ville: response.data.client_institution.client.identite.ville === null ? "" : response.data.client_institution.client.identite.ville,
                            number: response.data.account_number,
                            account_type_id: response.data.account_type_id,
                            category_client_id: response.data.client_institution.category_client_id,
                        };
                        setData(newClient);
                        setType({
                            value: response.data.account_type?response.data.account_type.id:"",
                            label: response.data.account_type?response.data.account_type.name.fr:""
                        });
                        setCategory({
                            value: response.data.client_institution.category_client ? response.data.client_institution.category_client.id : "",
                            label: response.data.client_institution.category_client ? response.data.client_institution.category_client.name.fr : ""
                        });

                    })
                ;
            }
        }
    }, []);

        const handleCustomerChange = (e, selected) => {
        const newData = {...data};
        setAccount(null);
        newData.account_type_id = "";
        newData.number = [];
        setAccounts(formatSelectOption(selected.accounts, "number", false));
        newData.firstname = selected.identity.firstname;
        newData.lastname = selected.identity.lastname;
        newData.sexe = selected.identity.sexe;
        newData.telephone = selected.identity.telephone?selected.identity.telephone:[];
        newData.email = selected.identity.email ? selected.identity.email : [];
        newData.ville = selected.identity.ville;
        newData.client_id = selected.client_id;
        newData.category_client_id = selected.category_client_id;
        setShowSearchResult(false);
        setSearchList([]);
        setData(newData);

        setCategory({
            value: selected.category_client_id ? selected.category_client_id : "",
            label: selected.category_name ? JSON.parse(selected.category_name).fr : ""
        });

        if (selected.identity?.telephone && Array.isArray(selected.identity.telephone) && selected.identity.telephone.length > 0 ){
            setDisabledInputTel(true)
        }

        if (selected.identity?.email && Array.isArray(selected.identity.email) && selected.identity.email.length > 0 ){
            setDisabledInputEmail(true)
        }
    };


    const blur = () => {
        setTimeout(function () {
            setShowSearchResult(false);
        }, 500);
    };

    const startSearchClient = async () => {
        setStartSearch(true);
        const value = props.plan === "PRO" ? (props.currentUserInstitution) : (verifyPermission(props.userPermissions, 'store-claim-against-my-institution') ? props.currentUserInstitution : institution.value);
        if (searchInputValue === clientCash.searchInputValue) {
            setStartSearch(false);
            setSearchList(clientCash.clients);
        } else {
            if (tag.name.length && tag.show) {
                if (tag.name === "full_name" && isNaN(searchInputValue)) {
                    if (verifyTokenExpire()) {
                        await axios.get(`${appConfig.apiDomaine}/my/clients/search?type=name_or_phone&r=${searchInputValue}`)
                            .then(({data}) => {
                                console.log(data)
                                setStartSearch(false);
                                setShowSearchResult(true);
                                if (data.length)
                                    setClientCash({"searchInputValue": searchInputValue, "clients": data});
                                setSearchList(data);
                            })
                            .catch(({response}) => {
                                setStartSearch(false);
                                console.log("Something is wrong");
                            })
                        ;
                    }
                }
                else if (tag.name === "telephone" && !isNaN(searchInputValue)) {
                    if (verifyTokenExpire()) {
                        await axios.get(`${appConfig.apiDomaine}/my/clients/search?type=name_or_phone&r=${searchInputValue}`)
                            .then(({data}) => {
                                setStartSearch(false);
                                setShowSearchResult(true);
                                if (data.length)
                                    setClientCash({"searchInputValue": searchInputValue, "clients": data});
                                setSearchList(data);
                                console.log(data);
                                console.log(searchInputValue);
                            })
                            .catch(({response}) => {
                                setStartSearch(false);
                                console.log("Something is wrong");
                            })
                        ;
                    }
                }
                else if (tag.name === "account_number") {
                    if (verifyTokenExpire()) {
                        await axios.get(`${appConfig.apiDomaine}/search/institutions/${value}/clients?type=account_number&r=${searchInputValue}`)
                            .then(({data}) => {
                                setStartSearch(false);
                                setShowSearchResult(true);
                                if (data.length)
                                    setClientCash({"searchInputValue": searchInputValue, "clients": data});
                                setSearchList(data);
                                console.log(data);
                                console.log(searchInputValue);
                            })
                            .catch(({response}) => {
                                setStartSearch(false);
                                console.log("Something is wrong");
                            })
                        ;
                    }
                }
                else {
                    setStartSearch(false);
                    setSearchList([]);
                }
            }
            else {
                if (verifyTokenExpire()) {
                    await axios.get(`${appConfig.apiDomaine}/search/institutions/${value}/clients?type=name_or_phone&r=${searchInputValue}`)
                        .then(({data}) => {
                            setStartSearch(false);
                            setShowSearchResult(true);
                            if (data.length)
                                setClientCash({"searchInputValue": searchInputValue, "clients": data});
                            setSearchList(data);
                            console.log(data);
                            console.log(searchInputValue);
                        })
                        .catch(({response}) => {
                            setStartSearch(false);
                            console.log("Something is wrong");
                        })
                    ;
                }
            }
        }
    };

    const onClickTag = (e, name, label, className) => {
        e.preventDefault();
        const newTag = {...tag};
        newTag.name = name;
        newTag.label = label;
        newTag.className = className;
        newTag.show = true;
        setTag(newTag);
    }

    const onCloseTag = () => {
        const newTag = {...tag};
        newTag.name = "";
        newTag.label = "";
        newTag.className = "";
        newTag.show = false;
        setTag(newTag)
    }

    const searchClient = () => {
        console.log(searchInputValue)
        if (searchInputValue.length) {
            if (verifyPermission(props.userPermissions, "store-claim-against-any-institution")) {
                if (institution) {
                    startSearchClient();
                } else
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veuillez selectionner une institution")))
            } else if (verifyPermission(props.userPermissions, "store-client-from-my-institution")) {
                    startSearchClient();
            }

        } else {
            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veuillez renseigner le champ de recherche")))
        }
    };

    const handleDisabledInputChange = (e) => {
        setSearchList([]);
        const newData = {...data};
        setAccount(null);
        setAccounts([]);
        newData.firstname = "";
        newData.lastname = "";
        newData.sexe = "";
        newData.telephone = [];
        newData.email = [];
        newData.client_id = "";
        newData.ville = "";
        newData.category_client_id = "";
        setData(newData);
        setDisabledInput(e.target.checked);
    };

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

    const onChangeFirstName = (e) => {
        const newData = {...data};
        newData.firstname = e.target.value;
        setData(newData);
    };
    const onChangeLastName = (e) => {
        const newData = {...data};
        newData.lastname = e.target.value;
        setData(newData);
    };
    const onChangeTelephone = (tel) => {
        const newData = {...data};
        newData.telephone = tel;
        setData(newData);
    };
    const onChangeSexe = (e) => {
        const newData = {...data};
        newData.sexe = e.target.value;
        setData(newData);
    };
    const onChangeEmail = (mail) => {
        const newData = {...data};
        newData.email = mail;
        setData(newData);
    };
    const onChangeVille = (e) => {
        const newData = {...data};
        newData.ville = e.target.value;
        setData(newData);
    };
    const onChangeInstitution = (selected) => {
        const newData = {...data};
        if (selected) {
            newData.institution_id = selected.value;
            setInstitution(selected);
            if (verifyTokenExpire()) {
                axios.get(appConfig.apiDomaine + `/any/clients/${newData.institution_id}/institutions`)
                    .then(response => {
                        const options =
                            response.data ? response.data.map((client) => ({
                                value: client.client_id,
                                label: client.client.identite.firstname + ' ' + client.client.identite.lastname
                            })) : "";
                        setNameClient(options);
                    })
                ;
            }
            setCategory([]);
            setClient([]);
            newData.firstname = "";
            newData.lastname = "";
            newData.sexe = "";
            newData.telephone = [];
            newData.email = [];
            newData.ville = "";
            newData.client_id = [];
            newData.account_type_id = "";
            newData.number = [];
            newData.category_client_id = "";
        }
        setData(newData);
        setDisabledInput(false)
        setDisabledInputTel(false);
        setDisabledInputEmail(false);
    };

    const onChangeClient = (selected) => {
        const newData = {...data};
        newData.client_id = selected.value;
        console.log( newData.client_id,"SELECT_ID")
        setClient(selected);
        if (newData.client_id) {
            if (verifyTokenExpire()) {
                axios.post(endPoint.update(`${newData.client_id}`),newData)
                    .then(response => {
                        const newIdentity = {
                            firstname: response.data.client.identite.firstname,
                            lastname: response.data.client.identite.lastname,
                            sexe: response.data.client.identite.sexe,
                            telephone: response.data.client.identite.telephone,
                            email: response.data.client.identite.email,
                            ville: response.data.client.identite.ville === null ? "" : response.data.client.identite.ville,
                            client_id: response.data.client_id,
                            institution_id: response.data.institution_id,
                            category_client_id: response.data.category_client_id
                        };
                        setData(newIdentity);
                        setCategory({
                            value: response.data.category_client ? response.data.category_client.id : "",
                            label: response.data.category_client ? response.data.category_client.name.fr : ""
                        });
                    }).catch((error)=>{
                        console.log(error.response.data,"ERROR")
                })
                ;
            }
        }
        setDisabledInput(true)

    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        let newData = {...data};
        if (verifyTokenExpire()) {
            if (!(verifyPermission(props.userPermissions, 'store-client-from-any-institution') || verifyPermission(props.userPermissions, 'update-client-from-any-institution')))
                delete newData.institution_id ;

            if (id) {
                axios.put(endPoint.update(`${id}`), newData)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    })
                    .catch((errorRequest) => {
                        setStartRequest(false);
                        setError({...defaultError, ...errorRequest.response.data.error});

                        if (errorRequest.response.data.error.message)
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(errorRequest.response.data.error.message));
                        else
                            ToastBottomEnd.fire(toastEditErrorMessageConfig());
                    })
                ;
            } else {

                if (data.client_id.length !== 0) {
                    axios.post(endPoint.storeAccount(`${data.client_id}`), data)

                        .then(response => {
                            setShowSearchResult(false);
                            setSearchInputValue("");
                            setDisabledInput(false);
                            setDisabledInputTel(false);
                            setDisabledInputEmail(false);
                            setTag({name: "", label: "", className: "", show: false})
                            setStartRequest(false);
                            setError(defaultError);
                            setData(defaultData);
                            setInstitution(null);
                            setType(null);
                            setCategory(null);
                            ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                        })
                        .catch((errorRequest) => {
                            setStartRequest(false);
                            setError({...defaultError, ...errorRequest.response.data.error});

                            if (errorRequest.response.data.error.code === 409){
                                ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(errorRequest.response.data.error.message));
                            } else {
                                ToastBottomEnd.fire(toastAddErrorMessageConfig());
                            }
                        })
                    ;
                } else {
                    axios.post(endPoint.store, newData)
                        .then(response => {
                            setStartRequest(false);
                            setError(defaultError);
                            setData(defaultData);
                            setType(null);
                            setCategory(null);
                            setInstitution(null);
                            ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                        })
                        .catch(async (errorRequest) => {
                            if (errorRequest.response.data.error.identite) {
                                await setFoundIdentity(errorRequest.response.data.error);
                                await document.getElementById("confirmClientSaveForm").click();
                                await setInstitution(null);
                                await setType(null);
                                await setCategory(null);
                                setStartRequest(false);
                                setError(defaultError);
                                setData(defaultData);
                            } else if (errorRequest.response.data.client) {
                                setStartRequest(false);
                                ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(
                                    errorRequest.response.data.client.identite.lastname + " " + errorRequest.response.data.client.identite.firstname + ": " + errorRequest.response.data.message)
                                );
                            } else {
                                console.log("error3", errorRequest.response.data.error)
                                setStartRequest(false);
                                setError({...defaultError, ...errorRequest.response.data.error});

                                if (errorRequest.response.data.error.status === false){
                                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(errorRequest.response.data.error.message));
                                } else {
                                    ToastBottomEnd.fire(toastAddErrorMessageConfig());
                                }
                               // ToastBottomEnd.fire(toastAddErrorMessageConfig());
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
                                    <div className="kt-portlet__body">
                                        <div className="kt-section kt-section--first">
                                            <h5 className="kt-section__title kt-section__title-lg">{t("Identité")}:</h5>
                                            {
                                                !id ?
                                                    <>
                                                    <div className="form-group row">
                                                        {
                                                            verifyPermission(props.userPermissions, "store-client-from-any-institution") ?
                                                                <div
                                                                    className={error.institution_id.length ? "col validated" : "col"}>
                                                                    <label htmlFor="exampleSelect1"> {t("Institution")} <span
                                                                        style={{color: "red"}}>*</span></label>
                                                                    {institutionData ? (
                                                                        <Select
                                                                            value={institution}
                                                                            placeholder={t("Veuillez sélectionner l'institution")}
                                                                            onChange={onChangeInstitution}
                                                                            options={institutionData ? institutionData.map(name => name) : ''}
                                                                        />
                                                                    ) : (
                                                                        <select name="institution"
                                                                                className={error.institution_id.length ? "form-control is-invalid" : "form-control"}
                                                                                id="institution">
                                                                            <option value=""/>
                                                                        </select>
                                                                    )
                                                                    }

                                                                    {
                                                                        error.institution_id.length ? (
                                                                            error.institution_id.map((error, index) => (
                                                                                <div key={index}
                                                                                     className="invalid-feedback">
                                                                                    {error}
                                                                                </div>
                                                                            ))
                                                                        ) : null
                                                                    }
                                                                </div>
                                                                : null
                                                        }
                                                       {/* <div
                                                            className={error.client_id.length ? "col validated" : "col"}>
                                                            <label htmlFor="exampleSelect1"> {t("Client")}</label>
                                                            {console.log(nameClient,"NAME")}
                                                            {nameClient ? (
                                                                <Select

                                                                    placeholder={t("Veuillez sélectionner le client")}
                                                                    value={client}
                                                                    onChange={onChangeClient}
                                                                    options={nameClient ? nameClient.map(name => name) : ''}
                                                                />
                                                            ) : (<select name="client"
                                                                         className={error.client_id.length ? "form-control is-invalid" : "form-control"}
                                                                         id="client">
                                                                <option value=""/>
                                                            </select>)
                                                            }

                                                            {
                                                                error.client_id.length ? (
                                                                    error.client_id.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>*/}

                                                    </div>
                                                    <div className="form-group row">
                                                        <div className={"col d-flex align-items-center mt-4"}>
                                                            <label className="kt-checkbox">

                                                                <input id="is_client" type="checkbox"
                                                                       checked={disabledInput}
                                                                       onChange={handleDisabledInputChange}/>
                                                                {t("Le client est-il déjà enregistré")} ?<span/>
                                                            </label>
                                                        </div>

                                                        <div className={"col"}>

                                                            <div className="row"
                                                                 onFocus={e => setShowSearchResult(true)}
                                                                 onBlur={e => blur()}>
                                                                <div className="col d-flex">

                                                                    {
                                                                        tag.show && tag.name.length ? (
                                                                            <span className={"btn btn-label-" + tag.className}
                                                                                  style={{

                                                                                      marginTop: "2rem",
                                                                                      borderBottomRightRadius: "0px",
                                                                                      borderTopRightRadius: "0px",
                                                                                      whiteSpace: "nowrap",
                                                                                  }}>
                                                                                        <div>
                                                                                    {tag.label}
                                                                                            <button type="button" onClick={e => onCloseTag()} className="btn btn-icon" style={{
                                                                                                height: "50%",
                                                                                                width: "20%",
                                                                                            }}>
                                                                                        <i className="flaticon2-cross" style={{
                                                                                            fontSize: "0.8em",
                                                                                        }}/>
                                                                                    </button>

                                                                                </div>
                                                                                    </span>
                                                                        ) : null
                                                                    }


                                                                    <input
                                                                        style={{
                                                                            marginTop: "2rem",
                                                                            borderBottomRightRadius: "0px",
                                                                            borderTopRightRadius: "0px"
                                                                        }}
                                                                        type="text"
                                                                        value={searchInputValue}
                                                                        onChange={e => setSearchInputValue(e.target.value)}
                                                                        placeholder={t("Rechercher un client") + "..."}
                                                                        className="form-control"
                                                                        disabled={!disabledInput}
                                                                    />

                                                                    <button
                                                                        style={{
                                                                            marginTop: "2rem",
                                                                            borderTopLeftRadius: "0px",
                                                                            borderBottomLeftRadius: "0px"
                                                                        }}
                                                                        type="button"
                                                                        className="btn btn-primary btn-icon"
                                                                        disabled={!disabledInput || startSearch}
                                                                        onClick={(e) => searchClient()}
                                                                    >
                                                                        <i className="fa fa-search"/>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {
                                                                disabledInput ? (
                                                                    searchList.length ? (
                                                                        <div className="row">
                                                                            <div
                                                                                className={showSearchResult ? `dropdown-menu show` : `dropdown-menu`}
                                                                                aria-labelledby="dropdownMenuButton"
                                                                                x-placement="bottom-start"
                                                                                style={{
                                                                                    width: "100%",
                                                                                    position: "absolute",
                                                                                    willChange: "transform",
                                                                                    top: "33px",
                                                                                    left: "0px",
                                                                                    transform: "translate3d(0px, 38px, 0px)",
                                                                                    zIndex: "1"
                                                                                }}>
                                                                                <span className="d-flex justify-content-center"><em>{("---" + t("Type de recherche") + "---")}</em></span>
                                                                                <div className="d-flex justify-content-center mt-1 mb-1">
                                                                                    <button className="btn btn-outline-primary" onClick={(e) => onClickTag(e,"full_name", t("Nom/Prénom"), "primary")}>{t("Nom/Prénom")}</button>&nbsp;
                                                                                    <button className="btn btn-outline-primary" onClick={(e) => onClickTag(e,"telephone", t("Numéro de téléphone"), "primary")}>{t("Numéro de téléphone")}</button>&nbsp;
                                                                                </div>
                                                                                <span className="d-flex justify-content-center mb-2"><em>{"---"+t("Fin")+"---"}</em></span>
                                                                                {
                                                                                    searchList.map((el, index) => (
                                                                                        <span
                                                                                            onClick={(e) => handleCustomerChange(e, el)}
                                                                                            key={index}
                                                                                            className="dropdown-item"
                                                                                            style={{cursor: "pointer"}}
                                                                                        >
                                                                                                    <strong>{el.fullName}</strong>
                                                                                            </span>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="row">
                                                                            <div
                                                                                className={showSearchResult ? `dropdown-menu show` : `dropdown-menu`}
                                                                                aria-labelledby="dropdownMenuButton"
                                                                                x-placement="bottom-start"
                                                                                style={{
                                                                                    width: "100%",
                                                                                    position: "absolute",
                                                                                    willChange: "transform",
                                                                                    top: "33px",
                                                                                    left: "0px",
                                                                                    transform: "translate3d(0px, 38px, 0px)",
                                                                                    zIndex: "1"
                                                                                }}>

                                                                                {
                                                                                    startSearch ? (
                                                                                        <span
                                                                                            className={"mt-5 mb-5"}><Loader/></span>
                                                                                    ) : (
                                                                                        <>
                                                                                            <span className="d-flex justify-content-center"><em>{"--- "+ t("Type de recherche") +" ---"}</em></span>
                                                                                            <div className="d-flex justify-content-center mt-1 mb-1">
                                                                                                <button className="btn btn-outline-primary" onClick={(e) => onClickTag(e,"full_name", t("Nom/Prénom"), "primary")}>{t("Nom/Prénom")}</button>&nbsp;
                                                                                                <button className="btn btn-outline-primary" onClick={(e) => onClickTag(e,"telephone", t("Numéro de téléphone"), "primary")}>{t("Numéro de téléphone")}</button>&nbsp;
                                                                                            </div>
                                                                                            <span className="d-flex justify-content-center mb-2"><em>{"--- "+t("Fin")+" ---"}</em></span>
                                                                                            <span
                                                                                                className="d-flex justify-content-center"><strong>{t("Pas de resultat")}</strong></span>

                                                                                        </>
                                                                                    )
                                                                                }

                                                                            </div>
                                                                        </div>
                                                                    )
                                                                ) : null
                                                            }
                                                        </div>
                                                    </div>
                                                    </>
                                                : null
                                            }

                                            <div className="form-group row">
                                                <div
                                                    className={error.category_client_id.length ? "col validated" : "col"}>
                                                    <label htmlFor="exampleSelect1">{t("Catégorie Client")} <InputRequire/></label>

                                                    {categoryClient ? (
                                                        <Select
                                                            placeholder={t("Veuillez sélectionner la catégorie client")}
                                                            value={category}
                                                            onChange={onChangeCategoryClient}
                                                            options={formatSelectOption(categoryClient, 'name', 'fr')}
                                                            isDisabled={props.getDisable ? props.getDisable : disabledInput}
                                                        />
                                                    ) : (
                                                        <select name="category"
                                                                className={error.category_client_id.length ? "form-control is-invalid" : "form-control"}
                                                                id="category"
                                                        >
                                                            <option value=""/>
                                                        </select>
                                                    )
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
                                                <div className={error.lastname.length ? "col validated" : "col"}>
                                                    <label htmlFor="lastname">{t("Nom")}<span style={{color: "red"}}>*</span>
                                                    </label>
                                                    <input
                                                        id="lastname"
                                                        type="text"
                                                        className={error.lastname.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le nom de famille")}
                                                        value={data.lastname}
                                                        onChange={(e) => onChangeLastName(e)}
                                                        disabled={props.getDisable ? props.getDisable : disabledInput}
                                                    />
                                                    {
                                                        error.lastname.length ? (
                                                            error.lastname.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>

                                                <div className={error.firstname.length ? "col validated" : "col"}>
                                                    <label htmlFor="firstname">{t("Prénom(s)")} <span
                                                        style={{color: "red"}}>*</span></label>
                                                    <input
                                                        id="firstname"
                                                        type="text"
                                                        className={error.firstname.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le prénom")}
                                                        value={data.firstname}
                                                        onChange={(e) => onChangeFirstName(e)}
                                                        disabled={props.getDisable ? props.getDisable : disabledInput}
                                                    />
                                                    {
                                                        error.firstname.length ? (
                                                            error.firstname.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <div className={error.sexe.length ? " col validated" : "col"}>
                                                    <label htmlFor="sexe">{t("Sexe")} <span
                                                        style={{color: "red"}}>*</span></label>
                                                    <select
                                                        id="sexe"
                                                        className={error.sexe.length ? "form-control is-invalid" : "form-control"}
                                                        value={data.sexe}
                                                        onChange={(e) => onChangeSexe(e)}
                                                        disabled={props.getDisable ? props.getDisable : disabledInput}
                                                    >
                                                        <option value="" disabled={true}>{t("Veuillez choisir le Sexe")}
                                                        </option>
                                                        <option value="F">{t("Féminin")}</option>
                                                        <option value="M">{t("Masculin")}</option>
                                                        <option value="M">{t("Autres")}</option>
                                                    </select>
                                                    {
                                                        error.sexe.length ? (
                                                            error.sexe.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>
                                                <div className={error.ville.length ? "col validated" : "col"}>
                                                    <label htmlFor="ville">{t("Ville")} <InputRequire/></label>
                                                    <input
                                                        id="ville"
                                                        type="text"
                                                        className={error.ville.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer votre ville")}
                                                        value={data.ville}
                                                        onChange={(e) => onChangeVille(e)}
                                                        disabled={props.getDisable ? props.getDisable : false}
                                                    />
                                                    {
                                                        error.ville.length ? (
                                                            error.ville.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>
                                            </div>

                                            <div className="form-group row">
                                                <div className={error.telephone.length ? "col validated" : "col"}>
                                                    <label htmlFor="telephone">{t("Téléphone(s)")} <WithoutCode/>
                                                        <InputRequire/> </label>
                                                    <TagsInput
                                                        value={data.telephone}
                                                        onChange={onChangeTelephone}
                                                        disabled={props.getDisable ? props.getDisable : disabledInputTel}
                                                        inputProps={{
                                                            className: "react-tagsinput-input",
                                                            placeholder: "Numéro(s)"
                                                        }}
                                                    />
                                                    {
                                                        error.telephone.length ? (
                                                            error.telephone.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>

                                                <div className={error.email.length ? "col validated" : "col"}>
                                                    <label htmlFor="email"> Email(s) <InputRequire/></label>
                                                    <TagsInput
                                                        value={data.email}
                                                        onChange={onChangeEmail}
                                                        disabled={props.getDisable ? props.getDisable : disabledInputEmail}
                                                        inputProps={{
                                                            className: "react-tagsinput-input",
                                                            placeholder: "Email(s)"
                                                        }}
                                                    />
                                                    {
                                                        error.email.length ? (
                                                            error.email.map((error, index) => (
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

                                    <div className="kt-portlet__body">
                                        <div className="kt-section kt-section--first">
                                            <h5 className="kt-section__title kt-section__title-lg">
                                                {t("Informations Techniques")}
                                            </h5>
                                            <div className="form-group row">
                                                <div className={error.account_type_id.length ? "col validated" : "col"}>
                                                    <label htmlFor="exampleSelect1">{t("Type de compte")}<InputRequire/></label>
                                                    {accountType ? (
                                                        <Select
                                                            placeholder={t("Veuillez selectionner le type de compte")}
                                                            value={type}
                                                            onChange={onChangeAccountType}
                                                            options={formatSelectOption(accountType, 'name', 'fr')}
                                                        />
                                                    ) : (
                                                        <select name="type"
                                                                className={error.account_type_id.length ? "form-control is-invalid" : "form-control"}
                                                                id="type">
                                                            <option value=""/>
                                                        </select>
                                                    )
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
                                                <div className={error.number.length ? "col validated" : "col"}>
                                                    <label htmlFor="number">{t("Numéro de Compte")} <InputRequire/></label>
                                                    <input
                                                        id="number"
                                                        type="text"
                                                        className={error.number.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le numero de compte")}
                                                        value={data.number}
                                                        onChange={onChangeAccount}
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
                                    <div className="kt-portlet__foot">
                                        <div className="kt-form__actions text-right">
                                            {
                                                !startRequest ? (
                                                    <button type="submit" onClick={(e) => onSubmit(e)}
                                                            className="btn btn-primary">{id ? t("Modifier") : t("Enregistrer")}</button>
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
                                            <button style={{display: "none"}} id="confirmClientSaveForm" type="button" className="btn btn-bold btn-label-brand btn-sm"
                                                    data-toggle="modal" data-target="#kt_modal_4">Launch Modal
                                            </button>
                                            {
                                                foundIdentity? (
                                                    <ConfirmClientSaveForm
                                                        plan={props.plan}
                                                        userPermissions={props.userPermissions}
                                                        message={foundIdentity.message}
                                                        institution={institution}
                                                        category={category}
                                                        categories={categoryClient}
                                                        type={type}
                                                        identite={foundIdentity}
                                                        client={client}
                                                        clients={nameClient}
                                                        types={accountType}
                                                        institutions={institutionData}
                                                        client_id={data.client_id}
                                                        institution_id={data.institution_id}
                                                        account_type_id={data.account_type_id}
                                                        category_id={data.category_client_id}
                                                        number={data.number}
                                                        resetFoundIdentity={() => setFoundIdentity({})}
                                                    />
                                                ) :  null
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
        userPermissions: state.user.user.permissions,
        plan: state.plan.plan
    }
};

export default connect(mapStateToProps)(HoldingClientForm);
