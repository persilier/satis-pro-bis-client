import React, { useState } from "react";
import axios from "axios";
import appConfig from "../../../config/appConfig";
import { ToastBottomEnd } from "../Toast";
import {useTranslation} from "react-i18next";
import {
  toastEditErrorMessageConfig,
  toastEditSuccessMessageConfig,
} from "../../../config/toastConfig";
import { resetPassword } from "../../../http/crud";
import {isTimeOut} from "../../../helpers";

const moment =  require("moment");



const UpdatePassword = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

  const [startRequest, setStartRequest] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);
  const [viewNewPassword, setViewNewPassword] = useState(false);
  const [viewConfirmNewPassword, setViewConfirmNewPassword] = useState(false);

  const defaultData = {
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  };

  const defaultError = {
    current_password: [],
    new_password: [],
    new_password_confirmation: [],
  };

  const [data, setData] = useState(defaultData);
  const [error, setError] = useState(defaultError);

  const handleChangeCurrentPassword = (value) => {
    const newData = { ...data };
    newData.current_password = value;
    setData(newData);
  };

  const handleNewPassword = (value) => {
    const newData = { ...data };
    newData.new_password = value;
    setData(newData);
  };


  const handleNewPasswordConfirmation = (value) => {
    const newData = { ...data };
    newData.new_password_confirmation = value;
    setData(newData);
  };

  const updatePassword =  (e) => {
    setStartRequest(true);
    e.preventDefault();
    resetPassword(data)
      .then(({ data }) => {
        setStartRequest(false);
        setError({ ...defaultError });
        setData(defaultData);
        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
      })
      .catch(({ response }) => {
        setStartRequest(false);
        setError({ ...defaultError, ...(response?.data?.error || {}) });
        ToastBottomEnd.fire(toastEditErrorMessageConfig());
      });
  };

  return (
      ready ? (
          <div className="kt-portlet">
              <div className="kt-portlet__head">
                  <div className="kt-portlet__head-label">
                      <h3 className="kt-portlet__head-title">{t("Changer le mot de passe")}</h3>
                  </div>
              </div>
              <form className="kt-form kt-form--label-right">
                  <div className="kt-portlet__body">
                      <div className="kt-section kt-section--first">
                          <div className="kt-section__body">
                              <div className="row">
                                  <label className="col-xl-3" />
                                  <div className="col-lg-9 col-xl-6">
                                      <h3 className="kt-section__title kt-section__title-sm">
                                          {t("Changer ou récupérer votre mot de passe")}:
                                      </h3>
                                  </div>
                              </div>

                              <div
                                  className={
                                      error.current_password.length
                                          ? "form-group row validated"
                                          : "form-group row"
                                  }
                              >
                                  <label className="col-xl-3 col-lg-3 col-form-label">
                                      {t("Ancien")}
                                  </label>
                                  <div className="col-lg-9 col-xl-6">
                                      <div
                                          style={{
                                              position: "relative",
                                              display: "flex",
                                              justifyContent: "row",
                                              alignItems: "center",
                                          }}
                                      >
                                          <div
                                              style={{
                                                  position: "absolute",
                                                  right: 15,
                                                  padding: 5,
                                                  cursor: "pointer",
                                              }}
                                          >
                                              <i
                                                  id="icon"
                                                  className={
                                                      viewPassword ? "fa fa-eye" : "fa fa-eye-slash"
                                                  }
                                                  aria-hidden="true"
                                                  onClick={(e) => setViewPassword(!viewPassword)}
                                              />
                                          </div>
                                          <input
                                              className={"form-control"}
                                              type={viewPassword ? "text" : "password"}
                                              id="password"
                                              onChange={(e) =>
                                                  handleChangeCurrentPassword(e.target.value)
                                              }
                                              value={data.current_password}
                                              placeholder="**************"
                                          />

                                          {error.current_password.length
                                              ? error.current_password.map((error, index) => (
                                                  <div key={index} className="invalid-feedback">
                                                      {error}
                                                  </div>
                                              ))
                                              : null}
                                      </div>
                                  </div>
                              </div>

                              <div
                                  className={
                                      error.new_password.length
                                          ? "form-group row validated"
                                          : "form-group row"
                                  }
                              >
                                  <label className="col-xl-3 col-lg-3 col-form-label">
                                      {t("Nouveau")}
                                  </label>
                                  <div className="col-lg-9 col-xl-6">
                                      <div
                                          style={{
                                              position: "relative",
                                              display: "flex",
                                              justifyContent: "row",
                                              alignItems: "center",
                                          }}
                                      >
                                          <div
                                              style={{
                                                  position: "absolute",
                                                  right: 15,
                                                  padding: 5,
                                                  cursor: "pointer",
                                              }}
                                          >
                                              <i
                                                  id="icon"
                                                  className={
                                                      viewNewPassword ? "fa fa-eye" : "fa fa-eye-slash"
                                                  }
                                                  aria-hidden="true"
                                                  onClick={(e) => setViewNewPassword(!viewNewPassword)}
                                              />
                                          </div>
                                          <input
                                              className={"form-control"}
                                              type={viewNewPassword ? "text" : "password"}
                                              id="password"
                                              onChange={(e) => handleNewPassword(e.target.value)}
                                              value={data.new_password}
                                              placeholder="**************"
                                          />

                                          {error.new_password.length
                                              ? error.new_password.map((error, index) => (
                                                  <div key={index} className="invalid-feedback">
                                                      {error}
                                                  </div>
                                              ))
                                              : null}
                                      </div>
                                  </div>
                              </div>

                              <div
                                  className={
                                      error.new_password_confirmation.length
                                          ? "form-group row validated"
                                          : "form-group row"
                                  }
                              >
                                  <label className="col-xl-3 col-lg-3 col-form-label">
                                      {t("Confirmation")}
                                  </label>
                                  <div className="col-lg-9 col-xl-6">
                                      <div
                                          style={{
                                              position: "relative",
                                              display: "flex",
                                              justifyContent: "row",
                                              alignItems: "center",
                                          }}
                                      >
                                          <div
                                              style={{
                                                  position: "absolute",
                                                  right: 15,
                                                  padding: 5,
                                                  cursor: "pointer",
                                              }}
                                          >
                                              <i
                                                  id="icon"
                                                  className={
                                                      viewConfirmNewPassword
                                                          ? "fa fa-eye"
                                                          : "fa fa-eye-slash"
                                                  }
                                                  aria-hidden="true"
                                                  onClick={(e) =>
                                                      setViewConfirmNewPassword(!viewConfirmNewPassword)
                                                  }
                                              />
                                          </div>
                                          <input
                                              className={"form-control"}
                                              type={viewConfirmNewPassword ? "text" : "password"}
                                              id="password"
                                              onChange={(e) =>
                                                  handleNewPasswordConfirmation(e.target.value)
                                              }
                                              value={data.new_password_confirmation}
                                              placeholder="**************"
                                          />

                                          {error.new_password_confirmation.length
                                              ? error.new_password_confirmation.map((error, index) => (
                                                  <div key={index} className="invalid-feedback">
                                                      {error}
                                                  </div>
                                              ))
                                              : null}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="kt-portlet__foot">
                      <div className="kt-form__actions">
                          <div className="row">
                              <div className="col-lg-3 col-xl-3"></div>
                              <div className="col-lg-9 col-xl-9">
                                  {!startRequest ? (
                                      <button
                                          type="submit"
                                          onClick={(e) => updatePassword(e)}
                                          className="btn btn-primary"
                                      >
                                          {t("Modifier")}
                                      </button>
                                  ) : (
                                      <button
                                          className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                          type="button"
                                          disabled
                                      >
                                          {t("Chargement")}...
                                      </button>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              </form>
          </div>
      ) : null
  );
};

export default UpdatePassword;
