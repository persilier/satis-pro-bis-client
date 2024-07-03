import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {
    useParams,
    Link
} from "react-router-dom";
import axios from "axios";
import appConfig from "../../config/appConfig";
import {ToastBottomEnd} from "./Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig
} from "../../config/toastConfig";
import {ERROR_401, redirectError401Page} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import InputRequire from "./InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";
import Select from "react-select";


const EditCommittee = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const {id} = useParams();
    if (id) {
        if (!verifyPermission(props.userPermissions, 'update-treatment-board'))
            window.location.href = ERROR_401;
    }

    const defaultData = {
        name: "",
        type:"specific",
        members: [],
        claim_id: ""
    };
    const defaultError = {
        name: [],
        members: [],
    };

    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [staff, setStaff] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [isLoad, setIsLoad] = useState(false);
    const [disabledInput, setDisabledInput] = useState(false);

    const [committee, setCommittee] = useState(null)


    useEffect(() => {
        async function fetchData() {
            if (id) {
                setIsLoad(true)
                axios.get(`${appConfig.apiDomaine}/treatments-boards/${id}/edit`)
                    .then(response => {
                        setCommittee(response.data.treatmentBoard);
                        for (var i = 0; i < response.data.staff.length; i++) {
                            response.data.staff[i].label = response.data.staff[i].identite.firstname + " " + response.data.staff[i].identite.lastname;
                            response.data.staff[i].value = response.data.staff[i].id;
                        }

                        let memberCommittee = [];

                        for (var j = 0; j < response.data?.treatmentBoard?.members.length; j++) {
                            response.data.treatmentBoard.members[j].label =response.data.treatmentBoard.members[j].identite.firstname + " " + response.data.treatmentBoard.members[j].identite.lastname;
                            response.data.treatmentBoard.members[j].value = response.data.treatmentBoard.members[j].id;
                        }

                        response.data?.treatmentBoard?.members.map(function(e) {memberCommittee.push(e.id)});

                        setStaff(response.data?.treatmentBoard?.members ?? [])
                        setStaffs(response.data.staff);

                        const newData = {
                            name: response.data?.treatmentBoard?.name,
                            type : response.data?.treatmentBoard?.type ,
                            claim_id: response.data.treatmentBoard?.claim?.id,
                            id: response.data.treatmentBoard?.id,
                            members: memberCommittee
                        };
                        setData(newData);
                        setIsLoad(false)
                    })
                    .catch(error => {
                        console.log("error", error)
                        //console.log("Something is wrong");
                    })
                ;
            }
        }

        if (verifyTokenExpire())
            fetchData();
    }, [appConfig.apiDomaine, id]);

    const onChangeName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };

    const onChangeStaff = (selected) => {
        console.log(selected)
        if (selected && Array.isArray(selected) && selected.length > 0) {
            var staffToSend = selected.map(item => item.value)
            const newData = {...data};
            newData.members = staffToSend;
            setStaff(selected);
            setData(newData);
        } else {
            setStaff([])
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            if (id) {
                axios.put(`${appConfig.apiDomaine}/treatments-boards/${id}`, data)
                    .then(response => {
                        setStartRequest(false);
                       /* setStaffs(response.data.staff);
                        let selected = response.data.staff.filter((s)=>data.members.includes(s.id))
                        var staffToSend = selected.map(item => item.id)
                        let newData = {...data};
                        newData.members = staffToSend;
                        newData.name = data.name;
                        setStaff(selected);*/

                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    })
                    .catch(errorRequest => {
                        setStartRequest(false);
                        setError({...defaultError, ...errorRequest.response?.data?.error});
                        ToastBottomEnd.fire(toastEditErrorMessageConfig());
                    })
                ;
            }
        }
    };

    const printJsx = () => {
        return (
            ready ?  ( verifyPermission(props.userPermissions, 'update-treatment-board') ? (
            <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-container  kt-container--fluid ">
                        <div className="kt-subheader__main">
                            <h3 className="kt-subheader__title">
                                {t("Paramètres")}
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to="/settings/channels" className="kt-subheader__breadcrumbs-link">
                                    {t("Canal")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()}
                                   className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                    {
                                        id ? t("Modification") : t("Ajout")
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
                                                id ? t("Modification d'un comité") : t("Ajout d'un comité")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-form kt-form--label-right"  style={{textAlign: "left"}}>
                                        <div className="kt-portlet__body"  style={{textAlign: "left"}}>
                                            <div
                                                className={error.name.length ? "form-group row validated" : "form-group row"}
                                            style={{textAlign: "left"}}>
                                                <label className="col-xl-2 col-lg-2 col-form-label "
                                                       htmlFor="name">{t("Nom")} <InputRequire/></label>
                                                <div className="col-lg-10 col-xl-10">
                                                    <input
                                                        disabled={disabledInput}
                                                        id="name"
                                                        type="text"
                                                        className={error.name?.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={"Veuillez entrer le nom du comité"}
                                                        value={data.name}
                                                        onChange={(e) => onChangeName(e)}
                                                    />
                                                    {
                                                        error.name.length ? (
                                                            error.name.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>
                                            </div>


                                            <div
                                                className={error.members.length ? "form-group row validated" : "form-group"}
                                                style={{textAlign: "left", display:"flex", }}>
                                                <label className="col-xl-2 col-lg-2 col-form-label"
                                                       htmlFor="staff">{t("Agent(s)")} <InputRequire/> </label>
                                                <div className={"col-lg-10 col-xl-10"}>
                                                    <Select
                                                        isClearable
                                                        isMulti
                                                        placeholder={t("Veuillez sélectionner les agents")}
                                                        value={staff}
                                                        isLoading={isLoad}
                                                        onChange={onChangeStaff}
                                                        options={staffs}
                                                    />
                                                    {
                                                        error.members.length ? (
                                                            error.members.map((error, index) => (
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
                                                        <button type="submit" onClick={(e) => onSubmit(e)}
                                                                className="btn btn-primary">{id ? t("Modifier") : t("Enregistrer")}</button>
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
                                                        <Link to="/process/committee-adhoc"
                                                              className="btn btn-secondary mx-2">
                                                            {t("Quitter")}
                                                        </Link>
                                                    ) : (
                                                        <Link to="/settings/channels" className="btn btn-secondary mx-2"
                                                              disabled>
                                                            {t("Quitter")}
                                                        </Link>
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

    return (
        ready ? (
            id ?
                verifyPermission(props.userPermissions, 'update-escalation-config') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'store-channel') ? (
                    printJsx()
                ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
    };
};

export default connect(mapStateToProps)(EditCommittee);
