import React, {useState} from "react";
import TagsInput from "react-tagsinput";
import axios from "axios";
import {ToastBottomEnd} from "../Toast";
import {
    toastAddErrorMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig,
} from "../../../config/toastConfig";
import {formatSelectOption} from "../../../helpers/function";
import {formatInstitutions} from "../../../helpers/institution";
import Select from "react-select";
import appConfig from "../../../config/appConfig";
import {verifyPermission} from "../../../helpers/permission";
import FormInformation from "../FormInformation";
import InputRequire from "../InputRequire";
import {useTranslation} from "react-i18next";

const endPointConfig = {
    PRO: {
        plan: "PRO",
        confirm: id => `${appConfig.apiDomaine}/my/identites/${id}/clients`
    },
    MACRO: {
        plan: "MACRO",
        holding: {
            confirm: id => `${appConfig.apiDomaine}/any/identites/${id}/clients`
        },
        filial: {
            confirm: id => `${appConfig.apiDomaine}/my/identites/${id}/clients`
        }
    },
};

const ConfirmClientSaveForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'store-client-from-any-institution') || verifyPermission(props.userPermissions, 'update-client-from-any-institution'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'store-client-from-my-institution') || verifyPermission(props.userPermissions, 'update-client-from-my-institution'))
            endPoint = endPointConfig[props.plan].filial
    } else
        endPoint = endPointConfig[props.plan];

    const [types, setTypes] = useState(props.types);
    const [clients, setClients] = useState(props.clients);
    const [category, setCategory] = useState(props.category);
    const [categories, setCategories] = useState(props.categories);
    // const institution = props.institution;
    const [institution, setInstitution] = useState(props.institution);
    const [institutions, setInstitutions] = useState(props.institutions);
    const [type, setType] = useState(props.type);
    const [client, setClient] = useState(props.client);


    const defaultData = {
        firstname: props.identite && props.identite.identite ? props.identite.identite.firstname : "",
        lastname: props.identite && props.identite.identite ? props.identite.identite.lastname : "",
        sexe: props.identite.identite.sexe,
        telephone: props.identite && props.identite.identite && props.identite.identite.telephone ? JSON.parse( props.identite.identite.telephone): [],
        email: props.identite && props.identite.identite && props.identite.identite.email ? JSON.parse(props.identite.identite.email) : [],
        ville: props.identite.identite.ville === null ? "" : props.identite.identite.ville,
        number:props.number,
        account_type_id: props.account_type_id ? props.account_type_id : "",
        client_id: props.client_id,
        institution_id: props.institution_id,
        category_client_id:props.category_id
    };

    const defaultError = {
        firstname: [],
        lastname: [],
        sexe: [],
        telephone: [],
        email: [],
        ville: [],
        number:[],
        account_type_id: [],
        client_id: [],
        institution_id: [],
        category_client_id:[]
    };
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

    const onChangeType = (selected) => {
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
    const onChangeCategory = (selected) => {
        const newData = {...data};
        newData.category_client_id = selected.value;
        setCategory(selected);
        setData(newData);
    };

    const onChangeInstitution = (selected) => {
        const newData = {...data};
        newData.institution_id = selected.value;
        setInstitution(selected);
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        axios.post(endPoint.confirm(props.identite.identite.id), data)
            .then(async (response) => {
                ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                await setStartRequest(false);
                await setError(defaultError);
                await setTypes([]);
                await setCategories([]);
                await setInstitutions([]);
                await setInstitution({});
                await setType({});
                await setCategory({});
                document.getElementById("closeConfirmSaveForm").click();
                // await props.resetFoundIdentity();
            })
            .catch(errorRequest => {
                setStartRequest(false);
                setError({...defaultError, ...errorRequest.response.data.error});
                ToastBottomEnd.fire(toastEditErrorMessageConfig());
            })
        ;
    };

    const onClickClose = async (e) => {
        await setStartRequest(false);
        await setError(defaultError);
        await setData(defaultError);
        await setTypes([]);
        await setCategory({});
        await setCategories([]);
        await setInstitutions([]);
        await setInstitution({});
        await setType({});
        await document.getElementById("closeButton").click();
        // await props.resetFoundIdentity();
    };

    return (
        ready ? (
            <div className="modal fade" id="kt_modal_4" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" role="dialog" data-backdrop="false"
                 style={{ display: "block", paddingRight: "17px"}} aria-modal="true">
                <div className="modal-dialog modal-lg" role="document" style={{boxShadow: "0px 4px 23px 6px rgba(0,0,0,0.75)"}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{t("Ajout d'un client avec des identifiants existant")}</h5>
                            <button onClick={(e) => onClickClose(e)} type="button" className="close"/>
                            <button id="closeButton" style={{display: "none"}} type="button" className="close" data-dismiss="modal" aria-label="Close"/>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="kt-portlet__body">
                                    <FormInformation
                                        information={props.message}
                                    />

                                    <div className="kt-section kt-section--first">
                                        <div className="kt-section__body">
                                            <h3 className="kt-section__title kt-section__title-lg">{t("Informations personnelles")}:</h3>

                                            <div className={"form-group row "}>
                                                {
                                                    verifyPermission(props.userPermissions, 'store-client-from-any-institution') || verifyPermission(props.userPermissions, 'update-client-from-any-institution') ? (

                                                        <div className="col">
                                                            <label htmlFor="type">{t("Institution")} <InputRequire/></label>
                                                            <Select
                                                                value={institution}
                                                                onChange={onChangeInstitution}
                                                                options={institutions}
                                                            />
                                                            {
                                                                error.institution_id.length ? (
                                                                    error.institution_id.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
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
                                                <div className={error.lastname.length ? "col validated" : "col"}>
                                                    <label htmlFor="lastname">{t("Nom")} <InputRequire/></label>
                                                    <input
                                                        id="lastname"
                                                        type="text"
                                                        className={error.lastname.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le nom de famille")}
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

                                                <div className={error.firstname.length ? "col validated" : "col"}>
                                                    <label htmlFor="firstname">{t("Prénom(s)")} <InputRequire/></label>
                                                    <input
                                                        id="firstname"
                                                        type="text"
                                                        className={error.firstname.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le prénom")}
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

                                            <div className="row">
                                                <div className={error.firstname.length ? "form-group col validated" : "form-group col"}>
                                                    <label htmlFor="sexe">{t("Sexe")} <InputRequire/></label>
                                                    <select
                                                        id="sexe"
                                                        className={error.sexe.length ? "form-control is-invalid" : "form-control"}
                                                        value={data.sexe}
                                                        onChange={(e) => onChangeSexe(e)}
                                                    >
                                                        <option value="" disabled={true}>{t("Veuillez choisir le Sexe")}</option>
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
                                            </div>

                                            <div className="form-group row">
                                                <div className={error.telephone.length ? "col validated" : "col"}>
                                                    <label htmlFor="telephone"> {t("Téléphone(s)")} <InputRequire/></label>
                                                    <TagsInput value={data.telephone} onChange={onChangeTelephone} />
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
                                                    <TagsInput value={data.email} onChange={onChangeEmail} />
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

                                                <div className={error.ville.length ? "col validated" : "col"}>
                                                    <label htmlFor="ville">{t("Ville")} <InputRequire/></label>
                                                    <input
                                                        id="ville"
                                                        type="text"
                                                        className={error.ville.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer votre ville")}
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
                                        </div>
                                    </div>

                                    <div className="kt-section">
                                        <div className="kt-section__body">
                                            <h3 className="kt-section__title kt-section__title-lg">{t("Informations professionnelles")}:</h3>
                                            <div className={"form-group row "}>

                                                <div className="col">
                                                    <label htmlFor="type">{("Catégorie client")} <InputRequire/></label>
                                                    <Select
                                                        value={category}
                                                        onChange={onChangeCategory}
                                                        options={formatSelectOption(categories, "name", "fr")}
                                                    />
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
                                            <div className={"form-group row"}>
                                                <div className="col">
                                                    <label htmlFor="institution">{t("Type de compte")} <InputRequire/></label>
                                                    <Select
                                                        value={type}
                                                        onChange={onChangeType}
                                                        options={formatSelectOption(types, "name", "fr")}
                                                    />
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

                                            </div>

                                            <div className="form-group row">
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
                                                        ) : ""
                                                    }
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
                                    <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{t("Enregistrer")}</button>
                                ) : (
                                    <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                        {t("Chargement")}...
                                    </button>
                                )
                            }
                            <button id="closeConfirmSaveForm" style={{display: "none"}} type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default ConfirmClientSaveForm;
