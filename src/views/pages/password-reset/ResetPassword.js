import React from "react";
import { resetPassword } from "../../../http/crud";
import { ToastBottomEnd } from "../../components/Toast";
function ResetPassword() {
  const [isLoading, setIsloading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [state, setState] = React.useState({});

  const onChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setErrors({});
    setIsloading(true);
    const _err = {};
    ////console.log("state", state);
    if (!state.current_password) {
      _err.current_password = "Champs réquis !";
    }
    if (!state.new_password) {
      _err.new_password = "Champs réquis !";
    }
    if(state?.new_password?.length < 6){
      _err.new_password = "Au moins 6 caractères !";
    }
    if (!state.new_password_confirmation) {
      _err.new_password_confirmation = "Champs réquis !";
    }
    if (
      state.new_password &&
      state.new_password_confirmation &&
      state.new_password !== state.new_password_confirmation
    ) {
      _err.new_password_confirmation = "Mots de passe non conformes !";
    }
    if (Object.keys(_err).length > 0) {
      setErrors(_err);
      setIsloading(false);
      return;
    }

    resetPassword(state)
      .then(({ data }) => {
        setIsloading(false);
        setState({});
        setErrors({});
        ToastBottomEnd.fire({
          background: "#3c3e40",
          icon: "success",
          title:
            "<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>Mot de passe modifié avec succès !</strong>",
        });
      })
      .catch((err) => {
        setIsloading(false);
        if(err.response.status === 422){
          ToastBottomEnd.fire({
            background: "#3c3e40",
            icon: "error",
            title:
              "<strong style='font-weight: bold; font-size: 1.1rem; color: white;' class='m-4'>Mot de passe erroné !</strong>",
          });
        }
      
        //console.log("err", err);
      });
  };

  return (
    <div
      className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
      id="kt_content"
    >
      <div className="kt-subheader   kt-grid__item" id="kt_subheader">
        <div className="kt-container  kt-container--fluid ">
          <div className="kt-subheader__main">
            <h3 className="kt-subheader__title">Paramètres</h3>
            <span className="kt-subheader__separator kt-hidden" />
          </div>
        </div>
      </div>

      <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
        <div className="row">
          <div className="col">
            <div className="kt-portlet">
              <div className="kt-portlet__head">
                <div className="kt-portlet__head-label">
                  <h3 className="kt-portlet__head-title">
                    Changer le mot de passe
                  </h3>
                </div>
              </div>

              <form method="POST" className="kt-form">
                <div className="kt-portlet__body">
                  <div className="tab-content">
                    <div className="kt-form kt-form--label-right">
                      <div className="kt-form__body">
                        <div className="kt-section kt-section--first">
                          <div className="kt-section__body">
                            <div
                              className={
                                errors?.current_password
                                  ? "form-group row validated"
                                  : "form-group row"
                              }
                            >
                              <label
                                className="col-xl-3 col-lg-3 col-form-label"
                                htmlFor="current_password"
                              >
                                Ancien mot de passe *
                              </label>
                              <div className="col-lg-9 col-xl-6">
                                <input
                                  id="current_password"
                                  type="password"
                                  name="current_password"
                                  className={
                                    errors?.current_password
                                      ? "form-control is-invalid"
                                      : "form-control"
                                  }
                                  placeholder="Tapez votre mot de passe actuel"
                                  value={state?.current_password}
                                  onChange={onChange}
                                />
                                {errors?.current_password && (
                                  <div className="invalid-feedback">
                                    {errors?.current_password}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div
                              className={
                                errors?.new_password
                                  ? "form-group row validated"
                                  : "form-group row"
                              }
                            >
                              <label
                                className="col-xl-3 col-lg-3 col-form-label"
                                htmlFor="new_password"
                              >
                                Nouveau mot de passe * (Min )
                              </label>
                              <div className="col-lg-9 col-xl-6">
                                <input
                                  id="new_password"
                                  className={
                                    errors?.new_password
                                      ? "form-control is-invalid"
                                      : "form-control"
                                  }
                                  placeholder="Tapez votre nouveau mot de passe"
                                  type="password"
                                  name="new_password"
                                  value={state?.new_password}
                                  onChange={onChange}
                                />
                                {errors?.new_password && (
                                  <div className="invalid-feedback">
                                    {errors?.new_password}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div
                              className={
                                errors?.new_password_confirmation
                                  ? "form-group row validated"
                                  : "form-group row"
                              }
                            >
                              <label
                                className="col-xl-3 col-lg-3 col-form-label"
                                htmlFor="new_password_confirmation"
                              >
                                Confirmation *
                              </label>
                              <div className="col-lg-9 col-xl-6">
                                <input
                                  id="new_password_confirmation"
                                  type="password"
                                  name="new_password_confirmation"
                                  className={
                                    errors?.new_password_confirmation
                                      ? "form-control is-invalid"
                                      : "form-control"
                                  }
                                  placeholder="Tapez votre nouveau mot de passe"
                                  value={state?.new_password_confirmation}
                                  onChange={onChange}
                                />
                                {errors?.new_password_confirmation && (
                                  <div className="invalid-feedback">
                                    {errors?.new_password_confirmation}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="kt-portlet__foot">
                            <div className="kt-form__actions text-right">
                              <button
                                type="submit"
                                onClick={handleUpdatePassword}
                                disabled={isLoading}
                                className="btn btn-primary"
                              >
                                {isLoading ? "En cours" : "Modifier"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
