import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    useParams,
    Link
} from "react-router-dom";
import {connect} from "react-redux";
import {loadCss, loadScript, validatedClaimRule} from "../../helpers/function";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import appConfig from "../../config/appConfig";
import ReasonModalPending from "../components/ReasonModalPending";
import {ToastBottomEnd} from "../components/Toast";
import {toastErrorMessageWithParameterConfig} from "../../config/toastConfig";
import ClientButtonDetail from "../components/ClientButtonDetail";
import ClaimButtonDetail from "../components/ClaimButtonDetail";
import AttachmentsButtonDetail from "../components/AttachmentsButtonDetail";
import ClientButton from "../components/ClientButton";
import ClaimButton from "../components/ClaimButton";
import AttachmentsButton from "../components/AttachmentsButton";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import TreatmentHistory from "../components/TreatmentHistory";
import {useTranslation} from "react-i18next";

loadCss("/assets/css/pages/wizard/wizard-2.css");
loadScript("/assets/js/pages/custom/wizard/wizard-2.js");
loadScript("/assets/js/pages/custom/chat/chat.js");


const ClaimToValidatedListDetail = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - " + ready ? t("Détails réclamation") : "";
    const {id} = useParams();
    const validation = validatedClaimRule(id);

    if (!((verifyPermission(props.userPermissions, 'show-claim-awaiting-validation-my-institution') ||
        verifyPermission(props.userPermissions, 'show-claim-awaiting-validation-any-institution')) && props.activePilot))
        window.location.href = ERROR_401;

    const [claim, setClaim] = useState(null);
    const [showReason, setShowReason] = useState(false);
    const [reasonTitle, setReasonTitle] = useState("");
    const [reasonLabel, setReasonLabel] = useState("");
    const [action, setAction] = useState("");
    const [startRequest, setStartRequest] = useState(true);

    useEffect(() => {
        async function fetchData() {
            let endpoint = "";
            if (verifyPermission(props.userPermissions, 'show-claim-awaiting-validation-my-institution'))
                endpoint = `${appConfig.apiDomaine}/claim-awaiting-validation-my-institution/${id}`;
            else if (verifyPermission(props.userPermissions, 'show-claim-awaiting-validation-any-institution'))
                endpoint = `${appConfig.apiDomaine}/claim-awaiting-validation-any-institution/${id}`;

            await axios.get(endpoint)
                .then(response => {
                    setStartRequest(false);
                    setClaim(response.data);
                })
                .catch(({response}) => {
                    setStartRequest(false);
                    if (response.data && response.data.code === 409)
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(response.data.error));
                    else
                        console.log("Something is wrong")
                });
        }
        if (verifyTokenExpire()) {
            fetchData();
        }
    }, [id]);

    const showReasonInput = async (type) => {
        if (type === "validateReject") {
            await setReasonTitle(t('Motif de rejet'));
            await setReasonLabel(t('Le motif'));
        } else if (type === "validateSolution") {
            await setReasonTitle(t('Solution à communiquer au client'));
            await setReasonLabel(t('Solution'));
        }
        await setAction(type);
        await setShowReason(true);
        document.getElementById("reason-modal").click();
    };

    return (
        ready ? (
            (verifyPermission(props.userPermissions, "show-claim-awaiting-validation-my-institution") ||
                verifyPermission(props.userPermissions, 'show-claim-awaiting-validation-any-institution') && props.activePilot) ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Processus")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                        className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()}
                                       className="kt-subheader__breadcrumbs-link" style={{cursor: "default"}}>
                                        {t("Traitement")}
                                    </a>
                                    <span className="kt-subheader__separator kt-hidden"/>
                                    <div className="kt-subheader__breadcrumbs">
                                        <a href="#icone" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                        <span className="kt-subheader__breadcrumbs-separator"/>
                                        <Link to="/process/claim-to-validated" className="kt-subheader__breadcrumbs-link">
                                            {t("Réclamations à valider")}
                                        </Link>
                                    </div>
                                </div>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#" className="kt-subheader__breadcrumbs-home">
                                        <i className="flaticon2-shelter"/>
                                    </a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#detail" onClick={e => e.preventDefault()} style={{cursor: "default"}}
                                       className="kt-subheader__breadcrumbs-link">
                                        {t("Détails réclamation")}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <div className="kt-portlet">
                            <div className="kt-portlet__body kt-portlet__body--fit">
                                <div className="kt-grid  kt-wizard-v2 kt-wizard-v2--white" id="kt_wizard_v2"
                                     data-ktwizard-state="step-first">
                                    <div className="kt-grid__item kt-wizard-v2__aside">
                                        <div className="kt-wizard-v2__nav">
                                            <div className="kt-wizard-v2__nav-items kt-wizard-v2__nav-items--clickable">
                                                <ClientButton/>

                                                <ClaimButton/>

                                                <AttachmentsButton claim={claim}/>

                                                {
                                                    verifyPermission(props.userPermissions, validation[props.plan].permission) ? (
                                                        <div className="kt-wizard-v2__nav-item" data-ktwizard-type="step">
                                                            <div className="kt-wizard-v2__nav-body">
                                                                <div className="kt-wizard-v2__nav-icon">
                                                                    <i className="flaticon-list"/>
                                                                </div>
                                                                <div className="kt-wizard-v2__nav-label">
                                                                    <div className="kt-wizard-v2__nav-label-title">
                                                                        {t("Validation du traitement")}
                                                                    </div>
                                                                    <div className="kt-wizard-v2__nav-label-desc">
                                                                        {t("Valider le traitement de l'agent")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : null
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="kt-grid__item kt-grid__item--fluid kt-wizard-v2__wrapper">
                                        <form className="kt-form" id="kt_form">
                                            <ClientButtonDetail claim={claim}/>

                                            <ClaimButtonDetail claim={claim}/>

                                            <AttachmentsButtonDetail claim={claim}/>

                                            {
                                                verifyPermission(props.userPermissions, validation[props.plan].permission) ? (
                                                    <div className="kt-wizard-v2__content" data-ktwizard-type="step-content">
                                                        {!startRequest ? (
                                                            <TreatmentHistory claim={claim}/>
                                                        ) : null}

                                                        <hr/>

                                                        <div className="kt-heading kt-heading--md">{t("Validation du traitement")}</div>
                                                        <div className="kt-form__section kt-form__section--first">
                                                            <div className="kt-wizard-v2__review">
                                                                {
                                                                    !startRequest ? (
                                                                        claim ? (
                                                                            <div className="kt-wizard-v2__review-item">
                                                                                <>
                                                                                    {
                                                                                        claim.active_treatment.solved_at !== null ? (
                                                                                            <>
                                                                                                <div className="kt-wizard-v2__review-item">
                                                                                                    <div className="kt-wizard-v2__review-title">
                                                                                                        <h5><strong>{t("Traitement à valider")}</strong></h5>
                                                                                                    </div>
                                                                                                    <div className="kt-wizard-v2__review-content">
                                                                                                        <strong>{t("Statut")}</strong>:
                                                                                                        <span className="mx-2">{t("Traitée")}</span><br/>
                                                                                                        <strong>{t("Montant retourné")}</strong>:
                                                                                                        <span className="mx-2">{claim.active_treatment.amount_returned ? claim.active_treatment.amount_returned : "-"}</span><br/>
                                                                                                        <strong>{t("Solution")}</strong>:
                                                                                                        <span className="mx-2">{claim.active_treatment.solution ? claim.active_treatment.solution : "-"}</span><br/>
                                                                                                        <strong>{t("Commentaires")}</strong>:
                                                                                                        <span className="mx-2">{claim.active_treatment.comments ? claim.active_treatment.comments : "-"}</span><br/>
                                                                                                        <strong>{t("Mesures préventives")}</strong>:
                                                                                                        <span className="mx-2">{claim.active_treatment.preventive_measures ? claim.active_treatment.preventive_measures : "-"}</span><br/>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="kt-widget__action">
                                                                                                    {
                                                                                                        verifyPermission(props.userPermissions, "validate-treatment-my-institution") ||
                                                                                                        verifyPermission(props.userPermissions, "validate-treatment-any-institution") ? (
                                                                                                            <button
                                                                                                                type="button"
                                                                                                                className="btn btn-label-danger btn-sm btn-upper"
                                                                                                                onClick={() => showReasonInput("validateReject")}>
                                                                                                                {t("Rejeter")}
                                                                                                            </button>
                                                                                                        ) : null
                                                                                                    }

                                                                                                    &nbsp;
                                                                                                    {
                                                                                                        verifyPermission(props.userPermissions, "validate-treatment-my-institution") ||
                                                                                                        verifyPermission(props.userPermissions, "validate-treatment-any-institution") ? (
                                                                                                            <button
                                                                                                                type="button"
                                                                                                                className="btn btn-brand btn-sm btn-upper"
                                                                                                                onClick={() => showReasonInput("validateSolution")}>
                                                                                                                {t("Valider")}
                                                                                                            </button>
                                                                                                        ) : null
                                                                                                    }

                                                                                                </div>
                                                                                            </>
                                                                                        ) : null
                                                                                    }

                                                                                    {
                                                                                        claim.active_treatment.declared_unfounded_at !== null ? (
                                                                                            <>
                                                                                                <div className="kt-wizard-v2__review-item">
                                                                                                    <div className="kt-wizard-v2__review-title">
                                                                                                        <h5><strong>{t("Traitement à valider")}</strong></h5>
                                                                                                    </div>
                                                                                                    <div className="kt-wizard-v2__review-content">
                                                                                                        <strong>{t("Statut")}</strong>: <span className="mx-2">{t("Non fondée")}</span>
                                                                                                        <br/>
                                                                                                        <strong>{t("Motif")}</strong>: <span className="mx-2">{claim.active_treatment.unfounded_reason ? claim.active_treatment.unfounded_reason : t("Pas de motif")}</span>
                                                                                                        <br/>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="kt-widget__action">
                                                                                                    <button type="button" className="btn btn-label-danger btn-sm btn-upper" onClick={() => showReasonInput("validateReject")}>
                                                                                                        {t("Rejeter")}
                                                                                                    </button>
                                                                                                    &nbsp;
                                                                                                    <button type="button" className="btn btn-brand btn-sm btn-upper" onClick={() => showReasonInput("validateSolution")}>
                                                                                                        {t("Valider")}
                                                                                                    </button>
                                                                                                </div>
                                                                                            </>
                                                                                        ) : null
                                                                                    }
                                                                                </>
                                                                                <button id={"reason-modal"} style={{display: "none"}} type="button" className="btn btn-bold btn-label-brand btn-sm" data-toggle="modal" data-target="#kt_modal_4_2"/>
                                                                            </div>
                                                                        ) : null
                                                                    ) : null
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null
                                            }

                                            <div className="kt-form__actions">
                                                <button
                                                    className="btn btn-secondary btn-md btn-tall btn-wide kt-font-bold kt-font-transform-u"
                                                    data-ktwizard-type="action-prev">
                                                    {t("PRÉCÉDENT")}
                                                </button>

                                                <button
                                                    className="btn btn-brand btn-md btn-tall btn-wide kt-font-bold kt-font-transform-u"
                                                    data-ktwizard-type="action-next">
                                                    {t("SUIVANT")}
                                                </button>
                                            </div>
                                        </form>

                                        {
                                            showReason ? (
                                                <ReasonModalPending
                                                    plan={props.plan}
                                                    id={id}
                                                    action={action}
                                                    reasonTitle={reasonTitle}
                                                    reasonLabel={reasonLabel}
                                                    onClose={() => setShowReason(false)}
                                                />
                                            ) : null
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        lead: state.user.user.staff.is_lead,
        plan: state.plan.plan,
        activePilot: state.user.user.staff.is_active_pilot
    };
};

export default connect(mapStateToProps)(ClaimToValidatedListDetail);
