import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {
    Link,
    useParams
} from "react-router-dom";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig, toastEditSuccessMessageConfig, toastErrorMessageWithParameterConfig,
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import Select from "react-select";
import TagsInput from "react-tagsinput";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";
import InputRequire from "./InputRequire";
import {formatSelectOption} from "../../helpers/function";

const endPointConfig = {
    PRO: {
        plan: "PRO",
        list: `${appConfig.apiDomaine}/my/reporting-claim/config`,
    },
    MACRO: {
        holding: {
            list: `${appConfig.apiDomaine}/any/reporting-claim/config`,
        },
        filial: {
            list: `${appConfig.apiDomaine}/my/reporting-claim/config`,
        }
    },

};

const ConfigRapportAutoForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'config-reporting-claim-any-institution'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'list-config-reporting-claim-my-institution'))
            endPoint = endPointConfig[props.plan].filial
    } else {
        endPoint = endPointConfig[props.plan]
    }

    const defaultData = {
        institution_id: "",
        period: "",
        staffs: [],
        reporting_type: ""
    };
    const defaultError = {
        institution_id: "",
        period: [],
        staffs: [],
        reporting_type: [],
    };
    const [load, setLoad] = useState(false);
    const [isLoad, setIsLoad] = useState(true)
    const [data, setData] = useState(defaultData);
    const [periodData, setPeriodData] = useState([]);
    const [period, setPeriod] = useState(null);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [disabledInput, setDisabledInput] = useState(false);
    const [institution, setInstitution] = useState(null);
    const [type, setType] = useState(null);
    const [types, setTypes] = useState([]);
    const [staff, setStaff] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [institutions, setInstitutions] = useState(null);

    const getReportingType = (data, key) =>{
        for ( let i = 0; i < data?.length ? data.length : ""; i ++){
            if (data[i].value === key) {
                //console.log(data[i])
                return data[i];
            }
        }
    }

    useEffect(() => {
        if (verifyTokenExpire()) {
            setLoad(true);
            setIsLoad(true);
            if (id) {
                axios.get(endPoint.list + `/${id}/edit`)
                    .then(response => {
                        //console.log("réponse obtenue", response.data)
                        let selectedStaffs = [];
                        for (let i = 0; i < response.data.staffs.length ; i ++) {
                            response.data.staffs[i].label= response.data.staffs[i].identite.firstname + " " + response.data.staffs[i].identite.lastname;
                            response.data.staffs[i].value= response.data.staffs[i].id;
                        }
                        for (let i = 0; i < response.data.reportingTask.staffs.length ; i ++) {
                            response.data.reportingTask.staffs[i].label= response.data.reportingTask.staffs[i].identite.firstname + " " + response.data.reportingTask.staffs[i].identite.lastname;
                            response.data.reportingTask.staffs[i].value= response.data.reportingTask.staffs[i].id;
                            selectedStaffs.push(response.data.reportingTask.staffs[i]);
                        }

                        setStaffs(response.data.staffs);
                        setStaff(selectedStaffs);

                        setPeriodData(response.data.period);
                        setPeriod(response.data.reportingTask.period_tag);

                        setType(getReportingType(response.data.types, response.data.reportingTask.reporting_type));
                        console.log("console", response.data)
                        setTypes(response.data.reportingTask.types);
                        //setTypes(response.data.reportingTask.reporting_type);

                       if (response.data.reportingTask.institution_targeted_id !== null) {
                            setInstitutions(response.data.institutions);
                            setTypes(response.data.types);
                            setInstitution({value: response.data.reportingTask.institution_targeted.id, label: response.data.reportingTask.institution_targeted.name});

                        }
                        let selectedStaffIds = [];
                       for ( let i = 0; i < selectedStaffs.length; i ++){
                           selectedStaffIds.push(selectedStaffs[i].id);
                       }
                        const newForm = {
                            reporting_type: response.data.reportingTask.reporting_type,
                            staffs: selectedStaffIds,
                            period: response.data.reportingTask.period,
/*
                            institution_id:response.data.reportingTask.institution_targeted_id!==null?response.data.reportingTask.institution_targeted_id:""
*/
                        };

                        setData(newForm);
                        setLoad(false);
                        setIsLoad(false)

                    })
            }
            axios.get(endPoint.list + `/create`)
                .then(response => {
                    let options =
                        response.data.institutions && response.data.institutions.length ? response.data.institutions.map(institution => ({
                            value: institution.id, label: institution.name
                        })) : ""
                    ;
                    setInstitutions(options);
                    for (var i = 0; i < response.data.staffs.length ; i ++) {
                        response.data.staffs[i].label= response.data.staffs[i].identite.firstname + " " + response.data.staffs[i].identite.lastname;
                        response.data.staffs[i].value= response.data.staffs[i].id;
                    }
                    setStaffs(response.data.staffs);
                    setTypes(response.data.types);
                    setPeriodData(response.data.period);
                    setLoad(false);
                    setIsLoad(false);


                })
            ;
        }
    }, []);

    const onChangePeriod = (selected) => {
        const newData = {...data};
        newData.period = selected.value;
        setPeriod(selected);
        setData(newData);
    };

    const onChangeStaff = (selected) => {
        //console.log(selected)
        var staffToSend = selected.map( item => item.value)
        const newData = {...data};
        newData.staffs = staffToSend;
        setStaff(selected);
        setData(newData);
    };

    const handleDisabledInputChange = () => {
        setDisabledInput(!disabledInput);
    };
    const onChangeInstitution = (selected) => {
        const newData = {...data};
        if (selected) {
            newData.institution_id = selected.value;
            setInstitution(selected);
        } else setInstitution(null);
        setData(newData);
    };

    const onChangeType = (selected) => {
        const newData = {...data};
        if (selected) {
            newData.reporting_type = selected.value;
            setType(selected);
        } else setType(null);
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (id) {
                axios.put(endPoint.list + `/${id}`, data)
                    .then(response => {
                        setStartRequest(false);
                        setError(defaultError);
                        setData(defaultData);
                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                        window.location.href="/settings/rapport-auto"
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError({...defaultError, ...error.response.data.error});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig());

                    })
                ;
            } else {
                delete data.institution_id;
                axios.post(endPoint.list, data)
                    .then(response => {
                        setStaff([]);
                        setType([]);
                        setPeriod("");
                        setStartRequest(false);
                        setError(defaultError);
                        setData(defaultData);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError({...defaultError, ...error.response.data.error});
                         if (error.response.status === 404 ){
                         ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.error));
                          } else {
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
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to="/settings/clients/category" className="kt-subheader__breadcrumbs-link">
                                    {t("Rapport Automatique")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()}
                                   className="kt-subheader__breadcrumbs-link">
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
                                                id ? t("Modification des rapports automatiques") : t("Ajout des rapports automatiques")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-portlet__body">
                                        <div className="tab-content">
                                            <div className="tab-pane active" id="kt_user_edit_tab_1" role="tabpanel">
                                                <div className="kt-form kt-form--label-right">
                                                    <div className="kt-form__body">
                                                        <div className="kt-section kt-section--first">
                                                            <div className="kt-section__body">

                                                                {
                                                                    props.plan !== "PRO" ? (
                                                                        <div className="form-group row">
                                                                            <label className="col-xl-3 col-lg-3 col-form-label"
                                                                                   htmlFor="institution">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    value={disabledInput}
                                                                                    onChange={handleDisabledInputChange}/>
                                                                                <span/> {t("Toutes les institutions")}<span/></label>
                                                                            <div className="col-lg-9 col-xl-6">
                                                                                <Select
                                                                                    isClearable
                                                                                    isDisabled={disabledInput}
                                                                                    placeholder={t("Veuillez sélectionner une institution")}
                                                                                    value={institution}
                                                                                    onChange={onChangeInstitution}
                                                                                    options={institutions?institutions.map(institution=>institution):""}
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                    ) : null
                                                                }

                                                                <div
                                                                    className={error.period.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="exampleSelect1">{t("Période(s)")} <InputRequire /></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                            <Select
                                                                                value={period}
                                                                                onChange={onChangePeriod}
                                                                                options={periodData }
                                                                                isLoading={isLoad}
                                                                            />
                                                                        {
                                                                            error.period.length ? (
                                                                                error.period.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={error.staffs.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="staff">{t("Agent(s)")} <InputRequire /> </label>
                                                                    <div className=" col-lg-9 col-xl-6">
                                                                        <Select
                                                                            isClearable
                                                                            isMulti
                                                                            placeholder={t("Veuillez sélectionner les agents")}
                                                                            value={staff}
                                                                            isLoading={isLoad}
                                                                            onChange={onChangeStaff}
                                                                            options={staffs}
                                                                        />
                                                                        {
                                                                            error.staffs.length ? (
                                                                                error.staffs.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>

                                                                </div>


                                                                <div
                                                                    className={error.reporting_type.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="rapport">
                                                                        {t("Rapport")} <InputRequire />
                                                                    </label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <Select
                                                                            isClearable
                                                                            placeholder={t("Veuillez sélectionner le rapport")}
                                                                            value={type}
                                                                            isLoading={isLoad}
                                                                            onChange={onChangeType}
                                                                            options={types}
                                                                        />
                                                                        {
                                                                            error.reporting_type.length ? (
                                                                                error.reporting_type.map((error, index) => (
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



                                                            <div className="kt-portlet__foot">
                                                                <div className="kt-form__actions text-right">
                                                                    {
                                                                        !startRequest ? (
                                                                            <button type="submit"
                                                                                    onClick={(e) => onSubmit(e)}
                                                                                    className="btn btn-primary">{t("Enregistrer")}</button>
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
                                                                            <Link to="/settings/rapport-auto"
                                                                                  className="btn btn-secondary mx-2">
                                                                                {t("Quitter")}
                                                                            </Link>
                                                                        ) : (
                                                                            <Link to="/settings/rapport-auto"
                                                                                  className="btn btn-secondary mx-2"
                                                                                  disabled>
                                                                                {t("Quitter")}
                                                                            </Link>
                                                                        )
                                                                    }

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
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, 'list-config-reporting-claim-my-institution') ? (
                printJsx()
            ) : null
        ) : null
    );

};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        plan: state.plan.plan,
    }
};

export default connect(mapStateToProps)(ConfigRapportAutoForm);
