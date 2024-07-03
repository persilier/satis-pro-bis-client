import appConfig from "../config/appConfig";
import { logout, myencodeParamUrl, script_appender } from "../helpers/function";
import { isTimeOut } from "../helpers";
import { logoutUser } from "./crud";
import { ExpirationConfirmation } from "../views/components/ConfirmationAlert";
import { ExpireConfig } from "../config/confirmConfig";
import i18n from "i18next";
import { verifyTokenExpire } from "middleware/verifyToken";

export default function setupAxios(axios, store) {
  axios.defaults.withCredentials = true;
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      let theUrl = config.url;
      config.baseURL = appConfig.apiDomaine;
      config.headers.post["Content-Type"] = "application/json";
      config.headers.post["X-Content-Type-Options"] = "nosniff";
      config.headers.post["X-XSS-Protection"] = "1; mode=block";

      if (config.params?.date_start && config.params?.date_end) {
        window.objectSorter = {
          ...(window.objectSorter || {}),
          date_start: config.params?.date_start,
          date_end: config.params?.date_end,
        };
      }
      if (window.objectSorter && window.objectSorter?.name) {
        theUrl = myencodeParamUrl(theUrl, `sort`, window.objectSorter?.name);
        theUrl = myencodeParamUrl(
          theUrl,
          `direction`,
          window.objectSorter?.order
        );
        if (window.objectSorter?.date_start && window.objectSorter?.date_end) {
          theUrl = myencodeParamUrl(
            theUrl,
            `date_start`,
            window.objectSorter?.date_start
          );
          theUrl = myencodeParamUrl(
            theUrl,
            `date_end`,
            window.objectSorter?.date_end
          );
        }
      }
      config.url = theUrl;
      delete window.objectSorter;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (err) => Promise.reject(err)
  );

  axios.interceptors.response.use(
    (response) => {
      script_appender("/assets/js/jquery.tablesorter.min.js");
      script_appender("/assets/js/main.js");
      window.$(".tbodyobjectSorter").remove();

      if (window.location.href !== "/login") {
        if (localStorage.getItem("userData") !== null) {
          /*if (isTimeOut()) {
            logoutUser()
              .then(({ data }) => {
                localStorage.removeItem("userData");
                ExpirationConfirmation.fire(
                  ExpireConfig(
                    i18n.t(
                      "Vous avez été déconnecter pour durer d'inactivité de votre compte, veuillez vous reconnecter"
                    )
                  )
                ).then((res) => {
                  if (res.value) {
                    logout();
                  }
                });
              })
              .catch(console.log);

            return response;
          }*/
        }
      }
      return response;
    },
    (error) => {
      if (window.location.href !== "/login") {
        if (localStorage.getItem("userData") !== null) {
          if (isTimeOut()) {
            logoutUser()
              .then(({ data }) => {
                localStorage.removeItem("userData");
                ExpirationConfirmation.fire(
                  ExpireConfig(
                    i18n.t(
                      "Vous avez été déconnecter pour durer d'inactivité de votre compte, veuillez vous reconnecter"
                    )
                  )
                ).then((res) => {
                  if (res.value) {
                    logout();
                  }
                });
              })
              .catch(console.log);
            return Promise.reject(error);
          }
          if (error.response.status === 401) {
            verifyTokenExpire();

            console.log(error.response);
            // ExpirationConfirmation.fire(
            //   ExpireConfig(
            //     i18n.t("Vous n'aviez pas les permissions pour voir ce menu")
            //   )
            // ).then((res) => {});
          }
        }
      }

      return Promise.reject(error);
    }
  );
}
