import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import InputRequire from "../components/InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const RejectLimitPage = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = (ready ? t("Satis client - Paramètre Limite de rejet") : "");
    if (!verifyPermission(props.userPermissions, 'update-reject-unit-transfer-parameters'))
        window.location.href = ERROR_401;

    const defaultData = {
        number_reject_max: 0,
    };
    const defaultError = {
        number_reject_max: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        async function fetchData () {
            await axios.get(`${appConfig.apiDomaine}/configurations/reject-unit-transfer-limitation`)
                .then(({data}) => {
                    setData({
                        number_reject_max: data.number_reject_max,
                    });
                })
                .catch(error => {
                    //console.log("Something is wrong");
                })
            ;
        }
        if (verifyTokenExpire())
            fetchData();
    }, []);

    const handleRecurencePeriod = (e) => {
        const newData = {...data};
        newData.number_reject_max = parseInt(e.target.value);
        setData(newData);
    };

    const onSubmit = async (e) => {
        const sendData = {...data};
        e.preventDefault();

        setStartRequest(true);
        if (verifyTokenExpire()) {
            await axios.put(`${appConfig.apiDomaine}/configurations/reject-unit-transfer-limitation`, sendData)
                .then(response => {
                    setStartRequest(false);
                    setError(defaultError);
                    ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                })
                .catch(errorRequest => {
                    setStartRequest(false);
                    setError({...defaultError, ...errorRequest.response.data.error});
                    ToastBottomEnd.fire(toastEditErrorMessageConfig());
                })
            ;
        }
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, 'update-reject-unit-transfer-parameters') ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Paramètre")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#link" className="kt-subheader__breadcrumbs-home">
                                        <i className="flaticon2-shelter"/>
                                    </a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#link" className="kt-subheader__breadcrumbs-link">
                                        {t("Limitation de rejet")}
                                    </a>
                                </div>
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
                                                {t("Limite de rejet après affectation")}
                                            </h3>
                                        </div>
                                    </div>

                                    <form method="POST" className="kt-form">
                                        <div className="kt-form kt-form--label-right">
                                            <div className="kt-portlet__body">
                                                <div className={error.number_reject_max.length ? "form-group row validated" : "form-group row"}>
                                                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="number_reject_max">{t("Nombre de rejet toléré")} <InputRequire/></label>
                                                    <div className="col-lg-9 col-xl-6">
                                                        <input
                                                            id="number_reject_max"
                                                            type="number"
                                                            className={error.number_reject_max.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder="0"
                                                            value={data.number_reject_max}
                                                            onChange={(e) => handleRecurencePeriod(e)}
                                                        />
                                                        {
                                                            error.number_reject_max.length ? (
                                                                error.number_reject_max.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="kt-portlet__foot">
                                                <div className="kt-form__actions text-right">
                                                    {
                                                        !startRequest ? (
                                                            <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{t("Enregistrer")}</button>
                                                        ) : (
                                                            <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                                {t("Chargement")}...
                                                            </button>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(RejectLimitPage);
