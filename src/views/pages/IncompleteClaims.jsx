import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import {
  loadCss,
  filterDataTableBySearchValue,
  forceRound,
  formatDateToTime,
  reduceCharacter,
  getLowerCaseString,
  truncateString,
} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import InfirmationTable from "../components/InfirmationTable";
import { ERROR_401 } from "../../config/errorPage";
import { verifyPermission } from "../../helpers/permission";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import HtmlDescription from "../components/DescriptionDetail/HtmlDescription";
import HtmlDescriptionModal from "../components/DescriptionDetail/HtmlDescriptionModal";
import { useTranslation } from "react-i18next";
import { NUMBER_ELEMENT_PER_PAGE } from "../../constants/dataTable";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const endPointConfig = {
  PRO: {
    plan: "PRO",
    list: `${appConfig.apiDomaine}/my/claims-incompletes`,
    destroy: (claimId) =>
      `${appConfig.apiDomaine}/my/claims-incompletes/${claimId}`,
  },
  MACRO: {
    holding: {
      list: `${appConfig.apiDomaine}/any/claims-incompletes`,
      destroy: (claimId) =>
        `${appConfig.apiDomaine}/any/claims-incompletes/${claimId}`,
    },
    filial: {
      list: `${appConfig.apiDomaine}/my/claims-incompletes`,
      destroy: (claimId) =>
        `${appConfig.apiDomaine}/my/claims-incompletes/${claimId}`,
    },
  },
  HUB: {
    plan: "HUB",
    list: `${appConfig.apiDomaine}/without-client/claims-incompletes `,
    destroy: (claimId) =>
      `${appConfig.apiDomaine}/without-client/claims-incompletes/${claimId}`,
  },
};

const IncompleteClaims = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  document.title =
    "Satis client - " + (ready ? t("Liste plaintes incomplètes") : null);
  if (
    !(
      verifyPermission(
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
      )
    )
  )
    window.location.href = ERROR_401;

  const [load, setLoad] = useState(true);
  const [incompleteClaims, setIncompleteClaims] = useState([]);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(10);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [search, setSearch] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  let endPoint = "";
  if (props.plan === "MACRO") {
    if (
      verifyPermission(
        props.userPermissions,
        "list-claim-incomplete-against-any-institution"
      )
    )
      endPoint = endPointConfig[props.plan].holding;
    else if (
      verifyPermission(
        props.userPermissions,
        "list-claim-incomplete-against-my-institution"
      )
    )
      endPoint = endPointConfig[props.plan].filial;
  } else endPoint = endPointConfig[props.plan];

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      axios
        .get(endPoint.list)
        .then((response) => {
          setLoad(false);
          setIncompleteClaims(response.data);
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

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newClaims = [...incompleteClaims];
    newClaims = newClaims.filter((el) => {
      return (
        getLowerCaseString(el.reference).indexOf(value) >= 0 ||
        getLowerCaseString(
          `${el.claimer && el.claimer.lastname ? el.claimer.lastname : ""} ${
            el.claimer && el.claimer.firstname ? el.claimer.firstname : ""
          }  ${
            el.account_targeted
              ? " / " + el.account_targeted.number
              : el.account_number
              ? " / " + el.account_number
              : ""
          }`
        ).indexOf(value) >= 0 ||
        getLowerCaseString(formatDateToTime(el.created_at)).indexOf(value) >=
          0 ||
        getLowerCaseString(
          el.claim_object && el.claim_object.name["fr"]
            ? el.claim_object.name["fr"]
            : ""
        ).indexOf(value) >= 0 ||
        getLowerCaseString(truncateString(el.description, 41)).indexOf(value) >=
          0 ||
        getLowerCaseString(el.institution_targeted.name).indexOf(value) >= 0
      );
    });

    return newClaims;
  };

  const searchElement = async (e) => {
    if (e.target.value) {
      setNumberPage(
        forceRound(
          filterShowListBySearchValue(e.target.value).length /
            NUMBER_ELEMENT_PER_PAGE
        )
      );
      setShowList(
        filterShowListBySearchValue(e.target.value.toLowerCase()).slice(
          0,
          NUMBER_ELEMENT_PER_PAGE
        )
      );
    } else {
      setNumberPage(
        forceRound(incompleteClaims.length / NUMBER_ELEMENT_PER_PAGE)
      );
      setShowList(incompleteClaims.slice(0, NUMBER_ELEMENT_PER_PAGE));
      setActiveNumberPage(1);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    setShowList(incompleteClaims.slice(0, parseInt(e.target.value)));
    setNumberPage(
      forceRound(incompleteClaims.length / parseInt(e.target.value))
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
      incompleteClaims.slice(
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
        incompleteClaims.slice(
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
        incompleteClaims.slice(
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

  const printBodyTable = (claim, index) => {
    return (
      <tr key={index} role="row" className="odd">
        <td data-sort="reference">{claim.reference ? claim.reference : ""}</td>
        <td data-sort="claimer.lastname">
          {claim.claimer ? claim.claimer.lastname : ""}&ensp;
          {claim.claimer ? claim.claimer.firstname : ""}
          {claim.account_targeted !== null
            ? "/" + claim.account_targeted.number
            : claim.account_number
            ? " / " + claim.account_number
            : ""}
        </td>
        <td data-sort="unitTargeted.name">
          {verifyPermission(
            props.userPermissions,
            "show-claim-incomplete-against-any-institution"
          ) ||
          verifyPermission(
            props.userPermissions,
            "show-claim-incomplete-without-client"
          )
            ? claim.institution_targeted
              ? claim.institution_targeted.name !== null
                ? claim.institution_targeted.name
                : ""
              : "-"
            : claim.unit_targeted
            ? claim.unit_targeted.name !== null
              ? claim.unit_targeted.name.fr
              : ""
            : "-"}
        </td>
        <td data-sort="created_at">
          {formatDateToTime(claim.created_at)} <br />
          {claim.timeExpire !== null &&
            (claim.timeExpire >= 0 ? (
              <span style={{ color: "forestgreen", fontWeight: "bold" }}>
                {"J+" + claim.timeExpire}
              </span>
            ) : (
              <span style={{ color: "red", fontWeight: "bold" }}>
                {"J" + claim.timeExpire}
              </span>
            ))}
        </td>
        <td data-sort="claimObject.name">
          {claim.claim_object
            ? claim.claim_object.name
              ? claim.claim_object.name.fr
              : "-    "
            : "- "}
        </td>
        <td style={{ textAlign: "center" }} data-sort="description">
          <HtmlDescription
            onClick={() =>
              showModal(claim.description ? claim.description : "-")
            }
          />
          {/*{claim.description.length > 30 ? reduceCharacter(claim.description) : claim.description}*/}
        </td>
        <td style={{ textAlign: "center" }}>
          {verifyPermission(
            props.userPermissions,
            "show-claim-incomplete-against-any-institution"
          ) ||
          verifyPermission(
            props.userPermissions,
            "show-claim-incomplete-against-my-institution"
          ) ||
          verifyPermission(
            props.userPermissions,
            "show-claim-incomplete-without-client"
          ) ? (
            <Link
              to={`/process/incomplete_claims/edit/${claim.id}`}
              className="btn btn-sm btn-clean btn-icon btn-icon-md"
              title={t("Complèter")}
            >
              <i className="la la-edit" />
            </Link>
          ) : null}
        </td>
      </tr>
    );
  };

  return ready ? (
    verifyPermission(
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
      <div
        className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
        id="kt_content"
      >
        <div className="kt-subheader  kt-grid__item" id="kt_subheader">
          <div className="kt-container  kt-container--fluid">
            <div className="kt-subheader__main">
              <h3 className="kt-subheader__title">{t("Collecte")}</h3>
              <span className="kt-subheader__separator kt-hidden" />
              <div className="kt-subheader__breadcrumbs">
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
                    {t("Réclamations Incomplètes")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="kt-container  kt-container--fluid kt-grid__item kt-grid__item--fluid">
          <InfirmationTable
            information={t("Liste des réclamations imcomplètes")}
          />

          <div className="kt-portlet">
            <HeaderTablePage
              addPermission={""}
              title={t("Réclamations Incomplètes")}
              addText={t("Ajouter de réclamations")}
              addLink={"/settings/claims/add"}
            />
            {load ? (
              <LoadingTable />
            ) : (
              <div className="kt-portlet__body">
                <div
                  id="kt_table_1_wrapper"
                  className="dataTables_wrapper dt-bootstrap4"
                >
                  <div className="row">
                    <div className="text-left col-sm-6">
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
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "25px" }}
                              aria-label="Ship City: activate to sort column ascending"
                            >
                              {t("Référence")}
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "85px" }}
                              aria-label="Ship City: activate to sort column ascending"
                            >
                              {t("Réclamant")}
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "50px" }}
                              aria-label="Ship City: activate to sort column ascending"
                            >
                              {verifyPermission(
                                props.userPermissions,
                                "show-claim-incomplete-against-any-institution"
                              ) ||
                              verifyPermission(
                                props.userPermissions,
                                "show-claim-incomplete-without-client"
                              )
                                ? t("Institution concernée")
                                : t("Point de service visé")}
                            </th>

                            <th
                              className="sorting sorter-dates"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "50px" }}
                              aria-label="Ship City: activate to sort column ascending"
                            >
                              {t("Date de réception")}
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "85px" }}
                              aria-label="Ship City: activate to sort column ascending"
                            >
                              {t("Objet de réclamation")}
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "100px" }}
                              aria-label="Ship City: activate to sort column ascending"
                            >
                              {t("Description")}
                            </th>

                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "70.25px" }}
                              aria-label="Type: activate to sort column ascending"
                            >
                              {t("Action")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {incompleteClaims.length ? (
                            search ? (
                              incompleteClaims.map((claim, index) =>
                                printBodyTable(claim, index)
                              )
                            ) : (
                              showList.map((claim, index) =>
                                printBodyTable(claim, index)
                              )
                            )
                          ) : (
                            <EmptyTable />
                          )}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th rowSpan="1" colSpan="1">
                              {t("Référence")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Réclamant")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {props.plan === "PRO"
                                ? t("Point de service visé")
                                : t("Institution ciblée")}
                            </th>

                            <th rowSpan="1" colSpan="1">
                              {t("Date de réception")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Objet de réclamation")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Description")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Action")}
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
                        title={t("Description")}
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
                        {t("Affichage de")} 1 {t("à")} {numberPerPage}{" "}
                        {t("sur")} {incompleteClaims.length} {t("données")}
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
            )}
          </div>
        </div>
      </div>
    ) : null
  ) : null;
};
const mapStateToProps = (state) => {
  return {
    userPermissions: state.user.user.permissions,
    plan: state.plan.plan,
  };
};

export default connect(mapStateToProps)(IncompleteClaims);
