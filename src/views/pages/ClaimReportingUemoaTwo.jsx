import React, { useEffect, useState } from "react";
import axios from "axios";
import { connect } from "react-redux";
import Select from "react-select";
import FileSaver from "file-saver";
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
  formatStatus,
  getLowerCaseString,
  loadCss,
  removeNullValueInObject,
} from "../../helpers/function";
import { NUMBER_ELEMENT_PER_PAGE } from "../../constants/dataTable";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import { ToastBottomEnd } from "../components/Toast";
import { toastSuccessMessageWithParameterConfig } from "../../config/toastConfig";
import { useTranslation } from "react-i18next";
import moment from "moment";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ClaimReportingUemoaTwo = (props) => {
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
  const defaultError = {
    date_start: [],
    date_end: [],
    institution_targeted_id: [],
    claim_category_id: [],
    claim_object_id: [],
    request_channel_slug: [],
    unit_targeted_id: [],
    responsible_unit_id: [],
    account_type_id: [],
    status: [],
    relationShip: [],
  };
  const [error, setError] = useState(defaultError);
  const [loadFilter, setLoadFilter] = useState(false);
  const [loadDownload, setLoadDownload] = useState(false);
  const [loadDownloadPdf, setLoadDownloadPdf] = useState(false);
  const [institution, setInstitution] = useState(null);
  const [institutions, setInstitutions] = useState([]);

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);

  const [objects, setObjects] = useState([]);
  const [object, setObject] = useState(null);

  const [canals, setCanals] = useState([]);
  const [canal, setCanal] = useState(null);

  const [clientTypes, setClientTypes] = useState([]);
  const [clientType, setClientType] = useState(null);

  const [units, setUnits] = useState([]);
  const [unit, setUnit] = useState(null);

  const [responsibles, setResponsibles] = useState([]);
  const [responsible, setResponsible] = useState(null);

  const [statutes, setStatutes] = useState([]);
  const [status, setStatus] = useState(null);

  const [relations, setRelations] = useState([]);
  const [relation, setRelation] = useState(null);

  const [filterObjectData, setFilterObjectData] = useState([]);
  const [filterUnitsData, setFilterUnitsData] = useState([]);
  const [filterResponsiblesData, setFilterResponsiblesData] = useState([]);

  const fetchData = async (click = false) => {
    setLoadFilter(true);
    setLoad(true);
    let endpoint = "";
    let sendData = {};
    if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-any-institution"
      )
    ) {
      if (props.plan === "MACRO")
        endpoint = `${appConfig.apiDomaine}/any/uemoa/state-more-30-days`;
      else
        endpoint = `${appConfig.apiDomaine}/without/uemoa/state-more-30-days`;
      sendData = {
        date_start: dateStart ? dateStart : null,
        date_end: dateEnd ? dateEnd : null,
        institution_id: institution ? institution.value : null,
        claim_category_id: category ? category.value : null,
        claim_object_id: object ? object.value : null,
        request_channel_slug: canal ? canal.value : null,
        unit_targeted_id: unit ? unit.value : null,
        responsible_unit_id: responsible ? responsible.value : null,
        account_type_id: clientType ? clientType.value : null,
        status: status ? status.value : null,
        relationship_id: relation ? relation.value : null,
      };
      if (props.plan === "HUB") {
        delete sendData.unit_targeted_id;
        delete sendData.account_type_id;
      } else delete sendData.relationShip;
    } else if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-my-institution"
      )
    ) {
      endpoint = `${appConfig.apiDomaine}/my/uemoa/state-more-30-days`;
      sendData = {
        date_start: dateStart ? dateStart : null,
        date_end: dateEnd ? dateEnd : null,
        claim_category_id: category ? category.value : null,
        claim_object_id: object ? object.value : null,
        request_channel_slug: canal ? canal.value : null,
        unit_targeted_id: unit ? unit.value : null,
        responsible_unit_id: responsible ? responsible.value : null,
        account_type_id: clientType ? clientType.value : null,
        status: status ? status.value : null,
      };
    }
    await axios
      .get(endpoint, { params: removeNullValueInObject(sendData) })
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
        setError(defaultError);
        setLoadFilter(false);
        setLoad(false);
      })
      .catch((error) => {
        setError({
          ...defaultError,
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
          setFilterObjectData(response.data.categories);
          if (
            verifyPermission(
              props.userPermissions,
              "list-reporting-claim-any-institution"
            )
          ) {
            setInstitutions(
              formatSelectOption(response.data.institutions, "name", false)
            );
            if (props.plan === "MACRO") {
              setFilterUnitsData(response.data.agences);
              setFilterResponsiblesData(response.data.functionTreating);
            } else {
              setResponsibles(
                formatSelectOption(response.data.functionTreating, "name", "fr")
              );
              setRelations(
                formatSelectOption(response.data.relationShip, "name", "fr")
              );
            }
          }
          if (
            verifyPermission(
              props.userPermissions,
              "list-reporting-claim-my-institution"
            )
          ) {
            setUnits(formatSelectOption(response.data.agences, "name", "fr"));
            setResponsibles(
              formatSelectOption(response.data.functionTreating, "name", "fr")
            );
          }
          setCategories(
            formatSelectOption(response.data.categories, "name", "fr")
          );
          if (props.plan !== "HUB")
            setClientTypes(
              formatSelectOption(response.data.clientTypes, "name", "fr")
            );
          setCanals(
            formatSelectOption(
              response.data.requestChannels,
              "name",
              "fr",
              "slug"
            )
          );
          setStatutes(formatStatus(response.data.status));
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
        getLowerCaseString(el.account ? el.account : "-").indexOf(value) >= 0 ||
        getLowerCaseString(
          el.accountCurrency ? el.accountCurrency : "-"
        ).indexOf(value) >= 0 ||
        getLowerCaseString(el.agence ? el.agence : "-").indexOf(value) >= 0 ||
        getLowerCaseString(el.amountDisputed ? el.amountDisputed : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.claimCategorie ? el.claimCategorie : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.claimObject ? el.claimObject : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.client ? el.client : "-").indexOf(value) >= 0 ||
        getLowerCaseString(el.commentClient ? el.commentClient : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.dateClosing ? el.dateClosing : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(
          el.dateQualification ? el.dateQualification : "-"
        ).indexOf(value) >= 0 ||
        getLowerCaseString(el.dateRegister ? el.dateRegister : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.dateTreatment ? el.dateTreatment : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(
          el.delayQualifWithWeekend ? el.delayQualifWithWeekend : "-"
        ).indexOf(value) >= 0 ||
        getLowerCaseString(
          el.delayTreatWithWeekend ? el.delayTreatWithWeekend : "-"
        ).indexOf(value) >= 0 ||
        getLowerCaseString(
          el.delayTreatWithoutWeekend ? el.delayTreatWithoutWeekend : "-"
        ).indexOf(value) >= 0 ||
        getLowerCaseString(
          el.functionTreating ? el.functionTreating : "-"
        ).indexOf(value) >= 0 ||
        getLowerCaseString(el.requestChannel ? el.requestChannel : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.solution ? el.solution : "-").indexOf(value) >=
          0 ||
        getLowerCaseString(el.staffTreating ? el.staffTreating : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.status ? el.status : "-").indexOf(value) >= 0 ||
        getLowerCaseString(el.telephone ? el.telephone : "-").indexOf(value) >=
          0 ||
        getLowerCaseString(el.relationShip ? el.relationShip : "-").indexOf(
          value
        ) >= 0 ||
        getLowerCaseString(el.typeClient ? el.typeClient : "-").indexOf(
          value
        ) >= 0
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

  const onChangeInstitution = (selected) => {
    setUnit(null);
    if (props.plan === "MACRO") setResponsible(null);
    if (selected === null) {
      setUnits([]);
      if (props.plan === "MACRO") setResponsibles([]);
    } else {
      if (props.plan === "MACRO") {
        const newUnits = filterUnitsData.filter(
          (item) => item.institution_id === selected.value
        );
        if (newUnits.length > 0)
          setUnits(formatSelectOption(newUnits, "name", "fr"));
        else setUnits([]);

        const newResponsibles = filterResponsiblesData.filter(
          (item) => item.institution_id === selected.value
        );
        if (newResponsibles.length > 0)
          setResponsibles(formatSelectOption(newResponsibles, "name", "fr"));
        else setResponsibles([]);
      }
    }
    setInstitution(selected);
  };

  const onChangeCategory = (selected) => {
    setObject(null);
    if (selected === null) setObjects([]);
    else {
      const objectList = filterObjectData.filter(
        (item) => item.id === selected.value
      );
      if (objectList.length > 0)
        setObjects(
          formatSelectOption(objectList[0].claim_objects, "name", "fr")
        );
      else setObjects([]);
    }
    setCategory(selected);
  };

  const onChangeClientType = (selected) => {
    setClientType(selected);
  };

  const onChangeObject = (selected) => {
    setObject(selected);
  };

  const onChangeRelation = (selected) => {
    setRelation(selected);
  };

  const onChangeUnit = (selected) => {
    setUnit(selected);
  };

  const onChangeResponsible = (selected) => {
    setResponsible(selected);
  };

  const onChangeCanal = (selected) => {
    setCanal(selected);
  };

  const onChangeStatus = (selected) => {
    setStatus(selected);
  };

  const downloadReporting = async () => {
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
        endpoint = `${appConfig.apiDomaine}/any/uemoa/state-more-30-days`;
      else
        endpoint = `${appConfig.apiDomaine}/without/uemoa/state-more-30-days`;
      sendData = {
        date_start: dateStart ? dateStart : null,
        date_end: dateEnd ? dateEnd : null,
        institution_id: institution ? institution.value : null,
        claim_category_id: category ? category.value : null,
        claim_object_id: object ? object.value : null,
        request_channel_slug: canal ? canal.value : null,
        unit_targeted_id: unit ? unit.value : null,
        responsible_unit_id: responsible ? responsible.value : null,
        account_type_id: clientType ? clientType.value : null,
        status: status ? status.value : null,
        relationship_id: relation ? relation.value : null,
      };
    } else if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-my-institution"
      )
    ) {
      endpoint = `${appConfig.apiDomaine}/my/uemoa/state-more-30-days`;
      sendData = {
        date_start: dateStart ? dateStart : null,
        date_end: dateEnd ? dateEnd : null,
        claim_category_id: category ? category.value : null,
        claim_object_id: object ? object.value : null,
        request_channel_slug: canal ? canal.value : null,
        unit_targeted_id: unit ? unit.value : null,
        responsible_unit_id: responsible ? responsible.value : null,
        account_type_id: clientType ? clientType.value : null,
        status: status ? status.value : null,
      };
    }

    if (verifyTokenExpire()) {
      await axios({
        method: "post",
        url: endpoint,
        responseType: "json",
        data: removeNullValueInObject(sendData),
      })
        .then(async ({ data }) => {
          setError(defaultError);
          const downloadButton = document.getElementById("downloadButton");
          downloadButton.href = `${appConfig.apiDomaine}/download-uemoa-reports/${data.file}`;
          downloadButton.click();
          setLoadDownload(false);
          // ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig('Téléchargement éffectuer avec succès'));
        })
        .catch((error) => {
          setError({
            ...defaultError,
            ...error.response.data.error,
          });
          console.log("Something is wrong");
          setLoadDownload(false);
        });
    }
  };

  const downloadReportingPdf = async () => {
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
        endpoint = `${appConfig.apiDomaine}/any/uemoa/state-more-30-days-pdf`;
      else
        endpoint = `${appConfig.apiDomaine}/without/uemoa/state-more-30-days-pdf`;
      sendData = {
        date_start: dateStart ? dateStart : null,
        date_end: dateEnd ? dateEnd : null,
        institution_id: institution ? institution.value : null,
        claim_category_id: category ? category.value : null,
        claim_object_id: object ? object.value : null,
        request_channel_slug: canal ? canal.value : null,
        unit_targeted_id: unit ? unit.value : null,
        responsible_unit_id: responsible ? responsible.value : null,
        account_type_id: clientType ? clientType.value : null,
        status: status ? status.value : null,
        relationship_id: relation ? relation.value : null,
      };
    } else if (
      verifyPermission(
        props.userPermissions,
        "list-reporting-claim-my-institution"
      )
    ) {
      endpoint = `${appConfig.apiDomaine}/my/uemoa/state-more-30-days-pdf`;
      sendData = {
        date_start: dateStart ? dateStart : null,
        date_end: dateEnd ? dateEnd : null,
        claim_category_id: category ? category.value : null,
        claim_object_id: object ? object.value : null,
        request_channel_slug: canal ? canal.value : null,
        unit_targeted_id: unit ? unit.value : null,
        responsible_unit_id: responsible ? responsible.value : null,
        account_type_id: clientType ? clientType.value : null,
        status: status ? status.value : null,
      };
    }

    if (verifyTokenExpire()) {
      await axios({
        method: "post",
        url: endpoint,
        responseType: "blob",
        data: removeNullValueInObject(sendData),
      })
        .then(async ({ data }) => {
          console.log("data:", data);
          setError(defaultError);
          FileSaver.saveAs(
            data,
            `reporting_retard_30_jours_${new Date().getFullYear()}.pdf`
          );
          setLoadDownloadPdf(false);
          // ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig('Téléchargement éffectuer avec succès'));
        })
        .catch((error) => {
          setError({
            ...defaultError,
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
              <strong>{t("Objet de réclamation")}</strong>
              <p className="ml-5">
                {claim.claimObject ? claim.claimObject : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Canal de réception")}</strong>
              <p className="ml-5">
                {claim.requestChannel ? claim.requestChannel : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>
                {t("Commentaire")} ({t("client")})
              </strong>
              <p className="ml-5">
                {claim.commentClient ? claim.commentClient : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Fonction de traitement")}</strong>
              <p className="ml-5">
                {claim.functionTreating ? claim.functionTreating : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Agent traitant")}</strong>
              <p className="ml-5">
                {claim.staffTreating ? claim.staffTreating : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Solution apportée par l'agent")}</strong>
              <p className="ml-5">{claim.solution ? claim.solution : "-"}</p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Statut")}</strong>
              <p className="ml-5">{claim.status ? claim.status : "-"}</p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Date de réclamation")}</strong>
              <p className="ml-5">
                {claim.dateRegister ? claim.dateRegister : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Date qualification")}</strong>
              <p className="ml-5">
                {claim.dateQualification ? claim.dateQualification : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Date de traitement")}</strong>
              <p className="ml-5">
                {claim.dateTreatment ? claim.dateTreatment : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Date de clôture")}</strong>
              <p className="ml-5">
                {claim.dateClosing ? claim.dateClosing : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>
                {t("Délai de qualification")} (J) {t("avec weekend")}
              </strong>
              <p className="ml-5">
                {claim.delayQualifWithWeekend
                  ? claim.delayQualifWithWeekend
                  : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>
                {t("Délai de traitement")} (J) {t("avec weekend")}
              </strong>
              <p className="ml-5">
                {claim.delayTreatWithWeekend
                  ? claim.delayTreatWithWeekend
                  : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>
                {t("Délai de traitement")} (J) {t("sans weekend")}
              </strong>
              <p className="ml-5">
                {claim.delayTreatWithoutWeekend
                  ? claim.delayTreatWithoutWeekend
                  : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Montant réclamé")}</strong>
              <p className="ml-5">
                {claim.amountDisputed ? claim.amountDisputed : "-"}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <strong>{t("Devise du montant")}</strong>
              <p className="ml-5">
                {claim.accountCurrency ? claim.accountCurrency : "-"}
              </p>
            </div>
          </div>
        </td>
        {verifyPermission(
          props.userPermissions,
          "list-reporting-claim-any-institution"
        ) ? (
          <td data-sort="filiale">{claim.filiale ? claim.filiale : "-"}</td>
        ) : null}
        {props.plan !== "HUB" ? (
          <>
            <td data-sort="accountTargeted.accountType.name">
              {claim.typeClient ? claim.typeClient : "-"}
            </td>
            <td data-sort="claimer.lastname">
              {claim.client ? claim.client : "-"}
            </td>
            <td data-sort="account_number">
              {claim.account ? claim.account : "-"}
            </td>
          </>
        ) : (
          <td data-sort="relationShip">
            {claim.relationShip ? claim.relationShip : "-"}
          </td>
        )}
        <td data-sort="claimer.telephone">
          {claim.telephone ? claim.telephone : "-"}
        </td>
        <td data-sort="unitTargeted.name">
          {claim.agence ? claim.agence : "-"}
        </td>
        <td data-sort="claimObject.claimCategory.name">
          {claim.claimCategorie ? claim.claimCategorie : "-"}
        </td>
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
                  {t("État retard de +30 jours")}
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
                  "État complet de toutes les réclamations qui ont déjà fait plus de 30 jours et qui n'ont toujours pas encore été traitées à la date du jour"
                )}
                .
              </div>
            }
          />

          <div className="kt-portlet">
            <HeaderTablePage
              title={
                t("Rapport") + " " + t("État retard de") + " 30 " + t("jours")
              }
            />

            <div className="kt-portlet__body">
              <div className="row">
                {verifyPermission(
                  props.userPermissions,
                  "list-reporting-claim-any-institution"
                ) ? (
                  <div className="col-md-12">
                    <div
                      className={
                        error.institution_targeted_id.length
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

                      {error.institution_targeted_id.length
                        ? error.institution_targeted_id.map((error, index) => (
                            <div key={index} className="invalid-feedback">
                              {error}
                            </div>
                          ))
                        : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {props.plan !== "HUB" ? (
                <div className="row">
                  <div className="col">
                    <div
                      className={
                        error.account_type_id.length
                          ? "form-group validated"
                          : "form-group"
                      }
                    >
                      <label htmlFor="">{t("Type de compte")}</label>
                      <Select
                        isClearable
                        value={clientType}
                        placeholder={t(
                          "Veuillez sélectionner le type de compte"
                        )}
                        onChange={onChangeClientType}
                        options={clientTypes}
                      />

                      {error.account_type_id.length
                        ? error.account_type_id.map((error, index) => (
                            <div key={index} className="invalid-feedback">
                              {error}
                            </div>
                          ))
                        : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="row">
                <div className="col">
                  <div
                    className={
                      error.claim_category_id.length
                        ? "form-group validated"
                        : "form-group"
                    }
                  >
                    <label htmlFor="">{t("Catégorie de réclamation")}</label>
                    <Select
                      isClearable
                      value={category}
                      placeholder={t("Veuillez sélectionner la catégorie")}
                      onChange={onChangeCategory}
                      options={categories}
                    />

                    {error.claim_category_id.length
                      ? error.claim_category_id.map((error, index) => (
                          <div key={index} className="invalid-feedback">
                            {error}
                          </div>
                        ))
                      : null}
                  </div>
                </div>

                <div className="col">
                  <div
                    className={
                      error.claim_object_id.length
                        ? "form-group validated"
                        : "form-group"
                    }
                  >
                    <label htmlFor="">{t("Objet de réclamation")}</label>
                    <Select
                      isClearable
                      value={object}
                      placeholder={t("Veuillez sélectionner l'objet")}
                      onChange={onChangeObject}
                      options={objects}
                    />

                    {error.claim_object_id.length
                      ? error.claim_object_id.map((error, index) => (
                          <div key={index} className="invalid-feedback">
                            {error}
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              </div>

              <div className="row">
                {props.plan === "HUB" ? (
                  <div className="col">
                    <div
                      className={
                        error.relationShip.length
                          ? "form-group validated"
                          : "form-group"
                      }
                    >
                      <label htmlFor="">{t("Relation")}</label>
                      <Select
                        isClearable
                        value={relation}
                        placeholder={t("Veuillez sélectionner la relation")}
                        onChange={onChangeRelation}
                        options={relations}
                      />

                      {error.relationShip.length
                        ? error.relationShip.map((error, index) => (
                            <div key={index} className="invalid-feedback">
                              {error}
                            </div>
                          ))
                        : null}
                    </div>
                  </div>
                ) : (
                  <div className="col">
                    <div
                      className={
                        error.unit_targeted_id.length
                          ? "form-group validated"
                          : "form-group"
                      }
                    >
                      <label htmlFor="">{t("Agences concernée")}</label>
                      <Select
                        isClearable
                        value={unit}
                        placeholder={t("Veuillez sélectionner l'agence")}
                        onChange={onChangeUnit}
                        options={units}
                      />

                      {error.unit_targeted_id.length
                        ? error.unit_targeted_id.map((error, index) => (
                            <div key={index} className="invalid-feedback">
                              {error}
                            </div>
                          ))
                        : null}
                    </div>
                  </div>
                )}

                <div className="col">
                  <div
                    className={
                      error.responsible_unit_id.length
                        ? "form-group validated"
                        : "form-group"
                    }
                  >
                    <label htmlFor="">{t("Fonction traitant")}</label>
                    <Select
                      isClearable
                      value={responsible}
                      placeholder={t(
                        "Veuillez sélectionner la fonction traitant"
                      )}
                      onChange={onChangeResponsible}
                      options={responsibles}
                    />

                    {error.responsible_unit_id.length
                      ? error.responsible_unit_id.map((error, index) => (
                          <div key={index} className="invalid-feedback">
                            {error}
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <div
                    className={
                      error.request_channel_slug.length
                        ? "form-group validated"
                        : "form-group"
                    }
                  >
                    <label htmlFor="">{t("Canal de réception")}</label>
                    <Select
                      isClearable
                      value={canal}
                      placeholder={t(
                        "Veuillez sélectionner le canal de réception"
                      )}
                      onChange={onChangeCanal}
                      options={canals}
                    />

                    {error.request_channel_slug.length
                      ? error.request_channel_slug.map((error, index) => (
                          <div key={index} className="invalid-feedback">
                            {error}
                          </div>
                        ))
                      : null}
                  </div>
                </div>

                <div className="col">
                  <div
                    className={
                      error.status.length
                        ? "form-group validated"
                        : "form-group"
                    }
                  >
                    <label htmlFor="">{t("Statut")}</label>
                    <Select
                      isClearable
                      value={status}
                      placeholder={t("Veuillez sélectionner le statut")}
                      onChange={onChangeStatus}
                      options={statutes}
                    />

                    {error.status.length
                      ? error.status.map((error, index) => (
                          <div key={index} className="invalid-feedback">
                            {error}
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              </div>

              <div className="row">
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
                      {t("Chargement")}...
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
                      {t("Chargement")}...
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
                      {t("Chargement")}...
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
                          {props.plan !== "HUB" ? (
                            <>
                              <th
                                className="sorting"
                                tabIndex="0"
                                aria-controls="kt_table_1"
                                rowSpan="1"
                                colSpan="1"
                                style={{ width: "70.25px" }}
                                aria-label="Country: activate to sort column ascending"
                              >
                                {t("Type de client")}
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
                                {t("Client")}
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
                                N° {t("Compte")}
                              </th>
                            </>
                          ) : (
                            <th
                              className="sorting"
                              tabIndex="0"
                              aria-controls="kt_table_1"
                              rowSpan="1"
                              colSpan="1"
                              style={{ width: "70.25px" }}
                              aria-label="Country: activate to sort column ascending"
                            >
                              {t("Relation")}
                            </th>
                          )}
                          <th
                            className="sorting"
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "70.25px" }}
                            aria-label="Country: activate to sort column ascending"
                          >
                            {t("Téléphone")}
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
                            {t("Agence")}
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
                            {t("Catégorie de réclamation")}
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
                          {props.plan !== "HUB" ? (
                            <>
                              <th rowSpan="1" colSpan="1">
                                {t("Type de client")}
                              </th>
                              <th rowSpan="1" colSpan="1">
                                {t("Client")}
                              </th>
                              <th rowSpan="1" colSpan="1">
                                N° {t("Compte")}
                              </th>
                            </>
                          ) : (
                            <th rowSpan="1" colSpan="1">
                              {t("Relation")}
                            </th>
                          )}
                          <th rowSpan="1" colSpan="1">
                            {t("Téléphone")}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {t("Agence")}
                          </th>
                          <th rowSpan="1" colSpan="1">
                            {t("Catégorie de réclamation")}
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

export default connect(mapStateToProps)(ClaimReportingUemoaTwo);
