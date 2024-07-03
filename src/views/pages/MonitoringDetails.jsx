import React, { useEffect, useRef, useState } from "react";
import { loadCss, loadScript } from "../../helpers/function";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import ClientButton from "../components/ClientButton";
import ClaimButton from "../components/ClaimButton";
import AttachmentsButton from "../components/AttachmentsButton";
import ClientButtonDetail from "../components/ClientButtonDetail";
import ClaimButtonDetail from "../components/ClaimButtonDetail";
import AttachmentsButtonDetail from "../components/AttachmentsButtonDetail";
import TreatmentButtonDetail from "../components/TreatmentButtonDetail";
import axios from "axios";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import { verifyPermission } from "../../helpers/permission";
import RelaunchModal from "../components/RelaunchModal";
import { DeleteConfirmation } from "../components/ConfirmationAlert";
import { confirmRevokeConfig } from "../../config/confirmConfig";
import appConfig from "../../config/appConfig";
import { ToastBottomEnd } from "../components/Toast";
import {
  toastErrorMessageWithParameterConfig,
  toastSuccessMessageWithParameterConfig,
} from "../../config/toastConfig";
import { getClaimDetails } from "../../http/crud";

loadCss("/assets/css/pages/wizard/wizard-2.css");
loadScript("/assets/js/pages/custom/wizard/wizard-2.js");
loadScript("/assets/js/pages/custom/chat/chat.js");

const MonitoringDetails = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  document.title = "Satis client -" + ready ? t("Détails plainte") : "";
  const [revokeLoad, setRevokeLoad] = useState(false);
  const { id } = useParams();
  const ref = useRef(null);

  const [claim, setClaim] = useState(null);

  useEffect(() => {
    async function fetchData() {
      await getClaimDetails(props.userPermissions, id)
        .then((response) => {
          setClaim(response.data);
          //console.log(response.data);
        })
        .catch((error) => {
          console.log(error.message);
        });
      /*            await axios.get(`/my/search-claim/${id}`)
                .then(response => {
                    setClaim(response.data[0]);
                })
                .catch(error => console.log("Something is wrong"))
            ;*/
    }

    if (verifyTokenExpire()) fetchData();
  }, []);

  const revoke = (e) => {
    DeleteConfirmation.fire(confirmRevokeConfig()).then((result) => {
      if (result.value) {
        setRevokeLoad(true);
        if (verifyTokenExpire()) {
          axios
            .put(`${appConfig.apiDomaine}/revoke-claim/${claim.id}`)
            .then((response) => {
              setRevokeLoad(false);
              ToastBottomEnd.fire(
                toastSuccessMessageWithParameterConfig(
                  t("Réclamation revoquer avec succès")
                )
              );
              setTimeout(() => {
                if (document.referrer) window.location.href = document.referrer;
                else window.location.href = "/";
              }, 1000);
            })
            .catch((error) => {
              setRevokeLoad(false);
              ToastBottomEnd.fire(
                toastErrorMessageWithParameterConfig(
                  t("Echec de revocation de la réclamation")
                )
              );
              console.log("Something is wrong");
            });
        }
      }
    });
  };

  return ready ? (
    <div
      className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
      id="kt_content"
    >
      <div className="kt-subheader   kt-grid__item" id="kt_subheader">
        <div className="kt-container  kt-container--fluid " />
      </div>

      <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
        <div className="kt-portlet">
          <div className="kt-portlet__body kt-portlet__body--fit">
            <div
              className="kt-grid  kt-wizard-v2 kt-wizard-v2--white"
              id="kt_wizard_v2"
              data-ktwizard-state="step-first"
            >
              <div className="kt-grid__item kt-wizard-v2__aside">
                <div className="kt-wizard-v2__nav">
                  <div className="kt-wizard-v2__nav-items kt-wizard-v2__nav-items--clickable">
                    <ClientButton />

                    <ClaimButton />

                    <AttachmentsButton claim={claim} />

                    <div
                      className="kt-wizard-v2__nav-item"
                      data-ktwizard-type="step"
                    >
                      <div className="kt-wizard-v2__nav-body">
                        <div className="kt-wizard-v2__nav-icon">
                          <i className="flaticon-list" />
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
                {claim && claim.status !== "archived"
                  ? verifyPermission(props.userPermissions, "revive-staff") &&
                    props.lead === true && (
                      <>
                        <button
                          ref={ref}
                          type="button"
                          data-keyboard="false"
                          data-backdrop="static"
                          data-toggle="modal"
                          data-target="#kt_modal_4"
                          className="d-none btn btn-outline-warning btn-sm"
                        >
                          {t("Relancer")}
                        </button>

                        <RelaunchModal
                          id={claim ? claim.id : ""}
                          onClose={() => {}}
                        />
                      </>
                    )
                  : null}

                <form className="kt-form" id="kt_form">
                  {false && (
                    <div className="d-flex justify-content-md-end">
                      {claim && claim.status !== "archived" ? (
                        <>
                          {verifyPermission(
                            props.userPermissions,
                            "revive-staff"
                          ) &&
                            props.lead === true && (
                              <button
                                onClick={() => {
                                  ref.current.click();
                                }}
                                type="button"
                                className="btn btn-outline-warning btn-sm"
                              >
                                {t("Relancer")}
                              </button>
                            )}
                        </>
                      ) : null}
                    </div>
                  )}
                  <ClientButtonDetail claim={claim} />

                  <ClaimButtonDetail claim={claim} />

                  <AttachmentsButtonDetail claim={claim} />

                  <TreatmentButtonDetail archive={true} claim={claim} />

                  <div className="kt-form__actions">
                    <button
                      className="btn btn-secondary btn-md btn-tall btn-wide kt-font-bold kt-font-transform-u"
                      data-ktwizard-type="action-prev"
                    >
                      {t("PRÉCÉDENT")}
                    </button>

                    <button
                      className="btn btn-brand btn-md btn-tall btn-wide kt-font-bold kt-font-transform-u"
                      data-ktwizard-type="action-next"
                    >
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
  ) : null;
};

const mapStateToProps = (state) => {
  return {
    userPermissions: state.user.user.permissions,
    activePilot: state.user.user.staff.is_active_pilot,
    lead: state.user.user.staff.is_lead,
    plan: state.plan.plan,
  };
};

export default connect(mapStateToProps)(MonitoringDetails);
