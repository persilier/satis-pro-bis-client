import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Select from "react-select";
import axios from "axios";
import {
  forceRound,
  formatDateToTime,
  formatDateToTimeStampte,
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
import { verifyTokenExpire } from "../../middleware/verifyToken";
import { ToastBottomEnd } from "../components/Toast";
import { toastSuccessMessageWithParameterConfig } from "../../config/toastConfig";
import FileSaver from "file-saver";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ProofReceipt = (props) => {
  if (
    !(
      verifyPermission(props.userPermissions, "list-notification-proof") ||
      verifyPermission(props.userPermissions, "list-any-notification-proof") ||
      verifyPermission(
        props.userPermissions,
        "pilot-list-notification-proof"
      ) ||
      verifyPermission(
        props.userPermissions,
        "pilot-list-any-notification-proof"
      )
    )
  )
    window.location.href = ERROR_401;

  let endPoint = "";
  if (
    verifyPermission(props.userPermissions, "list-notification-proof") ||
    verifyPermission(props.userPermissions, "pilot-list-notification-proof")
  )
    endPoint = "/my/notifications/proofs";
  else if (
    verifyPermission(props.userPermissions, "list-any-notification-proof") ||
    verifyPermission(props.userPermissions, "pilot-list-any-notification-proof")
  )
    endPoint = "/notifications/proofs";

  const [load, setLoad] = useState(true);
  const [staffs, setProofs] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(NUMBER_ELEMENT_PER_PAGE);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);
  const defautFilterDataError = {
    sender: [],
    chanel: [],
    start_date: [],
    end_date: [],
  };
  const [errorFilterData, setErrorFilterData] = useState(defautFilterDataError);
  const [filterData, setFilterData] = useState({
    sender: "",
    chanel: "",
    start_date: "",
    end_date: "",
  });
  const [startFilter, setStartFilter] = useState(false);
  const [expeditors, setExpeditors] = useState([]);
  const [expeditor, setExpeditor] = useState(null);
  const [loadDownloadPdf, setLoadDownloadPdf] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const sendData = null;
      await axios
        .post(appConfig.apiDomaine + endPoint, sendData)
        .then((response) => {
          setLoad(false);
          if (
            verifyPermission(
              props.userPermissions,
              "list-notification-proof"
            ) ||
            verifyPermission(
              props.userPermissions,
              "pilot-list-notification-proof"
            )
          ) {
            setNumberPage(
              forceRound(response.data.length / NUMBER_ELEMENT_PER_PAGE)
            );
            setShowList(response.data.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setProofs(response.data);
          } else if (
            verifyPermission(
              props.userPermissions,
              "list-any-notification-proof"
            ) ||
            verifyPermission(
              props.userPermissions,
              "pilot-list-any-notification-proof"
            )
          ) {
            setExpeditors(
              response.data["filter-data"].map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            );
            setNumberPage(
              forceRound(response.data.proofs.length / NUMBER_ELEMENT_PER_PAGE)
            );
            setShowList(response.data.proofs.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setProofs(response.data.proofs);
            setLoad(false);
          }
        })
        .catch((error) => {
          setLoad(false);
          console.log("Something is wrong");
        });
    }
    window.sortHandlerGlobal = fetchData;

    if (verifyTokenExpire()) fetchData();
  }, [endPoint, NUMBER_ELEMENT_PER_PAGE]);

  const separateStringByComa = (arrayString) => {
    let generateString = "";
    arrayString.map((t, index) => {
      generateString =
        index + 1 !== arrayString.length
          ? generateString + t + ", "
          : generateString + t;
    });
    return generateString;
  };

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newProofs = [...staffs];
    newProofs = newProofs.filter(
      (el) =>
        getLowerCaseString(
          `${el.to ? el.to.firstname + " " + el.to.lastname : ""} / ${
            el.to
              ? el.channel === "sms"
                ? el.to.telephone
                  ? el.to.telephone[0]
                  : ""
                : el.to.email
                ? el.to.email[0]
                : ""
              : ""
          }`
        ).indexOf(value) >= 0 ||
        getLowerCaseString(el.institution ? el.institution.name : "").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.channel).indexOf(value) >= 0 ||
        getLowerCaseString(el.message).indexOf(value) >= 0 ||
        getLowerCaseString(formatDateToTimeStampte(el.sent_at)).indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.status).indexOf(value) >= 0
    );
    return newProofs;
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
      setNumberPage(forceRound(staffs.length / NUMBER_ELEMENT_PER_PAGE));
      setShowList(staffs.slice(0, NUMBER_ELEMENT_PER_PAGE));
      setActiveNumberPage(1);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    setShowList(staffs.slice(0, parseInt(e.target.value)));
    setNumberPage(forceRound(staffs.length / parseInt(e.target.value)));
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
      staffs.slice(
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
        staffs.slice(
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
        staffs.slice(
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

  const printBodyTable = (proof, index) => {
    return (
      <tr key={index} role="row" className="odd">
        {proof && (
          <>
            {(verifyPermission(
              props.userPermissions,
              "list-any-notification-proof"
            ) ||
              verifyPermission(
                props.userPermissions,
                "pilot-list-any-notification-proof"
              )) && <td>{proof.institution ? proof.institution.name : ""}</td>}
            <td data-sort="to.firstname">
              {proof
                ? proof.to
                  ? `${proof.to.firstname ? proof.to.firstname : ""} ${
                      proof.to.lastname ? proof.to.lastname : ""
                    }`
                  : ""
                : "-"}{" "}
              /{" "}
              {proof
                ? proof.to
                  ? proof.channel === "sms"
                    ? `${
                        proof.to.telephone && proof.to.telephone[0]
                          ? proof.to.telephone[0]
                          : ""
                      }`
                    : `${
                        proof.to.email && proof.to.email[0]
                          ? proof.to.email[0]
                          : ""
                      }`
                  : ""
                : ""}
            </td>
            <td data-sort="channel">{proof.channel ? proof.channel : ""}</td>
            <td data-sort="message">{proof.message ? proof.message : ""}</td>
            <td data-sort="sent_at">
              {proof.sent_at ? formatDateToTimeStampte(proof.sent_at) : ""}
            </td>
            <td>{proof.status ? proof.status : ""}</td>
          </>
        )}
      </tr>
    );
  };

  const handleChange = (e) => {
    const newFilterData = { ...filterData };
    switch (e.target.id) {
      case "sender":
        newFilterData.sender = e.target.value;
        break;
      case "chanel":
        newFilterData.chanel = e.target.value;
        break;
      case "start_date":
        newFilterData.start_date = e.target.value;
        break;
      case "end_date":
        newFilterData.end_date = e.target.value;
        break;
    }
    setFilterData(newFilterData);
  };

  const filterProofReceipt = async () => {
    setStartFilter(true);

    const sendData = {
      channel: filterData.chanel,
      date_start: filterData.start_date,
      date_end: filterData.end_date,
      institution_id: filterData.sender ? filterData.sender.value : "",
    };
    if (!sendData.channel) delete sendData.channel;
    if (!sendData.date_start) delete sendData.date_start;
    if (!sendData.date_end) delete sendData.date_end;
    if (!sendData.institution_id) delete sendData.institution_id;

    await axios
      .post(appConfig.apiDomaine + endPoint, sendData)
      .then((response) => {
        if (
          verifyPermission(
            props.userPermissions,
            "list-any-notification-proof"
          ) ||
          verifyPermission(
            props.userPermissions,
            "pilot-list-any-notification-proof"
          )
        ) {
          setNumberPage(
            forceRound(response.data["proofs"].length / NUMBER_ELEMENT_PER_PAGE)
          );
          setShowList(
            response.data["proofs"].slice(0, NUMBER_ELEMENT_PER_PAGE)
          );
          setProofs(response.data["proofs"]);
          ToastBottomEnd.fire(
            toastSuccessMessageWithParameterConfig("Succès de l'opération")
          );
          setErrorFilterData(defautFilterDataError);
        }

        if (
          verifyPermission(props.userPermissions, "list-notification-proof") ||
          verifyPermission(
            props.userPermissions,
            "pilot-list-notification-proof"
          )
        ) {
          setNumberPage(
            forceRound(response.data.length / NUMBER_ELEMENT_PER_PAGE)
          );
          setShowList(response.data.slice(0, NUMBER_ELEMENT_PER_PAGE));
          setProofs(response.data);
          ToastBottomEnd.fire(
            toastSuccessMessageWithParameterConfig("Succès de l'opération")
          );
          setErrorFilterData(defautFilterDataError);
        }
      })
      .catch((error) => {
        console.log("Something is wrong");
        if (error.response.status === 422) {
          const errorData = error.response.data.error;
          setErrorFilterData({
            ...defautFilterDataError,
            end_date: errorData.date_end ? errorData.date_end : [],
            start_date: errorData.date_start ? errorData.date_start : [],
            chanel: errorData.channel ? errorData.channel : [],
            sender: errorData.institution_id ? errorData.institution_id : [],
          });
        }
      })
      .finally(() => {
        setStartFilter(false);
      });
  };

  const downloadReportingPdf = async () => {
    setLoadDownloadPdf(true);
    const sendData = {
      channel: filterData.chanel,
      date_start: filterData.start_date,
      date_end: filterData.end_date,
      institution_id: filterData.sender ? filterData.sender.value : "",
    };
    if (!sendData.channel) delete sendData.channel;
    if (!sendData.date_start) delete sendData.date_start;
    if (!sendData.date_end) delete sendData.date_end;
    if (!sendData.institution_id) delete sendData.institution_id;

    await axios({
      method: "post",
      url: appConfig.apiDomaine + "/my/export/notifications/proofs",
      responseType: "blob",
      data: sendData,
    })
      .then(({ data }) => {
        console.log(data);
        // setError(defaultError);

        FileSaver.saveAs(
          data,
          // `proof_of_receipt_${new Date().getFullYear()}.pdf`
          `reporting_retard_30_jours_${new Date().getFullYear()}.pdf`
        );
        setLoadDownloadPdf(false);
      })
      .catch((error) => {
        setLoadDownloadPdf(false);
        console.log("Something is wrong", error);
        if (error?.response?.status === 422) {
          const errorData = error.response.data.error;
          setErrorFilterData({
            ...defautFilterDataError,
            end_date: errorData.date_end ? errorData.date_end : [],
            start_date: errorData.date_start ? errorData.date_start : [],
            chanel: errorData.channel ? errorData.channel : [],
            sender: errorData.institution_id ? errorData.institution_id : [],
          });
        }
      })
      .finally(() => {
        setStartFilter(false);
      });
  };

  return verifyPermission(props.userPermissions, "list-notification-proof") ||
    verifyPermission(props.userPermissions, "list-any-notification-proof") ||
    verifyPermission(props.userPermissions, "pilot-list-notification-proof") ||
    verifyPermission(
      props.userPermissions,
      "pilot-list-any-notification-proof"
    ) ? (
    <div
      className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
      id="kt_content"
    >
      <div className="kt-subheader   kt-grid__item" id="kt_subheader">
        <div className="kt-container  kt-container--fluid ">
          <div className="kt-subheader__main">
            <h3 className="kt-subheader__title">{"Paramètres"}</h3>
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
                {"Preuve d'accusé de réception"}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
        <div className="kt-portlet">
          <HeaderTablePage
            addPermission={[]}
            title={"Preuve d'accusé de réception"}
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
                  {(verifyPermission(
                    props.userPermissions,
                    "list-any-notification-proof"
                  ) ||
                    verifyPermission(
                      props.userPermissions,
                      "pilot-list-any-notification-proof"
                    )) && (
                    <div className="form-group col-6">
                      <label htmlFor="sender">{"Expediteur"}</label>
                      <Select
                        isClearable={true}
                        placeholder={"Veuillez selectioner l'expediteur"}
                        onChange={(value) => setExpeditor(value)}
                        options={expeditors}
                        value={expeditor}
                      />
                      {errorFilterData.sender.length > 0 &&
                        errorFilterData.sender.map((item, index) => (
                          <div key={index} className="text-danger text-sm">
                            {item}
                          </div>
                        ))}
                    </div>
                  )}

                  <div
                    className={`form-group ${
                      verifyPermission(
                        props.userPermissions,
                        "list-any-notification-proof"
                      ) ||
                      verifyPermission(
                        props.userPermissions,
                        "pilot-list-any-notification-proof"
                      )
                        ? "col-6"
                        : "col-12"
                    }`}
                  >
                    <label htmlFor="chanel">{"Canal"}</label>
                    <select
                      id="chanel"
                      className={`form-control ${
                        errorFilterData.chanel.length ? "is-invalid" : ""
                      }`}
                      onChange={handleChange}
                      value={filterData.chanel}
                    >
                      <option disabled selected value={""}>
                        {"Choisissez"}...
                      </option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </select>
                    {errorFilterData.chanel.length > 0 &&
                      errorFilterData.chanel.map((item, index) => (
                        <div key={index} className="invalid-feedback">
                          {item}
                        </div>
                      ))}
                  </div>

                  <div className="form-group col-6">
                    <label htmlFor="start_date">{"Date de début"}</label>
                    <input
                      id="start_date"
                      type="date"
                      className={`form-control ${
                        errorFilterData.start_date.length ? "is-invalid" : ""
                      }`}
                      value={filterData.start_date}
                      onChange={handleChange}
                    />

                    {errorFilterData.start_date.length > 0 &&
                      errorFilterData.start_date.map((item, index) => (
                        <div key={index} className="invalid-feedback">
                          {item}
                        </div>
                      ))}
                  </div>

                  <div className="form-group col-6">
                    <label htmlFor="end_date">{"Date de fin"}</label>
                    <input
                      id="end_date"
                      type="date"
                      className={`form-control ${
                        errorFilterData.end_date.length ? "is-invalid" : ""
                      }`}
                      value={filterData.end_date}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                      Distinctio, fugit!
                    </div>
                    {errorFilterData.end_date.length > 0 &&
                      errorFilterData.end_date.map((item, index) => (
                        <div key={index} className="invalid-feedback">
                          {item}
                        </div>
                      ))}
                  </div>

                  <div className="form-group text-right col-12">
                    {startFilter ? (
                      <button className="btn btn-brand kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light">
                        {"Chargement"}...
                      </button>
                    ) : (
                      <button
                        onClick={filterProofReceipt}
                        className="btn btn-primary"
                      >
                        {"Filtre"}
                      </button>
                    )}

                    {verifyPermission(
                      props.userPermissions,
                      "pilot-export-notification-proof"
                    ) ||
                    verifyPermission(
                      props.userPermissions,
                      "export-notification-proof"
                    ) ? (
                      loadDownloadPdf ? (
                        <button
                          className="btn btn-secondary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3"
                          type="button"
                          disabled
                        >
                          Chargement...
                        </button>
                      ) : (
                        <button
                          onClick={downloadReportingPdf}
                          className="btn btn-secondary ml-3"
                        >
                          PDF
                        </button>
                      )
                    ) : null}
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6 text-left">
                    <div id="kt_table_1_filter" className="dataTables_filter">
                      <label>
                        {"Recherche"}:
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
                  <div className="col-sm-12" id="myTable">
                    <table
                      className="mb-4 table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                      role="grid"
                      aria-describedby="kt_table_1_info"
                      cellSpacing={"2"}
                      cellPadding={"2"}
                      width={"100%"}
                      style={{
                        display: "none",
                        width: "952px",
                        marginBottom: "20px",
                      }}
                    >
                      <thead>
                        <tr
                          className={"text-center"}
                          style={{ padding: "15px" }}
                          role={"row"}
                        >
                          <th
                            style={{
                              backgroundColor: "#fc9921",
                              width: "85%",
                              fontWeight: "bold",
                              textAlign: "center",
                              color: "white",
                            }}
                          >
                            Preuve d'accusé de réception
                          </th>
                          <th
                            style={{
                              width: "15%",
                              fontWeigth: "bold",
                              textAlign: "right",
                            }}
                          >
                            2022
                          </th>
                        </tr>
                      </thead>
                    </table>

                    <table
                      className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                      role="grid"
                      aria-describedby="kt_table_1_info"
                      style={{ width: "952px" }}
                    >
                      <thead>
                        <tr role="row">
                          {(verifyPermission(
                            props.userPermissions,
                            "list-any-notification-proof"
                          ) ||
                            verifyPermission(
                              props.userPermissions,
                              "pilot-list-any-notification-proof"
                            )) && (
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "70.25px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {"Expediteur"}
                            </th>
                          )}
                          <th
                            className="sorting"
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "50px" }}
                            aria-label="Country: activate to sort column ascending"
                          >
                            {"Destinataire"}
                          </th>
                          <th
                            className="sorting"
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "50px" }}
                            aria-label="Country: activate to sort column ascending"
                          >
                            {"Canal"}
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
                            {"Contenu/message"}
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
                            {"Date"}
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
                            {"Statut"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffs.length ? (
                          showList ? (
                            showList.map((staff, index) =>
                              printBodyTable(staff, index)
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
                            {"Nom"}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {"Téléphone"}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {"Email"}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {"Unité"}
                          </th>
                          {verifyPermission(
                            props.userPermissions,
                            "list-staff-from-any-unit"
                          ) ||
                          verifyPermission(
                            props.userPermissions,
                            "pilot-list-staff-from-any-unit"
                          ) ? (
                            <th rowSpan="1" colSpan="1">
                              {"Institution"}
                            </th>
                          ) : (
                            <th style={{ display: "none" }} />
                          )}
                          <th rowSpan="1" colSpan="1">
                            {"Position"}
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
                      {"Affichage de"} 1 {"à"} {numberPerPage} {"sur"}{" "}
                      {staffs.length} {"données"}
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
  ) : null;
};

const mapStateToProps = (state) => {
  return {
    userPermissions: state.user.user.permissions,
    activePilot: state?.user?.user?.staff?.is_active_pilot || false,
    plan: state.plan.plan,
  };
};

export default connect(mapStateToProps)(ProofReceipt);
