import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {
    Link, useParams,
} from "react-router-dom";
import {ToastBottomEnd} from "../../components/Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
} from "../../../config/toastConfig";
import appConfig from "../../../config/appConfig";
import Select from "react-select";
import {ERROR_401} from "../../../config/errorPage";
import {verifyPermission} from "../../../helpers/permission";
import {formatSelectOption} from "../../../helpers/function";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";
import InputRequire from "../../components/InputRequire";


const AddChatsForm = (props) => {
    const {type} = useParams();


    if (!verifyPermission(props.userPermissions, 'store-discussion'))
        window.location.href = ERROR_401;

    const defaultData = {
        name: "",
        claim_id: "",
    };
    const defaultError = {
        name: [],
        claim_id: [],
    };

    const {t, ready} = useTranslation();

    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [claimId, setClaimId] = useState([]);
    const [claimIdData, setClaimIdData] = useState([]);


    useEffect(() => {
/*
        if (claimId="unsatisfied") ?{*/
            async function fetchData() {
                axios.get(`${appConfig.apiDomaine}/claim-assignment-staff${type ? "?type=unsatisfied" : ""}`)
                    .then(response => {
                        setClaimIdData(response.data);
                    })
                    .catch(error => {
                        //console.log("Something is wrong");
                    })
                ;
            }
        /*}*/

        if (verifyTokenExpire())
            fetchData();
    }, []);

    const onChangeName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };

    const onChangeClaim = (selected) => {
        const newData = {...data};
        newData.claim_id = selected.value;
        setClaimId(selected);
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);

        if (verifyTokenExpire()) {
            axios.post(appConfig.apiDomaine + `/discussions`, data)
                .then(response => {
                    setStartRequest(false);
                    // setError(defaultError);
                    // setData(defaultData);
                    ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    window.location.href=`/chat/${type || ""}`;
                })
                .catch(error => {
                    setStartRequest(false);
                    setError({...defaultError,...error.response.data.error});
                    ToastBottomEnd.fire(toastAddErrorMessageConfig());
                })
            ;
        }
    };
    const printJsx = () => {
        return (
            ready ? (<div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-container  kt-container--fluid ">
                        <div className="kt-subheader__main">
                            {
                                (type) ? (
                                    <h3 className="kt-subheader__title"> {t("Escalade")} </h3>
                                ) : <h3 className="kt-subheader__title"> {t("Traitement")} </h3>
                            }
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to={`/chat/${type || ""}`} className="kt-subheader__breadcrumbs-link">
                                    {t("Tchat")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()}
                                   className="kt-subheader__breadcrumbs-link">
                                    {
                                        t("Ajout")
                                    }
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
                                            {
                                                t("Ajout de nouvelle discussion")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-portlet__body">
                                        <div className="tab-content">
                                            <div className="tab-pane active" id="kt_user_edit_tab_1" role="tabpanel">
                                                <div className="kt-form kt-form--label-right">
                                                    <div className="kt-form__body">
                                                        <div className="kt-section kt-section--first">
                                                            <div className="kt-section__body">
                                                                <div
                                                                    className={error.claim_id.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="exampleSelect1">{t("Référence réclamation")} <InputRequire/></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        {claimIdData ? (
                                                                            <Select
                                                                                value={claimId}
                                                                                onChange={(e) => onChangeClaim(e)}
                                                                                options={formatSelectOption(claimIdData, 'reference', false)}
                                                                            />
                                                                        ) : ''
                                                                        }


                                                                        {
                                                                            error.claim_id.length ? (
                                                                                error.claim_id.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="name">{t("Nom de Discussion")} <InputRequire/></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        <input
                                                                            id="name"
                                                                            type="text"
                                                                            className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                                            placeholder={t("Veillez entrer le nom")}
                                                                            value={data.name}
                                                                            onChange={(e) => onChangeName(e)}
                                                                        />
                                                                        {
                                                                            error.name.length ? (
                                                                                error.name.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
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
                                                                            <button type="submit"
                                                                                    onClick={(e) => onSubmit(e)}
                                                                                    className="btn btn-primary">{t("Ajouter")}</button>
                                                                        ) : (
                                                                            <button
                                                                                className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                                                type="button" disabled>
                                                                                {t("Chargement")}...
                                                                            </button>
                                                                        )
                                                                    }
                                                                    {
                                                                        !startRequest ? (
                                                                            <Link to={`/chat/${type || ""}`}
                                                                                  className="btn btn-secondary mx-2">
                                                                                {t("Quitter")}
                                                                            </Link>
                                                                        ) : (
                                                                            <Link to={`/chat/${type || ""}`}
                                                                                  className="btn btn-secondary mx-2"
                                                                                  disabled>
                                                                                {t("Quitter")}
                                                                            </Link>
                                                                        )
                                                                    }

                                                                </div>
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
            </div>) : null
        );
    };

    return (
        verifyPermission(props.userPermissions, 'store-discussion') ? (
            printJsx()
        ) : null
    );

};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    }
};

export default connect(mapStateToProps)(AddChatsForm);
