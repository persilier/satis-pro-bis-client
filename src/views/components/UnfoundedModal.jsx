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

const UnfoundedModal = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const defaultData = {
        unfounded_reason: "",
        solution_communicated: "",
    };
    const defaultError = {
        unfounded_reason: [],
        solution_communicated: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        if (props.activeTreatment) {
            setData({
                unfounded_reason: props.activeTreatment.unfounded_reason ? props.activeTreatment.unfounded_reason : "",
                solution_communicated: props.activeTreatment.solution_communicated ? props.activeTreatment.solution_communicated : ""

            });
        }
    }, [props.activeTreatment]);

    const onChangeDescription = (e) => {
        const newData = {...data};
        newData.unfounded_reason = e.target.value;
        setData(newData);
    };

    const onChangeSolution = (e) => {
        const newData = {...data};
        newData.solution_communicated = e.target.value;
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (verifyPermission(props.userPermissions, "unfounded-claim-awaiting-assignment")){
                axios.put(appConfig.apiDomaine + `/claim-awaiting-assignment/${props.getId}/unfounded`, data)
                    .then(response => {
                        setStartRequest(false);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                        window.location.href="/process/claim-assign"
                    }).catch(error => {
                    setStartRequest(false);
                    setError({...defaultError,...error.response.data.error});
                    ToastBottomEnd.fire(toastAddErrorMessageConfig());
                })
            }else{
                axios.put(appConfig.apiDomaine + `/claim-assignment-staff/${props.getId}/unfounded`, data)
                    .then(response => {
                        setStartRequest(false);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                        window.location.href="/process/claim-assign/to-staff"
                    }).catch(error => {
                    setStartRequest(false);
                    setError({...defaultError,...error.response.data.error});
                    ToastBottomEnd.fire(toastAddErrorMessageConfig());
                })
            }
        }
    };
    return (
        ready ? (
            <div>
                <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog"
                     aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">{t("Réclamation non Fondée")}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div
                                    className={error.unfounded_reason.length ? "form-group validated" : "form-group"}>
                                    <label htmlFor="description">{t("Motif")} <span style={{color:"red"}}>*</span></label>
                                    <textarea
                                        id="description"
                                        className={error.unfounded_reason.length ? "form-control is-invalid" : "form-control"}
                                        placeholder={t("Veuillez entrer la description du motif")}
                                        cols="62"
                                        rows="7"
                                        value={data.unfounded_reason}
                                        onChange={(e) => onChangeDescription(e)}
                                    />
                                    {
                                        error.unfounded_reason.length ? (
                                            error.unfounded_reason.map((error, index) => (
                                                <div key={index}
                                                     className="invalid-feedback">
                                                    {error}
                                                </div>
                                            ))
                                        ) : ""
                                    }
                                </div>
                                {
                                    verifyPermission(props.userPermissions, "unfounded-claim-awaiting-assignment")?(
                                        <div
                                            className={error.solution_communicated.length ? "form-group validated" : "form-group"}>
                                            <label htmlFor="description">{t("Solution")} <span style={{color:"red"}}>*</span></label>
                                            <textarea
                                                id="description"
                                                className={error.solution_communicated.length ? "form-control is-invalid" : "form-control"}
                                                placeholder={t("Message à communiquer au client")}
                                                cols="30"
                                                rows="7"
                                                value={data.solution_communicated}
                                                onChange={(e) => onChangeSolution(e)}
                                            />
                                            {
                                                error.solution_communicated.length ? (
                                                    error.solution_communicated.map((error, index) => (
                                                        <div key={index}
                                                             className="invalid-feedback">
                                                            {error}
                                                        </div>
                                                    ))
                                                ) : ""
                                            }

                                        </div>
                                    ):""
                                }

                            </div>
                            <div className="modal-footer">

                                {
                                    !startRequest ? (
                                        <button type="submit"
                                                onClick={(e) => onSubmit(e)}
                                                className="btn btn-primary">{("Enregistrer")}</button>
                                    ) : (
                                        <button
                                            className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                            type="button" disabled>
                                            {t("Chargement")}...
                                        </button>
                                    )
                                }

                                <button type="button" className="btn btn-secondary" data-dismiss="modal">{t("Quitter")}</button>

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

    };
};

export default connect(mapStateToProps)(UnfoundedModal);
