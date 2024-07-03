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
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import { ERROR_401 } from "../../config/errorPage";
import { verifyPermission } from "../../helpers/permission";
import { NUMBER_ELEMENT_PER_PAGE } from "../../constants/dataTable";
import { DeleteConfirmation } from "../components/ConfirmationAlert";
import {
  confirmActivation,
  confirmDeleteUser,
} from "../../config/confirmConfig";
import { ToastBottomEnd } from "../components/Toast";
import {
  toastDeleteErrorMessageConfig,
  toastDeleteSuccessMessageConfigUser,
  toastErrorMessageWithParameterConfig,
  toastSuccessMessageWithParameterConfig,
} from "../../config/toastConfig";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import { useTranslation } from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const User = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  if (
    !(
      verifyPermission(props.userPermissions, "list-user-any-institution") ||
      verifyPermission(props.userPermissions, "list-user-my-institution")
    )
  )
    window.location.href = ERROR_401;

  const [load, setLoad] = useState(true);
  const [users, setUsers] = useState([]);
  const [userLogout, setUserLogout] = useState(true);
  const [usersFilter, setUsersFilter] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(NUMBER_ELEMENT_PER_PAGE);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);

  useEffect(() => {
    let endpoint = "";
    /*let endPoint = "";*/
    if (props.plan === "MACRO") {
      if (verifyPermission(props.userPermissions, "list-user-any-institution"))
        endpoint = `${appConfig.apiDomaine}/any/users`;
      if (verifyPermission(props.userPermissions, "list-user-my-institution"))
        endpoint = `${appConfig.apiDomaine}/my/users`;
    } else if (props.plan === "HUB")
      endpoint = `${appConfig.apiDomaine}/any/users`;
    else if (props.plan === "PRO")
      endpoint = `${appConfig.apiDomaine}/my/users`;

    async function fetchData() {
      await axios
        .get(endpoint)
        .then((response) => {
          setNumberPage(
            forceRound(response.data.length / NUMBER_ELEMENT_PER_PAGE)
          );
          setShowList(response.data.slice(0, NUMBER_ELEMENT_PER_PAGE));
          setUsers(response.data);
          setUsersFilter([]);
          //console.log(response.data)
          setLoad(false);
        })
        .catch((error) => {
          setLoad(false);
          //console.log("Something is wrong");
        });
    }
    window.sortHandlerGlobal = fetchData;

    if (verifyTokenExpire()) fetchData();
  }, [appConfig.apiDomaine, props.plan, NUMBER_ELEMENT_PER_PAGE]);

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newUsers = [...users];
    newUsers = newUsers.filter(
      (el) =>
        getLowerCaseString(
          `${el.identite.lastname} ${el.identite.firstname}`
        ).indexOf(value) >= 0 ||
        getLowerCaseString(el.username).indexOf(value) >= 0 ||
        getLowerCaseString(printRole(el.roles)).indexOf(value) >= 0 ||
        getLowerCaseString(
          el.disabled_at === null ? t("Active") : t("Désactiver")
        ).indexOf(value) >= 0
    );

    return newUsers;
  };

  const searchElement = async (e) => {
    if (e.target.value) {
      setNumberPage(
        forceRound(
          filterShowListBySearchValue(e.target.value).length / numberPerPage
        )
      );
      setShowList(
        filterShowListBySearchValue(e.target.value.toLowerCase()).slice(
          0,
          numberPerPage
        )
      );
      setActiveNumberPage(1);
      setUsersFilter(filterShowListBySearchValue(e.target.value.toLowerCase()));
    } else {
      setNumberPage(forceRound(users.length / numberPerPage));
      setShowList(users.slice(0, numberPerPage));
      setActiveNumberPage(1);
      setUsersFilter([]);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    if (usersFilter.length > 0) {
      setShowList(usersFilter.slice(0, parseInt(e.target.value)));
      setNumberPage(forceRound(usersFilter.length / parseInt(e.target.value)));
    } else {
      setShowList(users.slice(0, parseInt(e.target.value)));
      setNumberPage(forceRound(users.length / parseInt(e.target.value)));
    }
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
    if (usersFilter.length > 0) {
      setShowList(
        usersFilter.slice(
          getEndByPosition(page) - numberPerPage,
          getEndByPosition(page)
        )
      );
    } else {
      setShowList(
        users.slice(
          getEndByPosition(page) - numberPerPage,
          getEndByPosition(page)
        )
      );
    }
  };

  const onClickNextPage = (e) => {
    e.preventDefault();
    if (activeNumberPage <= numberPage) {
      setActiveNumberPage(activeNumberPage + 1);
      if (usersFilter.length > 0) {
        setShowList(
          usersFilter.slice(
            getEndByPosition(activeNumberPage + 1) - numberPerPage,
            getEndByPosition(activeNumberPage + 1)
          )
        );
      } else {
        setShowList(
          users.slice(
            getEndByPosition(activeNumberPage + 1) - numberPerPage,
            getEndByPosition(activeNumberPage + 1)
          )
        );
      }
    }
  };

  const onClickPreviousPage = (e) => {
    e.preventDefault();
    if (activeNumberPage >= 1) {
      setActiveNumberPage(activeNumberPage - 1);
      if (usersFilter.length > 0) {
        setShowList(
          usersFilter.slice(
            getEndByPosition(activeNumberPage - 1) - numberPerPage,
            getEndByPosition(activeNumberPage - 1)
          )
        );
      } else {
        setShowList(
          users.slice(
            getEndByPosition(activeNumberPage - 1) - numberPerPage,
            getEndByPosition(activeNumberPage - 1)
          )
        );
      }
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

  const printRole = (roles) => {
    const newRoles = [];
    roles.map((r) => newRoles.push(r.name));
    return newRoles.join(" / ");
  };

  const activeAccount = (e, user, index, label) => {
    e.preventDefault();
    DeleteConfirmation.fire(confirmActivation(label)).then(async (result) => {
      if (result.value) {
        document.getElementById(`user-spinner-${user.id}`).style.display =
          "block";
        document.getElementById(`user-${user.id}`).style.display = "none";
        document.getElementById(`user-edit-${user.id}`).style.display = "none";

        let endpoint = "";
        if (props.plan === "MACRO") {
          if (
            verifyPermission(props.userPermissions, "list-user-any-institution")
          )
            endpoint = `${appConfig.apiDomaine}/any/users/${user.id}/enabled-desabled`;
          if (
            verifyPermission(props.userPermissions, "list-user-my-institution")
          )
            endpoint = `${appConfig.apiDomaine}/my/users/${user.id}/enabled-desabled`;
        } else if (props.plan === "HUB")
          endpoint = `${appConfig.apiDomaine}/any/users/${user.id}/enabled-desabled`;
        else if (props.plan === "PRO")
          endpoint = `${appConfig.apiDomaine}/my/users/${user.id}/enabled-desabled`;

        if (verifyTokenExpire()) {
          await axios
            .put(endpoint)
            .then((response) => {
              const newUsers = [...users];
              const newUsersFilter = [...usersFilter];
              const idx =
                activeNumberPage > 1
                  ? (activeNumberPage - 1) * numberPerPage + index
                  : index;
              if (usersFilter.length > 0) {
                newUsersFilter[idx].disabled_at =
                  newUsersFilter[idx].disabled_at === null ? true : null;
              } else
                newUsers[idx].disabled_at =
                  newUsers[idx].disabled_at === null ? true : null;
              document.getElementById(`user-spinner-${user.id}`).style.display =
                "none";
              document.getElementById(`user-${user.id}`).style.display =
                "block";
              document.getElementById(`user-edit-${user.id}`).style.display =
                "block";
              if (usersFilter.length > 0) setUsersFilter(newUsersFilter);
              else {
                setUsers(newUsers);
                setUsersFilter([]);
              }
              ToastBottomEnd.fire(
                toastSuccessMessageWithParameterConfig(
                  t("Succès de l'opération")
                )
              );
            })
            .catch((error) => {
              ToastBottomEnd.fire(
                toastErrorMessageWithParameterConfig(t("Echec de l'opération"))
              );
            });
        }
      }
    });
  };

  const rulesInclude = (rules, ...rule) => {
    let value = false;
    rules.map((r) => {
      value = r.name === rule[0] || r.name === rule[1];
    });

    return value;
  };

  const logoutUser = (userId, index) => {
    let endpoint = `${appConfig.apiDomaine}/logout`;
    let data = { id: userId };
    DeleteConfirmation.fire(confirmDeleteUser()).then((result) => {
      if (verifyTokenExpire()) {
        if (result.value) {
          axios
            .post(endpoint, data)
            .then((response) => {
              setUserLogout(response.data);
              /*   const newUsers = [...users].filter(e => e.id !== userId);
                                setShowList(newUsers.slice(0, numberPerPage))*/
              // setUsers(newUsers);
              /*    if (showList.length > 1) {
                                    setShowList(
                                        newUsers.slice(
                                            getEndByPosition(activeNumberPage) - numberPerPage,
                                            getEndByPosition(activeNumberPage)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage);
                                } else {
                                    setShowList(
                                        newUsers.slice(
                                            getEndByPosition(activeNumberPage - 1) - numberPerPage,
                                            getEndByPosition(activeNumberPage - 1)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage - 1);
                                }
                                setNumberPage(forceRound(newUsers.length/numberPerPage));*/
              ToastBottomEnd.fire(toastDeleteSuccessMessageConfigUser());
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

  const printBodyTable = (user, index) => {
    return (
      <tr key={index} role="row" className="odd">
        <td data-sort="identite.lastname">
          {`${user.identite.lastname} ${user.identite.firstname} `}
          {rulesInclude(user.roles, "pilot-filial", "pilot-holding") ? (
            user.identite.staff ? (
              user.identite.staff.is_active_pilot ? (
                <span className="kt-badge kt-badge--success kt-badge--inline">
                  {t("pilot actif")}
                </span>
              ) : null
            ) : null
          ) : null}
        </td>
        <td data-sort="username">{user.username}</td>
        <td data-sort="roles">{printRole(user.roles)}</td>
        <td data-sort="disabled_at">
          {user.disabled_at === null ? (
            <span className="kt-badge kt-badge--success kt-badge--inline">
              {t("Active")}
            </span>
          ) : (
            <span className="kt-badge kt-badge--danger kt-badge--inline">
              {t("Désactiver")}
            </span>
          )}
        </td>
        <td className="d-flex justify-content-between align-items-center">
          <div
            id={`user-spinner-${user.id}`}
            className="kt-spinner kt-spinner--lg kt-spinner--dark mt-2 mx-3"
            style={{ display: "none" }}
          />
          <a
            className="mt-2"
            id={`user-${user.id}`}
            href={
              user.disabled_at === null
                ? `desactive/${user.id}`
                : `reactive/${user.id}`
            }
            onClick={(e) =>
              activeAccount(
                e,
                user,
                index,
                user.disabled_at === null ? t("désactiver") : t("réactiver")
              )
            }
            title={user.disabled_at === null ? t("Désactiver") : t("Réactiver")}
          >
            {user.disabled_at === null ? t("Désactiver") : t("Réactiver")}
          </a>

          {verifyPermission(
            props.userPermissions,
            "show-user-any-institution"
          ) ||
          verifyPermission(
            props.userPermissions,
            "show-user-my-institution"
          ) ? (
            <Link
              to={`/settings/users/${user.id}/edit`}
              id={`user-edit-${user.id}`}
              className="btn btn-sm btn-clean btn-icon btn-icon-md "
              title={t("Modifier")}
            >
              <i className="la la-edit" />
            </Link>
          ) : null}

          {verifyPermission(
            props.userPermissions,
            "logout-user-my-institution"
          ) && (
            <button
              onClick={(e) => logoutUser(user.id, index)}
              className="btn btn-sm btn-clean btn-icon btn-icon-md"
              title={t("Déconnecter")}
            >
              {userLogout === true ? (
                <i className="la la-unlock" style={{ color: "green" }} />
              ) : (
                <i className="la la-unlock" style={{ color: "red" }} />
              )}
            </button>
          )}
        </td>
      </tr>
    );
  };

  return ready ? (
    verifyPermission(props.userPermissions, "list-user-any-institution") ||
    verifyPermission(props.userPermissions, "list-user-my-institution") ? (
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
                  {t("Utilisateur")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
          <div className="kt-portlet">
            <HeaderTablePage
              addPermission={[
                "store-user-any-institution",
                "store-user-my-institution",
              ]}
              title={t("Utilisateur")}
              addText={t("Ajouter")}
              addLink={"/settings/users/add"}
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
                              Email
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
                              {t("Rôle")}
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
                              {t("Statut")}
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
                          {users.length ? (
                            showList.length ? (
                              showList.map((user, index) =>
                                printBodyTable(user, index)
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
                              Email
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Rôle")}
                            </th>
                            <th rowSpan="1" colSpan="1">
                              {t("Statut")}
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
                        {t("sur")} {users.length} {t("données")}
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
    plan: state.plan.plan,
  };
};

export default connect(mapStateToProps)(User);
