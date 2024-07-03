import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    useParams,
    Link
} from "react-router-dom";
import {connect} from "react-redux";
import Select from "react-select";
import {loadCss, loadScript} from "../../helpers/function";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import appConfig from "../../config/appConfig";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastAssignClaimSuccessMessageConfig
} from "../../config/toastConfig";
import ReasonModal from "../components/ReasonModal";
import {AssignClaimConfirmation} from "../components/ConfirmationAlert";
import {confirmAssignConfig} from "../../config/confirmConfig";
import ClientButton from "../components/ClientButton";
import ClaimButton from "../components/ClaimButton";
import AttachmentsButton from "../components/AttachmentsButton";
import ClientButtonDetail from "../components/ClientButtonDetail";
import ClaimButtonDetail from "../components/ClaimButtonDetail";
import AttachmentsButtonDetail from "../components/AttachmentsButtonDetail";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

loadCss("/assets/css/pages/wizard/wizard-2.css");
loadScript("/assets/js/pages/custom/wizard/wizard-2.js");
loadScript("/assets/js/pages/custom/chat/chat.js");


const ClaimListDetail = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - " + ready ? t("Détails réclamation") : "";
    const {id} = useParams();

    if (!verifyPermission(props.userPermissions, "assignment-claim-awaiting-treatment"))
        window.location.href = ERROR_401;

    const [claim, setClaim] = useState(null);
    const [showReason, setShowReason] = useState(false);
    const [reasonTitle, setReasonTitle] = useState("");
    const [reasonLabel, setReasonLabel] = useState("");
    const [action, setAction] = useState("");
    const [staffs, setStaffs] = useState([]);
    const [errors, setErrors] = useState([]);
    const [staff, setStaff] = useState(null);
    const [startRequest, setStartRequest] = useState(false);

    const formatStaffsOptions = (data) => {
        const newData = [];
        for (let i = 0; i < data.length; i++)
            newData.push({value: data[i].id, label: `${data[i].identite.lastname} ${data[i].identite.firstname}`});
        return newData;
    };

    useEffect(() => {
        async function fetchData() {
            await axios.get(`${appConfig.apiDomaine}/claim-awaiting-treatment/${id}/edit`)
                .then(response => {
                    setClaim(response.data.claim);
                    setStaffs(formatStaffsOptions(response.data.staffs));
                })
                .catch(error => console.log("Something is wrong"))
            ;
        }
        if (verifyTokenExpire())
            fetchData();
    }, [id]);

    const onChangeStaff = (selected) => {
        setStaff(selected);
    };

    const selfAssign = () => {
        AssignClaimConfirmation.fire(confirmAssignConfig())
            .then(response => {
                if (verifyTokenExpire()) {
                    if (response.value) {
                        axios.put(`${appConfig.apiDomaine}/claim-awaiting-treatment/${id}/self-assignment`, {})
                            .then(response => {
                                ToastBottomEnd.fire(toastAssignClaimSuccessMessageConfig());
                                window.location.href = "/process/unit-claims";
                            })
                            .catch(error => console.log("Something is wrong"))
                        ;
                    }
                }
            })
    };

    const assignClaim = () => {
        setStartRequest(true);
        if (verifyTokenExpire()) {
            axios.put(`${appConfig.apiDomaine}/claim-awaiting-treatment/${id}/assignment`, {staff_id: staff ? staff.value : null})
                .then(response => {
                    ToastBottomEnd.fire(toastAssignClaimSuccessMessageConfig());
                    setStartRequest(false);
                    setStaff(null);
                    setErrors([]);
                    window.location.href = "/process/unit-claims";
                })
                .catch(error => {
                    setStartRequest(false);
                    setErrors(error.response.data.error.staff_id)
                })
            ;
        }
    };

    const showReasonInput = async (type) => {
        await setReasonTitle(t("Motif de rejet"));
        await setReasonLabel(t("Le motif"));
        await setAction(type);
        await setShowReason(true);
        document.getElementById("reason-modal").click();
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, "assignment-claim-awaiting-treatment") ? (
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
                                        <a href="#icone" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                        <span className="kt-subheader__breadcrumbs-separator"/>
                                        <Link to="/process/unit-claims" className="kt-subheader__breadcrumbs-link">
                                            {t("Liste des réclamations")}
                                        </Link>
                                    </div>
                                </div>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#" className="kt-subheader__breadcrumbs-home">
                                        <i className="flaticon2-shelter"/>
                                    </a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#detail" onClick={e => e.preventDefault()} style={{cursor: "text"}}
                                       className="kt-subheader__breadcrumbs-link">
                                        {
                                            claim ? claim.reference : t("Détails réclamation")
                                        }
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

                                                {
                                                    props.lead ? (
                                                        <div className="kt-wizard-v2__nav-item" data-ktwizard-type="step">
                                                            <div className="kt-wizard-v2__nav-body">
                                                                <div className="kt-wizard-v2__nav-icon">
                                                                    <i className="flaticon-paper-plane"/>
                                                                </div>
                                                                <div className="kt-wizard-v2__nav-label">
                                                                    <div className="kt-wizard-v2__nav-label-title">
                                                                        {t("Affectation de la réclamation")}
                                                                    </div>
                                                                    <div className="kt-wizard-v2__nav-label-desc">
                                                                        {t("Affectez la réclamation à un agent")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : null
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="kt-grid__item kt-grid__item--fluid kt-wizard-v2__wrapper">
                                        <form className="kt-form" id="kt_form">
                                            <div className="d-flex justify-content-end">
                                                {
                                                    !props.lead ? (
                                                        verifyPermission(props.userPermissions, "self-assignment-claim-awaiting-treatment") ? (
                                                            <button className="btn btn-primary btn-sm mx-2" onClick={selfAssign}>{t("Auto - affectation")}</button>
                                                        ) : null
                                                    ) : null
                                                }
                                                {
                                                    verifyPermission(props.userPermissions, "rejected-claim-awaiting-treatment") ? (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => showReasonInput("reject")}>
                                                            {t("Rejeter la réclamation")}
                                                        </button>
                                                    ) : null
                                                }
                                                <button id={"reason-modal"} style={{display: "none"}} type="button"
                                                        className="btn btn-bold btn-label-brand btn-sm"
                                                        data-toggle="modal" data-target="#kt_modal_4_2"/>
                                            </div>

                                            <ClientButtonDetail claim={claim}/>

                                            <ClaimButtonDetail claim={claim}/>

                                            <AttachmentsButtonDetail claim={claim}/>

                                            {
                                                props.lead ? (
                                                    <div className="kt-wizard-v2__content"
                                                         data-ktwizard-type="step-content">
                                                        <div className="kt-heading kt-heading--md">
                                                            {t("Affectation de la réclamation")}
                                                        </div>
                                                        <div className="kt-form__section kt-form__section--first">
                                                            <div className="kt-wizard-v2__review">
                                                                <div className="kt-wizard-v2__review-content">
                                                                    <div
                                                                        className={errors.length ? "form-group validated" : "form-group"}>
                                                                        <label>{t("Agent")}</label>
                                                                        <Select
                                                                            isClearable
                                                                            placeholder={t("Veillez sélectionner l'agent")}
                                                                            value={staff}
                                                                            onChange={onChangeStaff}
                                                                            options={staffs}
                                                                        />
                                                                        {
                                                                            errors.map((error, index) => (
                                                                                <div key={index}
                                                                                     className="invalid-feedback">
                                                                                    {error}
                                                                                </div>
                                                                            ))
                                                                        }
                                                                    </div>
                                                                    <div
                                                                        className="form-group d-flex justify-content-between">
                                                                        {
                                                                            !startRequest ? (
                                                                                <button className="btn btn-primary"
                                                                                        onClick={assignClaim}>
                                                                                    {t("Affecter la réclamation")}</button>
                                                                            ) : (
                                                                                <button
                                                                                    className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                                                    type="button" disabled>
                                                                                    {t("Chargement")}...
                                                                                </button>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null
                                            }

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

                                        {
                                            showReason ? (
                                                <ReasonModal
                                                    plan={props.plan}
                                                    id={id}
                                                    action={action}
                                                    reasonTitle={reasonTitle}
                                                    reasonLabel={reasonLabel}
                                                    onClose={() => setShowReason(false)}
                                                />
                                            ) : null
                                        }
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

export default connect(mapStateToProps)(ClaimListDetail);
