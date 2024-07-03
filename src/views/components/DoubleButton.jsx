import React from "react";
import {useTranslation} from "react-i18next";

const DoubleButton = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <div className="kt-wizard-v2__nav-item" data-ktwizard-type="step">
                <div className="kt-wizard-v2__nav-body">
                    <div className="kt-wizard-v2__nav-icon">
                        <i className="flaticon2-copy"/>
                    </div>
                    <div className="kt-wizard-v2__nav-label">
                        <div className="kt-wizard-v2__nav-label-title">
                            {t("Doublons")}
                            {
                                !props.claim ? "" : (
                                    <span
                                        className="mx-lg-4 kt-badge kt-badge--success  kt-badge--inline kt-badge--pill">{props.claim.duplicates.length}</span>
                                )
                            }
                        </div>
                        <div className="kt-wizard-v2__nav-label-desc">
                            {t("Acceder à la liste des doublons")}
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default DoubleButton;
