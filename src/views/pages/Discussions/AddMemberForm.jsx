import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {Link, useParams} from "react-router-dom";
import {ToastBottomEnd} from "../../components/Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastErrorMessageWithParameterConfig,
} from "../../../config/toastConfig";
import appConfig from "../../../config/appConfig";
import Select from "react-select";
import {ERROR_401} from "../../../config/errorPage";
import {verifyPermission} from "../../../helpers/permission";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";
import InputRequire from "../../components/InputRequire";


const AddMemberForm = (props) => {
const {id, type}=useParams();
    if (!verifyPermission(props.userPermissions, 'add-discussion-contributor'))
        window.location.href = ERROR_401;

    const defaultData = {
        staff_id: [],
    };
    const defaultError = {
        staff_id: [],
    };

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [staffId, setStaffId] = useState([]);
    const [staffIdData, setStaffIdData] = useState([]);
    const [staffEscalId, setStaffEscalId] = useState([]);
    const [staffEscalIdData, setstaffEscalIdData] = useState([]);


    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(`${appConfig.apiDomaine}/discussions/${id}/staff/create`)
                .then(response => {
                    let newStaffs=Object.values(response.data.staff).map(staff=>(
                        {value:staff.id, label:staff.identite.lastname+" "+staff.identite.firstname}
                    ));
                    setStaffIdData(newStaffs);

                    let newEscalationStaffs=Object.values(response.data.escalation_staff).map(escalation_staff=>(
                        {value:escalation_staff.id, label:escalation_staff.identite.lastname+" "+escalation_staff.identite.firstname}
                    ))
                    setstaffEscalIdData(newEscalationStaffs);

                })
                .catch(error => {
                    //console.log("Something is wrong");
                })
            ;
        }
    }, []);

    const onChangeClaim = (e,selected) => {
        console.log(selected)
        const newData = {...data};
        newData.staff_id = e?e.map(sel => sel.value):"";
        setStaffId(selected);
        setData(newData);
    };

    const onChangeClaimEscal = (e,selected) => {
        const newData = {...data};
        newData.escalation_staff = e?e.map(sel => sel.value):"";
        setStaffEscalId(selected);
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            axios.post(appConfig.apiDomaine + `/discussions/${id}/staff`, data)
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
                    console.log(error.response.data.error)
                    if (error.response.data.code === 422)

                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.error.staff_id));
                    else {
                        ToastBottomEnd.fire(toastAddErrorMessageConfig);
                    }
                })
            ;
        }
    };
    const printJsx = () => {
        return (
            <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
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
                                                t("Ajout des Participants")
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
                                                                    className={error.staff_id?.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="exampleSelect1">{t("Participants")} <InputRequire/></label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        {staffIdData ? (
                                                                            <Select
                                                                                value={staffId}
                                                                                onChange={(e) => onChangeClaim(e)}
                                                                                options={staffIdData}
                                                                                isMulti
                                                                            />
                                                                        ) : ''
                                                                        }


                                                                        {
                                                                            error.staff_id?.length ? (
                                                                                error.staff_id.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>
                                                                </div>

                                                                { type &&
                                                                    <div
                                                                    className={error.escalation_staff?.length ? "form-group row validated" : "form-group row"}>
                                                                    <label className="col-xl-3 col-lg-3 col-form-label"
                                                                           htmlFor="exampleSelect1">{t("Staffs de l'ancienne unité de traitement")}</label>
                                                                    <div className="col-lg-9 col-xl-6">
                                                                        {staffEscalIdData ? (
                                                                            <Select
                                                                                value={staffEscalId}
                                                                                onChange={(e) => onChangeClaimEscal(e)}
                                                                                options={staffEscalIdData}
                                                                                isMulti
                                                                            />
                                                                        ) : ''
                                                                        }


                                                                        {
                                                                            error.escalation_staff?.length ? (
                                                                                error.escalation_staff.map((error, index) => (
                                                                                    <div key={index}
                                                                                         className="invalid-feedback">
                                                                                        {error}
                                                                                    </div>
                                                                                ))
                                                                            ) : null
                                                                        }
                                                                    </div>
                                                                </div>
                                                                }

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
            </div>
        );
    };

    return (
        ready ? (verifyPermission(props.userPermissions, 'add-discussion-contributor') ? (
            printJsx()
        ) : null) : null
    );

};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    }
};

export default connect(mapStateToProps)(AddMemberForm);
