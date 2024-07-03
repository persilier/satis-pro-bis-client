import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastAddErrorMessageConfig,
    toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig, toastErrorMessageWithParameterConfig
} from "../../config/toastConfig";
import appConfig from "../../config/appConfig";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import InputRequire from "../components/InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";
import Select from "react-select";

const CommitteeConfig = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = (ready ? t("Satis client - Paramètre configuration des comités") : "");

      if (!verifyPermission(props.userPermissions, 'list-escalation-config') )
          window.location.href = ERROR_401;

    const defaultData = {
        name: "",
        standard_bord_exists: "",
        specific_bord_exists: ""
    };
    const defaultError = {
        name: [],
        standard_bord_exists: [],
        specific_bord_exists: []
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);
    const [InputStandard, setInputStandard] = useState("");
    const [InputSpecific, setInputSpecific] = useState("");
    const [configId, setConfigId] = useState("");
    const [disable, setDisable] = useState(false);
    const [disabledInput, setDisabledInput] = useState(false);
    const [isLoad, setIsLoad] = useState(true)
    const [staff, setStaff] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [members, setMembers] = useState([]);
    const [committee, setCommittee] = useState(null)

    useEffect(() => {
        axios.get(`${appConfig.apiDomaine}/escalation-config`)
            .then((response) => {
                setInputStandard(response.data.standard_bord_exists);
                setInputSpecific(response.data.specific_bord_exists);
                setConfigId(response.data.id)
                let newData = {...data}
                newData.name =response.data.name
                setData(newData)
                setMembers(response.data.members)
                setIsLoad(false)


                getCreateData(response.data)
            })
            .catch(error => {
                //console.log("Something is wrong");
            })




/*
        if (verifyTokenExpire())
            fetchData();*/
    }, []);

    const getCreateData = (data) => {
        axios.get(`${appConfig.apiDomaine}/treatments-boards/create`)
            .then(response => {
                for (var i = 0; i < response.data.staff.length; i++) {
                    response.data.staff[i].label = response.data.staff[i].identite.firstname + " " + response.data.staff[i].identite.lastname;
                    response.data.staff[i].value = response.data.staff[i].id;
                }
                setStaffs(response.data.staff);
                let selected = response.data.staff.filter((s)=>data.members.includes(s.id))
                var staffToSend = selected.map(item => item.id)
                let newData = {...data};
                newData.members = staffToSend;
                newData.name = data.name;
                setStaff(selected);
                console.log(newData)
                setData(newData);
                setIsLoad(false);
            })
            .catch(error => console.log(error))
        ;
    }

    const onChangeLastName = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };


    const handleInputChangeStandard = (e) => {
        const newData = {...data};
        let value = e.target.checked ? 1 : 0;
        setInputStandard(value);
        setData(newData);

    };

    const handleInputChangeSpecific = (e) => {
        const newData = {...data};
        let value = e.target.checked  ? 1 : 0;
        setInputSpecific(value);
        setData(newData);

    };


    const onChangeStaff = (selected) => {
        console.log("sel" , selected)
        let newData = {...data};

        if (selected && Array.isArray(selected) && selected.length > 0) {
            var staffToSend = selected.map(item => item.value)
            newData.members = staffToSend;
            setStaff(selected);
            setData(newData);
        } else {
            newData.members = [];
            setStaff([])
            setData(newData);
        }
    };

    const onSubmit =  (e) => {
        const sendData = {...data};
        sendData.id = configId
        sendData.standard_bord_exists = InputStandard
        sendData.specific_bord_exists = InputSpecific
        e.preventDefault();
        console.log(sendData)
        setStartRequest(true);
        if (verifyTokenExpire()) {
            console.log({sendData})
             axios.put(`${appConfig.apiDomaine}/escalation-config`, sendData)
                .then(response => {
                    setStartRequest(false);
                    setError(defaultError);
                    ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                })
                .catch(errorRequest => {
                    setStartRequest(false);
                    setError({...defaultError, ...errorRequest.response?.data?.error});
                    console.log(errorRequest.response)
                    if (errorRequest.response.data.code === 422) {
                        console.log("erreur", errorRequest.response)
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(("Veuillez remplir le(s) champ(s) obligatoire(s)")));
                    } else {
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig());
                    }
                })
            ;
        }
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, 'update-escalation-config')  ? (
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
                                        {t("Configuration des comités")}
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
                                                {t("Comité de réclamation")}
                                            </h3>
                                        </div>
                                    </div>

                                    <form method="POST" className="kt-form">
                                        <div className="kt-form kt-form--label-right">
                                            <div className="kt-portlet__body">

                                                <div className="form-group row">

                                                    <div className="" style={{
                                                        display: "flex",
                                                        verticalAlign: "middle",
                                                        margin: "auto"
                                                    }}>
                                                        <div className="kt-checkbox-list "
                                                             style={{marginRight: "20px"}}><label
                                                            htmlFor="">{t("Veuillez choisir le(s) comité(s)")}:</label>
                                                        </div>
                                                        <div className="kt-checkbox-list " style={{display: "flex"}}>
                                                            <label className="kt-checkbox"
                                                                   style={{marginRight: "20px"}}>
                                                                <input id="is_client" type="checkbox"
                                                                       checked={InputStandard == 1}
                                                                       disabled={disable}
                                                                       onChange={handleInputChangeStandard}/>
                                                                {t("Comité Standard")} <span
                                                                style={{border: "2px solid"}}/>

                                                            </label>
                                                            <label className="kt-checkbox"
                                                                   style={{marginRight: "20px"}}>
                                                                <input id="is_client" type="checkbox"
                                                                       checked={InputSpecific == 1}
                                                                       disabled={disable}
                                                                       onChange={handleInputChangeSpecific}/>
                                                                {t("Comité Spécifique")} <span
                                                                style={{border: "2px solid"}}/>

                                                            </label>
                                                        </div>
                                                    </div>

                                                </div>

                                                {InputSpecific == 1 ?
                                                    (
                                                        <div className="form-group ">
                                                            <div
                                                                className={"col-lg-9 col-md-9 col-sm-12 text-left m-auto"}>
                                                                <div className="alert alert-outline-primary fade show"
                                                                     role="alert">
                                                                    <div className="alert-icon"><i className="flaticon-information kt-font-brand"/></div>
                                                                    <div className="alert-text">
                                                                        {t(" Chaque comité spécifique est propre à chaque réclamation  et est crée uniquement lors du transfert de la réclamation ")}
                                                                    </div>
                                                                    <div className="alert-close">
                                                                        <button type="button" className="close"
                                                                                data-dismiss="alert" aria-label="Close">
                                                                            <span aria-hidden="true"> <i className="la la-close"/></span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <span/>
                                                            </div>
                                                        </div>
                                                    ) : null
                                                }

                                                {InputStandard == 1 ?
                                                    (
                                                        <>
                                                            <div className="form-group">
                                                                <div
                                                                    className={error.name?.length ? "col-lg-9 col-md-9 col-sm-12 m-auto validated" : "col-lg-9 col-md-9 col-sm-12 m-auto"}>
                                                                    <label
                                                                        htmlFor="name">{t("Nom")} {""}
                                                                        <InputRequire/> </label>
                                                                    <input
                                                                        disabled={disabledInput}
                                                                        id="name"
                                                                        type="text"
                                                                        className={error.name?.length ? "form-control is-invalid" : "form-control"}
                                                                        placeholder={"Veuillez entrer le nom du comité"}
                                                                        value={data.name}
                                                                        onChange={(e) => onChangeLastName(e)}
                                                                    />
                                                                    {
                                                                        error.name?.length ? (
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

                                                            <div
                                                                className={error.members?.length ? "col-lg-9 col-md-9 col-sm-12 m-auto validated" : "col-lg-9 col-md-9 col-sm-12 m-auto"}>
                                                                <label
                                                                    htmlFor="staff">{t("Membre(s) du comité")} <InputRequire/>
                                                                </label>
                                                                <div className={""}>
                                                                    <Select
                                                                        isClearable
                                                                        isMulti
                                                                        placeholder={t("Veuillez sélectionner les agents")}
                                                                        value={staff}
                                                                        isLoading={isLoad}
                                                                        onChange={onChangeStaff}
                                                                        options={staffs}
                                                                    />
                                                                    {error.members?.length ? (
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


                                                        </>
                                                    ) : null
                                                }


                                            </div>
                                            <div className="kt-portlet__foot">
                                                <div className="kt-form__actions text-right">
                                                    {
                                                        !startRequest ? (
                                                            <button type="submit" onClick={(e) => onSubmit(e)}
                                                                    className="btn btn-primary">{t("Enregistrer")}</button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                                type="button" disabled>
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

export default connect(mapStateToProps)(CommitteeConfig);
