import React from "react";
import Loader from "./Loader";
import {useTranslation} from "react-i18next";

const ClientButtonDetail = ({claim}) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    //console.log("claim:", claim);
    const test = ()=>{
        console.log("test");
    }

    return (
        <div className="kt-wizard-v2__content" data-ktwizard-type="step-content" data-ktwizard-state="current" style={{ position: 'relative', zIndex: 10 }}>
        <div className="kt-heading kt-heading--md">{t("Détails du client")}</div>
        <div className="kt-form_section kt-form_section--first">
            <div className="kt-wizard-v2__review">
                <div className="kt-wizard-v2__review-item">
                    <div className="kt-widget kt-widget--user-profile-1">
                        <div className="kt-widget__head">
                            <div className="kt-widget__media">
                                <img src="/personal/img/default-avatar.png" alt="image-avatar" />
                            </div>
                            <div className="kt-widget__content" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                                <div className="kt-widget__section">
                                    {!claim ? (
                                        <Loader />
                                    ) : (
                                        <a href="#" className="kt-widget__username">
                                            {`${claim?.claimer?.lastname ? claim.claimer.lastname : ""} ${claim?.claimer?.firstname ? claim.claimer.firstname : ""}`}
                                            <i className="flaticon2-correct kt-font-success" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="kt-widget__body">
                            {!claim ? "" : (
                                <div className="kt-widget__content">
                                    <div className="kt-widget__info">
                                        <span className="fa fa-venus-mars" style={{ fontSize: '1.5rem' }} />
                                        <span className="kt-widget__data">{claim?.claimer?.sexe ? (claim.claimer.sexe === 'F' ? t("Féminin") : t("Masculin")) : ""}</span>
                                    </div>
                                    <div className="kt-widget__info">
                                        <span className="fa fa-envelope" style={{ fontSize: '1.5rem' }} />
                                        <span className="kt-widget__data">
                                            {(claim.claimer && claim.claimer.email) ? claim.claimer.email.map((mail, index) => (
                                                index === claim.claimer.email.length - 1 ? mail : mail + "/ "
                                            )) : null}
                                        </span>
                                    </div>
                                    <div className="kt-widget__info">
                                        <span className="fa fa-phone-alt" style={{ fontSize: '1.5rem' }} />
                                        <span className="kt-widget__data">
                                            {claim?.claimer?.telephone ? claim.claimer.telephone.map((telephone, index) => (
                                                index === claim.claimer.telephone.length - 1 ? telephone : telephone + "/ "
                                            )) : null}
                                        </span>
                                    </div>
                                    <div className="kt-widget__info">
                                        <span className="fa fa-location-arrow" style={{ fontSize: '1.5rem' }} />
                                        <span className="kt-widget__data">
                                            {claim?.claimer?.ville ? claim.claimer.ville : "-"}
                                        </span>
                                    </div>

                                    <div className="kt-widget__info">
                                        <button onClick={test}>
                                            <span>{t("Numero de compte")}:</span>
                                        </button>
                                        <span className="kt-widget__data">
                                            {claim ? (claim.account_targeted ? claim.account_targeted.number : (claim.account_number ? claim.account_number : "-")) : '-'}
                                        </span>
                                    </div>

                                    <div className="kt-widget__info">
                                        <span>{t("Type de compte")}:</span>
                                        <span className="kt-widget__data">
                                            {claim ? claim.accountType : '-'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default ClientButtonDetail;
