import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
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
import { useTranslation } from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ClaimCategory = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  if (!verifyPermission(props.userPermissions, "list-claim-category"))
    window.location.href = ERROR_401;

  const [load, setLoad] = useState(true);
  const [claimCategories, setClaimCategories] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(NUMBER_ELEMENT_PER_PAGE);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // setLoad(true);

      await axios
        .get(`${appConfig.apiDomaine}/claim-categories`)
        .then((response) => {
          setNumberPage(
            forceRound(response.data.length / NUMBER_ELEMENT_PER_PAGE)
          );
          setShowList(response.data.slice(0, NUMBER_ELEMENT_PER_PAGE));
          setClaimCategories(response.data);
          setLoad(false);
        })
        .catch((error) => {
          setLoad(false);
          //console.log("Something is wrong");
        });
    }
    window.sortHandlerGlobal = fetchData;
    if (verifyTokenExpire()) fetchData();
  }, [appConfig.apiDomaine, NUMBER_ELEMENT_PER_PAGE]);

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newClaimCategories = [...claimCategories];
    newClaimCategories = newClaimCategories.filter(
      (el) => getLowerCaseString(el.name["fr"]).indexOf(value) >= 0
    );

    return newClaimCategories;
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
        forceRound(claimCategories.length / NUMBER_ELEMENT_PER_PAGE)
      );
      setShowList(claimCategories.slice(0, NUMBER_ELEMENT_PER_PAGE));
      setActiveNumberPage(1);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    setShowList(claimCategories.slice(0, parseInt(e.target.value)));
    setNumberPage(
      forceRound(claimCategories.length / parseInt(e.target.value))
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
      claimCategories.slice(
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
        claimCategories.slice(
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
        claimCategories.slice(
          getEndByPosition(activeNumberPage - 1) - numberPerPage,
          getEndByPosition(activeNumberPage - 1)
        )
      );
    }
  };

  const deleteClaimCategory = (claimCategoryId, index) => {
    DeleteConfirmation.fire(confirmDeleteConfig()).then((result) => {
      if (verifyTokenExpire()) {
        if (result.value) {
          axios
            .delete(
              `${appConfig.apiDomaine}/claim-categories/${claimCategoryId}`
            )
            .then((response) => {
              const newClaimCategories = [...claimCategories].filter(
                (e) => e.id !== claimCategoryId
              );
              setShowList(newClaimCategories.slice(0, numberPerPage));
              setClaimCategories(newClaimCategories);
              if (showList.length > 1) {
                setShowList(
                  newClaimCategories.slice(
                    getEndByPosition(activeNumberPage) - numberPerPage,
                    getEndByPosition(activeNumberPage)
                  )
                );
                setActiveNumberPage(activeNumberPage);
              } else {
                setShowList(
                  newClaimCategories.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                  )
                );
                setActiveNumberPage(activeNumberPage - 1);
              }
              setNumberPage(
                forceRound(newClaimCategories.length / numberPerPage)
              );
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

  const printBodyTable = (claimCategory, index) => {
    return (
      <tr key={index} role="row" className="odd">
        <td data-sort="name">{claimCategory.name["fr"]}</td>
        <td>
          {verifyPermission(props.userPermissions, "update-claim-category") ? (
            <Link
              to={`/settings/claim_categories/${claimCategory.id}/edit`}
              className="btn btn-sm btn-clean btn-icon btn-icon-md"
              title={t("Modifier")}
            >
              <i className="la la-edit" />
            </Link>
          ) : null}
          {verifyPermission(props.userPermissions, "destroy-claim-category") ? (
            <button
              onClick={(e) => deleteClaimCategory(claimCategory.id, index)}
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
    verifyPermission(props.userPermissions, "list-claim-category") ? (
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
                  {t("Catégorie de réclamation")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
          <div className="kt-portlet">
            <HeaderTablePage
              addPermission={"store-claim-category"}
              title={t("Catégories de réclamation")}
              addText={t("Ajouter")}
              addLink={"/settings/claim_categories/add"}
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
                              data-sort="name"
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
                              style={{ width: "40.25px" }}
                              aria-label="Type: activate to sort column ascending"
                            >
                              {t("Action")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {claimCategories.length ? (
                            showList ? (
                              showList.map((claimCategory, index) =>
                                printBodyTable(claimCategory, index)
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
                        {t("sur")} {claimCategories.length} {t("données")}
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
    language: state.language.languageSelected,
  };
};

export default connect(mapStateToProps)(ClaimCategory);
