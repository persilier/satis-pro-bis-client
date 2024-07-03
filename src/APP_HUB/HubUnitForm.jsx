import React, {useState, useEffect} from "react";
import axios from "axios";
import {
    useParams,
    Link
} from "react-router-dom";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig
} from "../config/toastConfig";
import {ToastBottomEnd} from "../views/components/Toast";
import Select from "react-select";
import {formatSelectOption} from "../helpers/function";
import appConfig from "../config/appConfig";
import FormInformation from "../views/components/FormInformation";
import {useTranslation} from "react-i18next";

const HubUnitForm = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const [unitTypes, setUnitTypes] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [unitType, setUnitType] = useState({});
    const [institution, setInstitution] = useState({});

    const {id} = useParams();
    const defaultData = {
        name: "",
        description: "",
        unit_type_id: unitTypes.length ? unitTypes[0].id : "",
        institution_id: institutions.length ? institutions[0].id : ""
    };
    const defaultError = {
        name: [],
        description: [],
        unit_type_id: [],
        institution_id: []
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        if (id) {
            axios.get(`${appConfig.apiDomaine}/units/${id}/edit`)
                .then(response => {
                    const newData = {
                        name: response.data.unit.name.fr,
                        description: response.data.unit.description.fr,
                        unit_type_id: response.data.unit.unit_type_id,
                        institution_id: response.data.unit.institution_id
                    };
                    setUnitType({value: response.data.unit.unit_type.id, label: response.data.unit.unit_type.name["fr"]});
                    setInstitution({value: response.data.unit.institution.id, label: response.data.unit.institution.name});
                    setUnitTypes(formatSelectOption(response.data.unitTypes, "name", "fr"));
                    setInstitutions(formatSelectOption(response.data.institutions, "name", false));
                    setData(newData);
                })
                .catch(error => {
                    console.log("Something is wrong");
                })
            ;
        } else {
            axios.get(`${appConfig.apiDomaine}/units/create`)
                .then(response => {
                    const newData = {...data};
                    newData.institution_id = "";
                    newData.unit_type_id = "";
                    setUnitTypes(formatSelectOption(response.data.unitTypes, "name", "fr"));
                    setInstitutions(formatSelectOption(response.data.institutions, "name", false));
                    setData(newData);
                })
                .catch(error => {
                    console.log("something is wrong");
                })
            ;
        }
    }, []);

    const onChangeName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };

    const onChangeDescription = (e) => {
        const newData = {...data};
        newData.description = e.target.value;
        setData(newData);
    };

    const onChangeUnitType = (selected) => {
        const newData = {...data};
        newData.unit_type_id = selected.value;
        setUnitType(selected);
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
        if (id) {
            axios.put(`${appConfig.apiDomaine}/units/${id}`, data)
                .then(response => {
                    setStartRequest(false);
                    setError(defaultError);
                    ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                })
                .catch(errorRequest => {
                    setStartRequest(false);
                    setError({...defaultError, ...errorRequest.response.data.error});
                    ToastBottomEnd.fire(toastEditErrorMessageConfig());
                })
            ;
        } else {
            axios.post(`${appConfig.apiDomaine}/units`, data)
                .then(response => {
                    setStartRequest(false);
                    setInstitution({});
                    setUnitType({});
                    setError(defaultError);
                    setData(defaultData);
                    ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                })
                .catch(errorRequest => {
                    setStartRequest(false);
                    setError({...defaultError, ...errorRequest.response.data.error});
                    ToastBottomEnd.fire(toastAddErrorMessageConfig());
                })
            ;
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
                               <a href="#" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                               <span className="kt-subheader__breadcrumbs-separator"/>
                               <Link to="/settings/unit" className="kt-subheader__breadcrumbs-link">
                                   {t("Unité")}
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
                                               id ? t("Modification d'unité") : t("Ajout d'unité")
                                           }
                                       </h3>
                                   </div>
                               </div>

                               <form method="POST" className="kt-form">
                                   <div className="kt-form kt-form--label-right">
                                       <div className="kt-portlet__body">
                                           <FormInformation information={"The example form below demonstrates common HTML form elements that receive updated styles from Bootstrap with additional classes."}/>

                                           <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                               <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Nom de l'unité")}</label>
                                               <div className="col-lg-9 col-xl-6">
                                                   <input
                                                       id="name"
                                                       type="text"
                                                       className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                       placeholder={t("Veuillez entrer le nom de l'unité")}
                                                       value={data.name}
                                                       onChange={(e) => onChangeName(e)}
                                                   />
                                                   {
                                                       error.name.length ? (
                                                           error.name.map((error, index) => (
                                                               <div key={index} className="invalid-feedback">
                                                                   {error}
                                                               </div>
                                                           ))
                                                       ) : ""
                                                   }
                                               </div>
                                           </div>

                                           <div className={error.unit_type_id.length ? "form-group row validated" : "form-group row"}>
                                               <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="unit_type">{t("Type d'unité")}</label>
                                               <div className="col-lg-9 col-xl-6">
                                                   <Select
                                                       value={unitType}
                                                       onChange={onChangeUnitType}
                                                       options={unitTypes}
                                                   />
                                                   {
                                                       error.unit_type_id.length ? (
                                                           error.unit_type_id.map((error, index) => (
                                                               <div key={index} className="invalid-feedback">
                                                                   {error}
                                                               </div>
                                                           ))
                                                       ) : ""
                                                   }
                                               </div>
                                           </div>

                                           <div className={error.description.length ? "form-group row validated" : "form-group row"}>
                                               <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="description">{t("La description")}</label>
                                               <div className="col-lg-9 col-xl-6">
                                                <textarea
                                                    id="description"
                                                    className={error.description.length ? "form-control is-invalid" : "form-control"}
                                                    placeholder={t("Veuillez entrer la description")}
                                                    cols="30"
                                                    rows="5"
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
                                                       ) : ""
                                                   }
                                               </div>
                                           </div>
                                       </div>
                                       <div className="kt-portlet__foot">
                                           <div className="kt-form__actions text-right">
                                               {
                                                   !startRequest ? (
                                                       <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{t("Envoyer")}</button>
                                                   ) : (
                                                       <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                           {t("Chargement")}...
                                                       </button>
                                                   )
                                               }
                                               {
                                                   !startRequest ? (
                                                       <Link to="/settings/unit" className="btn btn-secondary mx-2">
                                                           {t("Quitter")}
                                                       </Link>
                                                   ) : (
                                                       <Link to="/settings/unit" className="btn btn-secondary mx-2" disabled>
                                                           {t("Quitter")}
                                                       </Link>
                                                   )
                                               }
                                           </div>
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

export default HubUnitForm;
