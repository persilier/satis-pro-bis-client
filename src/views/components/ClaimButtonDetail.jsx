import React, {useState} from "react";
import {connect} from "react-redux";
import {formatDateToTimeStampte} from "../../helpers/function";
import HtmlDescription from "./DescriptionDetail/HtmlDescription";
import HtmlDescriptionModal from "./DescriptionDetail/HtmlDescriptionModal";
import {useTranslation} from "react-i18next";

const ClaimButtonDetail = ({claim, plan}) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()


    const [currentMessage, setCurrentMessage] = useState("");

    const showModal = (message) => {
        setCurrentMessage(message);
        document.getElementById("button_modal").click();
    };

    return (
        ready ? (
            <div className="kt-wizard-v2__content" data-ktwizard-type="step-content">
                <div className="kt-heading kt-heading--md">{t("Détails de la réclamation")}</div>
                <div className="kt-form__section kt-form__section--first">
                    <div className="kt-wizard-v2__review">
                        <div className="kt-wizard-v2__review-item">
                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title">
                                    <h5 style={{color: "#48465b"}}>{t("Référence")}</h5>
                                </div>
                                {!claim ? null : (
                                    <div className="kt-wizard-v2__review-content">

                                        <strong>{t("Référence")}:</strong>
                                        <span className="mx-2">{claim.reference ? claim.reference : "-"}</span><br/>
                                        <strong>{t("Catégorie de réclamation")}:</strong>
                                        <span
                                            className="mx-2">{(claim.claim_object && claim.claim_object.claim_category.name) ? claim.claim_object.claim_category.name["fr"] : '-'}</span><br/>
                                        <strong>{t("Objet de réclamations")}:</strong>
                                        <span className="mx-2">{claim.claim_object.name["fr"]}</span><br/>
                                        <strong>{t("Date de survenu de l'incident")}:</strong>
                                        <span
                                            className="mx-2">{claim.event_occured_at ? formatDateToTimeStampte(claim.event_occured_at) : "-"}</span><br/>
                                        <strong>{t("Lieu de survenu de l'incident")}:</strong>
                                        <span className="mx-2">{claim.lieu ? claim.lieu : "-"}</span><br/>
                                        {plan === "HUB" && (
                                            <>
                                                <strong>{t("Relation entretenue avec le réclamant")}:</strong>
                                                <span
                                                    className="mx-2">{claim.relationship ? formatDateToTimeStampte(claim.relationship.name["fr"]) : "-"}</span><br/>
                                            </>
                                        )}
                                        <strong>{t("Montant réclamé")}:</strong>
                                        <span
                                            className="mx-2">{claim.amount_disputed ? `${claim.amount_disputed} ${claim.amount_currency ? claim.amount_currency.name["fr"] : ''}` : "-"}</span><br/>
                                        <strong>{t("Description")}:</strong>
                                        <span className="mx-2">
                                        <HtmlDescription
                                            onClick={() => showModal(claim.description ? claim.description : '-')}/>
                                    </span>
                                        {/*<span className="mx-2">{claim.description ? claim.description : "-"}</span>*/}
                                        <br/>
                                        <strong>{t("Attente")}:</strong>
                                        <span
                                            className="mx-2">{claim.claimer_expectation ? claim.claimer_expectation : "-"}</span><br/>
                                        <strong>{t("Est - ce une relance ?")}:</strong>
                                        <span className="mx-2">{claim.is_revival ? "Oui" : "Non"}</span><br/>
                                    </div>
                                )}
                                <button id="button_modal" type="button" className="btn btn-secondary btn-icon-sm d-none"
                                        data-toggle="modal" data-target="#message_email"/>
                                <HtmlDescriptionModal title={t("Description")} message={currentMessage}/>
                            </div>

                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title">
                                    <h5><span style={{color: "#48465b"}}>{t("Cible")}</span></h5>
                                </div>
                                {
                                    !claim ? null : (
                                        <div className="kt-wizard-v2__review-content">
                                            <strong>{t("Institution")}:</strong>
                                            <span className="mx-2">{claim.institution_targeted.name}</span><br/>
                                            <strong>{t("Point de service")}</strong>:
                                            <span
                                                className="mx-2">{claim.unit_targeted ? claim.unit_targeted.name["fr"] : "-"}</span><br/>
                                            {claim.account_targeted || claim.account_number ? (
                                                <>
                                                    <strong>Compte concerné:</strong>
                                                    <span
                                                        className="mx-2">{claim.account_targeted ? claim.account_targeted.number : (claim.account_number ? claim.account_number : "-")}</span><br/>
                                                </>
                                            ) : null}
                                        </div>
                                    )
                                }
                            </div>

                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title">
                                    <h5><span style={{color: "#48465b"}}>{t("Canaux")}</span></h5>
                                </div>
                                {!claim ? null : (
                                    <div className="kt-wizard-v2__review-content">
                                        <strong>{t("Canal de réception")}:</strong>
                                        <span
                                            className="mx-2">{claim.request_channel ? claim.request_channel.name["fr"] : "-"}</span><br/>
                                        <strong>{t("Canal de réponse préférentiel")}:</strong>
                                        <span
                                            className="mx-2">{claim.response_channel ? claim.response_channel.name["fr"] : "-"}</span><br/>
                                    </div>
                                )}
                            </div>

                            <div className="kt-wizard-v2__review-item">
                                <div className="kt-wizard-v2__review-title">
                                    <h5><span style={{color: "#48465b"}}>{t("Enregistré par")}</span></h5>
                                </div>
                                {!claim ? null : (
                                    <div className="kt-wizard-v2__review-content">
                                        <strong>{t("Nom")}:</strong>
                                        <span
                                            className="mx-2">{`${(claim.created_by && claim.created_by.identite) ? claim.created_by.identite.firstname + " " + claim.created_by.identite.lastname : "-"} `}</span><br/>
                                        <strong>{t("Point de service")}:</strong>
                                        <span
                                            className="mx-2">{(claim.created_by && claim.created_by.unit) ? claim.created_by.unit.name["fr"] : "-"}</span><br/>
                                        <strong>{t("Institution")}:</strong>
                                        <span
                                            className="mx-2">{(claim.created_by && claim.created_by.institution) ? claim.created_by.institution.name : "-"}</span><br/>
                                        <strong>{t("Date de réception")}:</strong>
                                        <span
                                            className="mx-2">{claim.created_at ? formatDateToTimeStampte(claim.created_at) : "-"}</span><br/>
                                    </div>
                                )}
                            </div>

                            {claim && claim.completed_at ? (
                                <div className="kt-wizard-v2__review-item">
                                    <div className="kt-wizard-v2__review-title">
                                        <h5><span style={{color: "#48465b"}}>{t("Complété par")}</span></h5>
                                    </div>
                                    <div className="kt-wizard-v2__review-content">
                                        <strong>{t("Nom")}:</strong>
                                        <span className="mx-2">{`${(claim.completed_by && claim.completed_by.identite) ? claim.completed_by.identite.firstname + " " + claim.completed_by.identite.lastname : "-"} `}</span>
                                        <br/>
                                        <strong>{t("Point de service")}:</strong>

                                        <span className="mx-2">{(claim.completed_by && claim.completed_by.unit) ? claim.completed_by.unit.name["fr"] : "-"}</span>
                                        <br/>
                                        <strong>{t("Institution")}:</strong>

                                        <span className="mx-2">{(claim.completed_by && claim.completed_by.institution) ? claim.completed_by.institution.name : "-"}</span>
                                        <br/>
                                        <strong>{t("Date de complétion")}:</strong>
                                        <span className="mx-2">{claim.completed_at ? formatDateToTimeStampte(claim.completed_at) : "-"}</span><br/>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        plan: state.plan.plan,
    };
};

export default connect(mapStateToProps)(ClaimButtonDetail);
