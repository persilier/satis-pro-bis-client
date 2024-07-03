import React from "react";
import {useTranslation} from "react-i18next";

const ClientButton = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <div className="kt-wizard-v2__nav-item" data-ktwizard-type="step"
                 data-ktwizard-state="current">
                <div className="kt-wizard-v2__nav-body">
                    <div className="kt-wizard-v2__nav-icon">
                        <i className="flaticon-user-settings"/>
                    </div>
                    <div className="kt-wizard-v2__nav-label">
                        <div className="kt-wizard-v2__nav-label-title">
                            {t("Client")}
                        </div>
                        <div className="kt-wizard-v2__nav-label-desc">
                            {t("Accéder aux détails du client")}
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default ClientButton;
