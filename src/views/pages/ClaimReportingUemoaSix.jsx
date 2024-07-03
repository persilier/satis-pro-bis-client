import React, {useEffect, useState} from "react";
import axios from "axios";
import {connect} from "react-redux";
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import {verifyPermission} from "../../helpers/permission";
import InfirmationTable from "../components/InfirmationTable";
import HeaderTablePage from "../components/HeaderTablePage";
import LoadingTable from "../components/LoadingTable";
import EmptyTable from "../components/EmptyTable";
import Pagination from "../components/Pagination";
import {ERROR_401} from "../../config/errorPage";
import appConfig from "../../config/appConfig";
import {
    forceRound, formatSelectOption, formatStatus,
    getLowerCaseString,
    loadCss, removeNullValueInObject,
} from "../../helpers/function";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {ToastBottomEnd} from "../components/Toast";
import {toastSuccessMessageWithParameterConfig} from "../../config/toastConfig";
import Select from "react-select";


import {useTranslation} from "react-i18next";
import moment from "moment";

import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';


loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ClaimReportingUemoaSix = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    if (!(verifyPermission(props.userPermissions, 'system-any-efficiency-report') || verifyPermission(props.userPermissions, 'system-my-efficiency-report')))
        window.location.href = ERROR_401;

    const [load, setLoad] = useState(false);
    const [loadFilter, setLoadFilter] = useState(false);

    const [loadDownloadPdf, setLoadDownloadPdf] = useState(false);

    const [treatmentefficacity, setTreatmentefficacity] = useState([]);
    const [dateStart, setDateStart] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [dateEnd, setDateEnd] = useState(moment().format('YYYY-MM-DD'));
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const defaultError = {
        date_start: [],
        date_end: [],
        institution_targeted_id: [],
    };

    const [error, setError] = useState(defaultError);
    const [loadDownload, setLoadDownload] = useState(false);
    const [institution, setInstitution] = useState(null);
    const [institutions, setInstitutions] = useState([]);


    const fetchData = async (click = false) => {
        setLoadFilter(true);
        setLoad(true);
        let endpoint = "";
        let sendData = {};
        if (verifyPermission(props.userPermissions, 'list-reporting-claim-any-institution')) {
            if (props.plan === "MACRO")
                endpoint = `${appConfig.apiDomaine}/any/uemoa/global-state-report`;
            else
                endpoint = `${appConfig.apiDomaine}list-reporting-claim-my-institution`;
            sendData = {
                date_start: dateStart ? dateStart : null,
                date_end: dateEnd ? dateEnd : null,
                institution_id: institution ? institution.value : null,
            };
            if (props.plan === "HUB") {
                console.log("hub")
            } else
                console.log("hub")
        } else if (verifyPermission(props.userPermissions, 'system-my-efficiency-report')) {
            endpoint = `${appConfig.apiDomaine}/my/system-efficiency-report`;
            sendData = {
                date_start: dateStart ? dateStart : null,
                date_end: dateEnd ? dateEnd : null,
                institution_id: institution ? institution.value : null
            };
        }
        await axios.post(endpoint, sendData)
            .then(response => {
                if (click)
                    ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(ready ? t("Filtre effectué avec succès") : ""));
                console.log(response.data)

                setTreatmentefficacity(response.data);
                setError(defaultError);
                setLoadFilter(false);
                setLoad(false);
                setTitle(response.data.title)
                setDescription(response.data.description)
            })
            .catch(error => {
                setError({
                    ...defaultError,
                    ...error.response.data.error
                });
                setLoadFilter(false);
                setLoad(false);
                console.log("Something is wrong");
            })
        ;
    };


    useEffect(() => {
        var endpoint = "";
        if (verifyPermission(props.userPermissions, 'list-reporting-claim-any-institution')) {
            if (props.plan === "MACRO")
                endpoint = `${appConfig.apiDomaine}/any/uemoa/data-filter`;
            else
                endpoint = `${appConfig.apiDomaine}/without/uemoa/data-filter`;
        }

        if (verifyTokenExpire()) {
            setLoadFilter(true);
            setLoad(true);
            axios.get(endpoint)
                .then(response => {
                    console.log(response.data)
                })
                .catch(error => {
                    console.log("Something is wrong")
                });
            fetchData();
        }
    }, []);


    const handleDateEndChange = e => {
        setDateEnd(e.target.value);
    };

    const handleDateStartChange = e => {
        setDateStart(e.target.value);
    };

    const filterReporting = () => {
        setLoadFilter(true);
        setLoad(true);
        if (verifyTokenExpire())
            fetchData(true);
    };


    const downloadReportingPdf = () => {

        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        var headTable = document.getElementById("headReport")
        var tablePdf = document.getElementById("myTable")
        var val = htmlToPdfmake(headTable.innerHTML + tablePdf.innerHTML);
        var dd = {content: val};
        pdfMake.createPdf(dd).download();


    }


    return (
        ready ? (
            verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-any-institution') || verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-my-institution') ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Processus")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                        className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()}
                                       className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                        {t("Efficacité traitement")}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <InfirmationTable information={(
                            <div>
                                {t("État complet de toutes les réclamations reçues sur une période donnée")}
                            </div>
                        )}/>

                        <div className="kt-portlet">
                            <HeaderTablePage
                                title={t("Rapport Efficacité traitement")}
                            />

                            <div className="kt-portlet__body">


                                {/*   {props.plan !== "HUB" ? (
                                    <div className="row">

                                        <div className="col">
                                            <div className={error.account_type_id.length ? "form-group validated" : "form-group"}>
                                                <div className="col">
                                                    <div className={error.number_of_claims_litigated_in_court.length ? "form-group row validated" : "form-group row"}>
                                                        <label className="col-form-label" htmlFor="number_of_claims_litigated_in_court">{t("Nombre de réclamations faisant l'objet de contentieux pendants devant les tribunaux :")} </label>
                                                            <input
                                                                id="number_of_claims_litigated_in_court"
                                                                type="number"
                                                                className={error.number_of_claims_litigated_in_court.length ? "form-control is-invalid" : "form-control"}
                                                                placeholder="0"
                                                                value={data.number_of_claims_litigated_in_court}
                                                                onChange={(e) => handleRecurencePeriod(e)}
                                                            />
                                                            {
                                                                error.number_of_claims_litigated_in_court.length ? (
                                                                    error.number_of_claims_litigated_in_court.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="col">
                                            <div className={error.account_type_id.length ? "form-group validated" : "form-group"}>
                                                <div className="col">
                                                    <div className={error.total_amount_of_claims_litigated_in_court.length ? "form-group row validated" : "form-group row"}>
                                                        <label className="col-form-label" htmlFor="total_amount_of_claims_litigated_in_court">{t("Montant Total des réclamations faisant l'objet de contentieux pendants devant les tribunaux :")} </label>
                                                        <input
                                                            id="total_amount_of_claims_litigated_in_court"
                                                            type="number"
                                                            className={error.total_amount_of_claims_litigated_in_court.length ? "form-control is-invalid" : "form-control"}
                                                            placeholder="0"
                                                            value={data.total_amount_of_claims_litigated_in_court}
                                                            onChange={(e) => handleMountTotal(e)}
                                                        />
                                                        {
                                                            error.total_amount_of_claims_litigated_in_court.length ? (
                                                                error.total_amount_of_claims_litigated_in_court.map((error, index) => (
                                                                    <div key={index} className="invalid-feedback">
                                                                        {error}
                                                                    </div>
                                                                ))
                                                            ) : null
                                                        }
                                                    </div>

                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                ) : null}
                                */}

                                {/*       <div className="row">
                                            <div className="col">
                                                <div
                                                    className={error.institution_id.length ? "form-group validated" : "form-group"}>
                                                    <label htmlFor="">{t("Institution")}</label>
                                                    <Select
                                                        isClearable
                                                        value={institution}
                                                        placeholder={t("Veuillez sélectionner l'institution")}
                                                        onChange={onChangeInstitution}
                                                        options={institutions}
                                                    />

                                                    {
                                                        error.institution_id.length ? (
                                                            error.institution_id.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>
                                            </div>

                                        </div>*/}

                                {/*DATES*/}
                                <div className="row">
                                    <div className="col">
                                        <div className="form-group">
                                            <label htmlFor="">{t("Date de début")}</label>
                                            <input type="date" onChange={handleDateStartChange}
                                                   className={error.date_start.length ? "form-control is-invalid" : "form-control"}
                                                   value={dateStart}/>

                                            {
                                                error.date_start.length ? (
                                                    error.date_start.map((error, index) => (
                                                        <div key={index} className="invalid-feedback">
                                                            {error}
                                                        </div>
                                                    ))
                                                ) : null
                                            }
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="form-group">
                                            <label htmlFor="">{t("Date de fin")}</label>
                                            <input type="date" onChange={handleDateEndChange}
                                                   className={error.date_end.length ? "form-control is-invalid" : "form-control"}
                                                   value={dateEnd}/>

                                            {
                                                error.date_end.length ? (
                                                    error.date_end.map((error, index) => (
                                                        <div key={index} className="invalid-feedback">
                                                            {error}
                                                        </div>
                                                    ))
                                                ) : null
                                            }
                                        </div>
                                    </div>

                                    {/*Bouton PDF EXCEL*/}
                                    <div className="col-md-12">
                                        <div className="form-group d-flex justify-content-end">
                                            <a className="d-none" href="#" id="downloadButton"
                                               download={true}>downloadButton</a>
                                            {loadFilter ? (
                                                <button
                                                    className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                    type="button" disabled>
                                                    {t("Chargement...")}
                                                </button>
                                            ) : (
                                                <button onClick={filterReporting} className="btn btn-primary"
                                                        disabled={(loadDownload || loadDownloadPdf)}>{t("Filtrer le rapport")}</button>
                                            )}

                                            {loadDownload ? (
                                                <button
                                                    className="btn btn-secondary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3"
                                                    type="button" disabled>
                                                    {t("Chargement...")}
                                                </button>
                                            ) : (
                                                <ReactHTMLTableToExcel
                                                    id="test-table-xls-button"
                                                    className="btn btn-secondary ml-3"
                                                    table="myExcel"
                                                    filename="rapport_efficacité-traitement"
                                                    sheet="efficacité-traitement"
                                                    buttonText="EXCEL"/>
                                            )}

                                            {loadDownloadPdf ? (
                                                <button
                                                    className="btn btn-secondary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3"
                                                    type="button" disabled>
                                                    {t("Chargement...")}
                                                </button>
                                            ) : (
                                                <button onClick={downloadReportingPdf}
                                                        className="btn btn-secondary ml-3"
                                                        disabled={(loadFilter || loadDownload)}>PDF</button>
                                            )}
                                        </div>
                                    </div>
                                </div>


                            </div>

                            {
                                load ? (
                                    <LoadingTable/>
                                ) : (
                                    <div className="kt-portlet__body">
                                        <div id="kt_table_1_wrapper" className="dataTables_wrapper dt-bootstrap4">

                                            {/*    <div className="row">
                                                <div className="col-sm-6 text-left">
                                                    <div id="kt_table_1_filter" className="dataTables_filter">
                                                        <label>
                                                            {t("Rechercher")}:
                                                            <input id="myInput" type="text"
                                                                   onKeyUp={(e) => searchElement(e)}
                                                                   className="form-control form-control-sm"
                                                                   placeholder="" aria-controls="kt_table_1"/>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>*/}

                                            <div className="row">

                                                <div className="row">
                                                    <div style={{display: "none"}} id="headReport"
                                                         className="headRapport ml-5 mt-5">

                                                        <div className="mb-5" style={{textAlign:"justify"}}>
                                                            <h6 style={{textAlign:"center"}}> { title.toUpperCase() ? title.toUpperCase() : "-"}  DU {moment(dateStart).format('DD/MM/YYYY') + " À " +  moment(dateEnd).format('DD/MM/YYYY')} </h6>
                                                            <p style={{textAlign:"left"}}> { description ? description : "-"} </p>
                                                        </div>
                                                    </div>
                                                </div>


                                                <div id="myTable" className="ml-3 col-sm-12">


                                                    {props.plan === "PRO" ? (
                                                        <table id="myExcel"
                                                               className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                               role="grid" aria-describedby="kt_table_1_info"
                                                               style={{width: "952px"}}>
                                                            <thead>
                                                            <tr role="row">

                                                                <th className="sorting" tabIndex="0"
                                                                    aria-controls="kt_table_1"
                                                                    style={{textAlign: "center"}}
                                                                    aria-label="Country: activate to sort column ascending">
                                                                    {t("Libellés")}
                                                                </th>
                                                                <th className="sorting" tabIndex="0"
                                                                    aria-controls="kt_table_1"
                                                                    style={{textAlign: "center"}}
                                                                    aria-label="Country: activate to sort column ascending">
                                                                    {t("Valeurs")}
                                                                </th>

                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes reçues et non traitées sur la période")}  </td>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>
                                                                    { treatmentefficacity.totalUntreatedClaims !== undefined && treatmentefficacity.totalUntreatedClaims !== null ? treatmentefficacity.totalUntreatedClaims : "-"}
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes traitées sur la période et dans le délai")}  </td>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>
                                                                    { treatmentefficacity.totalTreatedClaimsInTime !== undefined && treatmentefficacity.totalTreatedClaimsInTime !== null ? treatmentefficacity.totalTreatedClaimsInTime : "-"}
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes traitées sur la période et hors délai")}  </td>
                                                                <td style={{ textAlign: "center", fontWeight: "bold"  }}>
                                                                    { treatmentefficacity.totalTreatedClaimsOutOfTime !== undefined && treatmentefficacity.totalTreatedClaimsOutOfTime !== null ? treatmentefficacity.totalTreatedClaimsOutOfTime : "-"}
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de relance de la part des clients")}  </td>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>
                                                                    { treatmentefficacity.totalRevivalClaims !== undefined && treatmentefficacity.totalRevivalClaims !== null ? treatmentefficacity.totalRevivalClaims : "-"}
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Taux de satisfaction sur la période")}  </td>
                                                                <td style={{  textAlign: "center",  fontWeight: "bold"  }}>
                                                                    { treatmentefficacity.rateOfSatisfaction !== undefined && treatmentefficacity.rateOfSatisfaction !== null ? treatmentefficacity.rateOfSatisfaction +"%" : "-"}
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de jour moyen de traitement d'une plainte")}  </td>
                                                                <td style={{ textAlign: "center", fontWeight: "bold"  }}>
                                                                    { treatmentefficacity.averageNumberOfDaysForTreatment !== undefined && treatmentefficacity.averageNumberOfDaysForTreatment !== null ? treatmentefficacity.averageNumberOfDaysForTreatment : "-"}
                                                                </td>
                                                            </tr>

                                                            {
                                                                props.plan === "MACRO" ? (
                                                                <>
                                                                        <tr>
                                                                            <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes reçues par une institution sur la période et non traitées")}  </td>
                                                                            <td style={{
                                                                                textAlign: "center",
                                                                                fontWeight: "bold"
                                                                            }}> 19678
                                                                            </td>
                                                                        </tr>

                                                                        <tr>
                                                                            <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes traitées par une institution sur la période et dans le délai")}  </td>
                                                                            <td style={{
                                                                                textAlign: "center",
                                                                                fontWeight: "bold"
                                                                            }}> 9563
                                                                            </td>
                                                                        </tr>

                                                                        <tr>
                                                                            <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes traitées par une institution sur la période et hors délai")}  </td>
                                                                            <td style={{
                                                                                textAlign: "center",
                                                                                fontWeight: "bold"
                                                                            }}> 5236
                                                                            </td>
                                                                        </tr>

                                                                        <tr>
                                                                            <td style={{fontWeight: "bold"}}> {t("Taux de relance de la part des clients d'une institution")}  </td>
                                                                            <td style={{
                                                                                textAlign: "center",
                                                                                fontWeight: "bold"
                                                                            }}> 459
                                                                            </td>
                                                                        </tr>

                                                                        <tr>
                                                                            <td style={{fontWeight: "bold"}}> {t("Taux de satisfaction des réclamations visant une institution sur la période")}  </td>
                                                                            <td style={{
                                                                                textAlign: "center",
                                                                                fontWeight: "bold"
                                                                            }}> 965
                                                                            </td>
                                                                        </tr>

                                                                        <tr>
                                                                            <td style={{fontWeight: "bold"}}> {t("Nombre de jour moyen de traitement d'une plainte par une institution")}  </td>
                                                                            <td style={{
                                                                                textAlign: "center",
                                                                                fontWeight: "bold"
                                                                            }}> 14756
                                                                            </td>
                                                                        </tr>




                                                                </>
                                                                ) : null
                                                            }

                                                            </tbody>
                                                            <tfoot>
                                                            <tr>
                                                                <th>{t("Libellés")}</th>
                                                                <th style={{textAlign: "center"}}>{t("Valeurs")}</th>
                                                            </tr>
                                                            </tfoot>
                                                        </table>
                                                    ) : null}

                                                    {
                                                        props.plan === "MACRO" ? (
                                                        <table id="myExcel"
                                                               className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                               role="grid" aria-describedby="kt_table_1_info"
                                                               style={{width: "952px"}}>
                                                            <thead>

                                                            <tr role="row">

                                                                <th className="sorting" tabIndex="0" rowSpan="2"
                                                                    aria-controls="kt_table_1"
                                                                    style={{textAlign: "center"}}
                                                                    aria-label="Country: activate to sort column ascending">
                                                                    {t("Libellés")}
                                                                </th>
                                                                <th className="sorting" tabIndex="0"
                                                                    aria-controls="kt_table_1"
                                                                    style={{textAlign: "center"}}
                                                                    aria-label="Country: activate to sort column ascending">
                                                                    {t("Valeurs")}
                                                                </th>

                                                            </tr>
                                                            <tr role="row">

                                                                <th className="sorting" tabIndex="0" rowSpan="2"
                                                                    aria-controls="kt_table_1"
                                                                    style={{textAlign: "center"}}
                                                                    aria-label="Country: activate to sort column ascending">
                                                                    UBA
                                                                </th>
                                                                <th className="sorting" tabIndex="0"
                                                                    aria-controls="kt_table_1"
                                                                    style={{textAlign: "center"}}
                                                                    aria-label="Country: activate to sort column ascending">
                                                                    BOA
                                                                </th>

                                                            </tr>

                                                            </thead>
                                                            <tbody>
                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes reçues et non traitées sur la période")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 50000
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 50000
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes traitées sur la période et dans le délai")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 45896
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 45896
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes traitées sur la période et hors délai")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 32010
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 32010
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de relance de la part des clients")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 12048
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 12048
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Taux de satisfaction sur la période")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 62053
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 62053
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de jour moyen de traitement d'une plainte")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 11001
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 11001
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes reçues par une institution sur la période et non traitées")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 19678
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 19678
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes traitées par une institution sur la période et dans le délai")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 9563
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 9563
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de plaintes traitées par une institution sur la période et hors délai")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 5236
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 5236
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Taux de relance de la part des clients d'une institution")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 459
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 459
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Taux de satisfaction des réclamations visant une institution sur la période")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 965
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 965
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style={{fontWeight: "bold"}}> {t("Nombre de jour moyen de traitement d'une plainte par une institution")}  </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 14756
                                                                </td>
                                                                <td style={{
                                                                    textAlign: "center",
                                                                    fontWeight: "bold"
                                                                }}> 14756
                                                                </td>
                                                            </tr>

                                                            </tbody>
                                                            <tfoot>
                                                            <tr>
                                                                <th>{t("Libellés")}</th>
                                                                <th style={{textAlign: "center"}}>{t("Valeurs")}</th>

                                                            </tr>
                                                            </tfoot>
                                                        </table>
                                                    ) : null}


                                                </div>


                                            </div>

                                            {/*     <div className="row">
                                                <div className="col-sm-12 col-md-5">
                                                    <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                         aria-live="polite">{t("Affichage de")} 1 {t("à")} {numberPerPage} {t("sur")} {claims.length} {t("données")}
                                                    </div>
                                                </div>
                                                {
                                                    showList.length ? (
                                                        <div className="col-sm-12 col-md-7 dataTables_pager">
                                                            <Pagination
                                                                numberPerPage={numberPerPage}
                                                                onChangeNumberPerPage={onChangeNumberPerPage}
                                                                activeNumberPage={activeNumberPage}
                                                                onClickPreviousPage={e => onClickPreviousPage(e)}
                                                                pages={pages}
                                                                onClickPage={(e, number) => onClickPage(e, number)}
                                                                numberPage={numberPage}
                                                                onClickNextPage={e => onClickNextPage(e)}
                                                            />
                                                        </div>
                                                    ) : null
                                                }
                                            </div>

*/}

                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        plan: state.plan.plan,
        userPermissions: state.user.user.permissions,
        activePilot: state.user.user.staff.is_active_pilot
    };
};

export default connect(mapStateToProps)(ClaimReportingUemoaSix);
