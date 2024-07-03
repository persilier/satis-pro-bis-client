import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { verifyPermission } from "../../helpers/permission";
import {
  goToSupport,
  seeCollect,
  seeHistorique,
  seeMonitoring,
  seeParameters,
  seeTreatment,
} from "../../helpers/function";

// react-i18n
import { useTranslation } from "react-i18next";
import CurrencUserGuide from "../components/shared/CurrencUserGuide";
const Aside = (props) => {
  const [staff, setStaff] = useState();
  const [data, setData] = useState();

  useEffect(() => {
    setStaff(JSON.parse(localStorage.getItem("userData")).staff);
    setData(JSON.parse(localStorage.getItem("userData")).data.roles);
  }, []);

  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  return (
    <div
      className="kt-aside  kt-aside--fixed  kt-grid__item kt-grid kt-grid--desktop kt-grid--hor-desktop"
      id="kt_aside"
    >
      <div
        className="kt-aside-menu-wrapper kt-grid__item kt-grid__item--fluid"
        id="kt_aside_menu_wrapper"
      >
        <div
          id="kt_aside_menu"
          className="kt-aside-menu "
          data-ktmenu-vertical="1"
          data-ktmenu-scroll="1"
        >
          {ready ? (
            <ul className="kt-menu__nav ">
              <li className="kt-menu__item " aria-haspopup="true">
                <NavLink
                  exact
                  to="/dashboard"
                  className="kt-menu__link"
                  activeClassName="kt-menu__item--active"
                >
                  <i className="kt-menu__link-icon flaticon2-architecture-and-city" />
                  <span className="kt-menu__link-text">
                    {t("Tableau de bord")}
                  </span>
                </NavLink>
              </li>

              {seeCollect(props.userPermissions) ||
              seeTreatment(props.userPermissions) ? (
                <li className="kt-menu__section ">
                  <h4 className="kt-menu__section-text">{t("Processus")}</h4>
                  <i className="kt-menu__section-icon flaticon-more-v2" />
                </li>
              ) : null}

              {!seeCollect(props.userPermissions) ? null : (
                <li
                  className="kt-menu__item  kt-menu__item--submenu"
                  aria-haspopup="true"
                  data-ktmenu-submenu-toggle="hover"
                >
                  <a
                    href="#collecte"
                    onClick={(e) => e.preventDefault()}
                    className="kt-menu__link kt-menu__toggle"
                  >
                    <i className="kt-menu__link-icon flaticon2-telegram-logo" />
                    <span className="kt-menu__link-text">{t("Collecte")}</span>
                    <i className="kt-menu__ver-arrow la la-angle-right" />
                  </a>
                  <div className="kt-menu__submenu ">
                    <span className="kt-menu__arrow" />
                    <ul className="kt-menu__subnav">
                      <li
                        className="kt-menu__item  kt-menu__item--parent"
                        aria-haspopup="true"
                      >
                        <span className="kt-menu__link">
                          <span className="kt-menu__link-text">
                            {t("Collecte")}
                          </span>
                        </span>
                      </li>

                      {verifyPermission(
                        props.userPermissions,
                        "store-claim-against-any-institution"
                      ) ||
                      verifyPermission(
                        props.userPermissions,
                        "store-claim-against-my-institution"
                      ) ||
                      verifyPermission(
                        props.userPermissions,
                        "store-claim-without-client"
                      ) ? (
                        <NavLink
                          exact
                          to="/process/claims/add"
                          className="kt-menu__item "
                          activeClassName="kt-menu__item--active"
                          aria-haspopup="true"
                        >
                          <li className="kt-menu__link ">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                              <span />
                            </i>
                            <span className="kt-menu__link-text">
                              {t("Enregistrer réclamation")}
                            </span>
                          </li>
                        </NavLink>
                      ) : null}
                      {verifyPermission(
                        props.userPermissions,
                        "list-claim-incomplete-against-any-institution"
                      ) ||
                      verifyPermission(
                        props.userPermissions,
                        "list-claim-incomplete-against-my-institution"
                      ) ||
                      verifyPermission(
                        props.userPermissions,
                        "list-claim-incomplete-without-client"
                      ) ? (
                        <NavLink
                          exact
                          to="/process/incomplete_claims"
                          className="kt-menu__item "
                          activeClassName="kt-menu__item--active"
                          aria-haspopup="true"
                        >
                          <li className="kt-menu__link ">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                              <span />
                            </i>
                            <span className="kt-menu__link-text">
                              {t("Réclamation incomplète")}
                            </span>
                          </li>
                        </NavLink>
                      ) : null}
                    </ul>
                  </div>
                </li>
              )}

              {!seeTreatment(props.userPermissions) ? null : (
                <li
                  className="kt-menu__item  kt-menu__item--submenu"
                  aria-haspopup="true"
                  data-ktmenu-submenu-toggle="hover"
                >
                  <a
                    href="#treatement"
                    onClick={(e) => e.preventDefault()}
                    className="kt-menu__link kt-menu__toggle"
                  >
                    <i className="kt-menu__link-icon flaticon-network" />
                    <span className="kt-menu__link-text">
                      {t("Traitement")}
                    </span>
                    <i className="kt-menu__ver-arrow la la-angle-right" />
                  </a>
                  <div className="kt-menu__submenu ">
                    <span className="kt-menu__arrow" />
                    <ul className="kt-menu__subnav">
                      <li
                        className="kt-menu__item  kt-menu__item--parent"
                        aria-haspopup="true"
                      >
                        <span className="kt-menu__link">
                          <span className="kt-menu__link-text">
                            {t("Traitement")}
                          </span>
                        </span>
                      </li>

                      {verifyPermission(
                        props.userPermissions,
                        "show-claim-awaiting-assignment"
                      ) && props.activePilot ? (
                        <NavLink
                          exact
                          to="/process/claim-assign"
                          className="kt-menu__item "
                          activeClassName="kt-menu__item--active"
                          aria-haspopup="true"
                        >
                          <li className="kt-menu__link ">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                              <span />
                            </i>
                            <span className="kt-menu__link-text">
                              {t("Réclamations à transférer")}
                            </span>
                          </li>
                        </NavLink>
                      ) : null}

                      {verifyPermission(
                        props.userPermissions,
                        "list-claim-awaiting-treatment"
                      ) ? (
                        <NavLink
                          exact
                          to="/process/unit-claims"
                          className="kt-menu__item "
                          activeClassName="kt-menu__item--active"
                          aria-haspopup="true"
                        >
                          <li className="kt-menu__link ">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                              <span />
                            </i>
                            <span className="kt-menu__link-text">
                              {t("Liste des réclamations")}
                            </span>
                          </li>
                        </NavLink>
                      ) : null}

                      {verifyPermission(
                        props.userPermissions,
                        "assignment-claim-awaiting-treatment"
                      ) &&
                        props.lead && (
                          <NavLink
                            exact
                            to="/process/claim-reassign"
                            className="kt-menu__item "
                            activeClassName="kt-menu__item--active"
                            aria-haspopup="true"
                          >
                            <li className="kt-menu__link ">
                              <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                <span />
                              </i>
                              <span className="kt-menu__link-text">
                                {t("Réassigner réclamation")}
                              </span>
                            </li>
                          </NavLink>
                        )}

                      {verifyPermission(
                        props.userPermissions,
                        "list-claim-assignment-to-staff"
                      ) ? (
                        <NavLink
                          exact
                          to="/process/claim-assign/to-staff"
                          className="kt-menu__item "
                          activeClassName="kt-menu__item--active"
                          aria-haspopup="true"
                        >
                          <li className="kt-menu__link ">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                              <span />
                            </i>
                            <span className="kt-menu__link-text">
                              {t("Réclamations à traiter")}
                            </span>
                          </li>
                        </NavLink>
                      ) : null}

                      {(verifyPermission(
                        props.userPermissions,
                        "list-claim-awaiting-validation-my-institution"
                      ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-claim-awaiting-validation-any-institution"
                        )) &&
                      props.activePilot ? (
                        <NavLink
                          exact
                          to="/process/claim-to-validated"
                          className="kt-menu__item "
                          activeClassName="kt-menu__item--active"
                          aria-haspopup="true"
                        >
                          <li className="kt-menu__link ">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                              <span />
                            </i>
                            <span className="kt-menu__link-text">
                              {t("Réclamations à valider")}
                            </span>
                          </li>
                        </NavLink>
                      ) : null}

                      {verifyPermission(
                        props.userPermissions,
                        "list-satisfaction-measured-any-claim"
                      ) ||
                      verifyPermission(
                        props.userPermissions,
                        "list-satisfaction-measured-my-claim"
                      ) ? (
                        <NavLink
                          exact
                          to="/process/claim_measure"
                          className="kt-menu__item "
                          activeClassName="kt-menu__item--active"
                          aria-haspopup="true"
                        >
                          <li className="kt-menu__link ">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                              <span />
                            </i>
                            <span className="kt-menu__link-text">
                              {t("Mesure de Satisfaction")}
                            </span>
                          </li>
                        </NavLink>
                      ) : null}
                      {verifyPermission(
                        props.userPermissions,
                        "list-any-claim-archived"
                      ) ||
                      verifyPermission(
                        props.userPermissions,
                        "list-my-claim-archived"
                      ) ? (
                        <NavLink
                          exact
                          to="/process/claim_archived"
                          className="kt-menu__item "
                          activeClassName="kt-menu__item--active"
                          aria-haspopup="true"
                        >
                          <li className="kt-menu__link ">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                              <span />
                            </i>
                            <span className="kt-menu__link-text">
                              {t("Archives")}
                            </span>
                          </li>
                        </NavLink>
                      ) : null}
                      {verifyPermission(
                        props.userPermissions,
                        "list-my-discussions"
                      ) ||
                      verifyPermission(
                        props.userPermissions,
                        "contribute-discussion"
                      ) ? (
                        <NavLink
                          exact
                          to="/chat"
                          className="kt-menu__item "
                          activeClassName="kt-menu__item--active"
                          aria-haspopup="true"
                        >
                          <li className="kt-menu__link ">
                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                              <span />
                            </i>
                            <span className="kt-menu__link-text">
                              {t("Discussions")}
                            </span>
                          </li>
                        </NavLink>
                      ) : null}
                    </ul>
                  </div>
                </li>
              )}

              {!seeMonitoring(props.userPermissions) ? null : (
                <>
                  {staff.is_active_pilot === true || staff.is_lead === true ? (
                    <li className="kt-menu__section ">
                      <h4 className="kt-menu__section-text">
                        {t("Monitoring")}
                      </h4>
                      <i className="kt-menu__section-icon flaticon-more-v2" />
                    </li>
                  ) : null}

                  {verifyPermission(
                    props.userPermissions,
                    "list-monitoring-claim-any-institution"
                  ) ||
                  verifyPermission(
                    props.userPermissions,
                    "list-monitoring-claim-my-institution"
                  ) ? (
                    <NavLink
                      exact
                      to="/monitoring/claims/monitoring"
                      className="kt-menu__item "
                      activeClassName="kt-menu__item--active"
                      aria-haspopup="true"
                    >
                      <li className="kt-menu__link ">
                        <i className="kt-menu__link-icon flaticon-folder-1" />
                        <span className="kt-menu__link-text">
                          {t("Suivi des réclamations")}
                        </span>
                      </li>
                    </NavLink>
                  ) : null}

                  {// (verifyPermission(props.userPermissions, 'show-my-staff-monitoring') && (!props.activePilot) && (props.userStaff?.lead === true) )
                  staff.is_lead === true &&
                    verifyPermission(
                      props.userPermissions,
                      "show-my-staff-monitoring"
                    ) && (
                      // console.log(!props.activePilot )
                      <NavLink
                        exact
                        to="/process/revival"
                        className="kt-menu__item "
                        activeClassName="kt-menu__item--active"
                        aria-haspopup="true"
                      >
                        <li className="kt-menu__link ">
                          <i className="kt-menu__link-icon flaticon-folder-1" />
                          <span className="kt-menu__link-text">
                            {t("Suivi des réclamations")}
                          </span>
                        </li>
                      </NavLink>
                    )}

                  {/*{
                                        verifyPermission(props.userPermissions, 'list-reporting-claim-any-institution') || verifyPermission(props.userPermissions, 'list-reporting-claim-my-institution') ? (
                                            <NavLink exact to="/monitoring/claims/reporting" className="kt-menu__item " activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                <li className="kt-menu__link ">
                                                    <i className="kt-menu__link-icon flaticon2-heart-rate-monitor"/>
                                                    <span className="kt-menu__link-text">Reporting</span>
                                                </li>
                                            </NavLink>
                                        ) : null
                                    }*/}

                  {staff.is_active_pilot === true || data.name === true ? (
                    <li
                      className="kt-menu__item  kt-menu__item--submenu"
                      aria-haspopup="true"
                      data-ktmenu-submenu-toggle="hover"
                    >
                      <a
                        href="#historique"
                        onClick={(e) => e.preventDefault()}
                        className="kt-menu__link kt-menu__toggle"
                      >
                        <i className="kt-menu__link-icon flaticon2-graph" />
                        <span className="kt-menu__link-text">
                          {t("Rapport")}
                        </span>
                        <i className="kt-menu__ver-arrow la la-angle-right" />
                      </a>
                      <div className="kt-menu__submenu ">
                        <span className="kt-menu__arrow" />
                        <ul className="kt-menu__subnav">
                          <li
                            className="kt-menu__item  kt-menu__item--parent"
                            aria-haspopup="true"
                          >
                            <span className="kt-menu__link">
                              <span className="kt-menu__link-text">
                                {t("Rapport")}
                              </span>
                            </span>
                          </li>

                          {verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-any-institution"
                          ) ||
                          verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-my-institution"
                          ) ? (
                            <NavLink
                              exact
                              to="/monitoring/claims/uemoa/reporting-one"
                              className="kt-menu__item "
                              activeClassName="kt-menu__item--active"
                              aria-haspopup="true"
                            >
                              <li className="kt-menu__link ">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                  <span />
                                </i>
                                <span className="kt-menu__link-text">
                                  {t("Etat global")}
                                </span>
                              </li>
                            </NavLink>
                          ) : null}

                          {verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-any-institution"
                          ) ||
                          verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-my-institution"
                          ) ? (
                            <NavLink
                              exact
                              to="/monitoring/claims/uemoa/reporting-two"
                              className="kt-menu__item "
                              activeClassName="kt-menu__item--active"
                              aria-haspopup="true"
                            >
                              <li className="kt-menu__link ">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                  <span />
                                </i>
                                <span className="kt-menu__link-text">
                                  {t("Etat Retard de +30 jrs")}
                                </span>
                              </li>
                            </NavLink>
                          ) : null}

                          {verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-any-institution"
                          ) ||
                          verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-my-institution"
                          ) ? (
                            <NavLink
                              exact
                              to="/monitoring/claims/uemoa/reporting-three"
                              className="kt-menu__item "
                              activeClassName="kt-menu__item--active"
                              aria-haspopup="true"
                            >
                              <li className="kt-menu__link ">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                  <span />
                                </i>
                                <span className="kt-menu__link-text">
                                  {t("Etat Hors Délai")}
                                </span>
                              </li>
                            </NavLink>
                          ) : null}

                          {verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-any-institution"
                          ) ||
                          verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-my-institution"
                          ) ? (
                            <NavLink
                              exact
                              to="/monitoring/claims/uemoa/reporting-four"
                              className="kt-menu__item "
                              activeClassName="kt-menu__item--active"
                              aria-haspopup="true"
                            >
                              <li className="kt-menu__link ">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                  <span />
                                </i>
                                <span className="kt-menu__link-text">
                                  {t("Etat analytique")}
                                </span>
                              </li>
                            </NavLink>
                          ) : null}

                          {verifyPermission(
                            props.userPermissions,
                            "list-regulatory-reporting-claim-any-institution"
                          ) ||
                          verifyPermission(
                            props.userPermissions,
                            "list-regulatory-reporting-claim-my-institution"
                          ) ? (
                            <NavLink
                              exact
                              to="/monitoring/claims/uemoa/reporting-five"
                              className="kt-menu__item "
                              activeClassName="kt-menu__item--active"
                              aria-haspopup="true"
                            >
                              <li className="kt-menu__link ">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                  <span />
                                </i>
                                <span className="kt-menu__link-text">
                                  {t("Etat réglementaire")}
                                </span>
                              </li>
                            </NavLink>
                          ) : null}

                          {/*  {
                                                        verifyPermission(props.userPermissions, "config-reporting-claim-any-institution") ||
                                                        verifyPermission(props.userPermissions, "list-config-reporting-claim-my-institution") ?
                                                            (<NavLink to="/settings/rapport-auto"
                                                                      className="kt-menu__item "
                                                                      activeClassName="kt-menu__item--active"
                                                                      aria-haspopup="true">
                                                                    <li className="kt-menu__link ">
                                                                        <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                        <span
                                                                            className="kt-menu__link-text"> {t("Rapport Automatique")} </span>
                                                                    </li>
                                                                </NavLink>
                                                            ) : null
                                                    }*/}

                          {verifyPermission(
                            props.userPermissions,
                            "system-any-efficiency-report"
                          ) ||
                          (verifyPermission(
                            props.userPermissions,
                            "system-my-efficiency-report"
                          ) &&
                            props.activePilot === true) ? (
                            <NavLink
                              exact
                              to="/monitoring/claims/uemoa/reporting-six"
                              className="kt-menu__item "
                              activeClassName="kt-menu__item--active"
                              aria-haspopup="true"
                            >
                              <li className="kt-menu__link ">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                  <span />
                                </i>
                                <span className="kt-menu__link-text">
                                  {t("Efficacité traitement")}
                                </span>
                              </li>
                            </NavLink>
                          ) : null}

                          {verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-any-institution"
                          ) ||
                          verifyPermission(
                            props.userPermissions,
                            "list-global-reporting"
                          ) ? (
                            <NavLink
                              exact
                              to="/monitoring/claims/uemoa/reporting-height"
                              className="kt-menu__item "
                              activeClassName="kt-menu__item--active"
                              aria-haspopup="true"
                            >
                              <li className="kt-menu__link ">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                  <span />
                                </i>
                                <span className="kt-menu__link-text">
                                  {t("Rapport SATIS")}
                                </span>
                              </li>
                            </NavLink>
                          ) : null}

                          {verifyPermission(
                            props.userPermissions,
                            "list-benchmarking-reporting"
                          ) ? (
                            <NavLink
                              exact
                              to="/monitoring/claims/reporting-benchmarking"
                              className="kt-menu__item "
                              activeClassName="kt-menu__item--active"
                              aria-haspopup="true"
                            >
                              <li className="kt-menu__link ">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                  <span />
                                </i>
                                <span className="kt-menu__link-text">
                                  {t("Benchmarking")}
                                </span>
                              </li>
                            </NavLink>
                          ) : null}

                          {verifyPermission(
                            props.userPermissions,
                            "list-system-usage-reporting"
                          ) ? (
                            <NavLink
                              exact
                              to="/monitoring/claims/system-usage"
                              className="kt-menu__item "
                              activeClassName="kt-menu__item--active"
                              aria-haspopup="true"
                            >
                              <li className="kt-menu__link ">
                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                  <span />
                                </i>
                                <span className="kt-menu__link-text">
                                  {t("Utilisation Système")}
                                </span>
                              </li>
                            </NavLink>
                          ) : null}
                        </ul>
                      </div>
                    </li>
                  ) : null}
                </>
              )}

              {!seeHistorique(props.userPermissions) ? null : (
                <>
                  <li className="kt-menu__section ">
                    <h4 className="kt-menu__section-text">
                      {t("Historiques")}
                    </h4>
                    <i className="kt-menu__section-icon flaticon-more-v2" />
                  </li>
                  <li
                    className="kt-menu__item  kt-menu__item--submenu"
                    aria-haspopup="true"
                    data-ktmenu-submenu-toggle="hover"
                  >
                    <a
                      href="#historique"
                      onClick={(e) => e.preventDefault()}
                      className="kt-menu__link kt-menu__toggle"
                    >
                      <i className="kt-menu__link-icon flaticon2-graphic-1" />
                      <span className="kt-menu__link-text">
                        {t("Historiques")}
                      </span>
                      <i className="kt-menu__ver-arrow la la-angle-right" />
                    </a>
                    <div className="kt-menu__submenu ">
                      <span className="kt-menu__arrow" />
                      <ul className="kt-menu__subnav">
                        <li
                          className="kt-menu__item  kt-menu__item--parent"
                          aria-haspopup="true"
                        >
                          <span className="kt-menu__link">
                            <span className="kt-menu__link-text">
                              {t("Historiques")}
                            </span>
                          </span>
                        </li>

                        {verifyPermission(
                          props.userPermissions,
                          "history-list-create-claim"
                        ) ? (
                          <NavLink
                            exact
                            to="/historic/claims/add"
                            className="kt-menu__item "
                            activeClassName="kt-menu__item--active"
                            aria-haspopup="true"
                          >
                            <li className="kt-menu__link ">
                              <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                <span />
                              </i>
                              <span className="kt-menu__link-text">
                                {t("Réclamations créées")}
                              </span>
                            </li>
                          </NavLink>
                        ) : null}
                        {verifyPermission(
                          props.userPermissions,
                          "history-list-treat-claim"
                        ) ? (
                          <NavLink
                            exact
                            to="/historic/claims/treat"
                            className="kt-menu__item "
                            activeClassName="kt-menu__item--active"
                            aria-haspopup="true"
                          >
                            <li className="kt-menu__link ">
                              <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                <span />
                              </i>
                              <span className="kt-menu__link-text">
                                {t("Réclamations traitées")}
                              </span>
                            </li>
                          </NavLink>
                        ) : null}
                        {false && (
                          <>
                            {verifyPermission(
                              props.userPermissions,
                              "list-unit-revivals"
                            ) ||
                            verifyPermission(
                              props.userPermissions,
                              "list-staff-revivals"
                            ) ? (
                              <NavLink
                                exact
                                to="/historic/revivals"
                                className="kt-menu__item "
                                activeClassName="kt-menu__item--active"
                                aria-haspopup="true"
                              >
                                <li className="kt-menu__link ">
                                  <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                    <span />
                                  </i>
                                  <span className="kt-menu__link-text">
                                    {t("Relances")}
                                  </span>
                                </li>
                              </NavLink>
                            ) : null}
                          </>
                        )}
                      </ul>
                    </div>
                  </li>
                </>
              )}

              {!seeParameters(props.userPermissions) ? null : (
                <>
                  <li className="kt-menu__section ">
                    <h4 className="kt-menu__section-text">{t("Paramètres")}</h4>
                    <i className="kt-menu__section-icon flaticon-more-v2" />
                  </li>
                  <li
                    className="kt-menu__item  kt-menu__item--submenu"
                    aria-haspopup="true"
                    data-ktmenu-submenu-toggle="hover"
                  >
                    <a
                      href="#parameter"
                      onClick={(e) => e.preventDefault()}
                      className="kt-menu__link kt-menu__toggle"
                    >
                      <i className="kt-menu__link-icon flaticon-settings" />
                      <span className="kt-menu__link-text">
                        {t("Paramètres")}
                      </span>
                      <i className="kt-menu__ver-arrow la la-angle-right" />
                    </a>
                    <div className="kt-menu__submenu ">
                      <span className="kt-menu__arrow" />
                      <ul className="kt-menu__subnav">
                        <li
                          className="kt-menu__item  kt-menu__item--parent"
                          aria-haspopup="true"
                        >
                          <span className="kt-menu__link">
                            <span className="kt-menu__link-text">
                              {t("Paramètres")}
                            </span>
                          </span>
                        </li>

                        {/*Structure*/}
                        {verifyPermission(
                          props.userPermissions,
                          "list-channel"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-my-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-any-unit"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-my-unit"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-without-link-unit"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-unit-type"
                        ) ? (
                          <li
                            className="kt-menu__item  kt-menu__item--submenu"
                            aria-haspopup="true"
                            data-ktmenu-submenu-toggle="hover"
                          >
                            <a
                              href="#structure"
                              onClick={(e) => e.preventDefault()}
                              className="kt-menu__link kt-menu__toggle"
                            >
                              <i className="kt-menu__link-icon    socicon-storehouse" />
                              <span className="kt-menu__link-text">
                                {t("Structure")}
                              </span>
                              <i className="kt-menu__ver-arrow la la-angle-right" />
                            </a>
                            <div className="kt-menu__submenu ">
                              <span className="kt-menu__arrow" />
                              <ul className="kt-menu__subnav">
                                <li
                                  className="kt-menu__item  kt-menu__item--parent"
                                  aria-haspopup="true"
                                >
                                  <span className="kt-menu__link">
                                    <span className="kt-menu__link-text">
                                      {t("Structure")}
                                    </span>
                                  </span>
                                </li>
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-channel"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/channels"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Canaux")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-my-institution"
                                ) ? (
                                  <NavLink
                                    to="/settings/institution/edit"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Institution")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-unit-type"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/unit_type"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Type d'unité")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-any-unit"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "list-my-unit"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "list-without-link-unit"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/unit"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Unité")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                              </ul>
                            </div>
                          </li>
                        ) : null}

                        {/*Compte utilisateur*/}

                        {verifyPermission(
                          props.userPermissions,
                          "list-staff-from-any-unit"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-staff-from-my-unit"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-staff-from-maybe-no-unit"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-position"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-any-institution-type-role"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-my-institution-type-role"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-user-my-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-user-any-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-active-pilot"
                        ) ? (
                          <li
                            className="kt-menu__item  kt-menu__item--submenu"
                            aria-haspopup="true"
                            data-ktmenu-submenu-toggle="hover"
                          >
                            <a
                              href="#compteutilisateur"
                              onClick={(e) => e.preventDefault()}
                              className="kt-menu__link kt-menu__toggle"
                            >
                              <i className="kt-menu__link-icon socicon-odnoklassniki" />
                              <span className="kt-menu__link-text">
                                {t("Compte Utilisateur")}
                              </span>
                              <i className="kt-menu__ver-arrow la la-angle-right" />
                            </a>
                            <div className="kt-menu__submenu ">
                              <span className="kt-menu__arrow" />
                              <ul className="kt-menu__subnav">
                                <li
                                  className="kt-menu__item  kt-menu__item--parent"
                                  aria-haspopup="true"
                                >
                                  <span className="kt-menu__link">
                                    <span className="kt-menu__link-text">
                                      {t("Compte Utilisateur")}
                                    </span>
                                  </span>
                                </li>

                                {verifyPermission(
                                  props.userPermissions,
                                  "list-position"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/positions"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Fonctions")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-any-institution-type-role"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "list-my-institution-type-role"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/rules"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Rôle")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}

                                {verifyPermission(
                                  props.userPermissions,
                                  "list-staff-from-any-unit"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "list-staff-from-my-unit"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "list-staff-from-maybe-no-unit"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/staffs"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Agent")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-user-my-institution"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "list-user-any-institution"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/users"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Utilisateur")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-active-pilot"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/activate-pilot"
                                    className="kt-menu__item"
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Pilote actif")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                              </ul>
                            </div>
                          </li>
                        ) : null}

                        {/*Compte Client*/}

                        {verifyPermission(
                          props.userPermissions,
                          "update-category-client"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-client-from-any-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-client-from-my-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-account-type"
                        ) ? (
                          <li
                            className="kt-menu__item  kt-menu__item--submenu"
                            aria-haspopup="true"
                            data-ktmenu-submenu-toggle="hover"
                          >
                            <a
                              href="#compteclient"
                              onClick={(e) => e.preventDefault()}
                              className="kt-menu__link kt-menu__toggle"
                            >
                              <i className="kt-menu__link-icon socicon-draugiem" />
                              <span className="kt-menu__link-text">
                                {t("Compte Client")}
                              </span>
                              <i className="kt-menu__ver-arrow la la-angle-right" />
                            </a>
                            <div className="kt-menu__submenu ">
                              <span className="kt-menu__arrow" />
                              <ul className="kt-menu__subnav">
                                <li
                                  className="kt-menu__item  kt-menu__item--parent"
                                  aria-haspopup="true"
                                >
                                  <span className="kt-menu__link">
                                    <span className="kt-menu__link-text">
                                      {t("Compte Client")}
                                    </span>
                                  </span>
                                </li>
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-account-type"
                                ) ? (
                                  <NavLink
                                    to="/settings/accounts/type"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Type De Compte")}{" "}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-category-client"
                                ) ? (
                                  <NavLink
                                    to="/settings/clients/category"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Catégorie Clients")}{" "}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-client-from-any-institution"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "list-client-from-my-institution"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/clients"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Client")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                              </ul>
                            </div>
                          </li>
                        ) : null}

                        {/*Réclamations*/}

                        {verifyPermission(
                          props.userPermissions,
                          "list-claim-category"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-processing-circuit-my-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-processing-circuit-any-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-processing-circuit-without-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-claim-object-requirement"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-claim-object"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-currency"
                        ) ? (
                          <li
                            className="kt-menu__item  kt-menu__item--submenu"
                            aria-haspopup="true"
                            data-ktmenu-submenu-toggle="hover"
                          >
                            <a
                              href="#reclamation"
                              onClick={(e) => e.preventDefault()}
                              className="kt-menu__link kt-menu__toggle"
                            >
                              <i className="kt-menu__link-icon flaticon-notepad" />
                              <span className="kt-menu__link-text">
                                {t("Réclamation")}
                              </span>
                              <i className="kt-menu__ver-arrow la la-angle-right" />
                            </a>
                            <div className="kt-menu__submenu ">
                              <span className="kt-menu__arrow" />
                              <ul className="kt-menu__subnav">
                                <li
                                  className="kt-menu__item  kt-menu__item--parent"
                                  aria-haspopup="true"
                                >
                                  <span className="kt-menu__link">
                                    <span className="kt-menu__link-text">
                                      {t("Réclamation")}
                                    </span>
                                  </span>
                                </li>
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-claim-category"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/claim_categories"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Catégorie de réclamation")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-claim-object"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/claim_objects"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Objet de réclamation")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-processing-circuit-my-institution"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "update-processing-circuit-any-institution"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "update-processing-circuit-without-institution"
                                ) ? (
                                  <NavLink
                                    to="/settings/processing-circuit"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {" "}
                                        {t("Entités de Traitement")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-claim-object-requirement"
                                ) ? (
                                  <NavLink
                                    to="/settings/requirement"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {" "}
                                        {t("Exigences")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                              </ul>
                            </div>
                          </li>
                        ) : null}

                        {/*Configurations*/}

                        {verifyPermission(
                          props.userPermissions,
                          "update-components-parameters"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-relance-parameters"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-recurrence-alert-settings"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-reject-unit-transfer-parameters"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-min-fusion-percent-parameters"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-auth-config"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-auth-config"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-severity-level"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-escalation-config"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-escalation-config"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-config-reporting-claim-my-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-config-reporting-claim-my-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "delete-config-reporting-claim-my-institution"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "store-config-reporting-claim-my-institution"
                        ) ? (
                          <li
                            className="kt-menu__item  kt-menu__item--submenu"
                            aria-haspopup="true"
                            data-ktmenu-submenu-toggle="hover"
                          >
                            <a
                              href="#configuration"
                              onClick={(e) => e.preventDefault()}
                              className="kt-menu__link kt-menu__toggle"
                            >
                              <i className="kt-menu__link-icon flaticon2-dashboard" />
                              <span className="kt-menu__link-text">
                                {t("Configurations")}
                              </span>
                              <i className="kt-menu__ver-arrow la la-angle-right" />
                            </a>
                            <div className="kt-menu__submenu ">
                              <span className="kt-menu__arrow" />
                              <ul className="kt-menu__subnav">
                                <li
                                  className="kt-menu__item  kt-menu__item--parent"
                                  aria-haspopup="true"
                                >
                                  <span className="kt-menu__link">
                                    <span className="kt-menu__link-text">
                                      {t("Configurations")}
                                    </span>
                                  </span>
                                </li>
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-components-parameters"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/config"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Configuration")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-reporting-titles-configs"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/config-rapport"
                                    className="kt-menu__item mb-3"
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Configuration Titre Rapport")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "config-reporting-claim-any-institution"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "list-config-reporting-claim-my-institution"
                                ) ? (
                                  <NavLink
                                    to="/settings/rapport-auto"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {" "}
                                        {t(
                                          "Configuration Rapport Automatique"
                                        )}{" "}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "show-proxy-config"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "any-email-claim-configuration"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/config-proxy"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Proxy Configuration")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "my-email-claim-configuration"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "any-email-claim-configuration"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/config-mail"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Email Configuration")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-relance-parameters"
                                ) ? (
                                  <NavLink
                                    to="/settings/relance"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link mb-3">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Configuration de Relance")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-recurrence-alert-settings"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/recurence"
                                    className="kt-menu__item"
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link mb-3">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t(
                                          "Configuration des alertes de recurences"
                                        )}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-reject-unit-transfer-parameters"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/reject-limit"
                                    className="kt-menu__item"
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link mb-3">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Configuration limitation rejet")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-escalation-config"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/committee"
                                    className="kt-menu__item"
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link mb-3">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Configuration des comités")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-min-fusion-percent-parameters"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/percentage-min-fusion"
                                    className="kt-menu__item"
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t(
                                          "Configuration pourcentage minimum fusion"
                                        )}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-auth-config"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "update-auth-config"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/connexion"
                                    className="kt-menu__item"
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Configurer connexion")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-currency"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/currencies"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Devise")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-severity-level"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/severities"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Niveau de gravité")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                              </ul>
                            </div>
                          </li>
                        ) : null}

                        {/*Notifications*/}

                        {verifyPermission(
                          props.userPermissions,
                          "update-notifications"
                        ) ? (
                          <li
                            className="kt-menu__item  kt-menu__item--submenu"
                            aria-haspopup="true"
                            data-ktmenu-submenu-toggle="hover"
                          >
                            <a
                              href="#notification"
                              onClick={(e) => e.preventDefault()}
                              className="kt-menu__link kt-menu__toggle"
                            >
                              <i className="kt-menu__link-icon flaticon2-notification" />
                              <span className="kt-menu__link-text">
                                {t("Notification")}
                              </span>
                              <i className="kt-menu__ver-arrow la la-angle-right" />
                            </a>
                            <div className="kt-menu__submenu ">
                              <span className="kt-menu__arrow" />
                              <ul className="kt-menu__subnav">
                                <li
                                  className="kt-menu__item  kt-menu__item--parent"
                                  aria-haspopup="true"
                                >
                                  <span className="kt-menu__link">
                                    <span className="kt-menu__link-text">
                                      {t("Notification")}
                                    </span>
                                  </span>
                                </li>
                                {verifyPermission(
                                  props.userPermissions,
                                  "update-notifications"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/notification"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Notification")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                              </ul>
                            </div>
                          </li>
                        ) : null}

                        {/*Rapports*/}

                        {verifyPermission(
                          props.userPermissions,
                          "activity-log"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-notification-proof"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "list-any-notification-proof"
                        ) ||
                        ((verifyPermission(
                          props.userPermissions,
                          "pilot-list-notification-proof"
                        ) ||
                          verifyPermission(
                            props.userPermissions,
                            "pilot-list-any-notification-proof"
                          )) &&
                          props.activePilot) ? (
                          //  && (props.userStaff.is_lead === false)
                          <li
                            className="kt-menu__item  kt-menu__item--submenu"
                            aria-haspopup="true"
                            data-ktmenu-submenu-toggle="hover"
                          >
                            <a
                              href="#rapport"
                              onClick={(e) => e.preventDefault()}
                              className="kt-menu__link kt-menu__toggle"
                            >
                              <i className="kt-menu__link-icon flaticon2-pie-chart-4" />
                              <span className="kt-menu__link-text">
                                {t("Rapport")}
                              </span>
                              <i className="kt-menu__ver-arrow la la-angle-right" />
                            </a>
                            <div className="kt-menu__submenu ">
                              <span className="kt-menu__arrow" />
                              <ul className="kt-menu__subnav">
                                <li
                                  className="kt-menu__item  kt-menu__item--parent"
                                  aria-haspopup="true"
                                >
                                  <span className="kt-menu__link">
                                    <span className="kt-menu__link-text">
                                      {t("Rapport")}
                                    </span>
                                  </span>
                                </li>
                                {verifyPermission(
                                  props.userPermissions,
                                  "activity-log"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/logs"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Journal des activitées")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-notification-proof"
                                ) ||
                                verifyPermission(
                                  props.userPermissions,
                                  "list-any-notification-proof"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/proof-of-receipt"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Preuve d'accusé de réception")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}

                                {(verifyPermission(
                                  props.userPermissions,
                                  "pilot-list-notification-proof"
                                ) ||
                                  verifyPermission(
                                    props.userPermissions,
                                    "pilot-list-any-notification-proof"
                                  )) &&
                                props.activePilot ? (
                                  <NavLink
                                    exact
                                    to="/settings/proof-of-receipt"
                                    className="kt-menu__item "
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Preuve d'accusé de réception")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                              </ul>
                            </div>
                          </li>
                        ) : null}

                        {/*API*/}

                        {verifyPermission(
                          props.userPermissions,
                          "list-message-apis"
                        ) ||
                        verifyPermission(
                          props.userPermissions,
                          "update-my-institution-message-api"
                        ) ? (
                          <li
                            className="kt-menu__item  kt-menu__item--submenu"
                            aria-haspopup="true"
                            data-ktmenu-submenu-toggle="hover"
                          >
                            <a
                              href="#api"
                              onClick={(e) => e.preventDefault()}
                              className="kt-menu__link kt-menu__toggle"
                            >
                              <i className="kt-menu__link-icon flaticon2-rhombus" />
                              <span className="kt-menu__link-text">
                                {t("API")}
                              </span>
                              <i className="kt-menu__ver-arrow la la-angle-right" />
                            </a>
                            <div className="kt-menu__submenu ">
                              <span className="kt-menu__arrow" />
                              <ul className="kt-menu__subnav">
                                <li
                                  className="kt-menu__item  kt-menu__item--parent"
                                  aria-haspopup="true"
                                >
                                  <span className="kt-menu__link">
                                    <span className="kt-menu__link-text">
                                      {t("API")}
                                    </span>
                                  </span>
                                </li>
                                {verifyPermission(
                                  props.userPermissions,
                                  "list-message-apis"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/message-apis"
                                    className="kt-menu__item"
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Message API")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}

                                {verifyPermission(
                                  props.userPermissions,
                                  "update-my-institution-message-api"
                                ) ? (
                                  <NavLink
                                    exact
                                    to="/settings/institution-message-apis"
                                    className="kt-menu__item"
                                    activeClassName="kt-menu__item--active"
                                    aria-haspopup="true"
                                  >
                                    <li className="kt-menu__link ">
                                      <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                        <span />
                                      </i>
                                      <span className="kt-menu__link-text">
                                        {t("Institution Message API")}
                                      </span>
                                    </li>
                                  </NavLink>
                                ) : null}
                              </ul>
                            </div>
                          </li>
                        ) : null}

                        {/*FAQs*/}

                        <li
                          className="kt-menu__item  kt-menu__item--submenu"
                          aria-haspopup="true"
                          data-ktmenu-submenu-toggle="hover"
                        >
                          <a
                            href="#faqs"
                            onClick={(e) => e.preventDefault()}
                            className="kt-menu__link kt-menu__toggle"
                          >
                            <i className="kt-menu__link-icon socicon-googlegroups " />
                            <span className="kt-menu__link-text">
                              {t("FAQs")}
                            </span>
                            <i className="kt-menu__ver-arrow la la-angle-right" />
                          </a>
                          <div className="kt-menu__submenu ">
                            <span className="kt-menu__arrow" />
                            <ul className="kt-menu__subnav">
                              <li
                                className="kt-menu__item  kt-menu__item--parent"
                                aria-haspopup="true"
                              >
                                <span className="kt-menu__link">
                                  <span className="kt-menu__link-text">
                                    {t("FAQs")}
                                  </span>
                                </span>
                              </li>
                              {verifyPermission(
                                props.userPermissions,
                                "list-faq-category"
                              ) ? (
                                <NavLink
                                  exact
                                  to="/settings/faqs/category"
                                  className="kt-menu__item "
                                  activeClassName="kt-menu__item--active"
                                  aria-haspopup="true"
                                >
                                  <li className="kt-menu__link ">
                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                      <span />
                                    </i>
                                    <span className="kt-menu__link-text">
                                      {t("Catégorie FAQs")}
                                    </span>
                                  </li>
                                </NavLink>
                              ) : null}
                              {verifyPermission(
                                props.userPermissions,
                                "store-faq"
                              ) ? (
                                <NavLink
                                  exact
                                  to="/settings/faqs/add"
                                  className="kt-menu__item "
                                  activeClassName="kt-menu__item--active"
                                  aria-haspopup="true"
                                >
                                  <li className="kt-menu__link ">
                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                      <span />
                                    </i>
                                    <span className="kt-menu__link-text">
                                      {t("Editer FAQs")}
                                    </span>
                                  </li>
                                </NavLink>
                              ) : null}
                              <NavLink
                                to="/settings/faqs/list"
                                className="kt-menu__item "
                                activeClassName="kt-menu__item--active"
                                aria-haspopup="true"
                              >
                                <li className="kt-menu__link ">
                                  <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
                                    <span />
                                  </i>
                                  <span className="kt-menu__link-text">
                                    FAQs
                                  </span>
                                </li>
                              </NavLink>
                            </ul>
                          </div>
                        </li>

                        {/*
                                                    {
                                                        verifyPermission(props.userPermissions, "list-staff-from-any-unit") || verifyPermission(props.userPermissions, 'list-staff-from-my-unit') || verifyPermission(props.userPermissions, 'list-staff-from-maybe-no-unit') ? (
                                                            <NavLink exact to="/settings/staffs" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Agent")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, 'list-channel') ? (
                                                            <NavLink exact to="/settings/channels" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Canaux")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, 'update-category-client') ?
                                                            <NavLink to="/settings/clients/category" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Catégorie Clients")} </span>
                                                                </li>
                                                            </NavLink>
                                                            : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, 'list-claim-category') ? (
                                                            <NavLink exact to="/settings/claim_categories" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Catégorie de réclamation")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "list-faq-category")?
                                                            <NavLink exact to="/settings/faqs/category" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Catégorie FAQs")}</span>
                                                                </li>
                                                            </NavLink>
                                                            :null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "list-client-from-any-institution") || verifyPermission(props.userPermissions, "list-client-from-my-institution") ? (
                                                            <NavLink exact to="/settings/clients" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Compte Clients")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "update-components-parameters")?(
                                                            <NavLink exact to="/settings/config" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Configuration")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ):null
                                                    }

                                                    {
                                                        verifyPermission(props.userPermissions, "update-relance-parameters")?(
                                                            <NavLink to="/settings/relance" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Configuration de Relance")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ): null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "update-recurrence-alert-settings") ? (
                                                            <NavLink exact to="/settings/recurence" className="kt-menu__item" activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Configuration des alerts de recurences")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "update-reject-unit-transfer-parameters") ? (
                                                            <NavLink exact to="/settings/reject-limit" className="kt-menu__item" activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Configuration limitation rejet")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "update-min-fusion-percent-parameters") ? (
                                                            <NavLink exact to="/settings/percentage-min-fusion" className="kt-menu__item" activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Configuration pourcentage minimum fusion")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "list-auth-config") || verifyPermission(props.userPermissions, "update-auth-config") ? (
                                                            <NavLink exact to="/settings/connexion" className="kt-menu__item" activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Configurer connexion")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }*/}
                        {/*  {
                                                        verifyPermission(props.userPermissions, "list-delai-qualification-parameters") ? (
                                                            <NavLink exact to="/settings/qualification-period" className="kt-menu__item" activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Delai qualification")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }*/}

                        {/*    {
                                                        verifyPermission(props.userPermissions, "list-delai-treatment-parameters") ? (
                                                            <NavLink exact to="/settings/treatment-period" className="kt-menu__item" activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Delai traitement")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }*/}
                        {/* {
                                                        verifyPermission(props.userPermissions, 'list-currency') ? (
                                                            <NavLink exact to="/settings/currencies" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Devise")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "store-faq")?
                                                            <NavLink exact to="/settings/faqs/add" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Editer FAQs")}</span>
                                                                </li>
                                                            </NavLink> :null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, 'update-processing-circuit-my-institution') ||
                                                        verifyPermission(props.userPermissions, "update-processing-circuit-any-institution") ||
                                                        verifyPermission(props.userPermissions, "update-processing-circuit-without-institution")?
                                                            (
                                                                <NavLink to="/settings/processing-circuit" className="kt-menu__item " activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                    <li className="kt-menu__link ">
                                                                        <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                        <span className="kt-menu__link-text"> {t("Entités de Traitement")}</span>
                                                                    </li>
                                                                </NavLink>
                                                            ): null

                                                    }*/}
                        {/*{
                                                    verifyPermission(props.userPermissions, "update-sms-parameters") ? (
                                                        <NavLink exact to="/settings/sms" className="kt-menu__item "
                                                                 activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                            <li className="kt-menu__link ">
                                                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                <span className="kt-menu__link-text">SMS</span>
                                                            </li>
                                                        </NavLink>
                                                    ) : null
                                                }*/}

                        {/*   {
                                                        verifyPermission(props.userPermissions, 'update-mail-parameters') ? (
                                                            <NavLink exact to="/settings/mail" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Envoie de mail")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }*/}
                        {/* {
                                                        verifyPermission(props.userPermissions, "update-claim-object-requirement") ?
                                                            <NavLink to="/settings/requirement" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text"> {t("Exigences")}</span>
                                                                </li>
                                                            </NavLink>
                                                            : null
                                                    }

                                                    <NavLink to="/settings/faqs/list" className="kt-menu__item "
                                                             activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                        <li className="kt-menu__link ">
                                                            <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                            <span className="kt-menu__link-text">FAQs</span>
                                                        </li>
                                                    </NavLink>

                                                    {
                                                        verifyPermission(props.userPermissions, 'list-position') ? (
                                                            <NavLink exact to="/settings/positions" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Fonctions")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }*/}
                        {/*{
                                                    verifyPermission(props.userPermissions, "list-performance-indicator") ? (
                                                        <NavLink exact to="/settings/performance_indicator"
                                                                 className="kt-menu__item " activeClassName="kt-menu__item--active"
                                                                 aria-haspopup="true">
                                                            <li className="kt-menu__link ">
                                                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                <span
                                                                    className="kt-menu__link-text">Indicateur de performance</span>
                                                            </li>
                                                        </NavLink>
                                                    ) : null
                                                }*/}

                        {/* {
                                                        verifyPermission(props.userPermissions, "list-any-institution") ?
                                                            <NavLink to="/settings/institution" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Institutions")}</span>
                                                                </li>
                                                            </NavLink>
                                                            : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "update-my-institution") ?
                                                            <NavLink to="/settings/institution/edit" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Institution")}</span>
                                                                </li>
                                                            </NavLink>
                                                            : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "list-message-apis") ? (
                                                            <NavLink exact to="/settings/message-apis" className="kt-menu__item" activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Message API")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }

                                                    {
                                                        verifyPermission(props.userPermissions, "update-my-institution-message-api") ? (
                                                            <NavLink exact to="/settings/institution-message-apis" className="kt-menu__item" activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Institution Message API")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, 'list-severity-level') ? (
                                                            <NavLink exact to="/settings/severities" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Niveau de gravité")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }

                                                    {
                                                        verifyPermission(props.userPermissions, "update-notifications") ? (
                                                            <NavLink exact to="/settings/notification" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Notification")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, 'list-claim-object') ? (
                                                            <NavLink exact to="/settings/claim_objects" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Objet de réclamation")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }

                                                    {

                                                        verifyPermission(props.userPermissions, "update-active-pilot")? (
                                                            <NavLink exact to="/settings/activate-pilot"
                                                                     className="kt-menu__item"
                                                                     activeClassName="kt-menu__item--active"
                                                                     aria-haspopup="true">

                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Pilote actif")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }

                                                    {
                                                        verifyPermission(props.userPermissions, "list-notification-proof") || verifyPermission(props.userPermissions, 'list-any-notification-proof') ? (
                                                            <NavLink exact to="/settings/proof-of-receipt" className="kt-menu__item " activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Preuve d'accusé de réception")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }

                                                    {
                                                        ((verifyPermission(props.userPermissions, "pilot-list-notification-proof") || verifyPermission(props.userPermissions, 'pilot-list-any-notification-proof')) && props.activePilot) ? (
                                                            <NavLink exact to="/settings/proof-of-receipt" className="kt-menu__item " activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Preuve d'accusé de réception")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }


                                                    {
                                                        verifyPermission(props.userPermissions, "config-reporting-claim-any-institution")||
                                                        verifyPermission(props.userPermissions, "config-reporting-claim-my-institution")?
                                                         (   <NavLink to="/settings/rapport-auto" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text"> {t("Rapport Automatique")}</span>
                                                                </li>
                                                            </NavLink>
                                                            ) : null
                                                    }

                                                    {
                                                        verifyPermission(props.userPermissions, 'list-any-institution-type-role') || verifyPermission(props.userPermissions, 'list-my-institution-type-role') ? (
                                                            <NavLink exact to="/settings/rules" className="kt-menu__item " activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Rôle")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "list-type-client") ?
                                                            <NavLink to="/settings/clients/type" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Type Clients")} </span>
                                                                </li>
                                                            </NavLink>
                                                            : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "list-account-type") ?
                                                            <NavLink to="/settings/accounts/type" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Type Compte")} </span>
                                                                </li>
                                                            </NavLink>
                                                            : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "list-relationship") ?
                                                            <NavLink exact to="/settings/relationship" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Type de relation client")}</span>
                                                                </li>
                                                            </NavLink>
                                                            : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, 'list-unit-type') ? (
                                                            <NavLink exact to="/settings/unit_type" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Type d'unité")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, 'list-any-unit') || verifyPermission(props.userPermissions, 'list-my-unit') || verifyPermission(props.userPermissions, 'list-without-link-unit') ? (
                                                            <NavLink exact to="/settings/unit" className="kt-menu__item "
                                                                     activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Unité")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        verifyPermission(props.userPermissions, "list-user-my-institution") || verifyPermission(props.userPermissions, "list-user-any-institution") ? (
                                                            <NavLink exact to="/settings/users" className="kt-menu__item " activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Utilisateur")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }
                                                    {
                                                        (verifyPermission(props.userPermissions, "my-email-claim-configuration") || verifyPermission(props.userPermissions, "any-email-claim-configuration")) ? (
                                                            <NavLink exact to="/settings/config-mail" className="kt-menu__item " activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Email Configuration")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }*/}

                        {/*
                                                    (verifyPermission(props.userPermissions, "activity-log")) ? (
                                                        <NavLink exact to="/settings/reset-password" className="kt-menu__item " activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                            <li className="kt-menu__link ">
                                                                <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                <span className="kt-menu__link-text">Changer le mot de passe</span>
                                                            </li>
                                                        </NavLink>
                                                    ) : null*/}
                        {/* {
                                                        (verifyPermission(props.userPermissions, "activity-log")) ? (
                                                            <NavLink exact to="/settings/logs" className="kt-menu__item " activeClassName="kt-menu__item--active" aria-haspopup="true">
                                                                <li className="kt-menu__link ">
                                                                    <i className="kt-menu__link-bullet kt-menu__link-bullet--dot"><span/></i>
                                                                    <span className="kt-menu__link-text">{t("Journal des activitées")}</span>
                                                                </li>
                                                            </NavLink>
                                                        ) : null
                                                    }*/}
                      </ul>
                    </div>
                  </li>
                </>
              )}

              <>
                <li className="kt-menu__section ">
                  <h4 className="kt-menu__section-text">{t("Mannuels")}</h4>
                  <i className="kt-menu__section-icon flaticon-more-v2" />
                </li>
                <li
                  className="kt-menu__item  kt-menu__item--submenu"
                  aria-haspopup="true"
                  data-ktmenu-submenu-toggle="hover"
                >
                  <a
                    href="#manuals"
                    onClick={(e) => e.preventDefault()}
                    className="kt-menu__link kt-menu__toggle"
                  >
                    <i className="kt-menu__link-icon flaticon2-paper" />
                    <span className="kt-menu__link-text">{t("Guides")}</span>
                    <i className="kt-menu__ver-arrow la la-angle-right" />
                  </a>
                  <div className="kt-menu__submenu ">
                    <span className="kt-menu__arrow" />
                    <ul className="kt-menu__subnav">
                      <li
                        className="kt-menu__item  kt-menu__item--parent"
                        aria-haspopup="true"
                      >
                        <span className="kt-menu__link">
                          <span className="kt-menu__link-text">
                            {t("Guides")}
                          </span>
                        </span>
                      </li>

                      {data?.map((mes, i) => {
                        const role_name = mes.name;
                        const role_label = mes.description;
                        return (
                          <CurrencUserGuide
                            key={i}
                            role={role_name}
                            label={role_label}
                          />
                        );
                      })}
                    </ul>
                  </div>
                </li>
              </>
              <>
                <li className="kt-menu__section ">
                  <h4 className="kt-menu__section-text">{t("Support")}</h4>
                  <i className="kt-menu__section-icon flaticon-more-v2" />
                </li>
                <li
                  className="kt-menu__item  kt-menu__item--submenu"
                  aria-haspopup="true"
                  data-ktmenu-submenu-toggle="hover"
                >
                  <a
                    href="#manuals"
                    onClick={(e) => {
                      goToSupport(e, {
                        ...props,
                        roles: data?.map((mes, i) => {
                          const role_name = mes.name;
                          // const role_label = mes.description;
                          return role_name;
                        }),
                      });
                    }}
                    className="kt-menu__link kt-menu__toggle"
                  >
                    <i className="kt-menu__link-icon flaticon2-paper" />
                    <span className="kt-menu__link-text">{t("Feedback")}</span>
                    <i className="kt-menu__ver-arrow la la-angle-right" />
                  </a>
                  <div className="kt-menu__submenu ">
                    <span className="kt-menu__arrow" />
                    <ul className="kt-menu__subnav">
                      <li
                        className="kt-menu__item  kt-menu__item--parent"
                        aria-haspopup="true"
                      >
                        <span className="kt-menu__link">
                          <span className="kt-menu__link-text">
                            {t("Support")}
                          </span>
                        </span>
                      </li>
                    </ul>
                  </div>
                </li>
              </>
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    userPermissions: state?.user?.user?.permissions || null,
    activePilot: state?.user?.user?.staff?.is_active_pilot || false,
    lead: state?.user?.user?.staff?.is_lead || false,
    user: state?.user?.user || {},
    plan: state.plan.plan,
  };
};

export default connect(mapStateToProps)(Aside);
