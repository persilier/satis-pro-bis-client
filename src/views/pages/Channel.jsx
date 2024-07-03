import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import HeaderTablePage from "../components/HeaderTablePage";
import LoadingTable from "../components/LoadingTable";
import EmptyTable from "../components/EmptyTable";
import Pagination from "../components/Pagination";
import appConfig from "../../config/appConfig";
import {
  forceRound,
  getLowerCaseString,
  loadCss,
} from "../../helpers/function";
import { DeleteConfirmation } from "../components/ConfirmationAlert";
import {
  confirmActivationChannel,
  confirmDeleteConfig,
} from "../../config/confirmConfig";
import { ToastBottomEnd } from "../components/Toast";
import {
  toastDeleteErrorMessageConfig,
  toastDeleteSuccessMessageConfig,
  toastErrorMessageWithParameterConfig,
  toastSuccessMessageWithParameterConfig,
} from "../../config/toastConfig";
import { verifyPermission } from "../../helpers/permission";
import { ERROR_401 } from "../../config/errorPage";
import { NUMBER_ELEMENT_PER_PAGE } from "../../constants/dataTable";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import { useTranslation } from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const Channel = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  if (!verifyPermission(props.userPermissions, "list-channel"))
    window.location.href = ERROR_401;

  const [load, setLoad] = useState(true);
  const [channels, setChannels] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(10);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      axios
        .get(`${appConfig.apiDomaine}/channels`)
        .then((response) => {
          setNumberPage(
            forceRound(response.data.length / NUMBER_ELEMENT_PER_PAGE)
          );
          setShowList(response.data.slice(0, NUMBER_ELEMENT_PER_PAGE));
          setChannels(response.data);
          setLoad(false);
        })
        .catch((error) => {
          setLoad(false);
        });
    }
    window.sortHandlerGlobal = fetchData;
    if (verifyTokenExpire()) fetchData();
  }, [appConfig.apiDomaine, NUMBER_ELEMENT_PER_PAGE]);

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newChannels = [...channels];
    newChannels = newChannels.filter(
      (el) =>
        getLowerCaseString(el.name["fr"]).indexOf(value) >= 0 ||
        getLowerCaseString(el.is_response ? "Oui" : "Non").indexOf(value) >= 0
    );

    return newChannels;
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
      setNumberPage(forceRound(channels.length / NUMBER_ELEMENT_PER_PAGE));
      setShowList(channels.slice(0, NUMBER_ELEMENT_PER_PAGE));
      setActiveNumberPage(1);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    setShowList(channels.slice(0, parseInt(e.target.value)));
    setNumberPage(forceRound(channels.length / parseInt(e.target.value)));
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
      channels.slice(
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
        channels.slice(
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
        channels.slice(
          getEndByPosition(activeNumberPage - 1) - numberPerPage,
          getEndByPosition(activeNumberPage - 1)
        )
      );
    }
  };

  const activeAccount = (e, channel, index) => {
    /*   e.preventDefault();*/
    DeleteConfirmation.fire(confirmActivationChannel(channel.is_response)).then(
      async (result) => {
        if (result.value) {
          document.getElementById(
            `channel-spinner-${channel.id}`
          ).style.display = "block";
          document.getElementById(`channel-${channel.id}`).style.display =
            "none";
          // document.getElementById(`channel-edit-${channel.id}`).style.display = "none";

          let endpoint = "";
          if (props.plan === "MACRO") {
            if (
              verifyPermission(
                props.userPermissions,
                "list-user-any-institution"
              )
            )
              endpoint = `${appConfig.apiDomaine}/any/users/${channel.id}/enabled-desabled`;
            if (
              verifyPermission(
                props.userPermissions,
                "list-user-my-institution"
              )
            )
              endpoint = `${appConfig.apiDomaine}/my/users/${channel.id}/enabled-desabled`;
          } else if (props.plan === "HUB")
            endpoint = `${appConfig.apiDomaine}/any/users/${channel.id}/enabled-desabled`;
          else if (props.plan === "PRO")
            endpoint = `${appConfig.apiDomaine}/channels/${channel.id}/toggle-is-response`;

          if (verifyTokenExpire()) {
            await axios
              .put(
                `${appConfig.apiDomaine}/channels/${channel.id}/toggle-is-response`
              )
              .then((response) => {
                const newChannels = [...channels];
                newChannels[index].can_be_response =
                  newChannels[index].can_be_response === null ? true : null;
                document.getElementById(
                  `channel-spinner-${channel.id}`
                ).style.display = "none";
                document.getElementById(`channel-${channel.id}`).style.display =
                  "block";
                // document.getElementById(`channel-edit-${channel.id}`).style.display = "block";
                setChannels(newChannels);
                window.location.reload();
                ToastBottomEnd.fire(
                  toastSuccessMessageWithParameterConfig(
                    t("Succès de l'opération")
                  )
                );
              })
              .catch((error) => {
                ToastBottomEnd.fire(
                  toastErrorMessageWithParameterConfig(
                    t("Echec de l'opération")
                  )
                );
              });
          }
        }
      }
    );
  };

  const deleteChannel = (channelId, index) => {
    DeleteConfirmation.fire(confirmDeleteConfig()).then((result) => {
      if (verifyTokenExpire()) {
        if (result.value) {
          axios
            .delete(`${appConfig.apiDomaine}/channels/${channelId}`)
            .then((response) => {
              const newChannels = [...channels];
              newChannels.splice(index, 1);
              setChannels(newChannels);
              if (showList.length > 1) {
                setShowList(
                  newChannels.slice(
                    getEndByPosition(activeNumberPage) - numberPerPage,
                    getEndByPosition(activeNumberPage)
                  )
                );
                setActiveNumberPage(activeNumberPage);
              } else {
                setShowList(
                  newChannels.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                  )
                );
                setActiveNumberPage(activeNumberPage - 1);
              }
              setNumberPage(forceRound(newChannels.length / numberPerPage));
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

  const printBodyTable = (channel, index) => {
    return (
      <tr key={index} role="row" className="odd">
        <td data-sort="name">{channel.name["fr"]}</td>
        <td data-sort="is_response">
          {channel.is_response ? t("Oui") : t("Non")}
        </td>
        <td
          data-sort="can_be_response"
          className={"d-flex justify-content-between align-items-center"}
        >
          <div
            id={`channel-spinner-${channel.id}`}
            className="kt-spinner kt-spinner--lg kt-spinner--dark mt-2 mx-3"
            style={{ display: "none" }}
          />
          {channel.can_be_response ? (
            <span
              className="kt-switch kt-switch--icon"
              id={`channel-${channel.id}`}
            >
              <label>
                <input
                  type="checkbox"
                  checked={channel.is_response ? "checked" : ""}
                  onChange={(e) =>
                    activeAccount(
                      e,
                      channel,
                      index,
                      channel.can_be_response ? "désactiver" : "Activer"
                    )
                  }
                  name=""
                />
                <span></span>
              </label>
            </span>
          ) : null}
        </td>

        <td>
          <div>
            {verifyPermission(props.userPermissions, "update-channel") &&
            channel.is_editable ? (
              <Link
                to={`/settings/channels/${channel.id}/edit`}
                id={`channel-edit-${channel.id}`}
                className="btn btn-sm btn-clean btn-icon btn-icon-md"
                title="Modifier"
              >
                <i className="la la-edit" />
              </Link>
            ) : null}
            {verifyPermission(props.userPermissions, "destroy-channel") &&
            channel.is_editable ? (
              <button
                onClick={(e) => deleteChannel(channel.id, index)}
                className="btn btn-sm btn-clean btn-icon btn-icon-md"
                title="Supprimer"
              >
                <i className="la la-trash" />
              </button>
            ) : null}
          </div>
        </td>
      </tr>
    );
  };

  return ready ? (
    verifyPermission(props.userPermissions, "list-channel") ? (
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
                  {t("Canal")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
          <div className="kt-portlet">
            <HeaderTablePage
              addPermission={"store-channel"}
              title={t("Canal")}
              addText={t("Ajouter")}
              addLink={"/settings/channels/add"}
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
                              {t("Canal de réponse")}
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
                              {t("Statut")}
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
                          {channels.length ? (
                            showList.length ? (
                              showList.map((channel, index) =>
                                printBodyTable(channel, index)
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
                              {t("Canal de réponse")}
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
                        {t("sur")} {channels.length} {t("données")}
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
  ) : (
    ""
  );
};

const mapStateToProps = (state) => {
  return {
    userPermissions: state.user.user.permissions,
  };
};

export default connect(mapStateToProps)(Channel);
