import { RECEPTION_CHANNEL, RESPONSE_CHANNEL } from "../constants/channel";
import { verifyPermission } from "./permission";
import appConfig, { suportUrl } from "../config/appConfig";
import moment from "moment";
import axios from "axios";
import { listConnectData } from "../constants/userClient";
import { AUTH_TOKEN } from "../constants/token";
import i18n from "../i18n";
import { keyPair, encrypt, sign, verify } from "asymmetric-crypto";

axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;

moment.locale();
export const existingScript = function(id) {
  return !!document.getElementById(id);
};
export const myencodeParamUrl = (url, paramName, paramValue) => {
  var urlObj = new URL(url);
  var searchParams = urlObj.searchParams;

  // Check if the parameter already exists
  if (searchParams.has(paramName)) {
    // Replace the existing parameter value
    searchParams.set(paramName, paramValue);
  } else {
    // Add the new parameter
    searchParams.append(paramName, paramValue);
  }

  // Return the updated URL
  return urlObj.href;
};

export const exitingStyleSheet = (id) => {
  return !!document.getElementById(id);
};

export const loadCss = function(linkStylsheet) {
  var tag = document.createElement("link");
  tag.href = linkStylsheet;
  tag.rel = "stylesheet";
  switch (linkStylsheet) {
    case "assets/plugins/custom/datatables/datatables.bundle.css":
      tag.id = "style-dataTable";
      if (!exitingStyleSheet("style-dataTable"))
        document.getElementsByTagName("head")[0].append(tag);
      break;
    case "/assets/plugins/custom/datatables/datatables.bundle.css":
      tag.id = "style-dataTable";
      if (!exitingStyleSheet("style-dataTable"))
        document.getElementsByTagName("head")[0].append(tag);
      break;
    case "/assets/css/pages/login/login-1.css":
      tag.id = "style-login-page";
      if (!exitingStyleSheet("style-login-page"))
        document.getElementsByTagName("head")[0].append(tag);
      break;
    case "/assets/css/pages/error/error-6.css":
      tag.id = "style-error401-page";
      if (!exitingStyleSheet("style-error401-page"))
        document.getElementsByTagName("head")[0].append(tag);
      break;
    case "/assets/css/pages/pricing/pricing-3.css":
      tag.id = "style-choice-nature-page";
      if (!exitingStyleSheet("style-choice-nature-page"))
        document.getElementsByTagName("head")[0].append(tag);
      break;
    case "/assets/css/pages/wizard/wizard-2.css":
      tag.id = "style-wizard-2";
      if (!exitingStyleSheet("style-style-wizard-2"))
        document.getElementsByTagName("head")[0].append(tag);
      break;
    case "/assets/plugins/custom/kanban/kanban.bundle.css":
      tag.id = "style-kanban-bord";
      if (!exitingStyleSheet("style-kanban-bord"))
        document.getElementsByTagName("head")[0].append(tag);
      break;
    case "/assets/js/pages/crud/metronic-datatable/advanced/row-details.js":
      tag.id = "datatable-row-detail";
      if (!exitingStyleSheet("datatable-row-detail"))
        document.getElementsByTagName("head")[0].append(tag);
      break;
    default:
      break;
  }
};

export const loadScript = function(src) {
  var tag = document.createElement("script");
  tag.src = src;

  switch (src) {
    case "assets/plugins/custom/datatables/datatables.bundle.js":
      tag.id = "data-table-script";
      if (!existingScript("data-table-script"))
        document.getElementsByTagName("body")[0].appendChild(tag);
      break;
    case "/assets/plugins/custom/datatables/datatables.bundle.js":
      tag.id = "data-table-script";
      if (!existingScript("data-table-script"))
        document.getElementsByTagName("body")[0].appendChild(tag);
      break;
    case "/assets/js/pages/custom/login/login-1.js":
      tag.id = "script-login-page";
      if (!existingScript("script-login-page"))
        document.getElementsByTagName("body")[0].appendChild(tag);
      break;
    case "/assets/plugins/global/plugins.bundle.js":
      tag.id = "script-global-one";
      if (!existingScript("script-global-one"))
        document.getElementsByTagName("body")[0].appendChild(tag);
      break;
    case "/assets/js/scripts.bundle.js":
      tag.id = "script-global-two";
      if (!existingScript("script-global-two"))
        document.getElementsByTagName("body")[0].appendChild(tag);
      break;
    case "/assets/js/pages/custom/wizard/wizard-2.js":
      tag.src = `${src}?v=4.4.4.4`;
      tag.id = "script-wizard-2";
      if (!existingScript("script-wizard-2"))
        document.getElementsByTagName("body")[0].appendChild(tag);
      break;
    case "/assets/js/pages/custom/chat/chat.js":
      tag.id = "script-chat-2";
      if (!existingScript("script-chat-2"))
        document.getElementsByTagName("body")[0].appendChild(tag);
      break;
    default:
      break;
  }
};

export const formatSelectOption = function(
  options,
  labelKey,
  translate,
  valueKey = "id"
) {
  const newOptions = [];
  for (let i = 0; i < options.length; i++) {
    if (translate)
      newOptions.push({
        value: options[i][valueKey],
        label: options[i][labelKey][translate],
      });
    else
      newOptions.push({
        value: options[i][valueKey],
        label: options[i][labelKey],
      });
  }
  return newOptions;
};

export const forceRound = (decimalNumber) => {
  return ("" + decimalNumber).split(".")[1]
    ? Math.trunc(decimalNumber) + 1
    : Math.trunc(decimalNumber);
};

export const formatPermissions = (permissions) => {
  const newPermissions = [];
  permissions.map((permission) => newPermissions.push(permission.name));
  return newPermissions;
};

export const filterDataTableBySearchValue = () => {
  function myFunction() {
    var input, filter, table, tr, td, i, j, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td");
      for (j = 0; j < td.length; j++) {
        if (td[j]) {
          txtValue = td[j].textContent || td[j].innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
            break;
          } else tr[i].style.display = "none";
        }
      }
    }
  }

  myFunction();
};

export const filterDiscussionBySearchValue = () => {
  function myFunction() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName("li");

    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("a")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }

  myFunction();
};

export const filterChannel = (channels, typeFilter) => {
  const newChannels = [];
  for (let i = 0; i < channels.length; i++) {
    if (typeFilter === RESPONSE_CHANNEL) {
      if (channels[i].is_response == 1) newChannels.push(channels[i]);
    } else if (typeFilter === RECEPTION_CHANNEL) {
      if (channels[i].is_response == 0) newChannels.push(channels[i]);
    } else return channels;
  }
  return newChannels;
};

export const percentageData = (data, total) => {
  if (total !== 0) return Math.round((data * 100) / total) + "%";
  else return 0 + "%";
};
// export const percentage = (data, total) => {
//
//     if (total !== 0)
//         return Math.round((data * 100) / total) ;
//     else return 0
//
// };

export const formatToTimeStamp = (dateTime) => {
  if (dateTime.length)
    return dateTime.split("T")[0] + " " + dateTime.split("T")[1];
  else return "";
};
export const formatToTimeStampUpdate = (dateTime) => {
  if (dateTime.length)
    return (
      dateTime.split("T")[0] + " " + dateTime.split("T")[1].substring(0, 5)
    );
  else return "";
};

export const formatDateToTimeStampte = (dateTime) => {
  if (dateTime) return moment(dateTime).format("LLLL");
  else return "Pas de date";
};

export const formatDateToTime = (dateTime) => {
  if (dateTime) return moment(dateTime).format("L");
  else return "Pas de date";
};

export const formatToTime = (dateTime) => {
  if (dateTime !== null)
    return dateTime.split("T")[0] + "T" + dateTime.split("T")[1].split(".")[0];
  else return "";
};
export const reduceCharacter = (texte) => {
  if (texte !== null) return texte.substr(0, 30) + "...";
  else return "";
};
// export const takeToken = url => {
//     if (url !== null)
//        return url.substr(38 );
//     else
//         return "";
// };

export const seeParameters = (userPermissions) => {
  return (
    verifyPermission(userPermissions, "update-sms-parameters") ||
    verifyPermission(userPermissions, "update-mail-parameters") ||
    verifyPermission(userPermissions, "update-proxy-config") ||
    verifyPermission(userPermissions, "show-proxy-config") ||
    verifyPermission(userPermissions, "list-any-institution") ||
    verifyPermission(userPermissions, "update-my-institution") ||
    verifyPermission(userPermissions, "update-claim-object-requirement") ||
    verifyPermission(
      userPermissions,
      "update-processing-circuit-my-institution"
    ) ||
    verifyPermission(
      userPermissions,
      "update-processing-circuit-any-institution"
    ) ||
    verifyPermission(
      userPermissions,
      "update-processing-circuit-without-institution"
    ) ||
    verifyPermission(userPermissions, "list-client-from-any-institution") ||
    verifyPermission(userPermissions, "list-client-from-my-institution") ||
    verifyPermission(userPermissions, "list-relationship") ||
    verifyPermission(userPermissions, "update-category-client") ||
    verifyPermission(userPermissions, "list-type-client") ||
    verifyPermission(userPermissions, "list-performance-indicator") ||
    verifyPermission(userPermissions, "list-unit-type") ||
    verifyPermission(userPermissions, "list-any-unit") ||
    verifyPermission(userPermissions, "list-position") ||
    verifyPermission(userPermissions, "list-claim-category") ||
    verifyPermission(userPermissions, "list-claim-object") ||
    verifyPermission(userPermissions, "list-staff-from-any-unit") ||
    verifyPermission(userPermissions, "list-staff-from-my-unit") ||
    verifyPermission(userPermissions, "list-staff-from-maybe-no-unit") ||
    verifyPermission(userPermissions, "list-severity-level") ||
    verifyPermission(userPermissions, "list-currency") ||
    verifyPermission(userPermissions, "update-notifications") ||
    verifyPermission(userPermissions, "list-channel") ||
    verifyPermission(userPermissions, "update-active-pilot") ||
    verifyPermission(userPermissions, "list-faq") ||
    verifyPermission(userPermissions, "list-faq-category") ||
    verifyPermission(
      userPermissions,
      "config-reporting-claim-any-institution"
    ) ||
    verifyPermission(userPermissions, "update-recurrence-alert-settings") ||
    verifyPermission(
      userPermissions,
      "update-reject-unit-transfer-parameters"
    ) ||
    verifyPermission(userPermissions, "list-any-institution-type-role") ||
    verifyPermission(userPermissions, "list-my-institution-type-role") ||
    verifyPermission(userPermissions, "update-min-fusion-percent-parameters") ||
    verifyPermission(userPermissions, "update-components-parameters") ||
    verifyPermission(userPermissions, "update-relance-parameters") ||
    verifyPermission(userPermissions, "list-account-type") ||
    verifyPermission(userPermissions, "list-auth-config") ||
    verifyPermission(userPermissions, "update-auth-config") ||
    verifyPermission(userPermissions, "activity-log") ||
    verifyPermission(userPermissions, "list-notification-proof") ||
    verifyPermission(userPermissions, "pilot-list-notification-proof") ||
    verifyPermission(userPermissions, "list-any-notification-proof") ||
    verifyPermission(userPermissions, "update-reporting-titles-configs") ||
    verifyPermission(userPermissions, "pilot-list-any-notification-proof") ||
    verifyPermission(
      userPermissions,
      "list-config-reporting-claim-my-institution"
    ) ||
    verifyPermission(
      userPermissions,
      "store-config-reporting-claim-my-institution"
    ) ||
    verifyPermission(
      userPermissions,
      "update-config-reporting-claim-my-institution"
    ) ||
    verifyPermission(
      userPermissions,
      "delete-config-reporting-claim-my-institution"
    ) ||
    true
  );
};

export const seeCollect = (userPermissions) => {
  return (
    verifyPermission(userPermissions, "store-claim-against-any-institution") ||
    verifyPermission(userPermissions, "store-claim-against-my-institution") ||
    verifyPermission(userPermissions, "store-claim-without-client") ||
    verifyPermission(
      userPermissions,
      "list-claim-incomplete-against-any-institution"
    ) ||
    verifyPermission(
      userPermissions,
      "list-claim-incomplete-against-my-institution"
    ) ||
    verifyPermission(userPermissions, "list-claim-incomplete-without-client")
  );
};

export const seeHistorique = (userPermissions) => {
  return (
    verifyPermission(userPermissions, "history-list-treat-claim") ||
    verifyPermission(userPermissions, "history-list-create-claim")
  );
};

export const seeTreatment = (userPermissions) => {
  return (
    verifyPermission(userPermissions, "show-claim-awaiting-assignment") ||
    verifyPermission(userPermissions, "list-claim-awaiting-treatment") ||
    verifyPermission(
      userPermissions,
      "list-claim-awaiting-validation-my-institution"
    ) ||
    verifyPermission(userPermissions, "list-satisfaction-measured-any-claim") ||
    verifyPermission(userPermissions, "list-satisfaction-measured-my-claim") ||
    verifyPermission(userPermissions, "list-my-claim-archived") ||
    verifyPermission(userPermissions, "list-any-claim-archived") ||
    verifyPermission(
      userPermissions,
      "list-claim-awaiting-validation-any-institution"
    ) ||
    verifyPermission(userPermissions, "list-claim-assignment-to-staff") ||
    verifyPermission(userPermissions, "list-claim-satisfaction-measured") ||
    verifyPermission(userPermissions, "list-my-discussions") ||
    verifyPermission(userPermissions, "contribute-discussion") ||
    verifyPermission(userPermissions, "list-claim-archived") ||
    verifyPermission(userPermissions, "list-my-discussions") ||
    verifyPermission(userPermissions, "contribute-discussion") ||
    verifyPermission(userPermissions, "list-unit-revivals") ||
    verifyPermission(userPermissions, "list-staff-revivals")
  );
};

export const seeMonitoring = (userPermissions) => {
  return (
    verifyPermission(
      userPermissions,
      "list-monitoring-claim-any-institution"
    ) ||
    verifyPermission(userPermissions, "list-monitoring-claim-my-institution") ||
    verifyPermission(userPermissions, "list-reporting-claim-any-institution") ||
    verifyPermission(userPermissions, "list-reporting-claim-my-institution") ||
    verifyPermission(
      userPermissions,
      "list-regulatory-reporting-claim-my-institution"
    ) ||
    verifyPermission(userPermissions, "system-my-efficiency-report") ||
    verifyPermission(userPermissions, "list-global-reporting") ||
    verifyPermission(
      userPermissions,
      "config-reporting-claim-my-institution"
    ) ||
    verifyPermission(userPermissions, "list-benchmarking-reporting") ||
    verifyPermission(userPermissions, "list-system-usage-reporting") ||
    verifyPermission(userPermissions, "show-my-staff-monitoring")
  );
};

export const validatedClaimRule = (id) => {
  return {
    MACRO: {
      endpoint: {
        validate: `${appConfig.apiDomaine}/claim-awaiting-validation-my-institution/${id}/validate`,
        invalidate: `${appConfig.apiDomaine}/claim-awaiting-validation-my-institution/${id}/invalidate`,
      },
      permission: "validate-treatment-my-institution",
    },
    PRO: {
      endpoint: {
        validate: `${appConfig.apiDomaine}/claim-awaiting-validation-my-institution/${id}/validate`,
        invalidate: `${appConfig.apiDomaine}/claim-awaiting-validation-my-institution/${id}/invalidate`,
      },
      permission: "validate-treatment-my-institution",
    },
    HUB: {
      endpoint: {
        validate: `${appConfig.apiDomaine}/claim-awaiting-validation-any-institution/${id}/validate`,
        invalidate: `${appConfig.apiDomaine}/claim-awaiting-validation-any-institution/${id}/invalidate`,
      },
      permission: "validate-treatment-any-institution",
    },
  };
};
function hypheny(res) {
  res = `${res}`;
  return res.replace(/\s+/g, "-").replace(/\//g, "-");
}
export const script_appender = (url, callback) => {
  const id = `${hypheny(url, "/")}`;
  const existingScript = document.getElementById(id);
  if (existingScript) {
    document.getElementById(id).remove();
  }
  const script = document.createElement("script");
  script.src = `${url}`;
  script.id = id;
  script.async = false;

  document.body.appendChild(script);
  script.onload = () => {
    if (callback) callback();
  };
};
export const formatDate = (date) => {
  date = date.split("/");
  date = date[2] + "-" + date[1] + "-" + date[0];
  return new Date(date);
};

export const debug = (variable, label = null) => {
  console.log(`${label ? label + ":" : "debug:"}`, variable);
};

export const getLowerCaseString = (value) => {
  return (value + "").toLowerCase();
};

export const logout = () => {
  const plan = localStorage.getItem("plan");
  const lng = localStorage.getItem("i18nextLng");
  localStorage.clear();
  localStorage.setItem("plan", plan);
  lng !== null && localStorage.setItem("i18nextLng", lng);
  localStorage.removeItem("DTimeout");
  window.location.href = "/login";
};

export const goToSupport = (e, props) => {
  e.preventDefault();
  const myKeyPairs = keyPair();
  const data = {
    nm: props.user?.data?.identite?.lastname,
    pm: props.user?.data?.identite?.firstname,
    em: props.user?.data?.identite.email?.[0],
    ph: props.user?.data?.identite.telephone?.[0],
    ins: props.user?.institution?.id,
    pf: props?.roles?.[0],
    ns: props.plan,
    us: window.location.origin,
  };
  const encrypted = encrypt(
    JSON.stringify(data),
    "IbfuKhNapgGAjq1evWQFITwo4t/gkvI4ZIe/VM4qrPg=",
    myKeyPairs.secretKey
  );
  let theSuportUrl = `${suportUrl}/?sk=${myKeyPairs.publicKey}&dt=${encrypted.data}&nc=${encrypted.nonce}`;
  console.log(theSuportUrl);
  window.open(theSuportUrl, "_blank").focus();
};

export const refreshToken = async () => {
  var date = new Date();
  date.setHours(date.getHours() + appConfig.timeAfterDisconnection);
  console.log("date:", date);

  const data = {
    grant_type: "refresh_token",
    refresh_token: localStorage.getItem("refresh_token"),
    client_id: listConnectData[localStorage.getItem("plan")].client_id,
    client_secret: listConnectData[localStorage.getItem("plan")].client_secret,
  };

  await axios
    .post(`${appConfig.apiDomaine}/oauth/token`, data)
    .then(({ data }) => {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("expire_in", data.expires_in);
      var date = new Date();
      date.setSeconds(date.getSeconds() + data.expires_in - 180);
      localStorage.setItem("date_expire", date);
      localStorage.setItem("refresh_token", data.refresh_token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.access_token}`;
    })
    .catch(() => {
      console.log("Something is wrong");
    });
};

export const truncateString = (text, length = 41) => {
  if (text.length <= 50) return text;
  return `${text.substring(0, length)}...`;
};
export const getToken = (url) => {
  if (url !== null) return url.split("/")[4];
  else return "";
};

export const formatStatus = (statutes) => {
  const array = Object.entries(statutes);
  const newArray = [];
  for (var i = 0; i < array.length; i++) {
    newArray.push({
      value: array[i][0],
      label: array[i][1],
    });
  }

  return newArray;
};

export const removeNullValueInObject = (obj) => {
  const array = Object.entries(obj);
  for (var i = 0; i < array.length; i++) {
    if (array[i][1] === null) delete obj[array[i][0]];
  }
  return obj;
};

export const displayStatus = (status) => {
  let finalStatus = "";

  if (i18n.isInitialized) {
    switch (status) {
      case "incomplete":
        finalStatus = i18n.t("incomplète");
        break;
      case "full":
        finalStatus = i18n.t("complète");
        break;
      case "transferred_to_unit":
        finalStatus = i18n.t("transférer à une unité");
        break;
      case "transferred_to_targeted_institution":
        finalStatus = i18n.t("transférer à une institution ciblée");
        break;
      case "assigned_to_staff":
        finalStatus = i18n.t("assigner à un staff");
        break;
      case "treated":
        finalStatus = i18n.t("traitée");
        break;
      case "validated":
        finalStatus = i18n.t("validée");
        break;
      case "archived":
        finalStatus = i18n.t("archivée");
        break;
      case "awaiting":
        finalStatus = i18n.t("en attente");
        break;
      case "considered":
        finalStatus = i18n.t("considérée");
        break;
      default:
        finalStatus = status;
        break;
    }
  }

  return finalStatus;
};
