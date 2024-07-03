import React, {useEffect, useState} from "react";
import axios from "axios";
import appConfig from "../../config/appConfig";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
} from "../../config/toastConfig";
import {verifyPermission} from "../../helpers/permission";
import {connect} from "react-redux";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";
import Select from "react-select";
import InputRequire from "./InputRequire";
import {ERROR_401} from "../../config/errorPage";

const CreateCommitteeSpecific = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const defaultData = {
        name: "",
        type: "specific",
        members: [],
        claim_id: props.getId
    };
    const defaultError = {
        name: [],
        members: [],
        claim_id: []
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [disabledInput, setDisabledInput] = useState(false);
    const [startRequest, setStartRequest] = useState(false);
    const [staff, setStaff] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [load, setLoad] = useState(false);
    const [isLoad, setIsLoad] = useState(true)

    if (!(verifyPermission(props.userPermissions, "store-treatment-board") && props.activePilot))
        window.location.href = ERROR_401;

    useEffect(() => {
        if (verifyTokenExpire()) {
            setIsLoad(true);
            axios.get(`${appConfig.apiDomaine}/treatments-boards/create`)
                .then(response => {
                    for (var i = 0; i < response.data.staff.length; i++) {
                        response.data.staff[i].label = response.data.staff[i].identite.firstname + " " + response.data.staff[i].identite.lastname;
                        response.data.staff[i].value = response.data.staff[i].id;
                    }
                    setStaffs(response.data.staff);
                    setIsLoad(false);
                })
                .catch(error => console.log(error))
            ;
        }
    }, [props.activeTreatment, props.getId]);


    const onChangeLastName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };

    const onChangeStaff = (selected) => {
        //console.log(selected)
        // setStaff(selected ?? []);
        console.log(selected)
        if (selected && Array.isArray(selected) && selected.length > 0) {
            var staffToSend = selected.map(item => item.value)
            const newData = {...data};
            newData.members = staffToSend;
            setStaff(selected);
            setData(newData);
        } else {
            setStaff([])
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (verifyPermission(props.userPermissions, "store-treatment-board")) {
                axios.post(appConfig.apiDomaine + `/treatments-boards`, data)
                    .then(response => {
                        setData(defaultData);
                        setError(defaultError)
                        setStartRequest(false);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                        window.location.href = "/process/claim-unsatisfied"
                    }).catch(error => {
                        setStartRequest(false);
                        setError({...defaultError, ...error.response?.data?.error});
                        ToastBottomEnd.fire(toastAddErrorMessageConfig());
                })
            }
        }
    };
    return (
        ready ? (
            <div>
                <div className="modal fade" id="exampleModalCommittee" tabIndex="-1" role="dialog"
                     aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title"
                                    id="exampleModalLabel">{t("Création du comité spécifique")}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">

                                {/*   <div className={error.closed_reason.length ? "form-group validated" : "form-group"}>
                                    <label htmlFor="description">{t("Motif")} <span style={{color:"red"}}>*</span></label>
                                    <textarea
                                        id="description"
                                        className={error.closed_reason.length ? "form-control is-invalid" : "form-control"}
                                        placeholder={t("Veuillez entrer la description du motif")}
                                        cols="62"
                                        rows="7"
                                        value={data.closed_reason}
                                        onChange={(e) => onChangeDescription(e)}
                                    />
                                    {
                                        error.closed_reason.length ? (
                                            error.closed_reason.map((error, index) => (
                                                <div key={index}
                                                     className="invalid-feedback">
                                                    {error}
                                                </div>
                                            ))
                                        ) : ""
                                    }
                                </div>*/}

                               {/* <div className="form-group row">*/}

                                    <div className={error.name?.length ? "form-group row validated" : "form-group "}  style={{padding: "0 9px", textAlign:"left"}}>
                                        <label
                                            htmlFor="name">{t("Nom")} {""}
                                            <InputRequire/> </label>
                                        <input
                                            disabled={disabledInput}
                                            id="name"
                                            type="text"
                                            className={error.name?.length ? "form-control is-invalid" : "form-control"}
                                            placeholder={"Veuillez entrer le nom du comité"}
                                            value={data.name}
                                            onChange={(e) => onChangeLastName(e)}
                                        />
                                        {
                                            error.name?.length ? (
                                                error.name.map((error, index) => (
                                                    <div key={index} className="invalid-feedback">
                                                        {error}
                                                    </div>
                                                ))
                                            ) : null
                                        }
                                    </div>


                                    <div
                                        className={error.members.length ? "form-group row validated" : "form-group "} style={{textAlign:"left"}}>
                                        <label
                                            className="col-xl-3 col-lg-3 col-form-label "
                                               htmlFor="staff">{t("Agent(s)")} <InputRequire/> </label>
                                        <div className={"col-xl-9"}>
                                            <Select
                                                isClearable
                                                isMulti
                                               // className={error.members.length ? " is-invalid col-xl-3 col-lg-3 col-form-label pl-0" : ""}
                                                placeholder={t("Veuillez sélectionner les agents")}
                                                value={staff}
                                                isLoading={isLoad}
                                                onChange={onChangeStaff}
                                                options={staffs}
                                            />
                                            {
                                                error.members.length ? (
                                                    error.members.map((error, index) => (
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
                            <div className="modal-footer">

                                {
                                    !startRequest ? (
                                        <button type="submit"
                                                onClick={(e) => onSubmit(e)}
                                                className="btn btn-primary">{("Transférer")}</button>
                                    ) : (
                                        <button
                                            className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                            type="button" disabled>
                                            {t("Chargement")}...
                                        </button>
                                    )
                                }

                                <button type="button" className="btn btn-secondary"
                                        data-dismiss="modal">{t("Quitter")}</button>

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
        activePilot: state.user.user.staff.is_active_pilot

    };
};

export default connect(mapStateToProps)(CreateCommitteeSpecific);
