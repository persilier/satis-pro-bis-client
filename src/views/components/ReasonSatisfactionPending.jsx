import React, {useState} from 'react';
import axios from "axios";
import {ToastBottomEnd} from "./Toast";
import {toastAddErrorMessageConfig, toastAddSuccessMessageConfig} from "../../config/toastConfig";
import {connect} from "react-redux";
import InputRequire from "./InputRequire";
import {useTranslation} from "react-i18next";


const ReasonSatisfaction = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const option1 = 1;
    const option2 = 0;
    const defaultData = {
        note: "",
        is_claimer_satisfied: "",
        unsatisfaction_reason: "",
    };
    const defaultError = {
        note: "",
        is_claimer_satisfied: '',
        unsatisfaction_reason: "",
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    const onChangeReason = (e) => {
        const newData = {...data};
        newData.unsatisfaction_reason = e.target.value;
        setData(newData);
    };
    const onChangeNote = (e) => {
        const newData = {...data};
        if(e.target.value<=5){
            newData.note = e.target.value;
            setData(newData);
        }

    };
    const onChangeOption = (e) => {
        const newData = {...data};
        newData.is_claimer_satisfied = parseInt(e.target.value);

        setData(newData);
    };

    const onClick = (e) => {
        e.preventDefault();
        setStartRequest(true);
        axios.put(props.getEndPoint + `/${props.getId}`, data)
            .then(response => {
                setStartRequest(false);
                ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                window.location.href = "/process/claim_measure_pending";
            })
            .catch(error => {
                setStartRequest(false);
                setError({...defaultError, ...error.response.data.error});
                ToastBottomEnd.fire(toastAddErrorMessageConfig());
            })
        ;
    };

    return (
        ready ? (
            <div>
                <div className={error.is_claimer_satisfied.length ? "form-group validated" : "form-group"}>
                    <label>{t("Client Satisfait?")} <InputRequire/></label>
                    <div className="kt-radio-inline">

                        <label className="kt-radio kt-radio--bold kt-radio--success">
                            <input
                                className={error.is_claimer_satisfied.length ? "form-control is-invalid" : "form-control"}
                                type="radio"
                                name="radio6"
                                value={option1}
                                onChange={(e) => onChangeOption(e)}
                            /> {t("Oui")}
                            <span></span>
                        </label>
                        <label className="kt-radio kt-radio--bold kt-radio--danger">
                            <input
                                type="radio"
                                name="radio6"
                                value={option2}
                                onChange={(e) => onChangeOption(e)}
                            /> {t("Non")}
                            <span></span>
                        </label>
                    </div>
                    {
                        error.is_claimer_satisfied.length ? (
                            error.is_claimer_satisfied.map((error, index) => (
                                <div key={index}
                                     className="invalid-feedback">
                                    {error}
                                </div>
                            ))
                        ) : ""
                    }
                </div>
                <div className={error.note.length ? "form-group row validated" : "form-group row"}>
                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="raison">{t("Note")}</label>
                    <div className="col-lg-9 col-xl-6">
                        <input
                            id="note"
                            type="number"
                            min={0}
                            max={5}
                            className={error.note.length ? "form-control is-invalid" : "form-control"}
                            placeholder={t("Veuillez attribuer une note")}
                            value={data.note}
                            onChange={(e) => onChangeNote(e)}
                        />
                        {
                            error.note.length ? (
                                error.note.map((error, index) => (
                                    <div key={index}
                                         className="invalid-feedback">
                                        {error}
                                    </div>
                                ))
                            ) : ""
                        }
                    </div>
                </div>

                <div
                    className={error.unsatisfaction_reason.length ? "form-group row validated" : "form-group row"}>
                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="raison">{t("Raison")}
                        {data.is_claimer_satisfied === 0 ? <InputRequire/> : ""}
                    </label>
                    <div className="col-lg-9 col-xl-6">
                    <textarea
                        id="measures"
                        className={error.unsatisfaction_reason.length ? "form-control is-invalid" : "form-control"}
                        placeholder={t("Veuillez entrer la raison")}
                        cols="30"
                        rows="10"
                        value={data.unsatisfaction_reason}
                        onChange={(e) => onChangeReason(e)}
                    />
                        {
                            error.unsatisfaction_reason.length ? (
                                error.unsatisfaction_reason.map((error, index) => (
                                    <div key={index}
                                         className="invalid-feedback">
                                        {error}
                                    </div>
                                ))
                            ) : ""
                        }
                    </div>
                </div>
                {
                    !startRequest ? (
                        <button
                            className="btn btn-success"
                            onClick={(e) => onClick(e)}
                        >
                            {t("Enregistrer")}
                        </button>
                    ) : (
                        <button
                            className="btn btn-success kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                            type="button" disabled>
                            {t("Chargement")}...
                        </button>
                    )
                }
            </div>
        ) : null
    );

};
const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
        plan: state.plan.plan,
    };
};

export default connect(mapStateToProps)(ReasonSatisfaction);
