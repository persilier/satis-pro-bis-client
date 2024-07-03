import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  loadCss,
  filterDataTableBySearchValue,
  forceRound,
  formatDateToTime,
  reduceCharacter,
} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import InfirmationTable from "../components/InfirmationTable";
import { ERROR_401 } from "../../config/errorPage";
import { verifyPermission } from "../../helpers/permission";
import { connect } from "react-redux";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import { useTranslation } from "react-i18next";
import HtmlDescriptionModal from "../components/DescriptionDetail/HtmlDescriptionModal";
import HtmlDescription from "../components/DescriptionDetail/HtmlDescription";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const endPointConfig = {
  PRO: {
    plan: "PRO",
    list: `${appConfig.apiDomaine}/my/claim-satisfaction-measured`,
  },
  MACRO: {
    holding: {
      list: `${appConfig.apiDomaine}/my/claim-satisfaction-measured`,
    },
    filial: {
      list: `${appConfig.apiDomaine}/my/claim-satisfaction-measured`,
    },
  },
  HUB: {
    plan: "HUB",
    list: `${appConfig.apiDomaine}/any/claim-satisfaction-measured`,
  },
};

const SatisfactionMeasure = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  document.title = ready ? t("Satis client - Mesure satisfaction") : "";

  if (
    !(
      verifyPermission(
        props.userPermissions,
        "list-satisfaction-measured-my-claim"
      ) ||
      verifyPermission(
        props.userPermissions,
        "list-satisfaction-measured-any-claim"
      )
    )
  )
    window.location.href = ERROR_401;

  let endPoint = "";
  if (props.plan === "MACRO") {
    if (
      verifyPermission(
        props.userPermissions,
        "list-satisfaction-measured-my-claim"
      )
    )
      endPoint = endPointConfig[props.plan].holding;
    else if (
      verifyPermission(
        props.userPermissions,
        "list-satisfaction-measured-my-claim"
      )
    )
      endPoint = endPointConfig[props.plan].filial;
  } else endPoint = endPointConfig[props.plan];

  const [load, setLoad] = useState(true);
  const [satisfactionMeasure, setSatisfactionMeasure] = useState([]);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(5);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [search, setSearch] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      axios
        .get(endPoint.list)
        .then((response) => {
          setLoad(false);
          setSatisfactionMeasure(response.data);
          setShowList(response.data.slice(0, numberPerPage));
          setNumberPage(forceRound(response.data.length / numberPerPage));
        })
        .catch((error) => {
          setLoad(false);
          //console.log("Something is wrong");
        });
    }
    window.sortHandlerGlobal = fetchData;

    if (verifyTokenExpire()) {
      fetchData();
    }
  }, []);

  const searchElement = async (e) => {
    if (e.target.value) {
      await setSearch(true);
      filterDataTableBySearchValue(e);
    } else {
      await setSearch(true);
      filterDataTableBySearchValue(e);
      setSearch(false);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    setShowList(satisfactionMeasure.slice(0, parseInt(e.target.value)));
    setNumberPage(
      forceRound(satisfactionMeasure.length / parseInt(e.target.value))
    );
  };

  const getEndByPosition = (position) => {
    let end = numberPerPage;
    for (let i = 1; i < position; i++) {
      end = end + numberPerPage;
    }
    return end;
  };

  const onClickPage = (e, page) => {
    e.preventDefault();
    setActiveNumberPage(page);
    setShowList(
      satisfactionMeasure.slice(
        getEndByPosition(page) - numberPerPage,
        getEndByPosition(page)
      )
    );
  };

  const onClickNextPage = (e) => {
    e.preventDefault();
    if (activeNumberPage <= numberPage) {
      setActiveNumberPage(activeNumberPage + 1);
      setShowList(
        satisfactionMeasure.slice(
          getEndByPosition(activeNumberPage + 1) - numberPerPage,
          getEndByPosition(activeNumberPage + 1)
        )
      );
    }
  };

  const onClickPreviousPage = (e) => {
    e.preventDefault();
    if (activeNumberPage >= 1) {
      setActiveNumberPage(activeNumberPage - 1);
      setShowList(
        satisfactionMeasure.slice(
          getEndByPosition(activeNumberPage - 1) - numberPerPage,
          getEndByPosition(activeNumberPage - 1)
        )
      );
    }
  };

  const arrayNumberPage = () => {
    const pages = [];
    for (let i = 0; i < numberPage; i++) {
      pages[i] = i;
    }
    return pages;
  };

  const pages = arrayNumberPage();

  const showModal = (message) => {
    setCurrentMessage(message);
    document.getElementById("button_modal").click();
  };

  const printBodyTable = (measure, index) => {
    return (
      <tr key={index} role="row" className="odd">
        <td data-sort="reference">
          {measure.reference === null ? "" : measure.reference}
        </td>
        <td data-sort="claimer.lastname">{`${
          measure.claimer && measure.claimer.lastname
            ? measure.claimer.lastname
            : ""
        } ${
          measure.claimer && measure.claimer.firstname
            ? measure.claimer.firstname
            : ""
        }  ${
          measure.account_targeted
            ? " / " + measure.account_targeted.number
            : measure.account_number
            ? " / " + measure.account_number
            : ""
        }`}</td>
        <td data-sort="unitTargeted.name">
          {props.plan === "PRO"
            ? measure.unit_targeted
              ? measure.unit_targeted.name.fr
              : "-"
            : measure.institution_targeted.name}
        </td>
        <td data-sort="created_at">
          {formatDateToTime(measure.created_at)} <br />
          {measure.timeExpire >= 0 ? (
            <span style={{ color: "red", fontWeight: "bold" }}>
              {"J+" + measure.timeExpire}
            </span>
          ) : (
            <span style={{ color: "forestgreen", fontWeight: "bold" }}>
              {"J" + measure.timeExpire}
            </span>
          )}
        </td>
        <td data-sort="claimObject.name">{measure.claim_object.name["fr"]}</td>
        <td data-sort="description">
          <HtmlDescription
            onClick={() =>
              showModal(measure.description ? measure.description : "-")
            }
          />

          {/*{measure.description.length >= 15 ? reduceCharacter(measure.description) : measure.description}*/}
        </td>
        {/* data-sort="activeTreatment.responsibleStaff.identite.lastname" */}
        <td>{`${
          measure.active_treatment.responsible_staff
            ? measure.active_treatment.responsible_staff.identite.lastname
            : ""
        } ${
          measure.active_treatment.responsible_staff
            ? measure.active_treatment.responsible_staff.identite.firstname
            : ""
        }/${measure.active_treatment.responsible_staff.unit.name["fr"]}`}</td>
        {verifyPermission(
          props.userPermissions,
          "update-satisfaction-measured-my-claim"
        ) ||
        verifyPermission(
          props.userPermissions,
          "update-satisfaction-measured-any-claim"
        ) ? (
          <td style={{ textAlign: "center" }}>
            <a
              href={`/process/claim_measure/${measure.id}/detail`}
              className="btn btn-sm btn-clean btn-icon btn-icon-md"
              title={t("Détails")}
            >
              <i className="la la-eye" />
            </a>
          </td>
        ) : null}
      </tr>
    );
  };

  return ready ? (
    <div
      className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
      id="kt_content"
    >
      <div className="kt-subheader   kt-grid__item" id="kt_subheader">
        <div className="kt-container  kt-container--fluid ">
          <div className="kt-subheader__main">
            <h3 className="kt-subheader__title">{t("Processus")}</h3>
            <span className="kt-subheader__separator kt-hidden" />
            <div className="kt-subheader__breadcrumbs">
              <a href="#icone" className="kt-subheader__breadcrumbs-home">
                <i className="flaticon2-shelter" />
              </a>
              <span className="kt-subheader__breadcrumbs-separator" />
              <a
                href="#button"
                onClick={(e) => e.preventDefault()}
                className="kt-subheader__breadcrumbs-link"
                style={{ cursor: "default" }}
              >
                {t("Traitement")}
              </a>
              <span className="kt-subheader__separator kt-hidden" />
              <div className="kt-subheader__breadcrumbs">
                <a href="#icone" className="kt-subheader__breadcrumbs-home">
                  <i className="flaticon2-shelter" />
                </a>
                <span className="kt-subheader__breadcrumbs-separator" />
                <a
                  href="#button"
                  onClick={(e) => e.preventDefault()}
                  className="kt-subheader__breadcrumbs-link"
                >
                  {t("Mesure de Satisfaction")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
        <InfirmationTable
          information={t("La liste des réclamations à mésurer la satisfaction")}
        />

        <div className="kt-portlet">
          <HeaderTablePage title={t("Mesure de Satisfaction")} />

          <div className="kt-portlet__body">
            <div
              id="kt_table_1_wrapper"
              className="dataTables_wrapper dt-bootstrap4"
            >
              <div className="row">
                <div className="col-sm-6 text-left">
                  <div id="kt_table_1_filter" className="dataTables_filter">
                    <label>
                      {t("Rechercher")}:
                      <input
                        id="myInput"
                        type="text"
                        onKeyUp={(e) => searchElement(e)}
                        className="form-control form-control-sm"
                        placeholder=""
                        aria-controls="kt_table_1"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12">
                  <table
                    className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                    id="myTable"
                    role="grid"
                    aria-describedby="kt_table_1_info"
                    style={{ width: "952px" }}
                  >
                    <thead>
                      <tr role="row">
                        <th
                          className="sorting "
                          tabIndex="0"
                          aria-controls="kt_table_1"
                          rowSpan="1"
                          colSpan="1"
                          style={{ width: "70.25px", paddingRight: "0" }}
                          aria-label="Country: activate to sort column ascending"
                        >
                          {t("Référence")}
                        </th>
                        <th
                          className="sorting"
                          tabIndex="0"
                          aria-controls="kt_table_1"
                          rowSpan="1"
                          colSpan="1"
                          style={{ width: "70.25px", paddingRight: "0" }}
                          aria-label="Country: activate to sort column ascending"
                        >
                          {t("Réclamant")}
                        </th>
                        <th
                          className="sorting"
                          tabIndex="0"
                          aria-controls="kt_table_1"
                          rowSpan="1"
                          colSpan="1"
                          style={{ width: "80.25px", paddingRight: "0" }}
                          aria-label="Country: activate to sort column ascending"
                        >
                          {props.plan === "PRO"
                            ? t("Point de service visé")
                            : t("Institution ciblée")}
                        </th>
                        <th
                          className="sorting sorter-dates"
                          tabIndex="0"
                          aria-controls="kt_table_1"
                          rowSpan="1"
                          colSpan="1"
                          style={{ width: "50px", paddingRight: "0" }}
                          aria-label="Country: activate to sort column ascending"
                        >
                          {t("Date de réception")}
                        </th>
                        <th
                          className="sorting"
                          tabIndex="0"
                          aria-controls="kt_table_1"
                          rowSpan="1"
                          colSpan="1"
                          style={{ width: "70.25px", paddingRight: "0" }}
                          aria-label="Country: activate to sort column ascending"
                        >
                          {t("Objet de réclamation")}
                        </th>
                        <th
                          className="sorting"
                          tabIndex="0"
                          aria-controls="kt_table_1"
                          rowSpan="1"
                          colSpan="1"
                          style={{ width: "70.25px", paddingRight: "0" }}
                          aria-label="Country: activate to sort column ascending"
                        >
                          {t("Description")}
                        </th>

                        <th
                          className=""
                          tabIndex="0"
                          aria-controls="kt_table_1"
                          rowSpan="1"
                          colSpan="1"
                          style={{ width: "70.25px", paddingRight: "0" }}
                          aria-label="Country: activate to sort column ascending"
                        >
                          {t("Agent traiteur")}
                        </th>
                        <th
                          className="sorting"
                          tabIndex="0"
                          aria-controls="kt_table_1"
                          rowSpan="1"
                          colSpan="1"
                          style={{ width: "40.25px", paddingRight: "0" }}
                          aria-label="Type: activate to sort column ascending"
                        >
                          {t("Action")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {load ? (
                        <LoadingTable />
                      ) : satisfactionMeasure.length ? (
                        search ? (
                          satisfactionMeasure.map((measure, index) =>
                            printBodyTable(measure, index)
                          )
                        ) : (
                          showList.map((measure, index) =>
                            printBodyTable(measure, index)
                          )
                        )
                      ) : (
                        <EmptyTable />
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th rowSpan="1" colSpan="1">
                          Référence
                        </th>
                        <th rowSpan="1" colSpan="1">
                          Réclamant
                        </th>
                        <th rowSpan="1" colSpan="1">
                          {props.plan === "PRO"
                            ? "Point de service visé"
                            : "Institution ciblée"}
                        </th>
                        <th rowSpan="1" colSpan="1">
                          Date de réception
                        </th>
                        <th rowSpan="1" colSpan="1">
                          Objet de réclamation
                        </th>
                        <th rowSpan="1" colSpan="1">
                          Description
                        </th>
                        <th rowSpan="1" colSpan="1">
                          Agent traiteur
                        </th>
                        <th rowSpan="1" colSpan="1">
                          Action
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                  <button
                    id="button_modal"
                    type="button"
                    className="btn btn-secondary btn-icon-sm d-none"
                    data-toggle="modal"
                    data-target="#message_email"
                  />
                  <HtmlDescriptionModal
                    title={"Description"}
                    message={currentMessage}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12 col-md-5">
                  <div
                    className="dataTables_info"
                    id="kt_table_1_info"
                    role="status"
                    aria-live="polite"
                  >
                    Affichage de 1 à {numberPerPage} sur{" "}
                    {satisfactionMeasure.length} données
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12 col-md-5">
                    <div
                      className="dataTables_info"
                      id="kt_table_1_info"
                      role="status"
                      aria-live="polite"
                    >
                      {t("Affichage de")} 1 {t("à")} {numberPerPage} {t("sur")}{" "}
                      {satisfactionMeasure.length} {t("données")}
                    </div>
                  </div>
                  {!search ? (
                    <div className="col-sm-12 col-md-7 dataTables_pager">
                      <Pagination
                        numberPerPage={numberPerPage}
                        onChangeNumberPerPage={onChangeNumberPerPage}
                        activeNumberPage={activeNumberPage}
                        onClickPreviousPage={(e) => onClickPreviousPage(e)}
                        pages={pages}
                        onClickPage={(e, number) => onClickPage(e, number)}
                        numberPage={numberPage}
                        onClickNextPage={(e) => onClickNextPage(e)}
                      />
                    </div>
                  ) : null}
                </div>
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
    plan: state.plan.plan,
  };
};

export default connect(mapStateToProps)(SatisfactionMeasure);
