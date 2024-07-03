import React, {useState} from "react";
import axios from "axios";
import appConfig from "../../config/appConfig";
import {ToastBottomEnd} from "./Toast";
import {
    toastAssignClaimSuccessMessageConfig,
    toastErrorMessageWithParameterConfig,
    toastRejectTreatmentClaimSuccessMessageConfig,
    toastValidateTreatmentClaimSuccessMessageConfig
} from "../../config/toastConfig";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const ReasonModal = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const [description, setDescription] = useState("");
    const [startRequest, setStartRequest] = useState(false);
    const [error, setError] = useState([]);

    const sendData = () => {
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (props.action === "reject") {
                axios.put(`${appConfig.apiDomaine}/claim-awaiting-treatment/${props.id}/rejected`, {rejected_reason: description})
                    .then(response => {
                        setStartRequest(false);
                        ToastBottomEnd.fire(toastAssignClaimSuccessMessageConfig());
                        window.location.href = `/process/unit-claims-pending`
                    })
                    .catch(error => {
                        setStartRequest(false);
                        if (error.response.data.code === 403) {
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t('Vous ne pouvez pas effectuer cette opération.') + t('Le nombre tolérable est dépassé')))
                        } else {
                            setError(error.response.data.error.rejected_reason);
                        }
                    })
                ;
            } else if(props.action === "validateReject") {
                let endpoint = ``;
                if (props.plan === "MACRO" || props.plan === "PRO")
                    endpoint = `${appConfig.apiDomaine}/claim-awaiting-validation-my-institution/${props.id}/invalidate`;
                else if(props.plan === "HUB")
                    endpoint = `${appConfig.apiDomaine}/claim-awaiting-validation-any-institution/${props.id}/invalidate`;
                axios.put(endpoint, {invalidated_reason: description})
                    .then(response => {
                        setStartRequest(false);
                        ToastBottomEnd.fire(toastRejectTreatmentClaimSuccessMessageConfig());
                        window.location.href = `/process/claim-pending-to-validated`
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError(error.response.data.error.invalidated_reason);
                    })
                ;
            } else if(props.action === "validateSolution") {
                let endpoint = "";
                if (props.plan === "MACRO" || props.plan === "PRO")
                    endpoint = `${appConfig.apiDomaine}/claim-awaiting-validation-my-institution/${props.id}/validate`;
                else if(props.plan === "HUB")
                    endpoint = `${appConfig.apiDomaine}/claim-awaiting-validation-any-institution/${props.id}/validate`;
                axios.put(endpoint, {solution_communicated: description})
                    .then(response => {
                        setStartRequest(false);
                        ToastBottomEnd.fire(toastValidateTreatmentClaimSuccessMessageConfig());
                        window.location.href = `/process/claim-pending-to-validated`
                    })
                    .catch(error => {
                        setStartRequest(false);
                        setError(error.response.data.error.solution_communicated);
                    })
                ;
            }
        }
    };

    return (
        ready ? (
            <div className="modal fade show" id="kt_modal_4_2" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" style={{display: "block", paddingRight: "17px"}} aria-modal="true">
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{props.reasonTitle}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"/>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className={error?.length ? "form-group validated" : ""}>
                                    <label htmlFor="message-text" className="form-control-label">{props.reasonLabel}:</label>
                                    <textarea
                                        className={error?.length ? "form-control is-invalid" : "form-control"}
                                        id="message-text"
                                        placeholder={t("Veuillez entrer le message à communiquer au réclamant")}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                    {
                                        error?.map((error, index) => (
                                            <div key={index} className="invalid-feedback">
                                                {error}
                                            </div>
                                        ))
                                    }
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button id={"close-button-reason"} type="button" className="btn btn-secondary" data-dismiss="modal" onClick={() => props.onClose()}>{t("Fermer")}</button>
                            {
                                !startRequest ? (
                                    <button type="button" className="btn btn-primary" onClick={() => sendData()}>{t("Envoyer")}</button>
                                ) : (
                                    <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                        {t("Chargement")}...
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        ) : null

    );
};

export default ReasonModal;
