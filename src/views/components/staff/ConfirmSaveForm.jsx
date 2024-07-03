import React, {useState} from "react";
import TagsInput from "react-tagsinput";
import axios from "axios";
import {formatUnits} from "../../../helpers/unit";
import {ToastBottomEnd} from "../Toast";
import {
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig,
    toastErrorMessageWithParameterConfig
} from "../../../config/toastConfig";
import {formatSelectOption} from "../../../helpers/function";
import {formatInstitutions} from "../../../helpers/institution";
import Select from "react-select";
import appConfig from "../../../config/appConfig";
import {verifyPermission} from "../../../helpers/permission";
import FormInformation from "../FormInformation";
import {useTranslation} from "react-i18next";

const endPointConfig = {
    PRO: {
        plan: "PRO",
        confirm: id => `${appConfig.apiDomaine}/my/identites/${id}/staff`
    },
    MACRO: {
        plan: "MACRO",
        holding: {
            confirm: id => `${appConfig.apiDomaine}/any/identites/${id}/staff`
        },
        filial: {
            confirm: id => `${appConfig.apiDomaine}/my/identites/${id}/staff`
        }
    },
    HUB: {
        plan: "HUB",
        confirm: id => `${appConfig.apiDomaine}/maybe/no/identites/${id}/staff`
    }
};

const ConfirmSaveForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'store-any-unit') || verifyPermission(props.userPermissions, 'update-any-unit'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'store-my-unit') || verifyPermission(props.userPermissions, 'update-my-unit'))
            endPoint = endPointConfig[props.plan].filial
    } else
        endPoint = endPointConfig[props.plan];

    const [units, setUnits] = useState(props.units);
    const [positions, setPositions] = useState(props.positions);
    const institutions = props.institutions;
    const [institution, setInstitution] = useState(props.institution);
    const [unit, setUnit] = useState(props.unit);
    const [position, setPosition] = useState(props.position);

    const defaultData = {
        firstname: props.identite?.firstname,
        lastname: props.identite?.lastname,
        sexe: props.identite?.sexe,
        telephone: JSON.parse(props.identite?.telephone),
        email: JSON.parse(props.identite?.email),
        ville: props.identite.ville === null ? "" : props.identite.ville,
        unit_id: props.unit_id,
        position_id: props.position_id,
    };
    const defaultError = {
        name: [],
        firstname: [],
        lastname: [],
        sexe: [],
        telephone: [],
        email: [],
        ville: [],
        unit_id: [],
        position_id: [],
        institution_id: []
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

    const onChangeUnit = (selected) => {
        const newData = {...data};
        newData.unit_id = selected.value;
        setUnit(selected);
        setData(newData);
    };

    const onChangePosition = (selected) => {
        const newData = {...data};
        newData.position_id = selected.value;
        setPosition(selected);
        setData(newData);
    };

    const onChangeInstitution = (selected) => {
        const newData = {...data};
        newData.institution_id = selected.value;
        setInstitution(selected);

        if (verifyPermission(props.userPermissions, 'store-staff-from-any-unit') || verifyPermission(props.userPermissions, 'update-staff-from-any-unit')) {
            axios.get(`${appConfig.apiDomaine}/institutions/${selected.value}/units`)
                .then(response => {
                    newData.unit_id = "";
                    setUnit({});
                    setUnits(formatUnits(response.data.units));
                })
                .catch(errorRequest => {
                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(errorRequest.response.data.error));
                })
            ;
        }
        setData(newData);
    };

    const resetData = async () => {
        await setStartRequest(false);
        await setError(defaultError);
        await setUnits([]);
        await setPositions([]);
        await setInstitution({});
        await setUnit({});
        await setPosition({});
    };

    const onSubmit = (e) => {
        e.preventDefault();

        setStartRequest(true);
        axios.post(endPoint.confirm(props.identite.id), data)
            .then(async (response) => {
                ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                await resetData();
                document.getElementById("closeConfirmSaveForm").click();
                await props.resetFoundData();
            })
            .catch(errorRequest => {
                setStartRequest(false);
                setError({...defaultError, ...errorRequest.response.data.error});
                ToastBottomEnd.fire(toastEditErrorMessageConfig());
            })
        ;
    };

    const onClickClose = async (e) => {
        await resetData();
        await document.getElementById("closeButton").click();
        await props.closeModal();
    };

    return (
        ready ? (
            <div className="modal fade" id="kt_modal_4" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" role="dialog" data-backdrop="false"
                 style={{ display: "block", paddingRight: "17px"}} aria-modal="true">
                <div className="modal-dialog modal-lg" role="document" style={{boxShadow: "0px 4px 23px 6px rgba(0,0,0,0.75)"}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{t("Ajout d'un agent avec des identifiants existant")}</h5>
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
                                            <div className="form-group row">
                                                <div className={error?.lastname.length ? "col validated" : "col"}>
                                                    <label htmlFor="lastname">{t("Votre nom de famille")}</label>
                                                    <input
                                                        id="lastname"
                                                        type="text"
                                                        className={error?.lastname.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le nom de famille")}
                                                        value={data.lastname || ""}
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
                                                    <label htmlFor="firstname">{t("Votre prénom")}</label>
                                                    <input
                                                        id="firstname"
                                                        type="text"
                                                        className={error?.firstname.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le prénom")}
                                                        value={data.firstname || ""}
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
                                                    <label htmlFor="sexe">{t("Votre sexe")}</label>
                                                    <select
                                                        id="sexe"
                                                        className={error?.sexe.length ? "form-control is-invalid" : "form-control"}
                                                        value={data.sexe || ""}
                                                        onChange={(e) => onChangeSexe(e)}
                                                    >
                                                        <option value="" disabled={true}>{t("Veillez choisir le Sexe")}</option>
                                                        <option value="F">{t("Féminin")}</option>
                                                        <option value="M">{t("Masculin")}</option>
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
                                                    <label htmlFor="telephone">{t("Votre Téléphone(s)")}</label>
                                                    <TagsInput value={data.telephone || []} onChange={onChangeTelephone} />
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
                                                    <label htmlFor="email">Votre Email(s)</label>
                                                    <TagsInput value={data.email || []} onChange={onChangeEmail} />
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
                                                    <label htmlFor="ville">{t("Votre ville")}</label>
                                                    <input
                                                        id="ville"
                                                        type="text"
                                                        className={error?.ville.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer votre ville")}
                                                        value={data.ville || ""}
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
                                            <div className={"form-group"}>
                                                <div className={"form-group"}>
                                                    <label htmlFor="position">{t("Position")}</label>
                                                    <Select
                                                        value={position}
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
                                            </div>

                                            <div className={"form-group row"}>
                                                {
                                                    verifyPermission(props.userPermissions, 'store-staff-from-any-unit') || verifyPermission(props.userPermissions, 'update-staff-from-any-unit') || verifyPermission(props.userPermissions, 'store-staff-from-maybe-no-unit') || verifyPermission(props.userPermissions, 'update-staff-from-maybe-no-unit') ? (
                                                        <div className="col">
                                                            <label htmlFor="institution">{t("Institution")}</label>
                                                            <div className={error?.institution_id.length ? 'is-invalid' : ''}>
                                                                <Select
                                                                    value={institution}
                                                                    onChange={onChangeInstitution}
                                                                    options={formatSelectOption(formatInstitutions(institutions), "name", false)}
                                                                />
                                                            </div>
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

                                                <div className="col">
                                                    <label htmlFor="unit">{t("Unité")}</label>
                                                    <div className={error?.unit_id.length ? 'is-invalid' : ''}>
                                                        <Select
                                                            value={unit}
                                                            onChange={onChangeUnit}
                                                            options={formatSelectOption(units, "name", "fr")}
                                                        />
                                                    </div>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            {
                                !startRequest ? (
                                    <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{t("Envoyer")}</button>
                                ) : (
                                    <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                        {t("Chargement")}...
                                    </button>
                                )
                            }
                            <button id="closeConfirmSaveForm" style={{display: "none"}} type="button" className="btn btn-secondary" data-dismiss="modal">{t("Fermer")}</button>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default ConfirmSaveForm;