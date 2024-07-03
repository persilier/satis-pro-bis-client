import React, {useState} from "react";
import {connect} from "react-redux";
import moment from "moment";
import axios from "axios";
import {verifyPermission} from "../../../helpers/permission";
import {DeleteConfirmation} from "../ConfirmationAlert";
import {confirmRevokeConfig} from "../../../config/confirmConfig";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import appConfig from "../../../config/appConfig";
import {ToastBottomEnd} from "../Toast";
import {
    toastErrorMessageWithParameterConfig,
    toastSuccessMessageWithParameterConfig
} from "../../../config/toastConfig";
import {useTranslation} from "react-i18next";

const KanbanElementDetail = ({claim, userPermissions, onClick, onShowDetail}) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const timeExpire = `${claim.time_expire >= 0 ? "j+"+claim.time_expire : "j"+claim.time_expire}`;
    const [revokeLoad, setRevokeLoad] = useState(false);

    const revoke = e => {
        e.stopPropagation();
        DeleteConfirmation.fire(confirmRevokeConfig())
            .then(result => {
                if (result.value) {
                    setRevokeLoad(true);
                    if (verifyTokenExpire()) {
                        axios.put(`${appConfig.apiDomaine}/revoke-claim/${claim.id}`)
                            .then(response => {
                                setRevokeLoad(false);
                                ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig('Réclamation revoquer avec succès'));
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            })
                            .catch(error => {
                                setRevokeLoad(false);
                                ToastBottomEnd.fire(toastErrorMessageWithParameterConfig('Echec de revocation de la réclamation'));
                                //console.log("Something is wrong");
                            })
                    }
                }
            })
        ;
    };

    return (
        ready ? (
            <div className="kt-portlet" style={{cursor: "pointer"}} onClick={() => onShowDetail(claim)}>
                <div className="kt-portlet__head kt-portlet__head--right kt-portlet__head--noborder  kt-ribbon kt-ribbon--clip kt-ribbon--left kt-ribbon--info">
                    <div className="kt-ribbon__target" style={{ top: "12px", zIndex: 0 }}>
                        <span className="kt-ribbon__inner" style={{backgroundColor: claim.time_expire !== null ? (claim.time_expire > 0 ? "#FED7D7" : "#C6F6D5") : "#e6e6e6"}}/>
                        <strong style={{color: claim.time_expire !== null ? (claim.time_expire > 0 ?  "#C53030" : "#2F855A") : "#000000"}}>
                            {claim.time_expire !== null ? timeExpire : "-"}
                        </strong>
                    </div>

                    <div className="kt-portlet__head-label">
                        <h3 className="kt-portlet__head-title">

                            {`${claim?.claimer?.lastname ? claim.claimer.lastname : ""} ${claim?.claimer?.firstname ? claim.claimer.firstname : ""}`}

                        </h3>
                    </div>
                </div>
                <div className="kt-portlet__body kt-portlet__body--fit-top">
                    <p style={{textAlign: "left"}}>
                        {t("La réclamation dont l'objet est")} <strong>{claim.claim_object ? (claim.claim_object ? claim.claim_object.name["fr"] : '-') : '-'}</strong> {t("est")} <br/> {t("reçu le")} <strong>{moment(new Date(claim.created_at)).format("DD/MM/YYYY")}</strong> <br/>
                        {/*voici la description: {claim.description.length > 34 ? claim.description.substring(0, 34)+"..." : claim.description}*/}
                        {t("Cliquer pour voir les détails")}
                    </p>
                    {(verifyPermission(userPermissions, 'revoke-claim') && ['incomplete', 'full'].includes(claim.status)) && (
                        <>
                            {revokeLoad ? (
                                <button className="btn btn-outline-danger btn-sm kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--primary mb-2 text-uppercase" disabled={true}>{t("Chargement")}</button>
                            ) : (
                                <button onClick={revoke} className="btn btn-outline-danger btn-sm text-uppercase mb-2">{t("Revoquer")}</button>
                            )}
                        </>
                    )}

                    {verifyPermission(userPermissions, 'revive-staff') && (
                        <button onClick={(e) => {e.stopPropagation(); onClick(claim.id)}} type="button" className="btn btn-outline-warning btn-sm text-uppercase">{t("Relancer")}</button>
                    )}
                </div>
            </div>
        ) : null
    );
};

const mapStateToProps = state  => {
    return {
        userPermissions: state.user.user.permissions,
    };
};

export default connect(mapStateToProps)(KanbanElementDetail);
