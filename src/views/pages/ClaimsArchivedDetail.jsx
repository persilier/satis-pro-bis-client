import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    useParams,
    Link
} from "react-router-dom";
import {connect} from "react-redux";
import {loadCss, loadScript} from "../../helpers/function";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import appConfig from "../../config/appConfig";
import ClientButton from "../components/ClientButton";
import ClaimButton from "../components/ClaimButton";
import AttachmentsButton from "../components/AttachmentsButton";
import ClientButtonDetail from "../components/ClientButtonDetail";
import ClaimButtonDetail from "../components/ClaimButtonDetail";
import AttachmentsButtonDetail from "../components/AttachmentsButtonDetail";
import TreatmentButtonDetail from "../components/TreatmentButtonDetail";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

loadCss("/assets/css/pages/wizard/wizard-2.css");
loadScript("/assets/js/pages/custom/wizard/wizard-2.js");
loadScript("/assets/js/pages/custom/chat/chat.js");

const ClaimArchivedDetail = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client -" + ready ? t("Détails plainte") : "";
    const {id} = useParams();

    const [claim, setClaim] = useState(null);

    const endPointConfig = {
        PRO: {
            plan: "PRO",
            list: `${appConfig.apiDomaine}/my/claim-archived`,
        },
        MACRO: {
            holding: {
                list: `${appConfig.apiDomaine}/any/claim-archived`,
            },
            filial: {
                list: `${appConfig.apiDomaine}/my/claim-archived`,
            }
        },
        HUB: {
            plan: "HUB",
            list: `${appConfig.apiDomaine}/any/claim-archived`,
        }
    };

    if (!(verifyPermission(props.userPermissions, 'show-any-claim-archived') ||
        verifyPermission(props.userPermissions, "show-my-claim-archived")))
        window.location.href = ERROR_401;

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'show-any-claim-archived'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'show-my-claim-archived'))
            endPoint = endPointConfig[props.plan].filial
    } else
        endPoint = endPointConfig[props.plan];

    useEffect(() => {
        async function fetchData() {
            await axios.get(endPoint.list + `/${id}`)
                .then(response => {
                    setClaim(response.data);
                })
                .catch(error => console.log("Something is wrong"))
            ;
        }

        if (verifyTokenExpire())
            fetchData();
    }, []);

    return (
        ready ? (
            verifyPermission(props.userPermissions, "show-any-claim-archived") ||
            verifyPermission(props.userPermissions, "show-my-claim-archived") ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Processus")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                        className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()}
                                       className="kt-subheader__breadcrumbs-link" style={{cursor: "default"}}>
                                        {t("Traitement")}
                                    </a>
                                    <span className="kt-subheader__separator kt-hidden"/>
                                    <div className="kt-subheader__breadcrumbs">
                                        <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                            className="flaticon2-shelter"/></a>
                                        <span className="kt-subheader__breadcrumbs-separator"/>
                                        <Link to="/process/claim_archived" className="kt-subheader__breadcrumbs-link">
                                            {t("Archivage")}
                                        </Link>
                                    </div>
                                </div>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#" className="kt-subheader__breadcrumbs-home">
                                        <i className="flaticon2-shelter"/>
                                    </a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#detail" onClick={e => e.preventDefault()} style={{cursor: "default"}}
                                       className="kt-subheader__breadcrumbs-link">
                                        {claim?claim.reference: t('Détails')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <div className="kt-portlet">
                            <div className="kt-portlet__body kt-portlet__body--fit">
                                <div className="kt-grid  kt-wizard-v2 kt-wizard-v2--white" id="kt_wizard_v2"
                                     data-ktwizard-state="step-first">
                                    <div className="kt-grid__item kt-wizard-v2__aside">
                                        <div className="kt-wizard-v2__nav">
                                            <div className="kt-wizard-v2__nav-items kt-wizard-v2__nav-items--clickable">
                                                <ClientButton/>

                                                <ClaimButton/>

                                                <AttachmentsButton claim={claim}/>

                                                <div className="kt-wizard-v2__nav-item" data-ktwizard-type="step">
                                                    <div className="kt-wizard-v2__nav-body">
                                                        <div className="kt-wizard-v2__nav-icon">
                                                            <i className="flaticon-list"/>
                                                        </div>
                                                        <div className="kt-wizard-v2__nav-label">
                                                            <div className="kt-wizard-v2__nav-label-title">
                                                                {t("Traitement effectué")}
                                                            </div>
                                                            <div className="kt-wizard-v2__nav-label-desc">
                                                                {t("Détails du traitement effectué")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="kt-grid__item kt-grid__item--fluid kt-wizard-v2__wrapper">
                                        <form className="kt-form" id="kt_form">
                                            <ClientButtonDetail claim={claim}/>

                                            <ClaimButtonDetail claim={claim}/>

                                            <AttachmentsButtonDetail claim={claim}/>

                                            <TreatmentButtonDetail archive={true} claim={claim}/>

                                            <div className="kt-form__actions">
                                                <button
                                                    className="btn btn-secondary btn-md btn-tall btn-wide kt-font-bold kt-font-transform-u"
                                                    data-ktwizard-type="action-prev">
                                                    {t("PRÉCÉDENT")}
                                                </button>

                                                <button
                                                    className="btn btn-brand btn-md btn-tall btn-wide kt-font-bold kt-font-transform-u"
                                                    data-ktwizard-type="action-next">
                                                    {t("SUIVANT")}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        lead: state.user.user.staff.is_lead,
        plan: state.plan.plan,
    };
};

export default connect(mapStateToProps)(ClaimArchivedDetail);
