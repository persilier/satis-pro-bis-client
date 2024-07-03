import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {NavLink} from "react-router-dom";
import axios from "axios";
import TagsInput from "react-tagsinput";
import Select from "react-select";
import appConfig from "../../config/appConfig";
import InfoFormatExcel from "../../constants/InfoFormatExcel";
import {
    filterChannel,
    formatSelectOption,
    formatToTimeStamp,
} from "../../helpers/function";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import {RESPONSE_CHANNEL} from "../../constants/channel";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastErrorMessageWithParameterConfig
} from "../../config/toastConfig";
import ConfirmClaimAddModal from "../components/Modal/ConfirmClaimAddModal";
import InfirmationTable from "../components/InfirmationTable";
import InputRequire from "../components/InputRequire";
import WithoutCode from "../components/WithoutCode";
import Loader from "../components/Loader";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";
import ClaimCategory from "./ClaimCategory";

const endPointConfig = {
    PRO: {
        plan: "PRO",
        create: `${appConfig.apiDomaine}/my/claims/create`,
        store: `${appConfig.apiDomaine}/my/claims`,
        storeKnowingIdentity: id => `${appConfig.apiDomaine}/my/identites/${id}/claims`,
    },
    MACRO: {
        holding: {
            create: `${appConfig.apiDomaine}/any/claims/create`,
            store: `${appConfig.apiDomaine}/any/claims`,
            storeKnowingIdentity: id => `${appConfig.apiDomaine}/any/identites/${id}/claims`,
        },
        filial: {
            create: `${appConfig.apiDomaine}/my/claims/create`,
            store: `${appConfig.apiDomaine}/my/claims`,
            storeKnowingIdentity: id => `${appConfig.apiDomaine}/my/identites/${id}/claims`,
        }
    },
    HUB: {
        plan: "HUB",
        create: `${appConfig.apiDomaine}/without-client/claims/create`,
        store: `${appConfig.apiDomaine}/without-client/claims`,
        storeKnowingIdentity: id => `${appConfig.apiDomaine}/without-client/identites/${id}/claims`,
    }
};

const ClaimAdd = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - " + ready ? t("Enrégistrement de réclamation") : "";
    if (!(verifyPermission(props.userPermissions, 'store-claim-against-any-institution') || verifyPermission(props.userPermissions, "store-claim-against-my-institution") || verifyPermission(props.userPermissions, "store-claim-without-client")))
        window.location.href = ERROR_401;

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'store-claim-against-any-institution'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'store-claim-against-my-institution'))
            endPoint = endPointConfig[props.plan].filial
    } else
        endPoint = endPointConfig[props.plan];

    const defaultData = {
        firstname: "",
        lastname: "",
        sexe: "",
        telephone: [],
        email: [],
        ville: "",
        lieu: "",
        unit_targeted_id: "",
        institution_targeted_id: "",
        account_targeted_id: "",
        account_number: "",
        relationship_id: "",
        claim_object_id: "",
        request_channel_slug: "",
        response_channel_slug: "",
        claimer_expectation: "",
        description: "",
        amount_currency_slug: "",
        amount_disputed: "",
        claimer_id: "",
        event_occured_at: "",
        is_revival: 0,
        file: []
    };
    const defaultError = {
        firstname: [],
        lastname: [],
        sexe: [],
        telephone: [],
        email: [],
        ville: [],
        lieu: [],
        unit_targeted_id: [],
        institution_targeted_id: [],
        relationship_id: [],
        account_targeted_id: [],
        account_number: [],
        claim_object_id: [],
        claim_category : [],
        request_channel_slug: [],
        response_channel_slug: [],
        claimer_expectation: [],
        description: [],
        amount_currency_slug: [],
        amount_disputed: [],
        claimer_id: [],
        event_occured_at: [],
        is_revival: [],
        file: []
    };

    const option1 = 1;
    const option2 = 0;

    const [claimObject, setClaimObject] = useState(null);
    const [claimObjects, setClaimObjects] = useState([]);
    const [claimCategory, setClaimCategory] = useState(null);
    const [claimCategories, setClaimCategories] = useState([]);
    const [relationship, setRelationship] = useState(null);
    const [relationships, setRelationships] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [account, setAccount] = useState(null);
    const [units, setUnits] = useState([]);
    const [unit, setUnit] = useState(null);
    const [responseChannels, setResponseChannels] = useState([]);
    const [channels, setChannels] = useState([]);
    const [responseChannel, setResponseChannel] = useState(null);
    const [receptionChannel, setReceptionChannel] = useState(null);
    const [currency, setCurrency] = useState(null);
    const [currencies, setCurrencies] = useState([]);
    const [disabledInput, setDisabledInput] = useState(false);
    const [disabledInputTel, setDisabledInputTel] = useState(false);
    const [disabledInputEmail, setDisabledInputEmail] = useState(false);
    const [institution, setInstitution] = useState(null);
    const [institutions, setInstitutions] = useState([]);
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [foundData, setFoundData] = useState({});
    const [clientCash, setClientCash] = useState({searchInputValue: "", clients: []});

    const [searchList, setSearchList] = useState([]);
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [searchInputValue, setSearchInputValue] = useState("");
    const [startSearch, setStartSearch] = useState(false);
    const [componentData, setComponentData] = useState(undefined);
    const [load, setLoad] = useState(true);

    const [tag, setTag] = useState({name: "", label: "", className: "", show: false});

    const [completionError, setCompletionError] = useState({ref: "", list: []});

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1);

    const maxDate = (currentDate.toISOString()).substr(0, (currentDate.toISOString()).length - 1);

    useEffect(() => {
        async function fetchData() {
            setLoad(true);
            await axios.get(endPoint.create)
                .then(response => {
                    if (verifyPermission(props.userPermissions, "store-claim-without-client"))
                        setRelationships(formatSelectOption(response.data.relationships, "name", "fr"));
                    if (verifyPermission(props.userPermissions, "store-claim-against-any-institution") || verifyPermission(props.userPermissions, "store-claim-without-client"))
                        setInstitutions(formatSelectOption(response.data.institutions, "name", false));
                    if (verifyPermission(props.userPermissions, "store-claim-against-my-institution")) {
                        setUnits(formatSelectOption(response.data.units, "name", "fr"))
                    }
                    setClaimCategories(formatSelectOption(response.data.claimCategories, "name", "fr"));
                    setCurrencies(formatSelectOption(response.data.currencies, "name", "fr", "slug"));
                    setChannels(formatSelectOption(response.data.channels, "name", "fr", "slug"));
                    setResponseChannels(formatSelectOption(filterChannel(response.data.channels, RESPONSE_CHANNEL), "name", "fr", "slug"))
                })
                .catch(error => {
                    //console.log("Something is wrong");
                });
            await axios.get(appConfig.apiDomaine + "/components/retrieve-by-name/register_claim")
                .then(response => {
                    setComponentData(response.data);
                    setLoad(false);
                })
                .catch(error => {
                    setLoad(false);
                    //console.log("Something is wrong");
                })
            ;
        }

        if (verifyTokenExpire()) {
            fetchData();
        }
    }, [endPoint.create, props.userPermissions]);

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

    const onChangeSexe = (e) => {
        const newData = {...data};
        newData.sexe = e.target.value;
        setData(newData);
    };

    const onChangeVille = (e) => {
        const newData = {...data};
        newData.ville = e.target.value;
        setData(newData);
    };

    const onChangeTelephone = (tel) => {
        const newData = {...data};
        newData.telephone = tel;
        setData(newData);
    };

    const onChangeEmail = (mail) => {
        const newData = {...data};
        newData.email = mail;
        setData(newData);
    };

    const onChangeFile = (e) => {
        const newData = {...data};
        newData.file = Object.values(e.target.files);
        setData(newData);
    };

    const onChangeInstitution = (selected) => {
        const newData = {...data};
        if (selected) {
            setInstitution(selected);
            newData.institution_targeted_id = selected.value;
            if (!verifyPermission(props.userPermissions, "store-claim-without-client")) {
                if (verifyTokenExpire()) {
                    axios.get(`${appConfig.apiDomaine}/institutions/${selected.value}/clients`)
                        .then(response => {
                            setUnits(formatSelectOption(response.data.units, "name", "fr"))
                        })
                        .catch(error => {
                            //console.log("Something is wrong");
                        })
                    ;
                }
            }
        } else {
            setUnits([]);
            setUnit(null);
            setInstitution(null);
            setAccount(null);
            setAccounts([]);
            newData.firstname = "";
            newData.lastname = "";
            newData.sexe = "";
            newData.telephone = [];
            newData.email = [];
            newData.ville = "";
            newData.unit_targeted_id = "";
            newData.claimer_id = "";
            newData.account_targeted_id = "";
            newData.account_number = "";
            newData.institution_targeted_id = "";
        }
        setData(newData);
    };

    const handleDisabledInputChange = (e) => {
        setSearchList([]);
        setShowSearchResult(false);
        setSearchInputValue("");
        const newData = {...data};
        setAccount(null);
        setAccounts([]);
        newData.firstname = "";
        newData.lastname = "";
        newData.sexe = "";
        newData.telephone = [];
        newData.email = [];
        newData.ville = "";
        newData.claimer_id = "";
        newData.account_targeted_id = "";
        newData.account_number = "";
        setData(newData);
        setDisabledInput(e.target.checked);
    };

    const onChangeUnit = selected => {
        const newData = {...data};
        if (selected) {
            setUnit(selected);
            newData.unit_targeted_id = selected.value;
        } else {
            newData.unit_targeted_id = "";
            setUnit(null)
        }
        setData(newData);
    };

    const handleCustomerChange = (e, selected) => {
        const newData = {...data};
        setAccount(null);
        newData.account_targeted_id = "";
        newData.account_number = "";
        setAccounts(formatSelectOption(selected.accounts, "number", false));
        newData.firstname = selected.identity.firstname;
        newData.lastname = selected.identity.lastname;
        newData.sexe = selected.identity.sexe;
        newData.telephone = selected.identity.telephone?selected.identity.telephone:[];
        newData.email = selected.identity.email ? selected.identity.email : [];
        newData.ville = selected.identity.ville;
        newData.claimer_id = selected.identity.id;
        setShowSearchResult(false);
        setSearchList([]);
        setData(newData);

        if (selected.identity?.telephone && Array.isArray(selected.identity.telephone) && selected.identity.telephone.length > 0 ){
            setDisabledInputTel(true)
        }

        if (selected.identity?.email && Array.isArray(selected.identity.email) && selected.identity.email.length > 0 ){
            setDisabledInputEmail(true)
        }
    };

    const onChangeAccount = selected => {
        const newData = {...data};
        if (selected) {
            setAccount(selected);
            newData.account_targeted_id = selected.value;
        } else {
            setAccount(null);
            newData.account_targeted_id = ""
        }
        setData(newData);
    };

    const onChangeAccountNumber = (e) => {
        const newData = {...data};
        newData.account_number = e.target.value;
        setData(newData);
    }

    const onChangeClaimObject = selected => {
        const newData = {...data};
        if (selected) {
            setClaimObject(selected);
            newData.claim_object_id = selected.value;
        } else {
            setClaimObject(null);
            newData.claim_object_id = "";
        }
        setData(newData);
    };

    const onChangeReceptionChannel = selected => {
        const newData = {...data};
        if (selected) {
            setReceptionChannel(selected);
            newData.request_channel_slug = selected.value;
        } else {
            setReceptionChannel(null);
            newData.request_channel_slug = ""
        }
        setData(newData);
    };

    const onChangeResponseChannel = selected => {
        const newData = {...data};
        if (selected) {
            setResponseChannel(selected);
            newData.response_channel_slug = selected.value;
        } else {
            setResponseChannel(null);
            newData.response_channel_slug = "";
        }
        setData(newData);
    };

    const onChangeClaimCategory = selected => {
        const newData = {...data};
        if (selected) {
            setClaimCategory(selected);
            if (verifyTokenExpire()) {
                axios.get(`${appConfig.apiDomaine}/claim-categories/${selected.value}/claim-objects`)
                    .then(response => {
                        newData.claim_object_id = "";
                        setClaimObject(null);
                        setClaimObjects(formatSelectOption(response.data.claimObjects, "name", "fr"));
                    })
                    .catch(error => console.log("Something is wrong"))
                ;
            }

        } else {
            setClaimObjects([]);
            setClaimObject(null);
            setClaimCategory(null);
            newData.claim_object_id = "";
        }
        setData(newData)
    };

    const onChangeClaimerExpectation = e => {
        const newData = {...data};
        newData.claimer_expectation = e.target.value;
        setData(newData);
    };

    const onChangeDescription = e => {
        const newData = {...data};
        newData.description = e.target.value;
        setData(newData);
    };

    const onChangeAmountDisputed = e => {
        const newData = {...data};
        newData.amount_disputed = e.target.value;
        setData(newData);
    };

    const onChangeAmountCurrency = selected => {
        const newData = {...data};
        if (selected) {
            setCurrency(selected);
            newData.amount_currency_slug = selected.value;
        } else {
            setCurrency(null);
            newData.amount_currency_slug = "";
        }
        setData(newData);
    };

    const onChangeRelationShip = selected => {
        const newData = {...data};
        setRelationship(selected);
        newData.relationship_id = selected ? selected.value : null;
        setData(newData);
    };

    const onChangeLieu = e => {
        const newData = {...data};
        newData.lieu = e.target.value;
        setData(newData);
    };

    const handleEventOccuredAt = e => {
        const newData = {...data};
        if (new Date(e.target.value) >= new Date()) {
            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Date invalide")));
            newData.event_occured_at = "";
        } else
            newData.event_occured_at = e.target.value;
        setData(newData);
    };

    const handleOptionChange = (e) => {
        const newData = {...data};
        newData.is_revival = parseInt(e.target.value);
        setData(newData);
    };

    const resetFountData = () => {
        resetAllData();
        setFoundData({});
        setData(defaultData);
        setError(defaultError)
    };

    const closeModal = () => {
        setFoundData({});
    };

    const formatFormData = (newData) => {
        const formData = new FormData();
        formData.append("_method", "post");
        for (const key in newData) {
            if (key === "file") {
                for (let i = 0; i < (newData.file).length; i++)
                    formData.append("file[]", (newData[key])[i], ((newData[key])[i]).name);
            } else if (key === "telephone") {
                for (let i = 0; i < (newData.telephone).length; i++)
                    formData.append("telephone[]", (newData[key])[i]);
            } else if (key === "email") {
                for (let i = 0; i < (newData.email).length; i++)
                    formData.append("email[]", (newData[key])[i]);
            } else
                formData.set(key, newData[key]);
        }
        return formData;
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
                        await axios.get(`${appConfig.apiDomaine}/search/institutions/${value}/clients?type=name_or_phone&r=${searchInputValue}`)
                            .then(({data}) => {
                                setStartSearch(false);
                                setShowSearchResult(true);
                                if (data.length)
                                    setClientCash({"searchInputValue": searchInputValue, "clients": data});
                                setSearchList(data);
                            })
                            .catch(({response}) => {
                                setStartSearch(false);
                                //console.log("Something is wrong");
                            })
                        ;
                    }
                }
                else if (tag.name === "telephone" && !isNaN(searchInputValue)) {
                    if (verifyTokenExpire()) {
                        await axios.get(`${appConfig.apiDomaine}/search/institutions/${value}/clients?type=name_or_phone&r=${searchInputValue}`)
                            .then(({data}) => {
                                setStartSearch(false);
                                setShowSearchResult(true);
                                if (data.length)
                                    setClientCash({"searchInputValue": searchInputValue, "clients": data});
                                setSearchList(data);
                                //console.log(data);
                                //console.log(searchInputValue);
                            })
                            .catch(({response}) => {
                                setStartSearch(false);
                                //console.log("Something is wrong");
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
                                //console.log(data);
                                //console.log(searchInputValue);
                            })
                            .catch(({response}) => {
                                setStartSearch(false);
                                //console.log("Something is wrong");
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
                            //console.log(data);
                            //console.log(searchInputValue);
                        })
                        .catch(({response}) => {
                            setStartSearch(false);
                            //console.log("Something is wrong");
                        })
                    ;
                }
            }
        }
    };

    const onClickTag = (name, label, className) => {
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
        if (searchInputValue.length) {
            if (verifyPermission(props.userPermissions, "store-claim-against-any-institution")) {
                if (institution) {
                    startSearchClient();
                } else

                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veuillez selectionner une institution")))
            } else if (verifyPermission(props.userPermissions, "store-claim-against-my-institution")) {
                startSearchClient();
            }

        } else {

            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veuillez renseigner le champ de recherche")))
        }
    };

    const resetAllData = async () => {
        await setDisabledInput(false);
        await setDisabledInputEmail(false);
        await setDisabledInputTel(false);
        document.getElementById('is_client').click();
        await setInstitution(null);
        await setClaimCategory(null);
        await setCurrency(null);
        await setResponseChannel(null);
        await setReceptionChannel(null);
        await setClaimObject(null);
        await setClaimObjects([]);
        await setAccounts([]);
        await setAccount(null);
        if (props.plan !== "PRO") {
            if (verifyPermission(props.userPermissions, 'store-claim-against-my-institution') && props.plan === "MACRO") {

            } else {
                await setUnits([]);
            }
        }
        await setUnit(null);
        await setData(defaultData);
        await setRelationship(null);
        setStartRequest(false);
        await setSearchInputValue("");
        await setError(defaultError);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const newData = {...data};
        newData.event_occured_at = formatToTimeStamp(data.event_occured_at);
        setStartRequest(true);
        if (!newData.file.length)
            delete newData.file;
        if (!newData.response_channel_slug)
            delete newData.response_channel_slug;
        if (!newData.unit_targeted_id)
            delete newData.unit_targeted_id;
        if (!newData.account_targeted_id)
            delete newData.account_targeted_id;
        if (!newData.account_number)
            delete newData.account_number;
        if (!newData.amount_disputed)
            delete newData.amount_disputed;
        if (!newData.amount_currency_slug)
            delete newData.amount_currency_slug;

        if (!newData.claimer_id)
            delete newData.claimer_id;
        if (props.plan !== "HUB")
            delete newData.relationship_id;
        if (verifyTokenExpire()) {
            axios.post(endPoint.store, formatFormData(newData))
                .then(async (response) => {
                    setDisabledInput(false);
                    ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    await resetAllData();
                    document.getElementById("customFile").value = "";
                    if (response.data.errors)
                        setCompletionError({ref: response.data.claim.reference, list: response.data.errors});
                })
                .catch(async (error) => {
                    if (completionError.length)
                        if (completionError.length)
                            setCompletionError({ref: "", list: []});
                    if (error.response.data.code === 409) {
                        //Existing entity claimer
                        setFoundData(error.response.data.error);
                        setStartRequest(false);
                        await setError(defaultError);
                        await document.getElementById("confirmSaveForm").click();
                    } else {
                        setStartRequest(false);
                        let fileErrors = [];
                        let i = 0;
                        for (const key in error.response.data.error) {
                            if (key === `file.${i}`) {
                                fileErrors = [...fileErrors, ...error.response.data.error[`file.${i}`]];
                                i++;
                            }
                        }
                        setError({...defaultError, ...error.response.data.error, file: fileErrors, claim_category: claimCategory === null ? ["Le champ claim_category est obligatoire."] : []});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig());
                    }
                })
            ;
        }
    };

    return (
        load || !ready ? (
            <Loader/>
        ) : (
            verifyPermission(props.userPermissions, 'store-claim-against-any-institution') || verifyPermission(props.userPermissions, "store-claim-against-my-institution") || verifyPermission(props.userPermissions, "store-claim-without-client") ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Processus")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                        className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()}
                                       className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                        {t("Collecte")}
                                    </a>
                                    <span className="kt-subheader__separator kt-hidden"/>
                                    <div className="kt-subheader__breadcrumbs">
                                        <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                            className="flaticon2-shelter"/></a>
                                        <span className="kt-subheader__breadcrumbs-separator"/>
                                        <a href="#button" onClick={e => e.preventDefault()}
                                           className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                            {t("Enregistrement de réclamation")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <InfirmationTable
                            information={componentData ? componentData.params.fr.info_page.value : ""}
                        />
                        <div className="row">
                            <div className="col">
                                <div className="kt-portlet">
                                    <div className="kt-portlet__head">
                                        <div className="kt-portlet__head-label">
                                            <h3 className="kt-portlet__head-title">
                                                {componentData ? componentData.params.fr.title.value : ""}
                                            </h3>
                                        </div>

                                        <div className="kt-portlet__head-toolbar">
                                            <div className="kt-portlet__head-wrapper">&nbsp;
                                                <div className="dropdown dropdown-inline">
                                                    <InfoFormatExcel/>
                                                    <a href={`${appConfig.apiDomaine}/download-excel/claims`}
                                                       download={true}
                                                       className="btn mr-1 btn-secondary">  {componentData ? componentData.params.fr.telecharger.value : ""}
                                                    </a>
                                                    <NavLink to={"/process/claims/import"}
                                                             className="btn ml-1 btn-primary"> {componentData ? componentData.params.fr.importer.value : ""}
                                                    </NavLink>

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="kt-form">
                                        <div className="kt-portlet__body">

                                            {
                                                verifyPermission(props.userPermissions, 'store-claim-against-any-institution') || verifyPermission(props.userPermissions, 'store-claim-without-client') ? (
                                                    <div
                                                        className={error.institution_targeted_id.length ? "form-group row validated" : "form-group row"}>
                                                        <label className="col-xl-3 col-lg-3 col-form-label"
                                                               htmlFor="institution">
                                                            {componentData ? componentData.params.fr.institution.value : ""}
                                                            <InputRequire/></label>
                                                        <div className="col-lg-9 col-xl-6">
                                                            <Select
                                                                isClearable
                                                                value={institution}
                                                                placeholder={componentData ? componentData.params.fr.institution_placeholder.value : ""}
                                                                onChange={onChangeInstitution}
                                                                options={institutions}
                                                            />
                                                            {
                                                                error.institution_targeted_id.length ? (
                                                                    error.institution_targeted_id.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>
                                                    </div>
                                                ) : null
                                            }

                                            <div className="kt-section">
                                                <div className="kt-section__body">
                                                    <h3 className="kt-section__title kt-section__title-lg"> {componentData ? componentData.params.fr.info_cible.value : ""}</h3>

                                                    {
                                                        !verifyPermission(props.userPermissions, 'store-claim-without-client') ? (
                                                            <div className="form-group row">
                                                                <div className={"col d-flex align-items-center mt-4"}>
                                                                    <label className="kt-checkbox">

                                                                        <input id="is_client" type="checkbox"
                                                                               value={disabledInput}
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
                                                                                            <button className="btn btn-outline-dark" onClick={e => onClickTag("full_name", t("Nom/Prénom"), "dark")}>{t("Nom/Prénom")}</button>&nbsp;
                                                                                            <button className="btn btn-outline-dark" onClick={e => onClickTag("telephone", t("Numéro de téléphone"), "dark")}>{t("Numéro de téléphone")}</button>&nbsp;
                                                                                            <button className="btn btn-outline-dark" onClick={e => onClickTag("account_number", t("Numéro de compte"), "dark")}>{t("Numéro de compte")}</button>
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
                                                                                                        <button className="btn btn-outline-primary" onClick={e => onClickTag("full_name", t("Nom/Prénom"), "primary")}>{t("Nom/Prénom")}</button>&nbsp;
                                                                                                        <button className="btn btn-outline-primary" onClick={e => onClickTag("telephone", t("Numéro de téléphone"), "primary")}>{t("Numéro de téléphone")}</button>&nbsp;
                                                                                                        <button className="btn btn-outline-primary" onClick={e => onClickTag("account_number", t("Numéro de compte"), "primary")}>{t("Numéro de compte")}</button>
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
                                                        ) : null
                                                    }

                                                    <div className="form-group row">
                                                        <div
                                                            className={error.lastname.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="lastname">{componentData ? componentData.params.fr.nom.value : ""}
                                                                <InputRequire/></label>
                                                            <input
                                                                disabled={disabledInput}
                                                                id="lastname"
                                                                type="text"
                                                                className={error.lastname.length ? "form-control is-invalid" : "form-control"}
                                                                placeholder={componentData ? componentData.params.fr.nom_placeholder.value : ""}
                                                                value={data.lastname}
                                                                onChange={(e) => onChangeLastName(e)}
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

                                                        <div
                                                            className={error.firstname.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="firstname">{componentData ? componentData.params.fr.prenoms.value : ""}
                                                                <InputRequire/></label>
                                                            <input
                                                                disabled={disabledInput}
                                                                id="firstname"
                                                                type="text"
                                                                className={error.firstname.length ? "form-control is-invalid" : "form-control"}
                                                                placeholder={componentData ? componentData.params.fr.prenoms_placeholder.value : ""}
                                                                value={data.firstname}
                                                                onChange={(e) => onChangeFirstName(e)}
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
                                                        <div
                                                            className={error.sexe.length ? "form-group col validated" : "form-group col"}>
                                                            <label
                                                                htmlFor="sexe">{componentData ? componentData.params.fr.sexe.value : ""}
                                                                <InputRequire/></label>
                                                            <select
                                                                disabled={disabledInput}
                                                                id="sexe"
                                                                className={error.sexe.length ? "form-control is-invalid" : "form-control"}
                                                                value={data.sexe}
                                                                onChange={(e) => onChangeSexe(e)}
                                                            >
                                                                <option value=""
                                                                        disabled={true}>{componentData ? componentData.params.fr.sexe_placeholder.value : ""}</option>

                                                                <option value="F">{t("Féminin")}</option>
                                                                <option value="M">{t("Masculin")}</option>
                                                                <option value="A">{t("Autres")}</option>
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
                                                            <label
                                                                htmlFor="ville">{componentData ? componentData.params.fr.ville.value : ""}</label>
                                                            <input
                                                                disabled={disabledInput}
                                                                id="ville"
                                                                type="text"
                                                                className={error.ville.length ? "form-control is-invalid" : "form-control"}
                                                                placeholder={componentData ? componentData.params.fr.ville_placeholder.value : ""}
                                                                value={data.ville ? data.ville : ""}
                                                                onChange={(e) => onChangeVille(e)}
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
                                                        <div
                                                            className={error.telephone.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="telephone">{componentData ? componentData.params.fr.telephone.value : ""}<WithoutCode/>
                                                                <InputRequire/></label>
                                                            <TagsInput disabled={disabledInputTel } value={data.telephone}
                                                                       onChange={onChangeTelephone} inputProps={{
                                                                className: 'react-tagsinput-input',
                                                                placeholder: componentData ? componentData.params.fr.telephone_placeholder.value : ""
                                                            }}/>
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
                                                            <label
                                                                htmlFor="email"> {componentData ? componentData.params.fr.email.value : ""} {responseChannel && responseChannel.value === "email" ?
                                                                <InputRequire/> : null}</label>
                                                            <TagsInput disabled={disabledInputEmail} value={data.email}
                                                                       onChange={onChangeEmail} inputProps={{
                                                                className: 'react-tagsinput-input',
                                                                placeholder: componentData ? componentData.params.fr.email_placeholder.value : ""
                                                            }}/>
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

                                            <div
                                                className="kt-separator kt-separator--border-dashed kt-separator--space-lg"/>

                                            <div className="kt-section">
                                                <div className="kt-section__body">
                                                    <h3 className="kt-section__title kt-section__title-lg"> {componentData ? componentData.params.fr.info_reclamation.value : ""}</h3>
                                                    {
                                                        !verifyPermission(props.userPermissions, 'store-claim-without-client') ? (
                                                            <div className="form-group row">
                                                                <div
                                                                    className={error.unit_targeted_id.length ? "col validated" : "col"}>
                                                                    <label
                                                                        htmlFor="unit">{componentData ? componentData.params.fr.unite.value : ""}</label>
                                                                    <Select
                                                                        value={unit}
                                                                        isClearable
                                                                        placeholder={componentData ? componentData.params.fr.unite_placeholder.value : ""}
                                                                        onChange={onChangeUnit}
                                                                        options={units}
                                                                    />
                                                                    {
                                                                        error.unit_targeted_id.length ? (
                                                                            error.unit_targeted_id.map((error, index) => (
                                                                                <div key={index}
                                                                                     className="invalid-feedback">
                                                                                    {error}
                                                                                </div>
                                                                            ))
                                                                        ) : null
                                                                    }
                                                                </div>

                                                                <div
                                                                    className={(error.account_targeted_id.length || error.account_number.length) ? "col validated" : "col"}>
                                                                    <label
                                                                        htmlFor="account">{componentData ? componentData.params.fr.compte.value : ""}</label>
                                                                    {
                                                                        accounts.length ? (
                                                                            <Select
                                                                                isClearable
                                                                                value={account}
                                                                                placeholder={componentData ? componentData.params.fr.compte_placeholder.value : ""}
                                                                                onChange={onChangeAccount}
                                                                                options={accounts}
                                                                            />
                                                                            ) : (
                                                                                <input
                                                                                    id="account"
                                                                                    type="text"
                                                                                    className={error.account_number.length ? "form-control is-invalid" : "form-control"}
                                                                                    placeholder={"Veuillez entrer le numéro de compte"}
                                                                                    value={data.account_number ? data.account_number : ""}
                                                                                    onChange={(e) => onChangeAccountNumber(e)}
                                                                                />
                                                                            )
                                                                    }
                                                                    {
                                                                        error.account_targeted_id.length ? (
                                                                            error.account_targeted_id.map((error, index) => (
                                                                                <div key={index}
                                                                                     className="invalid-feedback">
                                                                                    {error}
                                                                                </div>
                                                                            ))
                                                                        ) : null
                                                                    }
                                                                    {
                                                                        error.account_number.length ? (
                                                                            error.account_number.map((error, index) => (
                                                                                <div key={index}
                                                                                     className="invalid-feedback">
                                                                                    {error}
                                                                                </div>
                                                                            ))
                                                                        ) : null
                                                                    }
                                                                </div>
                                                            </div>
                                                        ) : null
                                                    }

                                                    <div className="form-group row">
                                                        <div
                                                            className={error.request_channel_slug.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="receptionChannel">{componentData ? componentData.params.fr.canal_reception.value : ""}
                                                                <InputRequire/></label>
                                                            <Select
                                                                isClearable
                                                                value={receptionChannel}
                                                                placeholder={componentData ? componentData.params.fr.canal_reception_placeholder.value : ""}
                                                                onChange={onChangeReceptionChannel}
                                                                options={channels}
                                                            />
                                                            {
                                                                error.request_channel_slug.length ? (
                                                                    error.request_channel_slug.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>

                                                        <div
                                                            className={error.response_channel_slug.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="responseChannel">{componentData ? componentData.params.fr.canal_reponse.value : ""}
                                                                <InputRequire/></label>
                                                            <Select
                                                                isClearable
                                                                placeholder={componentData ? componentData.params.fr.canal_reponse_placeholder.value : ""}
                                                                value={responseChannel}
                                                                onChange={onChangeResponseChannel}
                                                                options={responseChannels}
                                                            />
                                                            {
                                                                error.response_channel_slug.length ? (
                                                                    error.response_channel_slug.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <div className={error.claim_category.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="claimCtegory">{componentData ? componentData.params.fr.categorie.value : ""}
                                                                <InputRequire/></label>
                                                            <Select
                                                                isClearable
                                                                placeholder={componentData ? componentData.params.fr.categorie_placeholder.value : ""}
                                                                value={claimCategory}
                                                                onChange={onChangeClaimCategory}
                                                                options={claimCategories}
                                                            />
                                                            {
                                                                error.claim_category.length ? (
                                                                    error.claim_category.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>

                                                        <div
                                                            className={error.claim_object_id.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="claimObject">{componentData ? componentData.params.fr.object.value : ""}
                                                                <InputRequire/></label>
                                                            <Select
                                                                isClearable
                                                                placeholder={componentData ? componentData.params.fr.object_placeholder.value : ""}
                                                                value={claimObject}
                                                                onChange={onChangeClaimObject}
                                                                options={claimObjects}
                                                            />
                                                            {
                                                                error.claim_object_id.length ? (
                                                                    error.claim_object_id.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>

                                                        <div
                                                            className={error.lieu.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="lieu">{componentData ? componentData.params.fr.lieu.value : ""}</label>
                                                            <input
                                                                type={"text"}
                                                                id="lieu"
                                                                className={error.lieu.length ? "form-control is-invalid" : "form-control"}
                                                                placeholder={componentData ? componentData.params.fr.lieu_placeholder.value : ""}
                                                                value={data.lieu}
                                                                onChange={(e) => onChangeLieu(e)}
                                                            />
                                                            {
                                                                error.lieu.length ? (
                                                                    error.lieu.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <div
                                                            className={error.amount_disputed.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="amount_claim">{componentData ? componentData.params.fr.montant.value : ""} (<strong
                                                                className="text-danger">Laisser vide si pas de
                                                                montant</strong>)</label>
                                                            <input
                                                                type={"number"}
                                                                id="amount_claim"
                                                                min="0"
                                                                className={error.amount_disputed.length ? "form-control is-invalid" : "form-control"}
                                                                placeholder={componentData ? componentData.params.fr.montant_placeholder.value : ""}
                                                                value={data.amount_disputed}
                                                                onChange={(e) => onChangeAmountDisputed(e)}
                                                            />
                                                            {
                                                                error.amount_disputed.length ? (
                                                                    error.amount_disputed.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>

                                                        <div
                                                            className={error.amount_currency_slug.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="currency">{componentData ? componentData.params.fr.devise.value : ""}</label>
                                                            <Select
                                                                isClearable
                                                                placeholder={componentData ? componentData.params.fr.devise_placeholder.value : ""}
                                                                value={currency}
                                                                onChange={onChangeAmountCurrency}
                                                                options={currencies}
                                                            />
                                                            {
                                                                error.amount_currency_slug.length ? (
                                                                    error.amount_currency_slug.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <div
                                                            className={error.event_occured_at.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="date">{componentData ? componentData.params.fr.date.value : ""}
                                                                <InputRequire/></label>
                                                            <input
                                                                type={"datetime-local"}
                                                                id="date"
                                                                className={error.event_occured_at.length ? "form-control is-invalid" : "form-control"}
                                                                placeholder={componentData ? componentData.params.fr.date_placeholder.value : ""}
                                                                value={data.event_occured_at}
                                                                max={maxDate}
                                                                onChange={(e) => handleEventOccuredAt(e)}
                                                            />
                                                            {
                                                                error.event_occured_at.length ? (
                                                                    error.event_occured_at.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>

                                                        {
                                                            verifyPermission(props.userPermissions, "store-claim-without-client") ? (
                                                                <div
                                                                    className={error.relationship_id.length ? "col validated" : "col"}>
                                                                    <label

                                                                        htmlFor="relationship">{componentData ? componentData.params.fr.relation.value : ""} {t("avec l'institution")}
                                                                        <InputRequire/></label>
                                                                    <Select
                                                                        isClearable
                                                                        value={relationship}
                                                                        placeholder={componentData ? componentData.params.fr.relation_placeholder.value : ""}
                                                                        onChange={onChangeRelationShip}
                                                                        options={relationships}
                                                                    />
                                                                    {
                                                                        error.relationship_id.length ? (
                                                                            error.relationship_id.map((error, index) => (
                                                                                <div key={index}
                                                                                     className="invalid-feedback">
                                                                                    {error}
                                                                                </div>
                                                                            ))
                                                                        ) : null
                                                                    }
                                                                </div>
                                                            ) : null
                                                        }

                                                        <div className="col">
                                                            <label
                                                                htmlFor="file">{componentData ? componentData.params.fr.piece.value : ""}</label>
                                                            <input
                                                                onChange={onChangeFile}
                                                                type="file"
                                                                className={error.file.length ? "form-control is-invalid" : "form-control"}
                                                                id="customFile"
                                                                multiple={true}
                                                            />
                                                            {
                                                                error.file.length ? (
                                                                    error.file.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="form-group row">
                                                        <div
                                                            className={error.description.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="description">{componentData ? componentData.params.fr.description.value : ""}
                                                                <InputRequire/></label>
                                                            <textarea
                                                                rows="7"
                                                                id="description"
                                                                className={error.description.length ? "form-control is-invalid" : "form-control"}
                                                                placeholder={componentData ? componentData.params.fr.description_placeholder.value : ""}
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

                                                        <div
                                                            className={error.claimer_expectation.length ? "col validated" : "col"}>
                                                            <label
                                                                htmlFor="claimer_expectation">{componentData ? componentData.params.fr.attente.value : ""}</label>
                                                            <textarea
                                                                rows="7"
                                                                id="claimer_expectation"
                                                                className={error.claimer_expectation.length ? "form-control is-invalid" : "form-control"}
                                                                placeholder={componentData ? componentData.params.fr.attente_placeholder.value : ""}
                                                                value={data.claimer_expectation}
                                                                onChange={(e) => onChangeClaimerExpectation(e)}
                                                            />
                                                            {
                                                                error.claimer_expectation.length ? (
                                                                    error.claimer_expectation.map((error, index) => (
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

                                            <div
                                                className="kt-separator kt-separator--border-dashed kt-separator--space-lg"/>

                                            <div className="kt-section">
                                                <div className="kt-section__body">
                                                    <h3 className="kt-section__title kt-section__title-lg">{componentData ? componentData.params.fr.last_titre.value : ""}
                                                        <InputRequire/></h3>

                                                    <div className="form-group row">
                                                        <label
                                                            className="col-3 col-form-label">{componentData ? componentData.params.fr.question.value : ""}</label>
                                                        <div className="col-9">
                                                            <div className="kt-radio-inline">
                                                                <label className="kt-radio">
                                                                    <input type="radio" value={option1}
                                                                           onChange={handleOptionChange}
                                                                           checked={option1 == data.is_revival}/> {componentData ? componentData.params.fr.reponse_oui.value : ""}<span/>
                                                                </label>
                                                                <label className="kt-radio">
                                                                    <input type="radio" value={option2}
                                                                           onChange={handleOptionChange}
                                                                           checked={option2 == data.is_revival}/> {componentData ? componentData.params.fr.reponse_non.value : ""}<span/>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {completionError.list.length ? (
                                                <div className="kt-section">
                                                    <div className="kt-section__body">
                                                        <div className="form-group row">
                                                            <div className="col-12">
                                                                <div className="alert alert-warning fade show"
                                                                     role="alert">
                                                                    <div className="alert-icon"><i
                                                                        className="flaticon-warning"/></div>
                                                                    <div className="alert-text">
                                                                        <p>{t("La réclamation a été enregistrée avec succès sous la référence")}
                                                                            <strong>{completionError.ref}</strong>
                                                                        </p>
                                                                        <p>{t("Cependant elle est incomplète")}</p>
                                                                        <p>{t("Les informations qu'il reste à fournir sont les suivantes")} :</p>
                                                                        <ul className="ml-4">
                                                                            {completionError.list.map((el, index) => (
                                                                                <li key={index}>- {el.description["fr"]}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="alert-close">
                                                                        <button type="button" className="close"
                                                                                data-dismiss="alert" aria-label="Close">
                                                                        <span aria-hidden="true"><i
                                                                            className="la la-close"/></span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="kt-portlet__foot">
                                            <div className="kt-form__actions">
                                                {
                                                    !startRequest ? (
                                                        <button type="submit" onClick={(e) => onSubmit(e)}
                                                                className="btn btn-primary">{t("Enregistrer")}</button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                            type="button" disabled>
                                                            {t("Chargement")}...
                                                        </button>
                                                    )
                                                }
                                                <button style={{display: "none"}} id="confirmSaveForm" type="button"
                                                        className="btn btn-bold btn-label-brand btn-sm"
                                                        data-toggle="modal"
                                                        data-target="#kt_modal_4_2">
                                                    Launch Modal
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        foundData.entity ? (
                                            <ConfirmClaimAddModal
                                                componentData={componentData ? componentData : undefined}
                                                message={foundData.message ? foundData.message : ""}
                                                id={foundData.entity.id}
                                                firstname={foundData.entity.firstname ? foundData.entity.firstname : ""}
                                                lastname={foundData.entity.lastname ? foundData.entity.lastname : ""}
                                                sexe={foundData.entity.sexe ? foundData.entity.sexe : ""}
                                                telephone={foundData.entity.telephone ? foundData.entity.telephone : []}
                                                email={foundData.entity.email ? foundData.entity.email : []}
                                                ville={foundData.entity.ville ? foundData.entity.ville : ""}
                                                lieu={data.lieu ? data.lieu : ""}
                                                unit_targeted_id={data.unit_targeted_id ? data.unit_targeted_id : ""}
                                                institution_targeted_id={data.institution_targeted_id ? data.institution_targeted_id : ""}
                                                account_targeted_id={data.account_targeted_id ? data.account_targeted_id : ""}
                                                account_number={data.account_number ? data.account_number : ""}
                                                claim_object_id={data.claim_object_id ? data.claim_object_id : ""}
                                                request_channel_slug={data.request_channel_slug ? data.request_channel_slug : ""}
                                                response_channel_slug={data.response_channel_slug ? data.response_channel_slug : ""}
                                                claimer_expectation={data.claimer_expectation ? data.claimer_expectation : ""}
                                                description={data.description ? data.description : ""}
                                                amount_currency_slug={data.amount_currency_slug ? data.amount_currency_slug : ""}
                                                amount_disputed={data.amount_disputed ? data.amount_disputed : ""}
                                                claimer_id={data.claimer_id ? data.claimer_id : ""}
                                                relationship_id={data.relationship_id ? data.relationship_id : ""}
                                                event_occured_at={data.event_occured_at ? data.event_occured_at : ""}
                                                is_revival={data.is_revival ? data.is_revival : 0}
                                                file={data.file ? data.file : []}
                                                resetFoundData={resetFountData}
                                                claimObject={claimObject ? claimObject : null}
                                                claimObjects={claimObjects ? claimObjects : []}
                                                claimCategory={claimCategory ? claimCategory : null}
                                                claimCategories={claimCategories ? claimCategories : []}
                                                accounts={accounts ? accounts : []}
                                                account={account ? account : null}
                                                units={units ? units : []}
                                                unit={unit ? unit : null}
                                                relationships={relationships ? relationships : []}
                                                relationship={relationship ? relationship : null}
                                                responseChannels={responseChannels ? responseChannels : []}
                                                channels={channels ? channels : []}
                                                responseChannel={responseChannel ? responseChannel : null}
                                                receptionChannel={receptionChannel ? receptionChannel : null}
                                                closeModal={closeModal}
                                                currency={currency ? currency : null}
                                                currencies={currencies ? currencies : []}
                                                institution={institution ? institution : null}
                                                institutions={institutions ? institutions : []}
                                                endPoint={endPoint}
                                                fileValue={document.getElementById("customFile").value}
                                            />
                                        ) : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null
        )
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        plan: state.plan.plan,
        currentUserInstitution: state.user.user.staff.institution_id,
    };
};

export default connect(mapStateToProps)(ClaimAdd);
