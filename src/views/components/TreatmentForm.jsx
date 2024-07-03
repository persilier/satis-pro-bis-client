import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {addTreatment} from "../../store/actions/treatmentAction";
import axios from "axios";
import appConfig from "../../config/appConfig";
import {ToastBottomEnd} from "./Toast";
import {toastAddErrorMessageConfig, toastAddSuccessMessageConfig} from "../../config/toastConfig";
import InputRequire from "./InputRequire";
import {useTranslation} from "react-i18next";

const TreatmentForm = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const defaultData = {
        amount_returned: "",
        solution: "",
        comments: "",
        preventive_measures: "",
    };
    const defaultError = {
        amount_returned: [],
        solution: [],
        comments: [],
        preventive_measures: [],
    };
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        if (props.activeTreatment) {
            setData({
                amount_returned: props.activeTreatment.amount_returned ? props.activeTreatment.amount_returned : "",
                solution: props.activeTreatment.solution ? props.activeTreatment.solution : "",
                comments: props.activeTreatment.comments ? props.activeTreatment.comments : "",
                preventive_measures: props.activeTreatment.preventive_measures ? props.activeTreatment.preventive_measures : "",
            });
        }
    }, [props.activeTreatment]);

    const onChangeAmount = (e) => {
        const newData = {...data};
        newData.amount_returned = e.target.value;
        setData(newData);
        props.addTreatment(newData)
    };

    const onChangeSolution = (e) => {
        const newData = {...data};
        newData.solution = e.target.value;
        setData(newData);
        props.addTreatment(newData)
    };

    const onChangeComments = (e) => {
        const newData = {...data};
        newData.comments = e.target.value;
        setData(newData);
        props.addTreatment(newData)
    };

    const onChangePreventiveMeasures = (e) => {
        const newData = {...data};
        newData.preventive_measures = e.target.value;
        setData(newData);
        props.addTreatment(newData)
    };
    const onClick = (e) => {
        const newData = {...data};
        e.preventDefault();
        setStartRequest(true);
        if (!newData.amount_returned)
            delete  newData.amount_returned;
        axios.put(appConfig.apiDomaine + `/claim-assignment-staff/${props.getId}/treatment`, newData)
            .then(response => {
                setStartRequest(false);
                ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                window.location.href = "/process/claim-assign/to-staff";
            })
            .catch(error => {
                setStartRequest(false);
                setError({...defaultError, ...error.response.data.error});
                ToastBottomEnd.fire(toastAddErrorMessageConfig());
            })
        ;
    };
    //console.log("props:", props);
    return (
        ready ? (
        <div>
            {
                props.amount_disputed >= 0 ?
                    <div className={error.amount_returned.length ? "form-group row validated" : "form-group row"}>
                        <label className="col-xl-3 col-lg-3 col-form-label"
                               htmlFor="name"> {props.currency? ("Montant retourné en " + props.currency):"Montant retourné"}
                            {" "} {props.amount_disputed ?  <InputRequire/> : null} </label>
                        <div className="col-lg-9 col-xl-6">
                            <input
                                id="amount"
                                type="number"
                                required={props.amount_disputed ? true : false}
                                min={0}
                                className={error.amount_returned.length ? "form-control is-invalid" : "form-control"}
                                placeholder="Veuillez entrer le montant à retourner"
                                value={data.amount_returned}
                                onChange={(e) => onChangeAmount(e)}
                            />
                            {
                                error.amount_returned.length ? (
                                    error.amount_returned.map((error, index) => (
                                        <div key={index}
                                             className="invalid-feedback">
                                            {error}
                                        </div>
                                    ))
                                ) : ""
                            }
                        </div>
                    </div>
                        : null
                }
                <div
                    className={error.solution.length ? "form-group row validated" : "form-group row"}>
                    <label className="col-xl-3 col-lg-3 col-form-label"
                           htmlFor="description">{t("Solution")} <InputRequire/></label>
                    <div className="col-lg-9 col-xl-6">
                    <textarea
                        id="solution"
                        className={error.solution.length ? "form-control is-invalid" : "form-control"}
                        placeholder={t("Veuillez entrer la solution proposée")}
                        cols="30"
                        rows="5"
                        value={data.solution}
                        onChange={(e) => onChangeSolution(e)}
                    />
                        {
                            error.solution.length ? (
                                error.solution.map((error, index) => (
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
                    className={error.preventive_measures.length ? "form-group row validated" : "form-group row"}>
                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="description">{t("Mesures préventives")}
                    {/*<InputRequire/>*/}
                    </label>
                    <div className="col-lg-9 col-xl-6">
                    <textarea
                        id="measures"
                        className={error.preventive_measures.length ? "form-control is-invalid" : "form-control"}
                        placeholder={t("Veuillez entrer la mesure préventive")}
                        cols="30"
                        rows="5"
                        value={data.preventive_measures}
                        onChange={(e) => onChangePreventiveMeasures(e)}
                    />
                        {
                            error.preventive_measures.length ? (
                                error.preventive_measures.map((error, index) => (
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
                    className={error.comments.length ? "form-group row validated" : "form-group row"}>
                    <label className="col-xl-3 col-lg-3 col-form-label"
                           htmlFor="description">{t("Commentaires")}</label>
                    <div className="col-lg-9 col-xl-6">
                    <textarea
                        id="comments"
                        className={error.comments.length ? "form-control is-invalid" : "form-control"}
                        placeholder={t("Veuillez entrer un commentaire")}
                        cols="30"
                        rows="5"
                        value={data.comments}
                        onChange={(e) => onChangeComments(e)}
                    />
                        {
                            error.comments.length ? (
                                error.comments.map((error, index) => (
                                    <div key={index}
                                         className="invalid-feedback">
                                        {error}
                                    </div>
                                ))
                            ) : null
                        }
                    </div>
                </div>


                {
                    !startRequest ? (
                        <button
                            className="btn btn-success"
                            onClick={(e) => onClick(e)}
                        >
                            {t("TRAITER")}
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
    )
};
const mapStateToProps = state => {
    return {
        treatment: state.treatment,
    };
};

export default connect(mapStateToProps, {addTreatment})(TreatmentForm);
