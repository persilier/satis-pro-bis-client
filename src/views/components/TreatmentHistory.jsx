import React from "react";
import {formatDateToTimeStampte} from "../../helpers/function";
import {useTranslation} from "react-i18next";

const TreatmentHistory = ({claim}) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const treatments = claim ? (claim.active_treatment ? (claim.active_treatment.treatments ? claim.active_treatment.treatments : []) : [] ) : [];
    return (
        ready ? (
            <>
                <div className="kt-heading kt-heading--md">{t("Historique de traitement")}</div>
                {
                    treatments.map((item, index) => (
                        <div className="kt-wizard-v2__review-item mb-3" key={index}>
                            {!item.invalidated_reason ? (
                                <div className="kt-wizard-v2__review-title">
                                    <h5><strong>{t("Traitement validé")}</strong></h5>
                                </div>
                            ) : null}

                            <div className="kt-wizard-v2__review-content jumbotron px-2 py-2 mb-0">
                                {item.unfounded_reason ? (
                                    <>
                                        <strong>{t("Raison du non fondé")}</strong>: <span className="mx-2">{item.unfounded_reason}</span><br/>
                                    </>
                                ) : null}
                                {item.amount_returned || item.solution || item.preventive_measures || item.comments ? (
                                    <>
                                        <strong>{t("Montant")}</strong>: <span className={`mx-2 ${!item.invalidated_reason ? 'text-success' : ''}`}>{item.amount_returned ? item.amount_returned : '-'}</span><br/>
                                        <strong>{t("Solution")}</strong>: <span className={`mx-2 ${!item.invalidated_reason ? 'text-success' : ''}`}>{item.solution ? item.solution : '-'}</span><br/>
                                        <strong>{t("Mesure preventive")}</strong>: <span className={`mx-2 ${!item.invalidated_reason ? 'text-success' : ''}`}>{item.preventive_measures ? item.preventive_measures : '-'}</span><br/>
                                        <strong>{t("Commentaire")}</strong>: <span className={`mx-2 ${!item.invalidated_reason ? 'text-success' : ''}`}>{item.comments ? item.comments : '-'}</span><br/>
                                    </>
                                ) : null}

                                {item.solved_at ? (
                                    <>
                                        <strong>{t("Date de traitement")}</strong>: <span className={`mx-2 ${!item.invalidated_reason ? 'text-success' : ''}`}>{formatDateToTimeStampte(item.solved_at)}</span><br/>
                                    </>
                                ) : null}


                                {item.invalidated_reason ? (
                                    <>
                                        <strong>{t("Motif du rejet")}</strong>: <span className="mx-2 text-danger">{item.invalidated_reason}</span><br/>
                                    </>
                                ) : null}

                                {item.validated_at ? (
                                    <>
                                        <strong>{t("Date de validation du traitement")}</strong>: <span className={`mx-2 ${!item.invalidated_reason ? 'text-success' : ''}`}>{formatDateToTimeStampte(item.validated_at)}</span><br/>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    ))
                }
            </>
        ) : null
    );
};

export default TreatmentHistory;
