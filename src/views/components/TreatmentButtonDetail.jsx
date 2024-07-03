import React from "react";
import {formatDateToTimeStampte} from "../../helpers/function";
import TreatmentHistory from "./TreatmentHistory";
import {useTranslation} from "react-i18next";

const TreatmentButtonDetail = ({claim}) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <div className="kt-wizard-v2__content" data-ktwizard-type="step-content">
                <div className="kt-heading kt-heading--md">{t("Information sur le Traitement Effectué")}</div>
                <div className="kt-form__section kt-form__section--first">
                    {claim && !claim.active_treatment ? (
                        <div className="kt-wizard-v2__review-item">
                            <div className="kt-wizard-v2__review-title"><h5 style={{color: "#48465b"}}>{t("Aucune information")}</h5></div>
                        </div>
                    ) : null}

                    <div className="kt-wizard-v2__review">
                        {claim && claim.active_treatment && claim.active_treatment.transferred_to_targeted_institution_at ? (
                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title"><span style={{color: "#48465b"}}>{t("Transfert vers l'institution ciblée")}</span></div>
                                <div className="kt-wizard-v2__review-content">
                                    <strong>{t("Date de transfert")}:</strong>
                                    <span className="mx-2">{formatDateToTimeStampte(claim.active_treatment.transferred_to_targeted_institution_at)}</span><br/>
                                </div>
                            </div>
                        ) : null}

                        {claim && claim.active_treatment && claim.active_treatment.transferred_to_unit_by ? (
                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title"><span style={{color: "#48465b"}}>{t("Transféré par")}</span></div>
                                <div className="kt-wizard-v2__review-content">
                                   <strong>{t("Nom")}:</strong>
                                   <span className="mx-2">{claim.active_treatment.transferred_to_unit_by ? claim.active_treatment.transferred_to_unit_by.identite?.lastname + "  " + claim.active_treatment.transferred_to_unit_by.identite?.firstname : "-"}</span><br/>
                                </div>
                            </div>
                        ) : null}


                        {claim && claim.active_treatment && claim.active_treatment.transferred_to_unit_at ? (
                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title"><span style={{color: "#48465b"}}>{t("Unité de traitement")}</span></div>
                                <div className="kt-wizard-v2__review-content">
                                    <strong>{t("Unité")}:</strong>
                                    <span className="mx-2">{claim.active_treatment.responsible_unit ? claim.active_treatment.responsible_unit.name.fr : "-"}</span><br/>
                                    <strong>{t("Date de transfert")}:</strong>
                                    <span className="mx-2">{formatDateToTimeStampte(claim.active_treatment.transferred_to_unit_at)}</span>
                                </div>
                            </div>
                        ) : null}

                        {claim && claim.active_treatment && claim.active_treatment.assigned_to_staff_at ? (
                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title"><span style={{color: "#48465b"}}>{t("Affecté par")}</span></div>
                                {
                                    !claim ? null : (
                                        <div className="kt-wizard-v2__review-content">
                                            <strong>{t("Nom")}:</strong>
                                            <span className="mx-2">{claim.active_treatment.assigned_to_staff_by ? claim.active_treatment.assigned_to_staff_by.identite?.lastname + "  " + claim.active_treatment.assigned_to_staff_by.identite?.firstname : "-"}</span><br/>
                                            <strong>{t("Date de l'affectation")}:</strong>
                                            <span className="mx-2">{formatDateToTimeStampte(claim.active_treatment.assigned_to_staff_at)}</span>
                                        </div>
                                    )
                                }
                            </div>
                        ) : null}

                        {claim && claim.active_treatment && claim.active_treatment.assigned_to_staff_at ? (
                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title"><span style={{color: "#48465b"}}>{t("Chargé du traitement")}</span></div>
                                {
                                    !claim ? null : (
                                        <div className="kt-wizard-v2__review-content">
                                            <strong>{t("Nom")}:</strong>
                                            <span className="mx-2">{claim.active_treatment.responsible_staff ? claim.active_treatment.responsible_staff.identite?.lastname + "  " + claim.active_treatment.responsible_staff.identite?.firstname : "-"}</span><br/>
                                            {/*<strong>Institution:</strong>*/}
                                            {/*<span className="mx-2">{claim.active_treatment.responsible_staff ? claim.active_treatment.responsible_staff.institution.name : '-'}</span>*/}
                                        </div>
                                    )
                                }
                            </div>
                        ) : null}


                        {claim && claim.active_treatment && (claim.active_treatment.declared_unfounded_at || claim.active_treatment.solved_at) ? (
                            <div className="kt-wizard-v2__review-item">
                                <TreatmentHistory claim={claim}/>
                            </div>
                        ) : null}

                        {claim && claim.active_treatment && claim.active_treatment.validated_at ? (
                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title"><span style={{color: "#48465b"}}>{t("Validation du traitement")}</span></div>
                                {
                                    !claim ? null : (
                                        <div className="kt-wizard-v2__review-content">
                                            <strong>{t("Nom")}:</strong>
                                            <span className="mx-2">{claim.active_treatment.validated_by ? claim.active_treatment.validated_by.identite?.lastname + "  " + claim.active_treatment.validated_by.identite?.firstname : "-"}</span><br/>
                                            <strong>{t("Décision")}:</strong>
                                            <span className="mx-2">{claim.active_treatment.invalidated_reason ? t("Invalide") : t("Valide")}</span><br/>

                                            {claim.active_treatment.invalidated_reason ? (
                                                <>
                                                    <strong>{t("Raison de l'invalidation")}:</strong>
                                                    <span className="mx-2">{claim.active_treatment.invalidated_reason}</span><br/>

                                                    <strong>{t("Date de l'invalidation")}:</strong>
                                                    <span className="mx-2">{claim.active_treatment.validet_at ? formatDateToTimeStampte(claim.active_treatment.validated_at) : "-"}</span><br/>
                                                </>
                                            ) : (
                                                <>
                                                    <strong>{t("Solution Communiquée au client")}:</strong>
                                                    <span className="mx-2">{claim.active_treatment.solution_communicated ? claim.active_treatment.solution_communicated : '-'}</span><br/>
                                                    <strong>{t("Date de la validation")}:</strong>
                                                    <span className="mx-2">{claim.active_treatment.validated_at ? formatDateToTimeStampte(claim.active_treatment.validated_at) : '-'}</span><br/>
                                                </>
                                            )}
                                        </div>
                                    )
                                }
                            </div>
                        ) : null}

                        {claim && claim.active_treatment && claim.active_treatment.satisfaction_measured_at ? (
                            <>
                                <div className="kt-wizard-v2__review-item">
                                    <div className="kt-wizard-v2__review-title"><span style={{color: "#48465b"}}>{t("Résultats de la mesure de satisfaction")}</span></div>
                                    <div className="kt-wizard-v2__review-content">
                                        <strong>{t("Le client est-t-il satisfait par le traitement ?")}:</strong>
                                        <span className="mx-2">
                                            { claim.active_treatment.is_claimer_satisfied == 1 ?  <span className="kt-badge kt-badge--inline kt-badge--success">{t("OUI")}</span> : <span className="kt-badge kt-badge--inline kt-badge--danger">{t("NON")}</span> }
                                        </span><br/>

                                        <strong>{t("Raison / Commentaires")}:</strong>
                                        <span className="mx-2">{claim.active_treatment.unsatisfied_reason ? claim.active_treatment.unsatisfied_reason : "-"}</span><br/>
                                    </div>
                                </div>

                                <div className="kt-wizard-v2__review-item">
                                    <div className="kt-wizard-v2__review-title"><span style={{color: "#48465b"}}>{t("Satisfaction mesuré par")}</span></div>
                                    <div className="kt-wizard-v2__review-content">
                                        <strong>{t("Nom")}:</strong>
                                        <span className="mx-2">{claim.active_treatment.satisfaction_measured_by ? claim.active_treatment.satisfaction_measured_by.identite?.lastname + "  " + claim.active_treatment.satisfaction_measured_by.identite?.firstname : "-"}</span><br/>

                                        <strong>{t("Point de service")}:</strong>
                                        <span className="mx-2">{claim.active_treatment.satisfaction_measured_by ? claim.active_treatment.satisfaction_measured_by.unit.name["fr"] : "-"}</span><br/>

                                        <strong>{t("Institution")}:</strong>
                                        <span className="mx-2">{claim.active_treatment.satisfaction_measured_by ? claim.active_treatment.satisfaction_measured_by.institution.name : "-"}</span><br/>

                                        <strong>{t("Date de la mesure de satisfaction")}:</strong>
                                        <span className="mx-2">{formatDateToTimeStampte(claim.active_treatment.satisfaction_measured_at)}</span><br/>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        ) : null
    )
};

export default TreatmentButtonDetail;
