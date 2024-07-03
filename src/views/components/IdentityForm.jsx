import React, {useEffect, useState} from "react";
import TagsInput from "react-tagsinput";
import './staff/react-tagsinput.css';
import {connect} from "react-redux";
import {addIdentity} from "../../store/actions/IdentityAction";
import axios from "axios";
import appConfig from "../../config/appConfig";
import Select from "react-select";
import {
    useParams
} from "react-router-dom";
import {verifyPermission} from "../../helpers/permission";
import InputRequire from "./InputRequire";
import {useTranslation} from "react-i18next";

const endPointConfig = {
    PRO: {
        plan: "PRO",
        list: `${appConfig.apiDomaine}/my/clients`,
    },
    MACRO: {
        holding: {
            list: `${appConfig.apiDomaine}/any/clients`,
        },
        filial: {
            list: `${appConfig.apiDomaine}/my/clients`,
        }
    },

};

const IndentiteForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'store-client-from-any-institution'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'store-client-from-my-institution'))
            endPoint = endPointConfig[props.plan].filial
    } else {
        endPoint = endPointConfig[props.plan]
    }
    const defaultData = {
        firstname: "",
        lastname: "",
        sexe: "",
        ville: "",
        telephone: [],
        email: [],
        client_id: [],
        institution_id: []
    };
    const defaultError = {
        firstname: [],
        lastname: [],
        sexe: [],
        ville: [],
        telephone: [],
        email: [],
        client_id: [],
        institution_id: []
    };
    const [data, setData] = useState(props.getLoading ? props.getIdentite : defaultData);
    const [error] = useState(defaultError);
    const [nameClient, setNameClient] = useState([]);
    const [client, setClient] = useState([]);
    const [institutionData, setInstitutionData] = useState(undefined);
    const [institution, setInstitution] = useState([]);
    const [disableInput,setDisableInput]=useState(true);

    useEffect(() => {
        if(verifyPermission(props.userPermissions,'store-client-from-my-institution')){
        axios.get(endPoint.list)
            .then(response => {
                const options = [
                    response.data? response.data.map((client) => ({
                        value: client.client_id,
                        label: client.client.identite.firstname + ' ' + client.client.identite.lastname
                    })) : ""
                ];
                setNameClient(options);
            });
        }
        axios.get(appConfig.apiDomaine + `/any/clients/create`)
            .then(response => {
                const options = [
                    response.data.institutions.length ? response.data.institutions.map((institution) => ({
                        value: institution.id,
                        label: institution.name
                    })) : ""
                ];
                setInstitutionData(options);
            });
    }, []);
    const onChangeFirstName = (e) => {
        const newData = {...data};
        newData.firstname = e.target.value;
        setData(newData);
        props.addIdentite(newData)
    };

    const onChangeLastName = (e) => {
        const newData = {...data};
        newData.lastname = e.target.value;
        setData(newData);
        props.addIdentite(newData)
    };

    const onChangeTelephone = (tel) => {
        const newData = {...data};
        newData.telephone = tel;
        setData(newData);
        props.addIdentite(newData)
    };

    const onChangeSexe = (e) => {
        const newData = {...data};
        newData.sexe = e.target.value;
        setData(newData);
        props.addIdentite(newData)
    };
    const onChangeEmail = (mail) => {
        const newData = {...data};
        newData.email = mail;
        setData(newData);
        props.addIdentite(newData)
    };
    const onChangeVille = (e) => {
        const newData = {...data};
        newData.ville = e.target.value;
        setData(newData);
        props.addIdentite(newData)
    };
    const onChangeInstitution = (selected) => {
        const newData = {...data};
        newData.institution_id = selected.value;
        setInstitution(selected);
        props.addIdentite(selected);
        axios.get(appConfig.apiDomaine + `/any/clients/${newData.institution_id}/institutions`)
            .then(response => {
                //console.log(response.data, "CLIENT D'UNE INSTITUTION");
                const options = [
                    response.data ? response.data.map((client) => ({
                        value: client.client_id,
                        label: client.client.identite.firstname + ' ' + client.client.identite.lastname
                    })) : ""
                ];
                    setNameClient(options);
            });

        setData(newData);
        setDisableInput(false)
    };


    const onChangeClient = (selected) => {
        const newData = {...data};
        newData.client_id = selected.value;
        setClient(selected);
        setData(newData);
        props.addIdentite(selected);
        axios.get(endPoint.list + `/${newData.client_id}`)
            .then(response => {
                //console.log(response.data,"IDENTITE")
                const newIdentity = {
                    firstname: response.data.client.identite.firstname,
                    lastname: response.data.client.identite.lastname,
                    sexe: response.data.client.identite.sexe,
                    telephone: response.data.client.identite.telephone,
                    email: response.data.client.identite.email,
                    ville: response.data.client.identite.ville === null ? "" : response.data.client.identite.ville,
                    client_id: response.data.client_id,
                    institution_id:response.data.institution_id
                };
                setData(newIdentity);
                props.addIdentite(newIdentity);

            });
    };

    return (
        ready ? (
            <div>
                <div className="kt-portlet__body">
                    <div className="kt-section kt-section--first">
                        <h5 className="kt-section__title kt-section__title-lg">{t("Identité")}:</h5>
                        {!id ?
                            <div className="form-group row">
                                {
                                    verifyPermission(props.userPermissions, "store-client-from-any-institution") ?
                                        <div
                                            className={error.institution_id.length ? "col validated" : "col"}>
                                            <label htmlFor="exampleSelect1"> {t("Institution")}</label>
                                            {institutionData ? (
                                                <Select
                                                    value={institution}
                                                    placeholder={t("Veuillez selectionner l'institution")}
                                                    onChange={onChangeInstitution}
                                                    options={institutionData.length ? institutionData[0].map(name => name) : ''}
                                                />
                                            ) : (
                                                <select name="category"
                                                        className={error.institution_id.length ? "form-control is-invalid" : "form-control"}
                                                        id="category">
                                                    <option value=""/>
                                                </select>
                                            )
                                            }

                                            {
                                                error.institution_id.length ? (
                                                    error.institution_id.map((error, index) => (
                                                        <div key={index} className="invalid-feedback">
                                                            {error}
                                                        </div>
                                                    ))
                                                ) : ""
                                            }
                                        </div>
                                        : ""
                                }
                                <div
                                    className={error.client_id.length ? "col validated" : "col"}>
                                    <label htmlFor="exampleSelect1"> {t("Client")}</label>
                                    {nameClient ? (
                                        <Select
                                            placeholder={t("Veuillez selectionner le client")}
                                            value={client}
                                            onChange={onChangeClient}
                                            options={nameClient.length ? nameClient[0].map(name => name) : ''}
                                        />
                                    ) : (<select name="category"
                                                 className={error.client_id.length ? "form-control is-invalid" : "form-control"}
                                                 id="category">
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
                                        ) : ""
                                    }
                                </div>
                            </div>
                            : ""
                        }
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
                                    disabled={props.getDisable ? props.getDisable : false}
                                />
                                {
                                    error.lastname.length ? (
                                        error.lastname.map((error, index) => (
                                            <div key={index} className="invalid-feedback">
                                                {error}
                                            </div>
                                        ))
                                    ) : ""
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
                                    disabled={props.getDisable ? props.getDisable : false}
                                />
                                {
                                    error.firstname.length ? (
                                        error.firstname.map((error, index) => (
                                            <div key={index} className="invalid-feedback">
                                                {error}
                                            </div>
                                        ))
                                    ) : ""
                                }
                            </div>
                        </div>

                        <div className="form-group row">
                            <div className={error.sexe.length ? " col validated" : "col"}>
                                <label htmlFor="sexe">{t("Sexe")} <InputRequire/></label>
                                <select
                                    id="sexe"
                                    className={error.sexe.length ? "form-control is-invalid" : "form-control"}
                                    value={data.sexe}
                                    onChange={(e) => onChangeSexe(e)}
                                    disabled={props.getDisable ? props.getDisable : false}
                                >
                                    <option value="" disabled={true}>{t("Veuillez choisir le Sexe")}
                                    </option>
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
                                    ) : ""
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
                                    ) : ""
                                }
                            </div>
                        </div>

                        <div className="form-group row">
                            <div className={error.telephone.length ? "col validated" : "col"}>
                                <label htmlFor="telephone"> {t("Téléphone(s)")} <InputRequire/></label>
                                <TagsInput
                                    value={data.telephone}
                                    onChange={onChangeTelephone}
                                    disabled={props.getDisable ? props.getDisable : false}
                                    inputProps={{className: "react-tagsinput-input", placeholder: t("Numéro(s)")}}
                                />
                                {
                                    error.telephone.length ? (
                                        error.telephone.map((error, index) => (
                                            <div key={index} className="invalid-feedback">
                                                {error}
                                            </div>
                                        ))
                                    ) : ""
                                }
                            </div>

                            <div className={error.email.length ? "col validated" : "col"}>
                                <label htmlFor="email">Email(s) <InputRequire/></label>
                                <TagsInput
                                    value={data.email}
                                    onChange={onChangeEmail}
                                    disabled={props.getDisable ? props.getDisable : false}
                                    inputProps={{className: "react-tagsinput-input", placeholder: "Email(s)"}}
                                />
                                {
                                    error.email.length ? (
                                        error.email.map((error, index) => (
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
        ) : null
    )
};
const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        identite: state.identite,
        plan: state.plan.plan,
    }
};

export default connect(mapStateToProps, {addIdentite: addIdentity})(IndentiteForm);
