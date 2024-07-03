import React, {useState} from "react";
import axios from "axios";
import appConfig from "../../config/appConfig";
import {ToastBottomEnd} from "./Toast";
import {
    toastErrorMessageWithParameterConfig,
    toastMergeSuccessMessageConfig,
} from "../../config/toastConfig";
import {formatDateToTimeStampte} from "../../helpers/function";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const FusionClaim = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const [startRequest, setStartRequest] = useState(false);
    const [choice, setChoice] = useState({
        original: false,
        duplicate: false
    });

    const changeKeepClaim = () => {
        if (!choice.original && !choice.duplicate)
            return null;
        if (choice.original && !choice.duplicate)
            return 1;
        if (!choice.original && choice.duplicate)
            return 0;
    }

    const onClickFusion = () => {
        if (choice.original || choice.duplicate) {
            setStartRequest(true);
            if (choice.original && choice.duplicate)
                ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veuillez choisir une seule réclamation")));
            else {
                setStartRequest(true);
                if (verifyTokenExpire()) {
                    axios.put(`${appConfig.apiDomaine}/claim-awaiting-assignment/${props.claim.id}/merge/${props.copyClaim.id}`, {keep_claim: changeKeepClaim()})
                        .then(response => {
                            ToastBottomEnd.fire(toastMergeSuccessMessageConfig());
                            setStartRequest(false);
                            document.getElementById("close-button").click();
                            window.location.href = `/process/claim-assign/${response.data.id}/detail`;
                        })
                        .catch(({response}) => {
                            if (response.data.error.keep_claim)
                                ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(response.data.error.keep_claim[0]));
                            setStartRequest(false);
                            //console.log("Something is wrong")
                        })
                    ;
                }
            }
        } else
            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(t("Veillez choisir la réclamation à conserver")));
    };

    const handleChoiceChange = (e) => {
        const newChoice = {...choice};
        if (e.target.id === "original")
            setChoice({...newChoice, original: e.target.checked, duplicate: !e.target.checked});
        else if(e.target.id === "duplicate")
            setChoice({...newChoice, duplicate: e.target.checked, original: !e.target.checked});
    };

    const onClickCloseButton = () => {
        document.getElementById("close-button").click();
        props.onCloseModal();
    };

    return (
        ready ? (
            <div className="modal fade" id="kt_modal_4" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{t("Fusion de réclamation")}</h5>
                            <button disabled={startRequest} onClick={() => onClickCloseButton()} type="button" className="close"/>
                        </div>
                        <div className="modal-body">
                            <form>
                                <table className="table table-bordered text-center">
                                    <thead>
                                    <tr>
                                        <th><strong>{t("Paramètre")}</strong></th>
                                        <th style={{width: "40%"}}><strong>{t("Réclamation")}</strong></th>
                                        <th style={{width: "40%"}}><strong>{t("Doublon")}</strong></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td><strong>{t("Réclamant")}</strong></td>
                                        <td>{props.claim.claimer ? `${props.claim.claimer.lastname} ${props.claim.claimer.firstname}` : "-"}</td>
                                        <td>{props.copyClaim.claimer ? `${props.copyClaim.claimer.lastname} ${props.copyClaim.claimer.firstname}` : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>{t("Montant réclamé")}</strong></td>
                                        <td>{props.claim.amount_disputed ? `${props.claim.amount_disputed} ${props.claim.amount_currency ? props.claim.amount_currency.name["fr"] : ""}` : "-"}</td>
                                        <td>{props.copyClaim.amount_disputed ? `${props.copyClaim.amount_disputed} ${props.copyClaim.amount_currency ? props.copyClaim.amount_currency.name["fr"] : ""}` : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>{t("Date de réception")}</strong></td>
                                        <td>{props.claim.created_at ? formatDateToTimeStampte(props.claim.created_at) : "-"}</td>
                                        <td>{props.copyClaim.created_at ? formatDateToTimeStampte(props.copyClaim.created_at) : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>{t("Date de l'évenement")}</strong></td>
                                        <td>{props.claim.event_occured_at ? formatDateToTimeStampte(props.claim.event_occured_at) : "-"}</td>
                                        <td>{props.copyClaim.event_occured_at ? formatDateToTimeStampte(props.copyClaim.event_occured_at) : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>{t("Catégorie de réclamation")}</strong></td>
                                        <td>{props.claim.claim_object ? props.claim.claim_object.claim_category.name["fr"] : "-"}</td>
                                        <td>{props.copyClaim.claim_object ? props.copyClaim.claim_object.claim_category.name["fr"] : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>{t("Objet de réclamation")}</strong></td>
                                        <td>{props.claim.claim_object ? props.claim.claim_object.name["fr"] : "-"}</td>
                                        <td>{props.copyClaim.claim_object ? props.copyClaim.claim_object.name["fr"] : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>{t("Description")}</strong></td>
                                        <td>{props.claim.description ? props.claim.description: "-"}</td>
                                        <td>{props.copyClaim.description ? props.copyClaim.description : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>{t("Attente")}</strong></td>
                                        <td>{props.claim.claimer_expectation ? props.claim.claimer_expectation : "-"}</td>
                                        <td>{props.copyClaim.claimer_expectation ? props.copyClaim.claimer_expectation : "-"}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>{t("Choix")}</strong></td>
                                        <td>
                                            <label className="kt-checkbox">
                                                <input id={"original"} type="checkbox" checked={choice.original} onChange={handleChoiceChange}/><span/>
                                            </label>
                                        </td>
                                        <td>
                                            <label className="kt-checkbox">
                                                <input id={"duplicate"} type="checkbox" checked={choice.duplicate} onChange={handleChoiceChange}/><span/>
                                            </label>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button disabled={startRequest} onClick={() => onClickCloseButton()} type="button" className="btn btn-secondary">{t("Conserver les deux")}</button>
                            <button style={{display: "none"}} id={"close-button"} type="button" className="btn btn-secondary" data-dismiss="modal">{t("Conserver les deux")}</button>
                            {
                                !startRequest ? (
                                    <button type="button" className="btn btn-primary" onClick={() => onClickFusion()}>{t("Fusioner")}</button>
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

export default FusionClaim;
