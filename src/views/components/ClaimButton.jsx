import React from "react";
import {useTranslation} from "react-i18next";

const ClaimButton = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <div className="kt-wizard-v2__nav-item" data-ktwizard-type="step">
                <div className="kt-wizard-v2__nav-body">
                    <div className="kt-wizard-v2__nav-icon">
                        <i className="flaticon-book"/>
                    </div>
                    <div className="kt-wizard-v2__nav-label">
                        <div className="kt-wizard-v2__nav-label-title">
                            {t("Réclamation")}
                        </div>
                        <div className="kt-wizard-v2__nav-label-desc">
                            {t("Acceder aux détails de la réclamation")}
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default ClaimButton;
