import React, { useEffect, useState } from "react";
import axios from "axios";
import { connect } from "react-redux";
import { verifyPermission } from "../../helpers/permission";
import InfirmationTable from "../components/InfirmationTable";
import HeaderTablePage from "../components/HeaderTablePage";
import LoadingTable from "../components/LoadingTable";
import EmptyTable from "../components/EmptyTable";
import Pagination from "../components/Pagination";
import { ERROR_401 } from "../../config/errorPage";
import appConfig from "../../config/appConfig";
import {
  forceRound,
  formatSelectOption,
  getLowerCaseString,
  loadCss,
} from "../../helpers/function";
import { NUMBER_ELEMENT_PER_PAGE } from "../../constants/dataTable";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import { ToastBottomEnd } from "../components/Toast";
import { toastSuccessMessageWithParameterConfig } from "../../config/toastConfig";
import Select from "react-select";
import FileSaver from "file-saver";
import { useTranslation } from "react-i18next";
import moment from "moment";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ClaimReportingUemoaThree = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  if (
    !(
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-any-institution"
      ) ||
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-my-institution"
      )
    )
  )
    window.location.href = ERROR_401;

  const [load, setLoad] = useState(true);
  const [claims, setClaims] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(10);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);
  const [dateStart, setDateStart] = useState(
    moment()
      .startOf("month")
      .format("YYYY-MM-DD")
  );
  const [dateEnd, setDateEnd] = useState(moment().format("YYYY-MM-DD"));
  const [error, setError] = useState({
    date_start: [],
    date_end: [],
    institution_id: [],
  });
  const [loadFilter, setLoadFilter] = useState(false);
  const [loadDownload, setLoadDownload] = useState(false);
  const [loadDownloadPdf, setLoadDownloadPdf] = useState(false);
  const [institution, setInstitution] = useState(null);
  const [institutions, setInstitutions] = useState([]);

  const fetchData = async (click = false) => {
    setLoadFilter(true);
    setLoad(true);
    let endpoint = "";
    let sendData = "";
    if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-any-institution"
      )
    ) {
      if (props.plan === "MACRO")
        endpoint = `${appConfig.apiDomaine}/any/uemoa/state-analytique`;
      else endpoint = `${appConfig.apiDomaine}/without/uemoa/state-analytique`;
      sendData = {
        date_start: dateStart,
        date_end: dateEnd,
        institution_id: institution ? institution.value : null,
      };
    } else if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-my-institution"
      )
    ) {
      endpoint = `${appConfig.apiDomaine}/my/uemoa/state-analytique`;
      sendData = { date_start: dateStart, date_end: dateEnd };
    }
    await axios
      .get(endpoint, { params: sendData })
      .then((response) => {
        if (click)
          ToastBottomEnd.fire(
            toastSuccessMessageWithParameterConfig(
              ready ? t("Filtre effectuer avec succès") : ""
            )
          );
        setNumberPage(forceRound(response.data.length / numberPerPage));
        setShowList(response.data.slice(0, numberPerPage));
        setClaims(response.data);
        setError({
          date_start: [],
          date_end: [],
          institution_id: [],
        });
        setLoadFilter(false);
        setLoad(false);
      })
      .catch((error) => {
        setError({
          date_start: [],
          date_end: [],
          institution_id: [],
          ...error.response.data.error,
        });
        setLoadFilter(false);
        setLoad(false);
        console.log("Something is wrong");
      });
  };

  useEffect(() => {
    window.sortHandlerGlobal = fetchData;

    if (verifyTokenExpire()) fetchData();
  }, [numberPerPage]);

  useEffect(() => {
    var endpoint = "";
    if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-any-institution"
      )
    ) {
      if (props.plan === "MACRO")
        endpoint = `${appConfig.apiDomaine}/any/uemoa/data-filter`;
      else endpoint = `${appConfig.apiDomaine}/without/uemoa/data-filter`;
    }

    if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-my-institution"
      )
    )
      endpoint = `${appConfig.apiDomaine}/my/uemoa/data-filter`;

    if (verifyTokenExpire()) {
      axios
        .get(endpoint)
        .then((response) => {
          setInstitutions(
            formatSelectOption(response.data.institutions, "name", false)
          );
        })
        .catch((error) => {
          console.log("Something is wrong");
        });
    }
  }, []);

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newClaims = [...claims];
    newClaims = newClaims.filter((el) => {
      return (
        getLowerCaseString(el.filiale ? el.filiale : "-").indexOf(value) >= 0 ||
        getLowerCaseString(el.claimCategorie ? el.claimCategorie : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.claimObject ? el.claimObject : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.delayMediumQualification + "").indexOf(value) >=
          0 ||
        getLowerCaseString(el.delayMediumTreatmentWithWeekend + "").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.delayMediumTreatmentWithoutWeekend + "").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.delayPlanned + "").indexOf(value) >= 0 ||
        getLowerCaseString(el.percentageNoTreated + "").indexOf(value) >= 0 ||
        getLowerCaseString(el.percentageTreatedInDelay + "").indexOf(value) >=
          0 ||
        getLowerCaseString(el.percentageTreatedOutDelay + "").indexOf(value) >=
          0 ||
        getLowerCaseString(el.totalClaim + "").indexOf(value) >= 0 ||
        getLowerCaseString(el.totalNoValidated + "").indexOf(value) >= 0 ||
        getLowerCaseString(el.totalTreated + "").indexOf(value) >= 0 ||
        getLowerCaseString(el.totalUnfounded + "").indexOf(value) >= 0
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
      setNumberPage(forceRound(claims.length / NUMBER_ELEMENT_PER_PAGE));
      setShowList(claims.slice(0, NUMBER_ELEMENT_PER_PAGE));
      setActiveNumberPage(1);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    setShowList(claims.slice(0, parseInt(e.target.value)));
    setNumberPage(forceRound(claims.length / parseInt(e.target.value)));
  };

  const onChangeInstitution = (selected) => {
    setInstitution(selected);
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
      claims.slice(
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
        claims.slice(
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
        claims.slice(
          getEndByPosition(activeNumberPage - 1) - numberPerPage,
          getEndByPosition(activeNumberPage - 1)
        )
      );
    }
  };

  const handleDateEndChange = (e) => {
    setDateEnd(e.target.value);
  };

  const handleDateStartChange = (e) => {
    setDateStart(e.target.value);
  };

  const arrayNumberPage = () => {
    const pages = [];
    for (let i = 0; i < numberPage; i++) {
      pages[i] = i;
    }
    return pages;
  };

  const filterReporting = () => {
    setLoadFilter(true);
    setLoad(true);
    if (verifyTokenExpire()) fetchData(true);
  };

  const downloadReporting = () => {
    setLoadDownload(true);
    let endpoint = "";
    let sendData = {};
    if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-any-institution"
      )
    ) {
      if (props.plan === "MACRO")
        endpoint = `${appConfig.apiDomaine}/any/uemoa/state-analytique`;
      else endpoint = `${appConfig.apiDomaine}/without/uemoa/state-analytique`;
      sendData = {
        date_start: dateStart,
        date_end: dateEnd,
        institution_id: institution ? institution.value : null,
      };
    } else if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-my-institution"
      )
    ) {
      endpoint = `${appConfig.apiDomaine}/my/uemoa/state-analytique`;
      sendData = { date_start: dateStart, date_end: dateEnd };
    }

    if (!institution) delete sendData.institution_id;

    if (verifyTokenExpire()) {
      axios({
        method: "post",
        url: endpoint,
        responseType: "json",
        data: sendData,
      })
        .then(({ data }) => {
          setError({
            date_start: [],
            date_end: [],
            institution_id: [],
          });
          const downloadButton = document.getElementById("downloadButton");
          downloadButton.href = `${appConfig.apiDomaine}/download-uemoa-reports/${data.file}`;
          downloadButton.click();
          setLoadDownload(false);
          setLoadDownload(false);
          // ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig('Téléchargement éffectuer avec succès'));
        })
        .catch((error) => {
          setError({
            date_start: "",
            date_end: "",
            institution_id: [],
            ...error.response.data.error,
          });
          console.log("Something is wrong");
          setLoadDownload(false);
        });
    }
  };

  const downloadReportingPdf = () => {
    setLoadDownloadPdf(true);
    let endpoint = "";
    let sendData = {};
    if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-any-institution"
      )
    ) {
      if (props.plan === "MACRO")
        endpoint = `${appConfig.apiDomaine}/any/uemoa/state-analytique-pdf`;
      else
        endpoint = `${appConfig.apiDomaine}/without/uemoa/state-analytique-pdf`;
      sendData = {
        date_start: dateStart,
        date_end: dateEnd,
        institution_id: institution ? institution.value : null,
      };
    } else if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-my-institution"
      )
    ) {
      endpoint = `${appConfig.apiDomaine}/my/uemoa/state-analytique-pdf`;
      sendData = { date_start: dateStart, date_end: dateEnd };
    }

    if (!institution) delete sendData.institution_id;

    if (verifyTokenExpire()) {
      axios({
        method: "post",
        url: endpoint,
        responseType: "blob",
        data: sendData,
      })
        .then(({ data }) => {
          setError({
            date_start: [],
            date_end: [],
            institution_id: [],
          });
          FileSaver.saveAs(
            data,
            `reporting_etat_analytique_${new Date().getFullYear()}.pdf`
          );
          setLoadDownloadPdf(false);
          // setLoadDownload(false);
          // ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig('Téléchargement éffectuer avec succès'));
        })
        .catch((error) => {
          setError({
            date_start: "",
            date_end: "",
            institution_id: [],
            ...error.response.data.error,
          });
          console.log("Something is wrong");
          setLoadDownloadPdf(false);
        });
    }
  };

  const pages = arrayNumberPage();

  const printBodyTable = (claim, index) => {
    return (
      <tr key={index} role="row" className="odd">
        <td>
          <button
            className="btn btn-sm btn-clean btn-icon btn-icon-md dropdown-toggle dropdown-toggle-split"
            title={t("Détails")}
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {/*<i className="flaticon2-down"/>*/}
          </button>
          <div className="dropdown-menu px-5" style={{ width: "550px" }}>
            <div className="d-flex justify-content-between">
              <strong>
                {t("Délai moyen de qualification")} (J) {t("avec weekend")}
              </strong>
              <p className="ml-5">{claim.delayMediumQualification}</p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Délai prévu pour le traitement")}</strong>
              <p className="ml-5">{claim.delayPlanned}</p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>
                {t("Délai moyen de traitement")} (J) {t("avec weekend")}
              </strong>
              <p className="ml-5">{claim.delayMediumTreatmentWithWeekend}</p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>
                {t("Délai moyen de traitement")} (J) {t("sans weekend")}
              </strong>
              <p className="ml-5">{claim.delayMediumTreatmentWithoutWeekend}</p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>
                {t("Pourcentage de réclamations traités dans le délai")}
              </strong>
              <p className="ml-5">{claim.percentageTreatedInDelay + "%"}</p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>
                {t("Pourcentage de réclamations traités hors délai")}
              </strong>
              <p className="ml-5">{claim.percentageTreatedOutDelay + "%"}</p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>
                {t("Pourcentage de réclamations en cours de traitement")}
              </strong>
              <p className="ml-5">{claim.percentageNoTreated + "%"}</p>
            </div>
          </div>
        </td>
        {verifyPermission(
          props.userPermissions,
          "list-reporting-claim-any-institution"
        ) ? (
          <td data-sort="filiale">{claim.filiale ? claim.filiale : "-"}</td>
        ) : null}
        <td data-sort="claimObject.claimCategory.name">
          {claim.claimCategorie ? claim.claimCategorie : "-"}
        </td>
        <td data-sort="">{claim.claimObject ? claim.claimObject : "-"}</td>
        <td>{claim.totalClaim ? claim.totalClaim : "-"}</td>
        <td>{claim.totalTreated ? claim.totalTreated : "-"}</td>
        <td>{claim.totalUnfounded}</td>
        <td>{claim.totalNoValidated}</td>
      </tr>
    );
  };

  return ready ? (
    verifyPermission(
      props.userPermissions,
      "list-reporting-claim-any-institution"
    ) ||
    verifyPermission(
      props.userPermissions,
      "list-reporting-claim-my-institution"
    ) ? (
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
                  style={{ cursor: "text" }}
                >
                  {t("État retard de")} +30
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
          <InfirmationTable
            information={
              <div>
                {t(
                  "État complet de toutes les réclamations reçues sur une période donnée par objets de réclamations et par institution"
                )}
                .
              </div>
            }
          />

          <div className="kt-portlet">
            <HeaderTablePage title={t("Rapport état analytique")} />

            <div className="kt-portlet__body">
              <div className="row">
                {verifyPermission(
                  props.userPermissions,
                  "list-reporting-claim-any-institution"
                ) ? (
                  <div className="col">
                    <div
                      className={
                        error.institution_id.length
                          ? "form-group validated"
                          : "form-group"
                      }
                    >
                      <label htmlFor="">{t("Institution")}</label>
                      <Select
                        isClearable
                        value={institution}
                        placeholder={t("Veuillez sélectionner l'institution")}
                        onChange={onChangeInstitution}
                        options={institutions}
                      />

                      {error.institution_id.length
                        ? error.institution_id.map((error, index) => (
                            <div key={index} className="invalid-feedback">
                              {error}
                            </div>
                          ))
                        : null}
                    </div>
                  </div>
                ) : null}

                <div className="col">
                  <div className="form-group">
                    <label htmlFor="">{t("Date de début")}</label>
                    <input
                      type="date"
                      onChange={handleDateStartChange}
                      className={
                        error.date_start.length
                          ? "form-control is-invalid"
                          : "form-control"
                      }
                      value={dateStart}
                    />

                    {error.date_start.length
                      ? error.date_start.map((error, index) => (
                          <div key={index} className="invalid-feedback">
                            {error}
                          </div>
                        ))
                      : null}
                  </div>
                </div>

                <div className="col">
                  <div className="form-group">
                    <label htmlFor="">{t("Date de fin")}</label>
                    <input
                      type="date"
                      onChange={handleDateEndChange}
                      className={
                        error.date_end.length
                          ? "form-control is-invalid"
                          : "form-control"
                      }
                      value={dateEnd}
                    />

                    {error.date_end.length
                      ? error.date_end.map((error, index) => (
                          <div key={index} className="invalid-feedback">
                            {error}
                          </div>
                        ))
                      : null}
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="form-group d-flex justify-content-end">
                    <a
                      className="d-none"
                      href="#"
                      id="downloadButton"
                      download={true}
                    >
                      downloadButton
                    </a>
                    {loadFilter ? (
                      <button
                        className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                        type="button"
                        disabled
                      >
                        {t("Chargement...")}
                      </button>
                    ) : (
                      <button
                        onClick={filterReporting}
                        className="btn btn-primary"
                        disabled={loadDownload || loadDownloadPdf}
                      >
                        {t("Filtrer le rapport")}
                      </button>
                    )}

                    {loadDownload ? (
                      <button
                        className="btn btn-secondary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3"
                        type="button"
                        disabled
                      >
                        {t("Chargement...")}
                      </button>
                    ) : (
                      <button
                        onClick={downloadReporting}
                        className="btn btn-secondary ml-3"
                        disabled={loadFilter || loadDownloadPdf}
                      >
                        EXCEL
                      </button>
                    )}

                    {loadDownloadPdf ? (
                      <button
                        className="btn btn-secondary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3"
                        type="button"
                        disabled
                      >
                        {t("Chargement...")}
                      </button>
                    ) : (
                      <button
                        onClick={downloadReportingPdf}
                        className="btn btn-secondary ml-3"
                        disabled={loadFilter || loadDownload}
                      >
                        PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
                            className="sorting"
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "70.25px" }}
                            aria-label="Country: activate to sort column ascending"
                          >
                            {t("Détails")}
                          </th>
                          {verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-any-institution"
                          ) ? (
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "70.25px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {t("Filiale")}
                            </th>
                          ) : null}
                          <th
                            className="sorting"
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "70.25px" }}
                            aria-label="Country: activate to sort column ascending"
                          >
                            {t("Catégorie de réclamation")}
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
                            {t("Objet de réclamation")}
                          </th>
                          <th
                            className=""
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "70.25px" }}
                            aria-label="Country: activate to sort column ascending"
                          >
                            {t("Nombre de réclamations")}
                          </th>
                          <th
                            className=""
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "70.25px" }}
                            aria-label="Country: activate to sort column ascending"
                          >
                            {t("Nombre de réclamations traitées")}
                          </th>
                          <th
                            className=""
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "70.25px" }}
                            aria-label="Country: activate to sort column ascending"
                          >
                            {t("Nombre de réclamations non fondé")}
                          </th>

                          <th
                            className=""
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "70.25px" }}
                            aria-label="Country: activate to sort column ascending"
                          >
                            {t("Nombre de réclamations en cours")}
                          </th>
                        </tr>
                      </thead>
                      <tbody data-customloader="1">
                        {load ? (
                          <LoadingTable />
                        ) : claims.length ? (
                          showList.length ? (
                            showList.map((claim, index) =>
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
                            {t("Détails")}
                          </th>
                          {verifyPermission(
                            props.userPermissions,
                            "list-reporting-claim-any-institution"
                          ) ? (
                            <th rowSpan="1" colSpan="1">
                              {t("Filiale")}
                            </th>
                          ) : null}
                          <th rowSpan="1" colSpan="1">
                            {t("Catégorie de réclamation")}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {t("Objet de réclamation")}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {t("Nombre de réclamations")}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {t("Nombre de réclamations traitées")}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {t("Nombre de réclamations non fondé")}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {t("Nombre de réclamations en cours")}
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
                      {t("Affichage de")} 1 {t("à")} {numberPerPage} {t("sur")}{" "}
                      {claims.length} {t("données")}
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
          </div>
        </div>
      </div>
    ) : null
  ) : null;
};

const mapStateToProps = (state) => {
  return {
    plan: state.plan.plan,
    userPermissions: state.user.user.permissions,
    activePilot: state.user.user.staff.is_active_pilot,
  };
};

export default connect(mapStateToProps)(ClaimReportingUemoaThree);
