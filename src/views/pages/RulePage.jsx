import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Link, NavLink } from "react-router-dom";
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
import { ERROR_401 } from "../../config/errorPage";
import { verifyPermission } from "../../helpers/permission";
import { NUMBER_ELEMENT_PER_PAGE } from "../../constants/dataTable";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import InfoFormatExcel from "../../constants/InfoFormatExcel";
import { useTranslation } from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const RulePage = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  document.title = ready ? t("Satis client - Paramètre rôle") : "";
  if (
    !(
      verifyPermission(
        props.userPermissions,
        "list-any-institution-type-role"
      ) ||
      verifyPermission(props.userPermissions, "list-my-institution-type-role")
    )
  )
    window.location.href = ERROR_401;

  const [load, setLoad] = useState(true);
  const [rules, setRulePages] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(10);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);

  useEffect(() => {
    var endpoint = ``;
    if (
      verifyPermission(props.userPermissions, "list-any-institution-type-role")
    )
      endpoint = `${appConfig.apiDomaine}/any/roles`;
    if (
      verifyPermission(props.userPermissions, "list-my-institution-type-role")
    )
      endpoint = `${appConfig.apiDomaine}/my/roles`;
    async function fetchData() {
      await axios
        .get(endpoint)
        .then((response) => {
          setNumberPage(forceRound(response.data.length / numberPerPage));
          setShowList(response.data.slice(0, numberPerPage));
          setRulePages(response.data);
          setLoad(false);
        })
        .catch((error) => {
          setLoad(false);
          console.log("Something is wrong");
        });
    }
    window.sortHandlerGlobal = fetchData;
    if (verifyTokenExpire()) fetchData();
  }, []);

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newRulePages = [...rules];
    newRulePages = newRulePages.filter(
      (el) =>
        getLowerCaseString(el.name ? el.name : "").indexOf(value) >= 0 ||
        getLowerCaseString(el.description ? el.description : "").indexOf(
          value
        ) >= 0
    );

    return newRulePages;
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
      setNumberPage(forceRound(rules.length / NUMBER_ELEMENT_PER_PAGE));
      setShowList(rules.slice(0, NUMBER_ELEMENT_PER_PAGE));
      setActiveNumberPage(1);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    setShowList(rules.slice(0, parseInt(e.target.value)));
    setNumberPage(forceRound(rules.length / parseInt(e.target.value)));
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
      rules.slice(
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
        rules.slice(
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
        rules.slice(
          getEndByPosition(activeNumberPage - 1) - numberPerPage,
          getEndByPosition(activeNumberPage - 1)
        )
      );
    }
  };

  const deleteRulePage = (ruleId, index) => {
    DeleteConfirmation.fire(confirmDeleteConfig()).then((result) => {
      if (verifyTokenExpire()) {
        if (result.value) {
          var endpoint = "";
          if (
            verifyPermission(
              props.userPermissions,
              "destroy-any-institution-type-role"
            )
          )
            endpoint = `${appConfig.apiDomaine}/any/roles/${ruleId}`;
          if (
            verifyPermission(
              props.userPermissions,
              "destroy-my-institution-type-role"
            )
          )
            endpoint = `${appConfig.apiDomaine}/my/roles/${ruleId}`;

          axios
            .delete(endpoint)
            .then((response) => {
              console.log("rule", rules);

              const newRulePages = [...rules].filter((e) => e.name !== ruleId);

              console.log("newRulePages", newRulePages);
              setShowList(newRulePages.slice(0, numberPerPage));
              setRulePages(newRulePages);

              if (showList.length > 1) {
                setShowList(
                  newRulePages.slice(
                    getEndByPosition(activeNumberPage) - numberPerPage,
                    getEndByPosition(activeNumberPage)
                  )
                );
                setActiveNumberPage(activeNumberPage);
              } else {
                setShowList(
                  newRulePages.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                  )
                );
                setActiveNumberPage(activeNumberPage - 1);
              }
              setNumberPage(forceRound(newRulePages.length / numberPerPage));
              ToastBottomEnd.fire(toastDeleteSuccessMessageConfig());
            })
            .catch((error) => {
              console.log("erreur:", error.response.data);
              if (error.response.status === 404) {
                ToastBottomEnd.fire(
                  toastErrorMessageWithParameterConfig(
                    error.response.data.error
                  )
                );
              } else {
                ToastBottomEnd.fire(toastDeleteErrorMessageConfig());
              }
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

  const printBodyTable = (rule, index) => {
    return (
      <tr key={index} role="row" className="odd">
        <td data-sort="name">{rule.name ? rule.name : "-"}</td>
        <td data-sort="description">
          {rule.description ? rule.description : "-"}
        </td>
        <td>
          {rule.is_editable == 1 ? (
            verifyPermission(
              props.userPermissions,
              "update-any-institution-type-role"
            ) ||
            verifyPermission(
              props.userPermissions,
              "update-my-institution-type-role"
            ) ? (
              <Link
                to={`/settings/rules/${rule.name}/edit`}
                className="btn btn-sm btn-clean btn-icon btn-icon-md"
                title={t("Modifier")}
              >
                <i className="la la-edit" />
              </Link>
            ) : null
          ) : null}
          {rule.is_editable == 1 ? (
            verifyPermission(
              props.userPermissions,
              "destroy-any-institution-type-role"
            ) ||
            verifyPermission(
              props.userPermissions,
              "destroy-my-institution-type-role"
            ) ? (
              <button
                onClick={(e) => deleteRulePage(rule.name, index)}
                className="btn btn-sm btn-clean btn-icon btn-icon-md"
                title={t("Supprimer")}
              >
                <i className="la la-trash" />
              </button>
            ) : null
          ) : null}
        </td>
      </tr>
    );
  };

  return ready ? (
    verifyPermission(props.userPermissions, "list-any-institution-type-role") ||
    verifyPermission(props.userPermissions, "list-my-institution-type-role") ? (
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
                <a href="#icone" className="kt-subheader__breadcrumbs-home">
                  <i className="flaticon2-shelter" />
                </a>
                <span className="kt-subheader__breadcrumbs-separator" />
                <a
                  href="#button"
                  onClick={(e) => e.preventDefault()}
                  className="kt-subheader__breadcrumbs-link"
                  style={{ cursor: "text" }}
                >
                  {t("Rôles")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
          <div className="kt-portlet">
            <HeaderTablePage
              addPermission={[
                "store-any-institution-type-role",
                "store-my-institution-type-role",
              ]}
              title={t("Rôles")}
              addText={t("Ajouter")}
              addLink={"/settings/rules/add"}
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
                    <div className="kt-portlet__head-toolbar col-sm-6 text-right">
                      <div className="kt-portlet__head-wrapper">
                        &nbsp;
                        <div className="dropdown dropdown-inline">
                          <InfoFormatExcel />
                          <a
                            href={`${appConfig.apiDomaine}/download-excel/add-profils`}
                            download={true}
                            className="btn mr-1 btn-secondary"
                          >
                            {" "}
                            {t("Télécharger le format excel")}
                          </a>
                          <NavLink
                            to={"/setting/role/import"}
                            className="btn ml-1 btn-primary"
                          >
                            {" "}
                            {t("Importer via excel")}
                          </NavLink>
                        </div>
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
                              style={{ width: "70.25px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {t("Nom")}
                            </th>
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "70.25px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {t("Description")}
                            </th>
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
                          {rules.length ? (
                            showList.length ? (
                              showList.map((rule, index) =>
                                printBodyTable(rule, index)
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
                              {t("Nom")}
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
                        {t("sur")} {rules.length} {t("données")}
                      </div>
                    </div>
                    {showList.length ? (
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
  };
};

export default connect(mapStateToProps)(RulePage);
