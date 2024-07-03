import React from "react";
import {connect} from "react-redux";
import appConfig from "../../config/appConfig";
import CompleteAttachment from "./CompleteAttachment";
import {verifyPermission} from "../../helpers/permission";
import {useTranslation} from "react-i18next";

const AttachmentsButtonDetail = ({claim, userPermissions, user}) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    let completeAttachment = false;
    let canAddAttachmentFirst = false;
    let canAddAttachmentSecond = false;


    const checkRole = (array, role) => {
        let roleIsValid = false;
        array.map((elem, index) => {
            if (elem.name === role)
                roleIsValid = true;
        })
        return roleIsValid;
    }


    if (claim) {
        completeAttachment = verifyPermission(userPermissions, 'attach-files-to-claim') && claim.status !== "archived";
        canAddAttachmentFirst = claim.status === "assigned_to_staff" && checkRole(user.data.roles, "staff");
        canAddAttachmentSecond = claim.status === "validated" && (checkRole(user.data.roles, "pilot") && user.staff.is_active_pilot) && (checkRole(user.data.roles, "staff") && claim.active_treatment.responsible_staff_id === user.staff.id)

    }


    return (
        ready ? (
            <div className="kt-wizard-v2__content" data-ktwizard-type="step-content">
                <div className="kt-heading kt-heading--md">
                    {t("Liste de pièces jointes")}
                </div>
                <div className="kt-form__section kt-form__section--first">
                    <div className="kt-wizard-v2__review">
                        {
                            !claim ? null : (
                                claim.files.length ? (
                                    claim.files.map((file, index) => (
                                        <div className="kt-wizard-v2__review-item" key={index}>
                                            <div className="kt-wizard-v2__review-content">
                                                <a href={`${appConfig.apiDomaine}${file.url}`}
                                                   download={true} target={"_blank"}>
                                                    {file.title}
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="kt-wizard-v2__review-item">
                                        <div className="kt-wizard-v2__review-title">
                                            {t("Pas de pièce jointe")}
                                        </div>
                                    </div>
                                )
                            )
                        }

                        {claim && (
                            completeAttachment && claim.canAddAttachment &&  (
                                <CompleteAttachment claimId={claim.id}/>
                            )
                        )}


                    </div>
                </div>
            </div>
        ) : null
    )
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        user: state.user.user,
    };
};

export default connect(mapStateToProps)(AttachmentsButtonDetail);
