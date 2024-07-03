import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {
    Link,
    useParams
} from "react-router-dom";
import TagsInput from "react-tagsinput";
import Select from "react-select";
import appConfig from "../../config/appConfig";
import {
    debug,
    filterChannel,
    formatSelectOption,
    formatToTime,
    formatToTimeStampUpdate
} from "../../helpers/function";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import {RESPONSE_CHANNEL} from "../../constants/channel";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastAddErrorMessageConfig,
    toastEditErrorMessageConfig, toastErrorMessageWithParameterConfig, toastSuccessMessageWithParameterConfig,
} from "../../config/toastConfig";
import InputRequire from "./InputRequire";
import InfirmationTable from "./InfirmationTable";
import WithoutCode from "./WithoutCode";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import Loader from "./Loader";
import HtmlDescriptionModal from "./DescriptionDetail/HtmlDescriptionModal";
import HtmlDescription from "./DescriptionDetail/HtmlDescription";
import {useTranslation} from "react-i18next";


const endPointConfig = {
    PRO: {
        plan: "PRO",
        edit: id => `${appConfig.apiDomaine}/my/claims-incompletes/${id}/edit`,
        update: id => `${appConfig.apiDomaine}/my/claims-incompletes/${id}`,
    },
    MACRO: {
        holding: {
            edit: id => `${appConfig.apiDomaine}/any/claims-incompletes/${id}/edit`,
            update: id => `${appConfig.apiDomaine}/any/claims-incompletes/${id}`,
        },
        filial: {
            edit: id => `${appConfig.apiDomaine}/my/claims-incompletes/${id}/edit`,
            update: id => `${appConfig.apiDomaine}/my/claims-incompletes/${id}`,
        }
    },
    HUB: {
        plan: "HUB",
        edit: id => `${appConfig.apiDomaine}/without-client/claims-incompletes/${id}/edit`,
        update: id => `${appConfig.apiDomaine}/without-client/claims-incompletes/${id}`,
    }
};

const IncompleteClaimsEdit = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    document.title = (ready ? t("Satis client - Complétion plaintes incomplètes") : "");
    const {id} = useParams();
    if (!(verifyPermission(props.userPermissions, 'update-claim-incomplete-against-any-institution') ||
        verifyPermission(props.userPermissions, "update-claim-incomplete-against-my-institution") ||
        verifyPermission(props.userPermissions, "update-claim-incomplete-without-client")))
        window.location.href = ERROR_401;

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'update-claim-incomplete-against-any-institution'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'update-claim-incomplete-against-my-institution'))
            endPoint = endPointConfig[props.plan].filial
    } else
        endPoint = endPointConfig[props.plan];

    const defaultData = {
        firstname: null,
        lastname: null,
        sexe: null,
        telephone: [],
        email: [],
        ville: null,
        unit_targeted_id: null,
        institution_targeted_id: null,
        account_targeted_id: null,
        account_number: null,
        claim_object_id: null,
        request_channel_slug: null,
        response_channel_slug: null,
        claimer_expectation: null,
        description: null,
        amount_currency_slug: null,
        amount_disputed: null,
        claimer_id: null,
        relationship_id: null,
        event_occured_at: null,
        is_revival: 0,
        file: [],
        lieu: null
    };
    const defaultError = {
        firstname: [],
        lastname: [],
        sexe: [],
        telephone: [],
        email: [],
        ville: [],
        unit_targeted_id: [],
        institution_targeted_id: [],
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
        relationship_id: [],
        event_occured_at: [],
        is_revival: [],
        file: [],
        lieu: []
    };

    const option1 = 1;
    const option2 = 0;

    const [load, setLoad] = useState(true);
    const [claimObject, setClaimObject] = useState(null);
    const [claimObjects, setClaimObjects] = useState([]);
    const [claimCategory, setClaimCategory] = useState(null);
    const [claimCategories, setClaimCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [account, setAccount] = useState(null);
    const [units, setUnits] = useState([]);
    const [unit, setUnit] = useState(null);
    const [responseChannels, setResponseChannels] = useState([]);
    const [channels, setChannels] = useState([]);
    const [relationships, setRelationships] = useState([]);
    const [relationship, setRelationship] = useState(null);
    const [responseChannel, setResponseChannel] = useState(null);
    const [receptionChannel, setReceptionChannel] = useState(null);
    const [currency, setCurrency] = useState(null);
    const [currencies, setCurrencies] = useState([]);
    const [disabledInput, setDisabledInput] = useState(false);
    const [institution, setInstitution] = useState(null);
    const [institutions, setInstitutions] = useState([]);
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [isRequire, setIsRequire] = useState(null);
    const [componentData, setComponentData] = useState(undefined);
    const [currentMessage, setCurrentMessage] = useState("");
    const [oldFiles, setOldFiles] = useState([]);


    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1);
    const maxDate = (currentDate.toISOString()).substr(0, (currentDate.toISOString()).length - 1);

    useEffect(() => {
        async function fetchData() {
            await axios.get(endPoint.edit(`${id}`))
                .then(response => {
                    // console.log(response.data, "DATA")
                    const newIncompleteClaim = {
                        claimer_id: response.data.claim.claimer_id,
                        firstname: response.data.claim.claimer !== null && response.data.claim.claimer.firstname !== null ? response.data.claim.claimer.firstname : "",
                        lastname: response.data.claim.claimer !== null && response.data.claim.claimer.lastname !== null ? response.data.claim.claimer.lastname : "" ,
                        sexe: response.data.claim.claimer !== null && response.data.claim.claimer.sexe !== null ? response.data.claim.claimer.sexe : "",
                        telephone: response.data.claim.claimer !== null && response.data.claim.claimer.telephone !== null ? response.data.claim.claimer.telephone : [],
                        email: response.data.claim.claimer === null || response.data.claim.claimer.email === null ? [] : response.data.claim.claimer.email,
                        ville: response.data.claim.claimer === null || response.data.claim.claimer.ville === null ? "" : response.data.claim.claimer.ville,
                        unit_targeted_id: response.data.claim.unit_targeted_id,
                        relationship_id: response.data.claim.relationship_id,
                        account_targeted_id: response.data.claim.account_targeted_id,
                        account_number: response.data.claim.account_number,
                        institution_targeted_id: response.data.claim.institution_targeted_id,
                        claim_object_id: response.data.claim.claim_object_id,
                        request_channel_slug: response.data.claim.request_channel_slug,
                        response_channel_slug: response.data.claim.response_channel_slug,
                        claimer_expectation: response.data.claim.claimer_expectation === null ? "" : response.data.claim.claimer_expectation,
                        description: response.data.claim.description,
                        lieu: response.data.claim.lieu !== null ? response.data.claim.lieu : null,
                        amount_currency_slug: response.data.claim.amount_currency_slug ? response.data.claim.amount_currency_slug : "",
                        amount_disputed: response.data.claim.amount_disputed ? response.data.claim.amount_disputed : "",
                        event_occured_at: formatToTime(response.data.claim.event_occured_at),
                        is_revival: response.data.claim.is_revival == 1 ? 1 : 0,
                        //file: response.data.claim.files ? response.data.claim.files.map(file => file.title) : []
                    };
                    setData(newIncompleteClaim);
                    setIsRequire(response.data.requirements);
                    setOldFiles(response.data.claim.files);
                    if (verifyPermission(props.userPermissions, "update-claim-incomplete-without-client"))
                        setRelationships(formatSelectOption(response.data.relationships, "name", "fr"));
                    setAccounts(response.data.accounts ? formatSelectOption(response.data.accounts, "account_number", false) : "");

                    if (verifyPermission(props.userPermissions, "update-claim-incomplete-against-any-institution") ||
                        verifyPermission(props.userPermissions, "update-claim-incomplete-without-client"))
                        setInstitutions(formatSelectOption(response.data.institutions, "name", false));
                    if (verifyPermission(props.userPermissions, "store-claim-against-my-institution")) {
                        setUnits(formatSelectOption(response.data.units, "name", "fr"))
                    }
                    setClaimCategories(formatSelectOption(response.data.claimCategories, "name", "fr"));
                    setCurrencies(formatSelectOption(response.data.currencies, "name", "fr", "slug"));
                    setChannels(formatSelectOption(response.data.channels, "name", "fr", "slug"));
                    setResponseChannels(formatSelectOption(filterChannel(response.data.channels, RESPONSE_CHANNEL), "name", "fr", "slug"))

                    if (response.data.claim.request_channel !== null) {
                        setReceptionChannel({
                            value: response.data.claim.request_channel.id,
                            label: response.data.claim.request_channel.name.fr
                        });
                    }
                    if (response.data.claim.response_channel !== null) {
                        setResponseChannel({
                            value: response.data.claim.response_channel.id,
                            label: response.data.claim.response_channel.name.fr
                        });
                    }
                    if (response.data.claim.claim_object !== null) {
                        setClaimObject({
                            value: response.data.claim.claim_object.id,
                            label: response.data.claim.claim_object.name.fr
                        });
                    }
                    if (response.data.claim.claim_object && response.data.claim.claim_object.claim_category !== null) {
                        setClaimCategory({
                            value: response.data.claim.claim_object.claim_category.id,
                            label: response.data.claim.claim_object.claim_category.name.fr
                        });
                    }
                    if (response.data.claim.institution_targeted !== null) {
                        setInstitution({
                            value: response.data.claim.institution_targeted.id,
                            label: response.data.claim.institution_targeted.name
                        });
                    }
                    if (response.data.claim.relationship !== null) {
                        setRelationship({
                            value: response.data.claim.relationship.id,
                            label: response.data.claim.relationship.name.fr
                        });
                    }
                    if (response.data.claim.amount_currency !== null) {
                        setCurrency({
                            value: response.data.claim.amount_currency.id,
                            label: response.data.claim.amount_currency.name.fr
                        });
                    }
                    if (response.data.claim.account_targeted !== null) {
                        setAccount({
                            value: response.data.claim.account_targeted.id,
                            label: response.data.claim.account_targeted.account_number
                        });
                    }
                    if (response.data.claim.unit_targeted !== null) {
                        setUnit({
                            value: response.data.claim.unit_targeted.id,
                            label: response.data.claim.unit_targeted.name.fr
                        });
                    }
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
    }, [endPoint, props.userPermissions, id]);

    const showModal = (message) => {
        setCurrentMessage(message);
        document.getElementById("button_modal").click();
    };

    const onChangeRelationShip = selected => {
        const newData = {...data};
        if (selected) {
            setRelationship(selected);
            newData.relationship_id = selected.value;
        } else {
            setRelationship(null);
            newData.relationship_id = "";
        }
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
    const onChangeLieu = (e) => {
        const newData = {...data};
        newData.lieu = e.target.value;
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

    const onChangeUnit = selected => {
        setUnit(selected);
        const newData = {...data};
        if (selected.value !== "other")
            newData.unit_targeted_id = selected.value;
        else
            newData.unit_targeted_id = "";
        setData(newData);
    };

    const onChangeAccount = selected => {
        setAccount(selected);
        const newData = {...data};
        newData.account_targeted_id = selected.value;
        setData(newData);
    };

    const onChangeAccountNumber = (e) => {
        const newData = {...data};
        newData.account_number = e.target.value;
        setData(newData);
    }

    const onChangeClaimObject = selected => {
        setClaimObject(selected);
        const newData = {...data};
        newData.claim_object_id = selected.value;
        setData(newData);
    };

    const onChangeReceptionChannel = selected => {
        setReceptionChannel(selected);
        const newData = {...data};
        newData.request_channel_slug = selected.value;
        setData(newData);
    };

    const onChangeResponseChannel = selected => {
        setResponseChannel(selected);
        const newData = {...data};
        newData.response_channel_slug = selected.value;
        setData(newData);
    };

    const onChangeClaimCategory = selected => {
        setClaimCategory(selected);
        if (verifyTokenExpire()) {
            axios.get(`${appConfig.apiDomaine}/claim-categories/${selected.value}/claim-objects`)
                .then(response => {
                    setClaimObject({});
                    setClaimObjects(formatSelectOption(response.data.claimObjects, "name", "fr"));
                })
                .catch(error => {
                    console.log("Something is wrong")
                }
                )
            ;
        }
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

    const onChangeEventOccuredAt = e => {
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

    const onChangeFile = (e) => {
        const newData = {...data};
        newData.file = Object.values(e.target.files);
        setData(newData);
    };


    const formatFormData = (newData) => {
        const formData = new FormData();
        formData.append("_method", "put");
        for (const key in newData) {
            // console.log(`${key}:`, newData[key]);
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

    const onSubmit = (e) => {
        const newData = {...data};
        e.preventDefault();
        setStartRequest(true);
        newData.event_occured_at = formatToTimeStampUpdate(data.event_occured_at);

        // if (!newData.file.length)
        //     delete newData.file;
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
        if (!verifyPermission(props.userPermissions, "update-claim-incomplete-without-client"))
            delete newData.relationship_id;

        /*        debug(endPoint.update(`${id}`), "endpoint");
                for (var value of formatFormData(newData).values()) {
                    debug(value, "value");
                }*/
        if (verifyTokenExpire()) {
            axios.post(endPoint.update(`${id}`), formatFormData(newData))
                .then((response) => {
                    setStartRequest(false);
                    ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(t("Succès de la complétion")));
                    window.location.href = "/process/incomplete_claims"
                })
                .catch((error) => {
                        console.log(error.response.data.error)
                    if (error.response.data.code === 422) {
                        setStartRequest(false);
                        let fileErrors = [];
                        let i = 0;
                        for (const key in error.response.data.error) {
                            if (key === `file.${i}`) {
                                fileErrors = [...fileErrors, ...error.response.data.error[`file.${i}`]];
                                i++;
                            }
                        }
                        setError({...defaultError, ...error.response.data.error, file: fileErrors,  claim_category: claimCategory === null ? ["Le champ claim_category est obligatoire."] : []});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig(error.response.data.error));
                    } else {
                        setStartRequest(false);
                        // setError({...defaultError, ...error.response.data.error});
                        // ToastBottomEnd.fire(toastEditErrorMessageConfig);
                    }

                })
            ;
        }
    };

    return (
        ready ? (
            load ? (
                <Loader/>
            ) : (
                (verifyPermission(props.userPermissions, 'update-claim-incomplete-against-any-institution')
                    || verifyPermission(props.userPermissions, "update-claim-incomplete-against-my-institution") ||
                    verifyPermission(props.userPermissions, "update-claim-incomplete-without-client")) && isRequire ? (
                    <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
                         id="kt_content">
                        <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                            <div className="kt-container  kt-container--fluid ">
                                <div className="kt-subheader__main">
                                    <h3 className="kt-subheader__title">
                                        {t("Collecte")}
                                    </h3>
                                    <span className="kt-subheader__separator kt-hidden"/>
                                    <div className="kt-subheader__breadcrumbs">
                                        <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                            className="flaticon2-shelter"/></a>
                                        <span className="kt-subheader__breadcrumbs-separator"/>
                                        <a href="#button" onClick={e => e.preventDefault()}
                                           className="kt-subheader__breadcrumbs-link" style={{cursor: "default"}}>
                                            {t("Réclamations Incomplètes")}
                                        </a>
                                        <span className="kt-subheader__separator kt-hidden"/>
                                        <div className="kt-subheader__breadcrumbs">
                                            <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                                className="flaticon2-shelter"/></a>
                                            <span className="kt-subheader__breadcrumbs-separator"/>
                                            <a href="#button" onClick={e => e.preventDefault()}
                                               className="kt-subheader__breadcrumbs-link" style={{cursor: "default"}}>
                                                {t("Complétion")}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                            <InfirmationTable
                                information={"Formulaire d'enregistrement d'une réclamation. " + t("Utilisez ce formulaire pour completer les réclamations imcomplètes de vos clients")}
                            />
                            <div className="row">
                                <div className="col">
                                    <div className="kt-portlet">
                                        <div className="kt-portlet__head">
                                            <div className="kt-portlet__head-label">
                                                <h3 className="kt-portlet__head-title">
                                                    {t("Complétion de réclamation")}
                                                </h3>
                                            </div>
                                        </div>

                                        <form method="POST" className="kt-form">
                                            <div className="kt-portlet__body">
                                                {
                                                    verifyPermission(props.userPermissions, 'update-claim-incomplete-against-any-institution') ||
                                                    verifyPermission(props.userPermissions, "update-claim-incomplete-without-client") ? (
                                                        <div
                                                            className={error.institution_targeted_id.length ? "form-group row validated" : "form-group row"}>
                                                            <label className="col-xl-3 col-lg-3 col-form-label"
                                                                   htmlFor="institution">{componentData ? componentData.params.fr.institution.value : ""}
                                                                <InputRequire/></label>
                                                            <div className="col-lg-9 col-xl-6">
                                                                <Select
                                                                    classNamePrefix="select"
                                                                    className="basic-single"
                                                                    // isDisabled={!disabledInput}
                                                                    placeholder={componentData ? componentData.params.fr.institution_placeholder.value : ""}
                                                                    value={institution}
                                                                    options={institutions}
                                                                />
                                                                {
                                                                    error.institution_targeted_id.length ? (
                                                                        error.institution_targeted_id.map((error, index) => (
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
                                                {
                                                    verifyPermission(props.userPermissions, "update-claim-incomplete-against-any-institution") ||
                                                    verifyPermission(props.userPermissions, "update-claim-incomplete-against-my-institution") ? (
                                                        <div className="kt-section kt-section--first">
                                                            <div className="kt-section__body">
                                                                <h3 className="kt-section__title kt-section__title-lg">
                                                                    {componentData ? componentData.params.fr.info_cible.value + ":" : ""}</h3>

                                                                <div className="form-group row">
                                                                    <div
                                                                        className={error.lastname.length ? "col validated" : "col"}>
                                                                        <label
                                                                            htmlFor="lastname">{componentData ? componentData.params.fr.nom.value : ""}
                                                                            <InputRequire/></label>
                                                                        <input
                                                                            // disabled={!disabledInput}
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
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
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
                                                                            // disabled={!disabledInput}
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
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
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
                                                                            // disabled={!disabledInput}
                                                                            id="sexe"
                                                                            className={error.sexe.length ? "form-control is-invalid" : "form-control"}
                                                                            value={data.sexe}
                                                                            onChange={(e) => onChangeSexe(e)}
                                                                        >
                                                                            <option value=""
                                                                                    disabled={true}>{componentData ? componentData.params.fr.sexe_placeholder.value : ""}
                                                                            </option>
                                                                            <option value="F">{t("Féminin")}</option>
                                                                            <option value="M">{t("Masculin")}</option>
                                                                            <option value="A">{t("Autres")}</option>
                                                                        </select>
                                                                        {
                                                                            error.sexe.length ? (
                                                                                error.sexe.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className={error.ville.length ? "col validated" : "col"}>
                                                                        <label
                                                                            htmlFor="ville">{componentData ? componentData.params.fr.ville.value : ""} </label>
                                                                        <input
                                                                            // disabled={!disabledInput}
                                                                            id="ville"
                                                                            type="text"
                                                                            className={error.ville.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder={componentData ? componentData.params.fr.ville_placeholder.value : ""}
                                                                            value={data.ville}
                                                                            onChange={(e) => onChangeVille(e)}
                                                                        />
                                                                        {
                                                                            error.ville.length ? (
                                                                                error.ville.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
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
                                                                            htmlFor="telephone"> {componentData ? componentData.params.fr.telephone.value : ""}<WithoutCode/>
                                                                            <InputRequire/></label>
                                                                        <TagsInput
                                                                            // disabled={!disabledInput}
                                                                            value={data.telephone}
                                                                            onChange={onChangeTelephone}
                                                                            inputProps={{
                                                                                className: 'react-tagsinput-input',
                                                                                placeholder: componentData ? componentData.params.fr.telephone.value : ""
                                                                            }}
                                                                        />
                                                                        {
                                                                            error.telephone.length ? (
                                                                                error.telephone.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>

                                                                    <div
                                                                        className={error.email.length ? "col validated" : "col"}>
                                                                        <label
                                                                            htmlFor="email">{componentData ? componentData.params.fr.email.value : ""}
                                                                            <InputRequire/></label>
                                                                        <TagsInput
                                                                            // disabled={!disabledInput}
                                                                            value={data.email}
                                                                            onChange={onChangeEmail}
                                                                            inputProps={{
                                                                                className: 'react-tagsinput-input',
                                                                                placeholder: componentData ? componentData.params.fr.email_placeholder.value : ""
                                                                            }}/>
                                                                        {
                                                                            error.email.length ? (
                                                                                error.email.map((error, index) => (
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
                                                        </div>


                                                    ) : null
                                                }

                                                <div
                                                    className="kt-separator kt-separator--border-dashed kt-separator--space-lg"/>

                                            <div className="kt-section">
                                                <div className="kt-section__body">
                                                    <h3 className="kt-section__title kt-section__title-lg">{componentData ? componentData.params.fr.info_reclamation.value : ""}</h3>
                                                    {
                                                        !verifyPermission(props.userPermissions, "update-claim-incomplete-without-client") ?
                                                            (
                                                                <div className="form-group row">
                                                                    <div
                                                                        className={error.unit_targeted_id.length ? "col validated" : "col"}>
                                                                        <label
                                                                            htmlFor="unit">{componentData ? componentData.params.fr.unite.value : ""} {isRequire.unit_targeted_id ?
                                                                            <InputRequire/> : ""}</label>
                                                                        <Select
                                                                            classNamePrefix="select"
                                                                            className="basic-single"
                                                                            placeholder={componentData ? componentData.params.fr.unite_placeholder.value : ""}
                                                                            value={unit}
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
                                                                        className={error.account_targeted_id.length || error.account_number.length ? "col validated" : "col"}>
                                                                        <label
                                                                            htmlFor="account">{componentData ? componentData.params.fr.compte.value : ""} {isRequire.account_targeted_id ?
                                                                            <InputRequire/> : ""}</label>
                                                                        {
                                                                            accounts.length ? (
                                                                                <Select
                                                                                    classNamePrefix="select"
                                                                                    className="basic-single"
                                                                                    placeholder={componentData ? componentData.params.fr.compte_placeholder.value : ""}
                                                                                    value={account}
                                                                                    onChange={onChangeAccount}
                                                                                    options={accounts}
                                                                                />
                                                                            ) : (
                                                                                <input
                                                                                    id="account-incomplete"
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
                                                            )
                                                            : null
                                                    }

                                                        <div className="form-group row">
                                                            <div
                                                                className={error.request_channel_slug.length ? "col validated" : "col"}>
                                                                <label
                                                                    htmlFor="receptionChannel">{componentData ? componentData.params.fr.canal_reception.value : ""}
                                                                    <InputRequire/></label>
                                                                <Select
                                                                    classNamePrefix="select"
                                                                    className="basic-single"
                                                                    placeholder={componentData ? componentData.params.fr.canal_reception_placeholder.value : ""}
                                                                    value={receptionChannel}
                                                                    onChange={onChangeReceptionChannel}
                                                                    options={channels}
                                                                />
                                                                {
                                                                    error.request_channel_slug.length ? (
                                                                        error.request_channel_slug.map((error, index) => (
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
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
                                                                    classNamePrefix="select"
                                                                    className="basic-single"
                                                                    placeholder={componentData ? componentData.params.fr.canal_reponse_placeholder.value : ""}
                                                                    value={responseChannel}
                                                                    onChange={onChangeResponseChannel}
                                                                    options={responseChannels}
                                                                />
                                                                {
                                                                    error.response_channel_slug.length ? (
                                                                        error.response_channel_slug.map((error, index) => (
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
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
                                                                    htmlFor="claimCtegory">{componentData ? componentData.params.fr.categorie.value : ""}<InputRequire/> </label>
                                                                <Select
                                                                    classNamePrefix="select"
                                                                    className="basic-single"
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
                                                                    classNamePrefix="select"
                                                                    className="basic-single"
                                                                    placeholder={componentData ? componentData.params.fr.object_placeholder.value : ""}
                                                                    value={claimObject}
                                                                    onChange={onChangeClaimObject}
                                                                    options={claimObjects}
                                                                />
                                                                {
                                                                    error.claim_object_id.length ? (
                                                                        error.claim_object_id.map((error, index) => (
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
                                                                                {error}
                                                                            </div>
                                                                        ))
                                                                    ) : null
                                                                }
                                                            </div>

                                                            <div
                                                                className={error.lieu.length ? "col validated" : "col"}>
                                                                <label
                                                                    htmlFor="lieu">{componentData ? componentData.params.fr.lieu.value : ""} </label>
                                                                <input
                                                                    // disabled={!disabledInput}
                                                                    id="lieu"
                                                                    type="text"
                                                                    className={error.lieu.length ? "form-control is-invalid" : "form-control"}
                                                                    placeholder={componentData ? componentData.params.fr.lieu_placeholder.value : ""}
                                                                    value={data.lieu}
                                                                    onChange={(e) => onChangeLieu(e)}
                                                                />
                                                                {
                                                                    error.lieu.length ? (
                                                                        error.lieu.map((error, index) => (
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
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
                                                                    className="text-danger">{t("Laisser vide si pas de montant")}</strong>) {isRequire.amount_disputed ?
                                                                    <InputRequire/> : ""}</label>
                                                                <input
                                                                    type={"number"}
                                                                    min="0"
                                                                    id="amount_claim"
                                                                    className={error.amount_disputed.length ? "form-control is-invalid" : "form-control"}
                                                                    placeholder={componentData ? componentData.params.fr.montant_placeholder.value : ""}
                                                                    value={data.amount_disputed}
                                                                    onChange={(e) => onChangeAmountDisputed(e)}
                                                                />
                                                                {
                                                                    error.amount_disputed.length ? (
                                                                        error.amount_disputed.map((error, index) => (
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
                                                                                {error}
                                                                            </div>
                                                                        ))
                                                                    ) : null
                                                                }
                                                            </div>

                                                            <div
                                                                className={error.amount_currency_slug.length ? "col validated" : "col"}>
                                                                <label
                                                                    htmlFor="currency">{componentData ? componentData.params.fr.devise.value : ""}
                                                                    {isRequire.amount_currency_slug ?
                                                                        <InputRequire/> : ""}</label>
                                                                <Select
                                                                    isClearable
                                                                    classNamePrefix="select"
                                                                    className="basic-single"
                                                                    placeholder={componentData ? componentData.params.fr.devise_placeholder.value : ""}
                                                                    value={currency}
                                                                    onChange={onChangeAmountCurrency}
                                                                    options={currencies}
                                                                />
                                                                {
                                                                    error.amount_currency_slug.length ? (
                                                                        error.amount_currency_slug.map((error, index) => (
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
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
                                                                    onChange={(e) => onChangeEventOccuredAt(e)}
                                                                />
                                                                {
                                                                    error.event_occured_at.length ? (
                                                                        error.event_occured_at.map((error, index) => (
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
                                                                                {error}
                                                                            </div>
                                                                        ))
                                                                    ) : null
                                                                }
                                                            </div>
                                                            {
                                                                verifyPermission(props.userPermissions, "update-claim-incomplete-without-client") ? (
                                                                    <div
                                                                        className={error.relationship_id.length ? "col validated" : "col"}>
                                                                        <label
                                                                            htmlFor="relationship">{componentData ? componentData.params.fr.relation.value : ""} {isRequire.relationship_id ?
                                                                            <InputRequire/> : ""}</label>
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
                                                                    htmlFor="file">{componentData ? componentData.params.fr.piece.value : ""} {isRequire.file ?
                                                                    <InputRequire/> : ""}</label>
                                                                <input
                                                                    onChange={onChangeFile}
                                                                    type="file"
                                                                    className={error.file.length ? "form-control is-invalid" : "form-control"}
                                                                    placeholder={componentData ? componentData.params.fr.piece_placeholder.value : ""}
                                                                    id="customFile"
                                                                    multiple={true}
                                                                />
                                                                {
                                                                    oldFiles ? (
                                                                        oldFiles.length ? (
                                                                            oldFiles.map((file, index) => (
                                                                                <div className="kt-margin-t-10">
                                                                                    <a href={`${appConfig.apiDomaine}${file.url}`}
                                                                                       download={true} target={"_blank"}>
                                                                                        {file.title}
                                                                                    </a>
                                                                                </div>
                                                                            ))
                                                                        ) : null
                                                                    ) : null
                                                                }
                                                                {
                                                                    error.file.length ? (
                                                                        error.file.map((error, index) => (
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
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
                                                                    {isRequire.description ?
                                                                        <InputRequire/> : ""}</label>

                                                                {
                                                                    data.request_channel_slug === "email" ? (
                                                                            <div>
                                                                                <HtmlDescription onClick={e => {
                                                                                    e.preventDefault()
                                                                                    showModal(data.description ? data.description : '-')
                                                                                }}/>
                                                                            </div>
                                                                        ) :
                                                                        (
                                                                            <textarea
                                                                                rows="7"
                                                                                id="description"
                                                                                className={error.description.length ? "form-control is-invalid" : "form-control"}
                                                                                placeholder={componentData ? componentData.params.fr.description_placeholder.value : ""}
                                                                                value={data.description}
                                                                                onChange={(e) => onChangeDescription(e)}
                                                                            />
                                                                        )
                                                                }

                                                                {
                                                                    error.description.length ? (
                                                                        error.description.map((error, index) => (
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
                                                                                {error}
                                                                            </div>
                                                                        ))
                                                                    ) : null
                                                                }
                                                            </div>
                                                            <div
                                                                className={error.claimer_expectation.length ? "col validated" : "col"}>
                                                                <label
                                                                    htmlFor="claimer_expectation">{componentData ? componentData.params.fr.attente.value : ""}
                                                                    {isRequire.claimer_expectation ?
                                                                        <InputRequire/> : ""} </label>
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
                                                                            <div key={index}
                                                                                 className="invalid-feedback">
                                                                                {error}
                                                                            </div>
                                                                        ))
                                                                    ) : null
                                                                }
                                                            </div>
                                                        </div>
                                                        <button id="button_modal" type="button"
                                                                className="btn btn-secondary btn-icon-sm d-none"
                                                                data-toggle="modal" data-target="#message_email"/>
                                                        <HtmlDescriptionModal title={t("Description")}
                                                                              message={currentMessage}/>
                                                    </div>
                                                </div>

                                                <div
                                                    className="kt-separator kt-separator--border-dashed kt-separator--space-lg"/>
                                                <div className="kt-section">
                                                    <div className="kt-section__body">
                                                        <h3 className="kt-section__title kt-section__title-lg">{componentData ? componentData.params.fr.last_titre.value : ""}
                                                            <InputRequire/>
                                                        </h3>

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
                                            </div>

                                            <div className="kt-portlet__foot">
                                                <div className="kt-form__actions text-right">
                                                    {
                                                        !startRequest ? (
                                                            <button type="submit" onClick={(e) => onSubmit(e)}
                                                                    className="btn btn-primary">{t("Modifier")}</button>
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
                                                            <Link to="/process/incomplete_claims"
                                                                  className="btn btn-secondary mx-2">
                                                                {t("Quitter")}
                                                            </Link>
                                                        ) : (
                                                            <Link to="/process/incomplete_claims"
                                                                  className="btn btn-secondary mx-2"
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
            )
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        plan: state.plan.plan,
    };
};

export default connect(mapStateToProps)(IncompleteClaimsEdit);
