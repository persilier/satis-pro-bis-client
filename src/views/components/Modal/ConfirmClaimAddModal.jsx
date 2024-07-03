import React, {useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import FormInformation from "../../components/FormInformation";
import TagsInput from "react-tagsinput";
import Select from "react-select";
import appConfig from "../../../config/appConfig";
import {formatSelectOption, formatToTimeStamp} from "../../../helpers/function";
import {ToastBottomEnd} from "../../components/Toast";
import {
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
} from "../../../config/toastConfig";
import {verifyPermission} from "../../../helpers/permission";
import InputRequire from "../InputRequire";
import WithoutCode from "../WithoutCode";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const ConfirmClaimAddModal = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const componentData = props.componentData;

    const defaultData = {
        firstname: props.firstname,
        lastname: props.lastname,
        sexe: props.sexe,
        telephone: props.telephone.length?JSON.parse(props.telephone):[],
        email: props.email.length?JSON.parse(props.email):[],
        ville: props.ville,
        lieu: props.lieu,
        unit_targeted_id: props.unit_targeted_id,
        institution_targeted_id: props.institution_targeted_id,
        account_targeted_id: props.account_targeted_id,
        account_number: props.account_number,
        claim_object_id: props.claim_object_id,
        request_channel_slug: props.request_channel_slug,
        response_channel_slug: props.response_channel_slug,
        claimer_expectation: props.claimer_expectation,
        description: props.description,
        amount_currency_slug: props.amount_currency_slug,
        amount_disputed: props.amount_disputed,
        claimer_id: props.claimer_id,
        event_occured_at: props.event_occured_at,
        is_revival: props.is_revival,
        relationship_id: props.relationship_id,
        file: props.file
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
        account_targeted_id: [],
        account_number: [],
        claim_object_id: [],
        request_channel_slug: [],
        response_channel_slug: [],
        claimer_expectation: [],
        description: [],
        amount_currency_slug: [],
        amount_disputed: [],
        claimer_id: [],
        event_occured_at: [],
        is_revival: [],
        relationship_id: [],
        file: []
    };

    const option1 = 1;
    const option2 = 0;

    const [relationship, setRelationship] = useState(props.relationship);
    const relationships = props.relationships;
    const [claimObject, setClaimObject] = useState(props.claimObject);
    const [claimObjects, setClaimObjects] = useState(props.claimObjects);
    const [claimCategory, setClaimCategory] = useState(props.claimCategory);
    const claimCategories = props.claimCategories;
    const [accounts, setAccounts] = useState(props.accounts);
    const [account, setAccount] = useState(props.account);
    const [units, setUnits] = useState(props.units);
    const [unit, setUnit] = useState(props.unit);
    const responseChannels = props.responseChannels;
    const channels = props.channels;
    const [responseChannel, setResponseChannel] = useState(props.responseChannel);
    const [receptionChannel, setReceptionChannel] = useState(props.receptionChannel);
    const [currency, setCurrency] = useState(props.currency);
    const currencies = props.currencies;
    const [institution, setInstitution] = useState(props.institution);
    const institutions = props.institutions;
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

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

    const onChangeLieu = e => {
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

    const onChangeClaimCategory = async (selected) => {
        const newData = {...data};
        if (selected) {
            setClaimCategory(selected);
            if (verifyTokenExpire()) {
                await axios.get(`${appConfig.apiDomaine}/claim-categories/${selected.value}/claim-objects`)
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
        if (selected) {
            setRelationship(selected);
            newData.relationship_id = selected.value;
        } else {
            setRelationship(null);
            newData.relationship_id = "";
        }
        setData(newData);
    };

    const onChangeEventOccuredAt = e => {
        const newData = {...data};
        newData.event_occured_at = e.target.value;
        setData(newData);
    };

    const handleOptionChange = (e) => {
        const newData = {...data};
        newData.is_revival = parseInt(e.target.value);
        setData(newData);
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

    const onSubmit = (e) => {
        const newData = {...data};
        newData.event_occured_at = formatToTimeStamp(data.event_occured_at);
        e.preventDefault();
        setStartRequest(true);

        if (!newData.account_targeted_id)
            delete newData.account_targeted_id;
        if (!newData.account_number)
            delete newData.account_number;
        if (!newData.amount_disputed)
            delete newData.amount_disputed;
        if (!newData.amount_currency_slug)
            delete newData.amount_currency_slug;
        if (!verifyPermission(props.userPermissions, "store-claim-without-client"))
            delete newData.relationship_id;
        if (verifyTokenExpire()) {
            axios.post(props.endPoint.storeKnowingIdentity(props.id), formatFormData(newData))
                .then(async (response) => {
                    ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    await setInstitution(null);
                    await setClaimCategory(null);
                    await setCurrency(null);
                    await setResponseChannel(null);
                    await setReceptionChannel(null);
                    await setClaimObject(null);
                    await setClaimObjects([]);
                    await setAccounts([]);
                    await setAccount(null);
                    await setUnits([]);
                    await setUnit(null);
                    await setRelationship(null);
                    await setStartRequest(false);
                    // await setError(defaultError);
                    await setData(defaultData);
                    document.getElementById("customFile").value = "";
                    document.getElementById("closeConfirmSaveForm").click();
                    await props.resetFoundData();
                })
                .catch(errorRequest => {
                    setStartRequest(false);
                    setError({...defaultError, ...errorRequest.response.data.error});
                    ToastBottomEnd.fire(toastEditErrorMessageConfig());
                })
            ;
        }

    };

    const onClickClose = async () => {
        await document.getElementById("closeButton").click();
        props.closeModal();
        // await props.resetFoundData();
    };

    return (
        ready ? (
            <div className="modal fade" id="kt_modal_4_2" data-backdrop="static" tabIndex="-1" role="dialog"
                 aria-labelledby="exampleModalLabel" aria-hidden="true" style={{display: "none"}}>
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{t("Enregistrement réclamation")}</h5>
                            <button onClick={(e) => onClickClose(e)} type="button" className="close"/>
                            <button id="closeButton" style={{display: "none"}} type="button" className="close"
                                    data-dismiss="modal" aria-label="Close"/>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="kt-portlet__body">
                                    <FormInformation
                                        information={props.message}
                                    />

                                    <div className="kt-section kt-section--first">
                                        <div className="kt-section__body">
                                            {
                                                verifyPermission(props.userPermissions, 'store-claim-against-any-institution') || verifyPermission(props.userPermissions, 'store-claim-without-client') ? (
                                                    <div
                                                        className={error.institution_targeted_id.length ? "form-group row validated" : "form-group row"}>
                                                        <label className="col-xl-3 col-lg-3 col-form-label"
                                                               htmlFor="institution">{componentData ? componentData.params.fr.institution.value : ""}
                                                            <InputRequire/></label>
                                                        <div className="col-lg-9 col-xl-6">
                                                            <Select
                                                                isClearable
                                                                isDisabled={true}
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
                                                <h3 className="kt-section__title kt-section__title-lg">{componentData ? componentData.params.fr.info_cible.value : ""}</h3>

                                                    {
                                                        !verifyPermission(props.userPermissions, 'store-claim-without-client') ? (
                                                            <div className="form-group row">
                                                                <div className={"col d-flex align-items-center mt-4"}>
                                                                    <label className="kt-checkbox">
                                                                        <input disabled={true} type="checkbox"/>
                                                                        {t("Le client est-il déjà enregistré ?")}<span/>
                                                                    </label>
                                                                </div>

                                                                <div className={"col"}>
                                                                    <div className="row">
                                                                        <div className="col d-flex">
                                                                            <input
                                                                                style={{
                                                                                    marginTop: "2rem",
                                                                                    borderBottomRightRadius: "0px",
                                                                                    borderTopRightRadius: "0px"
                                                                                }}
                                                                                type="text"
                                                                                placeholder={t("Rechercher un client...")}
                                                                                className="form-control"
                                                                                disabled={true}
                                                                            />

                                                                            <button
                                                                                style={{
                                                                                    marginTop: "2rem",
                                                                                    borderTopLeftRadius: "0px",
                                                                                    borderBottomLeftRadius: "0px"
                                                                                }}
                                                                                type="button"
                                                                                className="btn btn-primary btn-icon"
                                                                                disabled={true}
                                                                            >
                                                                                <i className="fa fa-search"/>
                                                                            </button>
                                                                        </div>
                                                                    </div>
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
                                                                disabled={true}
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
                                                                disabled={true}
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
                                                                disabled={true}
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
                                                        <label htmlFor="ville">{componentData ? componentData.params.fr.ville.value : ""}</label>
                                                        <input
                                                            disabled={true}
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
                                                            <TagsInput
                                                                disabled={true}
                                                                value={data.telephone}
                                                                onChange={onChangeTelephone}
                                                                inputProps={{
                                                                    className: 'react-tagsinput-input',
                                                                    placeholder: componentData ? componentData.params.fr.telephone_placeholder.value : ""
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
                                                            <label
                                                                htmlFor="email">{componentData ? componentData.params.fr.email.value : ""}
                                                                <InputRequire/></label>
                                                            <TagsInput
                                                                disabled={true}
                                                                value={data.email}
                                                                onChange={onChangeEmail}
                                                                inputProps={{
                                                                    className: 'react-tagsinput-input',
                                                                    placeholder: componentData ? componentData.params.fr.email_placeholder.value : ""
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

                                            <div
                                                className="kt-separator kt-separator--border-dashed kt-separator--space-lg"/>

                                            <div className="kt-section">
                                                <div className="kt-section__body">
                                                    <h3 className="kt-section__title kt-section__title-lg">{componentData ? componentData.params.fr.info_reclamation.value : ""}</h3>

                                                    {
                                                        !verifyPermission(props.userPermissions, 'store-claim-without-client') ? (
                                                            <div className="form-group row">
                                                                <div
                                                                    className={error.unit_targeted_id.length ? "col validated" : "col"}>
                                                                    <label
                                                                        htmlFor="unit">{componentData ? componentData.params.fr.unite.value : ""}</label>
                                                                    <Select
                                                                        isClearable
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

                                                            <div className={error.account_targeted_id.length || error.account_number.length ? "col validated" : "col"}>
                                                                <label htmlFor="account">{componentData ? componentData.params.fr.compte.value : ""}</label>
                                                                {
                                                                    accounts.length ? (
                                                                        <Select
                                                                            isClearable
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
                                                                            <div key={index} className="invalid-feedback">
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
                                                                placeholder={componentData ? componentData.params.fr.canal_reception_placeholder.value : ""}
                                                                value={receptionChannel}
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
                                                        <div className={"col"}>
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
                                                                onChange={(e) => onChangeEventOccuredAt(e)}
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

                                                        <div className="col">
                                                            <label
                                                                htmlFor="file">{componentData ? componentData.params.fr.piece.value : ""}</label>
                                                            <input
                                                                onChange={onChangeFile}
                                                                type="file"
                                                                className={error.file.length ? "form-control is-invalid" : "form-control"}
                                                                id="customFileTwo"
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

                                                        {
                                                            verifyPermission(props.userPermissions, "store-claim-without-client") ? (
                                                                <div
                                                                    className={error.relationship_id.length ? "col validated" : "col"}>
                                                                    <label
                                                                        htmlFor="relationship">{componentData ? componentData.params.fr.relation.value : ""} avec
                                                                        l'institution <InputRequire/></label>
                                                                    <Select
                                                                        isClearable
                                                                        placeholder={componentData ? componentData.params.fr.relation_placeholder.value : ""}
                                                                        value={relationship}
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
                                                                           checked={option1 === data.is_revival}/> {componentData ? componentData.params.fr.reponse_oui.value : ""}<span/>
                                                                </label>
                                                                <label className="kt-radio">
                                                                    <input type="radio" value={option2}
                                                                           onChange={handleOptionChange}
                                                                           checked={option2 === data.is_revival}/> {componentData ? componentData.params.fr.reponse_non.value : ""}<span/>
                                                                </label>
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
                        <div className="modal-footer">
                            {
                                !startRequest ? (
                                    <button type="submit" onClick={(e) => onSubmit(e)}
                                            className="btn btn-primary">{t("Valider")}</button>
                                ) : (
                                    <button
                                        className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                        type="button" disabled>
                                        {t("Chargement")}...
                                    </button>
                                )
                            }
                            <button id="closeConfirmSaveForm" style={{display: "none"}} type="button"
                                    className="btn btn-secondary" data-dismiss="modal">Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(ConfirmClaimAddModal);
