import React from "react";
import {useTranslation} from "react-i18next";

const AttachmentsButton = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <div className="kt-wizard-v2__nav-item" href="#" data-ktwizard-type="step">
                <div className="kt-wizard-v2__nav-body">
                    <div className="kt-wizard-v2__nav-icon">
                        <i className="flaticon-file-2"/>
                    </div>
                    <div className="kt-wizard-v2__nav-label">
                        <div className="kt-wizard-v2__nav-label-title">
                            {t("Pièces jointes")}
                            {
                                !props.claim ? "" : (
                                    <span
                                        className="mx-lg-4 kt-badge kt-badge--success  kt-badge--inline kt-badge--pill">{props.claim.files.length}</span>
                                )
                            }
                        </div>
                        <div className="kt-wizard-v2__nav-label-desc">
                            {t("Acceder à la liste des pièces jointes")}
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default AttachmentsButton;
