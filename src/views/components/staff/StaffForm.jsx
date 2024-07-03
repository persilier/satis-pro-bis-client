import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {
    useParams,
    Link
} from "react-router-dom";
import TagsInput from "react-tagsinput";
import Select from "react-select";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig,
    toastMessageConsoleWithParameterConfig,
    toastErrorMessageWithParameterConfig
} from "../../../config/toastConfig";
import {ToastBottomEnd} from "../Toast";
import {formatUnits} from "../../../helpers/unit";
import './react-tagsinput.css';
import {formatSelectOption} from "../../../helpers/function";
import {formatInstitutions} from "../../../helpers/institution";
import appConfig from "../../../config/appConfig";
import ConfirmSaveForm from "./ConfirmSaveForm";
import {ERROR_401} from "../../../config/errorPage";
import {verifyPermission} from "../../../helpers/permission";
import InputRequire from "../InputRequire";
import {confirmLeadConfig} from "../../../config/confirmConfig";
import {ConfirmLead} from "../ConfirmationAlert";
import WithoutCode from "../WithoutCode";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


const endPointConfig = {
    PRO: {
        plan: "PRO",
        store: `${appConfig.apiDomaine}/my/staff`,
        update: id => `${appConfig.apiDomaine}/my/staff/${id}`,
        create: `${appConfig.apiDomaine}/my/staff/create`,
        edit: id => `${appConfig.apiDomaine}/my/staff/${id}/edit`
    },
    MACRO: {
        holding: {
            store: `${appConfig.apiDomaine}/any/staff`,
            update: id => `${appConfig.apiDomaine}/any/staff/${id}`,
            create: `${appConfig.apiDomaine}/any/staff/create`,
            edit: id => `${appConfig.apiDomaine}/any/staff/${id}/edit`
        },
        filial: {
            store: `${appConfig.apiDomaine}/my/staff`,
            update: id => `${appConfig.apiDomaine}/my/staff/${id}`,
            create: `${appConfig.apiDomaine}/my/staff/create`,
            edit: id => `${appConfig.apiDomaine}/my/staff/${id}/edit`
        }
    },
    HUB: {
        plan: "HUB",
        store: `${appConfig.apiDomaine}/maybe/no/staff`,
        update: id => `${appConfig.apiDomaine}/maybe/no/staff/${id}`,
        create: `${appConfig.apiDomaine}/maybe/no/staff/create`,
        edit: id => `${appConfig.apiDomaine}/maybe/no/staff/${id}/edit`
    }
};

const StaffForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (id) {
        if (!(verifyPermission(props.userPermissions, "update-staff-from-any-unit") || verifyPermission(props.userPermissions, 'update-staff-from-my-unit') || verifyPermission(props.userPermissions, 'update-staff-from-maybe-no-unit')))
            window.location.href = ERROR_401;
    } else {
        if (!(verifyPermission(props.userPermissions, "store-staff-from-any-unit") || verifyPermission(props.userPermissions, 'store-staff-from-my-unit') || verifyPermission(props.userPermissions, 'store-staff-from-maybe-no-unit')))
            window.location.href = ERROR_401;
    }

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'store-any-unit') || verifyPermission(props.userPermissions, 'update-any-unit'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'store-my-unit') || verifyPermission(props.userPermissions, 'update-my-unit'))
            endPoint = endPointConfig[props.plan].filial
    } else
        endPoint = endPointConfig[props.plan];

    const optionOne = 1;
    const optionTwo = 0;
    const [units, setUnits] = useState([]);
    const [positions, setPositions] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [foundData, setFoundData] = useState({});
    const [institution, setInstitution] = useState(null);
    const [unit, setUnit] = useState(null);
    const [position, setPosition] = useState(null);

    const defaultData = {
        firstname: "",
        lastname: "",
        sexe: "",
        telephone: [],
        email: [],
        ville: "",
        unit_id: "",
        institution_id: "",
        position_id: "",
        is_lead: 0,
    };
    const defaultError = {
        firstname: [],
        lastname: [],
        sexe: [],
        telephone: [],
        email: [],
        ville: [],
        unit_id: [],
        institution_id: [],
        position_id: [],
        is_lead: []
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        if (verifyTokenExpire()) {
            if (id) {
                axios.get(endPoint.edit(id))
                    .then(response => {
                        const newData = {
                            firstname: response.data?.staff?.identite?.firstname ? response.data.staff.identite.firstname : "",
                            lastname: response.data?.staff?.identite?.lastname ? response.data.staff.identite.lastname : "",
                            sexe: response.data?.staff?.identite?.sexe ? response.data.staff.identite.sexe : "",
                            telephone: response.data?.staff?.identite?.telephone ?  response.data.staff.identite.telephone : "",
                            email: response.data?.staff?.identite?.email ? response.data.staff.identite.email :"",
                            ville: response.data.staff.identite.ville === null ? "" : response.data.staff.identite.ville,
                            unit_id: response.data?.staff?.unit_id ? response.data.staff.unit_id : "",
                            position_id: response.data?.staff?.position_id ? response.data.staff.position_id : "",
                            institution_id: response.data?.staff?.institution_id ? response.data.staff.institution_id : "",
                            is_lead: response.data?.staff?.is_lead ? 1 : 0
                        };

                        setPositions(response.data.positions);
                        if (verifyPermission(props.userPermissions, 'update-staff-from-any-unit') || verifyPermission(props.userPermissions, 'update-staff-from-maybe-no-unit')) {
                            setInstitutions(response.data.institutions);
                            setInstitution({value: response.data.staff.institution.id, label: response.data.staff.institution.name});
                        }
                        setPosition({value: response.data.staff.position.id, label: response.data.staff.position.name["fr"]});

                        if (verifyPermission(props.userPermissions, 'update-staff-from-maybe-no-unit'))
                            setUnits(response.data.units);
                        else if (verifyPermission(props.userPermissions, 'update-staff-from-my-unit'))
                            setUnits(response.data.units);
                        else if (verifyPermission(props.userPermissions, 'update-staff-from-any-unit'))
                            setUnits(response.data.staff.institution.units);

                        setUnit({value: response.data.staff.unit.id, label: response.data.staff.unit.name["fr"], lead: response.data.staff.unit.lead});
                        setData(newData);
                    })
                    .catch(error => {
                        //console.log("Something is wrong");
                    })
                ;
            } else {
                axios.get(endPoint.create)
                    .then(response => {
                        if (verifyPermission(props.userPermissions, 'store-staff-from-any-unit') || verifyPermission(props.userPermissions, 'store-staff-from-maybe-no-unit'))
                            setInstitutions(formatInstitutions(response.data.institutions));
                        setPositions(response.data.positions);
                        if (response.data.units)
                            setUnits(formatUnits(response.data.units));
                    })
                    .catch(error => {
                        //console.log("something is wrong");
                    })
                ;
            }
        }
    }, [endPoint, id, props.userPermissions]);

    const formatUnitSelectOption = (options, labelKey, translate, valueKey = "id") => {
        const newOptions = [];
        for (let i = 0; i < options.length; i++) {
            if (translate)
                newOptions.push({value: (options[i])[valueKey], label: ((options[i])[labelKey])[translate], lead: (options[i])["lead"]});
            else
                newOptions.push({value: (options[i])[valueKey], label: (options[i])[labelKey], lead: (options[i])["lead"]});
        }
        return newOptions;
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

    const onChangeUnit = (selected) => {
        const newData = {...data};
        if (selected) {
            newData.is_lead = 0;
            setData(newData);
        }
        newData.unit_id = selected ? selected.value : "";
        if (selected === null)
            newData.is_lead = 0;
        setUnit(selected);
        setData(newData);
    };

    const onChangePosition = (selected) => {
        const newData = {...data};
        newData.position_id = selected ? selected.value : "";
        setPosition(selected);
        setData(newData);
    };

    const onChangeInstitution = (selected) => {
        const newData = {...data};
        newData.institution_id = selected ? selected.value : null;
        setInstitution(selected);

        if (selected) {
            if (verifyTokenExpire()) {
                if (verifyPermission(props.userPermissions, 'store-staff-from-any-unit') || verifyPermission(props.userPermissions, 'update-staff-from-any-unit')) {
                    axios.get(`${appConfig.apiDomaine}/institutions/${selected.value}/units`)
                        .then(response => {
                            newData.unit_id = "";
                            setUnit(null);
                            setUnits(formatUnits(response.data.units));
                        })
                        .catch(errorRequest => {
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(errorRequest.response.data.error));
                        })
                    ;
                }
            }
        }

        setData(newData);
    };

    const changeOption = (value) => {
        const newData = {...data};
        newData.is_lead = value;
        setData(newData);
    };

    const confirmIsLead = (config, value) => {
        ConfirmLead.fire(config)
            .then(result => {
                if (result.value) {
                    changeOption(value);
                }
            })
        ;
    };

    const handleOptionChange = (e) => {
        if (unit) {
            const value = parseInt(e.target.value);
            if (parseInt(e.target.value) === 1) {
                if (unit.lead) {
                    if (!!Object.keys(unit.lead).length) {
                        confirmIsLead(confirmLeadConfig(`${unit.lead.identite.lastname} ${unit.lead.identite.firstname}`), value);
                    } else {
                        changeOption(parseInt(e.target.value));
                    }
                } else {
                    confirmIsLead(confirmLeadConfig(null), value);
                }
            } else {
                changeOption(parseInt(e.target.value));
            }
        } else {
            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t('Veuillez choisir une unité')))
        }
    };

    const resetFoundData = async () => {
        setError(defaultError);
        setData(defaultData);
        await setInstitution(null);
        await setUnit(null);
        await setPosition(null);
        setFoundData({});
    };

    const closeModal = () => {
        setFoundData({});
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        let newData = {...data};
        newData.is_lead = newData.is_lead === 1;
        if (!(verifyPermission(props.userPermissions, 'store-staff-from-any-unit') || verifyPermission(props.userPermissions, 'update-staff-from-any-unit') || verifyPermission(props.userPermissions, 'store-staff-from-maybe-no-unit') || verifyPermission(props.userPermissions, 'update-staff-from-maybe-no-unit')))
            delete newData.institution_id;

        if (verifyTokenExpire()) {
            if (id) {
                axios.put(endPoint.update(id), newData)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    })
                    .catch(errorRequest => {
                        setStartRequest(false);
                        //console.log("data-56465:",errorRequest.response.data)

                        if (errorRequest.response.status === 409) {
                            setStartRequest(false);
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(errorRequest.response.data.error.message))
                        }

                        if (errorRequest.response.data.error.staff) {
                            // Existing staff
                            setStartRequest(false);
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(
                                errorRequest.response.data.error.staff.identite.lastname+" "+errorRequest.response.data.error.staff.identite.firstname+": "+errorRequest.response.data.error.message)
                            );
                        }
                        if(errorRequest.response.status === 422){
                            setError({...defaultError, ...errorRequest.response.data.error});
                            ToastBottomEnd.fire(toastEditErrorMessageConfig());
                        }
                    })
                ;
            } else {
                axios.post(endPoint.store, newData)
                    .then(response => {
                        setStartRequest(false);
                        setInstitution(null);
                        setUnit(null);
                        setPosition(null);
                        setError(defaultError);
                        setData(defaultData);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    })
                    .catch(async (errorRequest) => {
                        if (errorRequest.response.data.error.identite)
                        {
                            // Existing entity
                            await setFoundData(errorRequest.response.data.error);
                            await document.getElementById("confirmSaveForm").click();
                            setStartRequest(false);
                        } else if (errorRequest.response.data.error.staff) {
                            // Existing staff
                            setStartRequest(false);
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(
                                errorRequest.response.data.error.staff.identite.lastname+" "+errorRequest.response.data.error.staff.identite.firstname+": "+errorRequest.response.data.error.message)
                            );
                        } else {
                            // Validation errors
                            setStartRequest(false);
                            setError({...defaultError, ...errorRequest.response.data.error});
                            ToastBottomEnd.fire(toastAddErrorMessageConfig());
                        }
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
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to="/settings/staffs" className="kt-subheader__breadcrumbs-link">
                                    {t("Agent")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
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
                                                id ? t("Modification d'un agent") : t("Ajout d'un agent")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-portlet__body">
                                        <div className="kt-section kt-section--first">
                                            <div className="kt-section__body">
                                                <h3 className="kt-section__title kt-section__title-lg">{t("Informations personnelles")}:</h3>
                                                <div className="form-group row">
                                                    <div className={error?.lastname.length ? "col validated" : "col"}>
                                                        <label htmlFor="lastname">{t("Nom")} <InputRequire/></label>
                                                        <input
                                                            id="lastname"
                                                            type="text"
                                                            className={error?.lastname.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder={t("Veuillez entrer le nom")}
                                                            value={data.lastname}
                                                            onChange={(e) => onChangeLastName(e)}
                                                        />
                                                        {
                                                            error?.lastname.length ? (
                                                                error?.lastname.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>

                                                    <div className={error?.firstname.length ? "col validated" : "col"}>
                                                        <label htmlFor="firstname">{t("Prénom")} <InputRequire/></label>
                                                        <input
                                                            id="firstname"
                                                            type="text"
                                                            className={error?.firstname.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder={t("Veuillez entrer le prénom")}
                                                            value={data.firstname}
                                                            onChange={(e) => onChangeFirstName(e)}
                                                        />
                                                        {
                                                            error?.firstname.length ? (
                                                                error?.firstname.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className={error?.sexe.length ? "form-group col validated" : "form-group col"}>
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
                                                            error?.sexe.length ? (
                                                                error?.sexe.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>

                                                <div className="form-group row">
                                                    <div className={error?.telephone.length ? "col validated" : "col"}>
                                                        <label htmlFor="telephone">{t("Téléphone(s)")}<WithoutCode/> <InputRequire/></label>
                                                        <TagsInput value={data.telephone} onChange={onChangeTelephone} inputProps={{className: 'react-tagsinput-input', placeholder: 'Numéro(s)'}} />
                                                        {
                                                            error?.telephone.length ? (
                                                                error?.telephone.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>

                                                    <div className={error?.email.length ? "col validated" : "col"}>
                                                        <label htmlFor="email">Email(s) <InputRequire/></label>
                                                        <TagsInput value={data.email} onChange={onChangeEmail} inputProps={{className: 'react-tagsinput-input', placeholder: 'Email(s)'}}/>
                                                        {
                                                            error?.email.length ? (
                                                                error?.email.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>

                                                    <div className={error?.ville.length ? "col validated" : "col"}>
                                                        <label htmlFor="ville">{t("Ville")}</label>
                                                        <input
                                                            id="ville"
                                                            type="text"
                                                            className={error?.ville.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder={t("Veuillez entrer votre ville")}
                                                            value={data.ville ? data.ville : ""}
                                                            onChange={(e) => onChangeVille(e)}
                                                        />
                                                        {
                                                            error?.ville.length ? (
                                                                error?.ville.map((error, index) => (
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
                                                <div className={error?.position_id.length ? "form-group row validated" : "form-group row"}>
                                                    <div className="col">
                                                        <label htmlFor="position">{t("Fonction")} <InputRequire/></label>
                                                        <Select
                                                            isClearable
                                                            value={position}
                                                            placeholder={t("Veuillez sélectionner la fonction")}
                                                            onChange={onChangePosition}
                                                            options={formatSelectOption(positions, "name", "fr")}
                                                        />
                                                        {
                                                            error?.position_id.length ? (
                                                                error?.position_id.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>

                                                    {
                                                        verifyPermission(props.userPermissions, 'store-staff-from-any-unit') || verifyPermission(props.userPermissions, 'update-staff-from-any-unit') || verifyPermission(props.userPermissions, 'store-staff-from-maybe-no-unit') || verifyPermission(props.userPermissions, 'update-staff-from-maybe-no-unit') ? (
                                                            <div className="col">
                                                                <label htmlFor="institution">{t("Institution")} <InputRequire/></label>
                                                                <Select
                                                                    isClearable
                                                                    value={institution}
                                                                    placeholder={t("Veuillez sélectionner l'institution")}
                                                                    onChange={onChangeInstitution}
                                                                    options={formatSelectOption(formatInstitutions(institutions), "name", false)}
                                                                />
                                                                {
                                                                    error?.institution_id.length ? (
                                                                        error?.institution_id.map((error, index) => (
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
                                                    <div  className={error?.unit_id.length ? "col validated" : "col"}>
                                                        <label htmlFor="unit">{t("Unité")} <InputRequire/></label>
                                                        <Select
                                                            isClearable
                                                            value={unit}
                                                            placeholder={t("Veuillez selectionner l'unité")}
                                                            onChange={onChangeUnit}
                                                            options={formatUnitSelectOption(units, "name", "fr")}
                                                        />
                                                        {
                                                            error?.unit_id.length ? (
                                                                error?.unit_id.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>

                                                    <div  className={error?.unit_id.length ? "row col validated" : "row col"}>
                                                        <label className="col-xl-6 col-lg-6 col-form-label mt-4" htmlFor="name">{t("Responsable de l'unité")} <InputRequire/></label>
                                                        <div className="col-lg-6 col-xl-6 kt-radio-inline">
                                                            <label className="kt-radio mt-4">
                                                                <input type="radio" value={optionOne} onChange={handleOptionChange} checked={optionOne === data.is_lead}/> {t("OUI")}<span/>
                                                            </label>
                                                            <label className="kt-radio">
                                                                <input type="radio" value={optionTwo} onChange={handleOptionChange} checked={optionTwo === data.is_lead}/> {t("NON")}<span/>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="kt-portlet__foot">
                                        <div className="kt-form__actions">
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
                                                    <Link to="/settings/staffs" className="btn btn-secondary mx-2">
                                                        {t("Quitter")}
                                                    </Link>
                                                ) : (
                                                    <Link to="/settings/staffs" className="btn btn-secondary mx-2" disabled>
                                                        {t("Quitter")}
                                                    </Link>
                                                )
                                            }
                                            <button style={{display: "none"}} id="confirmSaveForm" type="button" className="btn btn-bold btn-label-brand btn-sm" data-toggle="modal" data-target="#kt_modal_4">Launch Modal</button>
                                        </div>
                                    </div>
                                </form>
                                {
                                    foundData.identite ? (
                                        <ConfirmSaveForm
                                            plan={props.plan}
                                            userPermissions={props.userPermissions}
                                            message={foundData.message}
                                            unit={unit}
                                            institution={institution}
                                            position={position}
                                            identite={foundData.identite}
                                            units={units}
                                            positions={positions}
                                            institutions={institutions}
                                            unit_id={data.unit_id}
                                            position_id={data.position_id}
                                            closeModal={closeModal}
                                            resetFoundData={resetFoundData}
                                        />
                                    ) : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        ready ? (
            id ? (
                verifyPermission(props.userPermissions, 'update-staff-from-any-unit') || verifyPermission(props.userPermissions, 'update-staff-from-my-unit') || verifyPermission(props.userPermissions, 'update-staff-from-maybe-no-unit') ? (
                    printJsx()
                ) : null
            ) : (
                verifyPermission(props.userPermissions, 'store-staff-from-any-unit') || verifyPermission(props.userPermissions, 'store-staff-from-my-unit') || verifyPermission(props.userPermissions, 'store-staff-from-maybe-no-unit') ? (
                    printJsx()
                ) : null
            )
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        plan: state.plan.plan
    };
};

export default connect(mapStateToProps)(StaffForm);
