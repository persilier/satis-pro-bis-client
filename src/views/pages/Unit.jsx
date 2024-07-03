import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  forceRound,
  getLowerCaseString,
  loadCss,
} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import { ToastBottomEnd } from "../components/Toast";
import {
  toastDeleteErrorMessageConfig,
  toastDeleteSuccessMessageConfig,
  toastErrorMessageWithParameterConfig,
} from "../../config/toastConfig";
import { DeleteConfirmation } from "../components/ConfirmationAlert";
import { confirmDeleteConfig } from "../../config/confirmConfig";
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import InfirmationTable from "../components/InfirmationTable";
import { ERROR_401 } from "../../config/errorPage";
import { verifyPermission } from "../../helpers/permission";
import { NUMBER_ELEMENT_PER_PAGE } from "../../constants/dataTable";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import ExportButton from "../components/ExportButton";
import { useTranslation } from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const endPointConfig = {
  PRO: {
    plan: "PRO",
    list: `${appConfig.apiDomaine}/my/units`,
    destroy: (unitId) => `${appConfig.apiDomaine}/my/units/${unitId}`,
  },
  MACRO: {
    holding: {
      list: `${appConfig.apiDomaine}/any/units`,
      destroy: (unitId) => `${appConfig.apiDomaine}/any/units/${unitId}`,
    },
    filial: {
      list: `${appConfig.apiDomaine}/my/units`,
      destroy: (unitId) => `${appConfig.apiDomaine}/my/units/${unitId}`,
    },
  },
  HUB: {
    plan: "HUB",
    list: `${appConfig.apiDomaine}/without-link/units`,
    destroy: (unitId) => `${appConfig.apiDomaine}/without-link/units/${unitId}`,
  },
};

const Unit = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  if (
    !(
      verifyPermission(props.userPermissions, "list-any-unit") ||
      verifyPermission(props.userPermissions, "list-my-unit") ||
      verifyPermission(props.userPermissions, "list-without-link-unit")
    )
  )
    window.location.href = ERROR_401;

  let endPoint = "";
  if (props.plan === "MACRO") {
    if (verifyPermission(props.userPermissions, "list-any-unit"))
      endPoint = endPointConfig[props.plan].holding;
    else if (verifyPermission(props.userPermissions, "list-my-unit"))
      endPoint = endPointConfig[props.plan].filial;
  } else {
    endPoint = endPointConfig[props.plan];
  }
  const [load, setLoad] = useState(true);
  const [units, setUnits] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(NUMBER_ELEMENT_PER_PAGE);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await axios
        .get(endPoint.list)
        .then((response) => {
          setNumberPage(
            forceRound(response.data.length / NUMBER_ELEMENT_PER_PAGE)
          );
          setShowList(response.data.slice(0, NUMBER_ELEMENT_PER_PAGE));

          setUnits(response.data);
          setLoad(false);
        })
        .catch((error) => {
          setLoad(false);
          //console.log("Something is wrong");
        });
    }
    window.sortHandlerGlobal = fetchData;

    if (verifyTokenExpire()) fetchData();
  }, [endPoint.list, NUMBER_ELEMENT_PER_PAGE]);

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newUnits = [...units];
    newUnits = newUnits.filter(
      (el) =>
        getLowerCaseString(el.name["fr"]).indexOf(value) >= 0 ||
        getLowerCaseString(el.unit_type.name["fr"]).indexOf(value) >= 0 ||
        getLowerCaseString(
          el.lead
            ? el.lead.identite
              ? el.lead.identite.lastname + " " + el.lead.identite.firstname
              : "-"
            : "-"
        ).indexOf(value) >= 0 ||
        getLowerCaseString(
          verifyPermission(props.userPermissions, "list-any-unit")
            ? el.institution
              ? el.institution.name
              : "-"
            : "-"
        ).indexOf(value) >= 0
    );

    return newUnits;
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
      setNumberPage(forceRound(units.length / NUMBER_ELEMENT_PER_PAGE));
      setShowList(units.slice(0, NUMBER_ELEMENT_PER_PAGE));
      setActiveNumberPage(1);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    setShowList(units.slice(0, parseInt(e.target.value)));
    setNumberPage(forceRound(units.length / parseInt(e.target.value)));
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
      units.slice(
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
        units.slice(
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
        units.slice(
          getEndByPosition(activeNumberPage - 1) - numberPerPage,
          getEndByPosition(activeNumberPage - 1)
        )
      );
    }
  };

  const deleteUnit = (unitId, index) => {
    DeleteConfirmation.fire(confirmDeleteConfig()).then((result) => {
      if (verifyTokenExpire()) {
        if (result.value) {
          axios
            .delete(endPoint.destroy(unitId))
            .then((response) => {
              const newUnits = [...units].filter((e) => e.id !== unitId);
              setShowList(newUnits.slice(0, numberPerPage));
              setUnits(newUnits);
              if (showList.length > 1) {
                setShowList(
                  newUnits.slice(
                    getEndByPosition(activeNumberPage) - numberPerPage,
                    getEndByPosition(activeNumberPage)
                  )
                );
                setActiveNumberPage(activeNumberPage);
              } else {
                setShowList(
                  newUnits.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                  )
                );
                setActiveNumberPage(activeNumberPage - 1);
              }
              setNumberPage(forceRound(newUnits.length / numberPerPage));
              ToastBottomEnd.fire(toastDeleteSuccessMessageConfig());
            })
            .catch((error) => {
              if (error.response.data.error)
                ToastBottomEnd.fire(
                  toastErrorMessageWithParameterConfig(
                    error.response.data.error
                  )
                );
              else ToastBottomEnd.fire(toastDeleteErrorMessageConfig());
            });
        }
      }
    });
  };

  const arrayNumberPage = () => {
    const pages = [];
    for (let i = 0; i < numberPage; i++) {
      pages[i] = i;
    }
    return pages;
  };

  const pages = arrayNumberPage();

  const printBodyTable = (unit, index) => {
    return (
      <tr key={index} role="row" className="odd">
        <td data-sort="name">{unit.name["fr"]}</td>
        <td
          data-sort="unitType.name"
          style={{ textOverflow: "ellipsis", width: "70px" }}
        >
          {unit.unit_type.name["fr"]}
        </td>
        <td
          data-sort="state.country.name"
          style={{ textOverflow: "ellipsis", width: "70px" }}
        >
          {" "}
          {unit.state && unit.state.country
            ? unit.state.country.name
            : "-"}{" "}
        </td>
        <td
          data-sort="state.state.name"
          style={{ textOverflow: "ellipsis", width: "70px" }}
        >
          {" "}
          {unit.state ? unit.state.name : "-"}{" "}
        </td>
        <td
          data-sort="state.state.name"
          style={{ textOverflow: "ellipsis", width: "70px" }}
        >
          {unit.lead
            ? unit.lead.identite
              ? unit.lead.identite.lastname + " " + unit.lead.identite.firstname
              : "-"
            : "-"}
        </td>
        {verifyPermission(props.userPermissions, "list-any-unit") ? (
          <td
            data-sort="state.state.name"
            style={{ textOverflow: "ellipsis", width: "70px" }}
          >
            {unit.institution ? unit.institution.name : null}
          </td>
        ) : null}
        <td>
          {verifyPermission(props.userPermissions, "update-any-unit") ||
          verifyPermission(props.userPermissions, "update-my-unit") ||
          verifyPermission(
            props.userPermissions,
            "update-without-link-unit"
          ) ? (
            <Link
              to={`/settings/unit/${unit.id}/edit`}
              className="btn btn-sm btn-clean btn-icon btn-icon-md"
              title={t("Modifier")}
            >
              <i className="la la-edit" />
            </Link>
          ) : null}
          {verifyPermission(props.userPermissions, "destroy-any-unit") ||
          verifyPermission(props.userPermissions, "destroy-my-unit") ||
          verifyPermission(
            props.userPermissions,
            "destroy-without-link-unit"
          ) ? (
            <button
              onClick={(e) => deleteUnit(unit.id, index)}
              className="btn btn-sm btn-clean btn-icon btn-icon-md"
              title={t("Supprimer")}
            >
              <i className="la la-trash" />
            </button>
          ) : null}
        </td>
      </tr>
    );
  };

  return ready ? (
    verifyPermission(props.userPermissions, "list-any-unit") ||
    verifyPermission(props.userPermissions, "list-my-unit") ||
    verifyPermission(props.userPermissions, "list-without-link-unit") ? (
      <div
        className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
        id="kt_content"
      >
        <div className="kt-subheader   kt-grid__item" id="kt_subheader">
          <div className="kt-container  kt-container--fluid ">
            <div className="kt-subheader__main">
              <h3 className="kt-subheader__title">{t("Paramètres")}</h3>
              <span className="kt-subheader__separator kt-hidden" />
              <div className="kt-subheader__breadcrumbs">
                <a href="#" className="kt-subheader__breadcrumbs-home">
                  <i className="flaticon2-shelter" />
                </a>
                <span className="kt-subheader__breadcrumbs-separator" />
                <a
                  href=""
                  onClick={(e) => e.preventDefault()}
                  className="kt-subheader__breadcrumbs-link"
                  style={{ cursor: "text" }}
                >
                  {t("Unité")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
          <InfirmationTable
            information={t("Liste des services, agences, etc") + "..."}
          />

          <div className="kt-portlet">
            <HeaderTablePage
              addPermission={[
                "store-any-unit",
                "store-my-unit",
                "store-without-link-unit",
              ]}
              title={t("Unité")}
              addText={t("Ajouter")}
              addLink={"/settings/unit/add"}
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
                    <div className="col-sm-6 text-left">
                      <div id="kt_table_1_filter" className="dataTables_filter">
                        <label>
                          {t("Recherche")}:
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

                    <ExportButton
                      downloadLink={`${appConfig.apiDomaine}/download-excel/units`}
                      pageUrl={"/settings/unit/import"}
                    />
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
                              style={{ width: "70.25px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {t("Nom Unité")}
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "70px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {t("Type Unité")}
                            </th>
                            <th
                              className="sorting "
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "0px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {t("Pays")}
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "0px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {t("Zones")}
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "70px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {t("Responsable")}
                            </th>
                            {verifyPermission(
                              props.userPermissions,
                              "list-any-unit"
                            ) ? (
                              <th
                                className="sorting"
                                tabIndex="0"
                                aria-controls="kt_table_1"
                                rowSpan="1"
                                colSpan="1"
                                style={{ width: "70px" }}
                                aria-label="Country: activate to sort column ascending"
                              >
                                {t("Institution")}
                              </th>
                            ) : (
                              <th style={{ display: "none" }} />
                            )}
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "40.25px" }}
                              aria-label="Type: activate to sort column ascending"
                            >
                              {t("Action")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {units.length ? (
                            showList.length ? (
                              showList.map((unit, index) =>
                                printBodyTable(unit, index)
                              )
                            ) : (
                              <EmptyTable search={true} />
                            )
                          ) : (
                            <EmptyTable />
                          )}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th rowSpan="1" colSpan="1">
                              {t("Nom Unité")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Type Unité")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Pays")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Zones")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Responsable")}
                            </th>
                            {verifyPermission(
                              props.userPermissions,
                              "list-any-unit"
                            ) ? (
                              <th rowSpan="1" colSpan="1">
                                {t("Institution")}
                              </th>
                            ) : (
                              <th style={{ display: "none" }} />
                            )}
                            <th rowSpan="1" colSpan="1">
                              {t("Action")}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
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
                        {t("sur")} {units.length} {t("données")}
                      </div>
                    </div>
                    {showList ? (
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

export default connect(mapStateToProps)(Unit);
