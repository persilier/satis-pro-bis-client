import {connect} from "react-redux";
import {useTranslation} from "react-i18next";
import {verifyPermission} from "../../helpers/permission";
import InfirmationTable from "../components/InfirmationTable";
import HeaderTablePage from "../components/HeaderTablePage";
import Select from "react-select";
import LoadingTable from "../components/LoadingTable";
import EmptyTable from "../components/EmptyTable";
import Pagination from "../components/Pagination";
import React, {useCallback, useEffect, useState} from "react";
import moment from "moment"
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import {ERROR_401} from "../../config/errorPage";
import {loadCss, removeNullValueInObject} from "../../helpers/function";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import appConfig from "../../config/appConfig";
import axios from "axios";
import {ToastBottomEnd} from "../components/Toast";
import {toastSuccessMessageWithParameterConfig} from "../../config/toastConfig";

import pdfMake from "pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";
import {systemUsageReport} from "../../http/crud";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ClaimSystemUsageReport = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    if (!(verifyPermission(props.userPermissions, 'list-system-usage-reporting')))
        window.location.href = ERROR_401;

    const defaultError = {
        date_start: [],
        date_end: [],
        institution_targeted_id: [],
    };

    const [load, setLoad] = useState(false);
    const [loadFilter, setLoadFilter] = useState(false);
    const [loadDownload, setLoadDownload] = useState(false);

    const [data, setData] = useState([]);
    const [error, setError] = useState(defaultError);
    const [institution, setInstitution] = useState(null);
    const [institutions, setInstitutions] = useState([]);
    const [dateStart, setDateStart] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [dateEnd, setDateEnd] = useState(moment().format('YYYY-MM-DD'));

    const fetchData = useCallback(
        async (click = false) => {

            let sendData = {
                date_start: dateStart ? dateStart : null,
                date_end: dateEnd ? dateEnd : null,
            }

            await systemUsageReport(props.userPermissions, sendData)
                    .then(response => {
                        setLoad(false);
                        setLoadFilter(false);
                        setData(response.data);
                        if (click)
                            ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(ready ? t("Filtre effectuer avec succès") : ""));
                    })
                    .catch(error => {
                        setLoad(false);
                        setLoadFilter(false);
                        setError({...defaultError, ...error.response.data.error});
                        //console.log("Something is wrong");
                    })
        }
    , [dateStart, dateEnd])

    useEffect(() => {
        setLoad(true);
        fetchData().catch(error => console.log("Something is wrong"))
    }, []);


    const handleDateStartChange = e => {
        setDateStart(e.target.value);
    };

    const handleDateEndChange = e => {
        setDateEnd(e.target.value);
    };

    const downloadReportingPdf = () => {
        setLoadDownload(true);
        let doc = document.cloneNode(true);
        let systemUsageHeader = doc.getElementById("system-usage-header").outerHTML
        let systemUsageTable = doc.getElementById("system-usage-div").outerHTML;
        let htmlTable = htmlToPdfmake(systemUsageHeader.innerHTML + systemUsageTable.innerHTML);
        let docDefinition = {
          content: htmlTable
        };
        pdfMake.createPdf(docDefinition).download("SystemUsageReport.pdf", function () {
            setLoadDownload(false);
        });
    }

    const filterReporting = async () => {
        setLoadFilter(true);
        setLoad(true);
        fetchData(true).catch(error => console.log("Something is wrong"));
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, 'list-system-usage-reporting')  ? (
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
                                        {t("Utilisation Système")}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <InfirmationTable information={(
                            <div>
                                {t("Utilisation du système sur une période donnée")}
                            </div>
                        )}/>

                        <div className="kt-portlet">
                            <HeaderTablePage
                                id="system-usage-header"
                                title={t("Rapport utilisation système")}
                            />

                            <div className="kt-portlet__body">

                                {
                                    props.plan !== "PRO" ? (
                                        <div className="row">
                                            {verifyPermission(props.userPermissions, 'list-reporting-claim-my-institution') ? (
                                                <div className="col-md-12">
                                                    <div
                                                        className={error.date_start.length ? "form-group validated" : "form-group"}>
                                                        <label htmlFor="">{t("Institution")}</label>
                                                        <Select
                                                            isClearable
                                                            value={institution}
                                                            placeholder={t("Veuillez sélectionner l'institution")}
                                                            /*onChange={}*/
                                                            options={institutions}
                                                        />

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
                                            ) : null}
                                        </div>
                                    ) : null
                                }


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

                                    <div className="col-md-12">
                                        <div className="form-group d-flex justify-content-end">
                                            <a className="d-none" href="#" id="downloadButton"
                                               download={true}>downloadButton</a>
                                            {loadFilter ? (
                                                <button
                                                    className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                    type="button" disabled>
                                                    {t("Chargement") + "..."}
                                                </button>
                                            ) : (
                                                <button onClick={filterReporting} className="btn btn-primary"
                                                        disabled={(loadFilter)}>{t("Filtrer le rapport")}</button>
                                            )}

                                            {loadDownload ? (
                                                <button
                                                    className="btn btn-secondary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3"
                                                    type="button" disabled>
                                                    {t("Chargement") + "..."}
                                                </button>
                                            ) : (
                                                /*<button /!*onClick={}*!/ className="btn btn-secondary ml-3"
                                                        disabled={(loadFilter)}>EXCEL</button>*/
                                                <ReactHTMLTableToExcel
                                                    id="test-table-xls-button"
                                                    className="btn btn-secondary ml-3"
                                                    table="system-usage-table"
                                                    filename="SystemUsageReport"
                                                    sheet="system-usage-report"
                                                    buttonText="EXCEL"
                                                />

                                            )}

                                            {loadDownload ? (
                                                <button
                                                    className="btn btn-secondary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3"
                                                    type="button" disabled>
                                                    {t("Chargement") + "..."}
                                                </button>
                                            ) : (
                                                <button onClick={downloadReportingPdf}
                                                        className="btn btn-secondary ml-3"
                                                        disabled={(loadDownload)}>PDF</button>
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
                                        <div>
                                            <div className="row">
                                                <div className="table-responsive col-sm-12" id="system-usage-div">
                                                    <table  id="system-usage-table" className="table table-striped table-bordered table-hover table-checkable dtr-inline">
                                                        <thead>
                                                            <tr>
                                                                <th rowSpan={1}>{t("Titre")}</th>
                                                                <th colSpan={1}>{t("Valeur")}</th>
                                                            </tr>
{/*                                                            <tr>
                                                                <th>Satis</th>
                                                                <th>Dmd</th>
                                                            </tr>*/}
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            data.totalReceivedClaims !== null ? (
                                                                <tr>
                                                                    <th scope="row">
                                                                        {t("Nombre de plaintes reçues sur la période")}
                                                                    </th>
                                                                    <td>{data.totalReceivedClaims}</td>
                                                                </tr>
                                                            ) : (
                                                                <tr>
                                                                    <th scope="row">
                                                                        {t("Nombre de plaintes reçues sur la période")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }
                                                        {
                                                            data.totalTreatedClaims !== null ? (
                                                                <tr>
                                                                    <th scope="row">
                                                                        {t("Nombre de plaintes traitées sur la période")}
                                                                    </th>
                                                                    <td>{data.totalTreatedClaims}</td>
                                                                </tr>
                                                            ) : (
                                                                <tr>
                                                                    <th scope="row">
                                                                        {t("Nombre de plaintes traitées sur la période")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }
                                                        {
                                                            data.totalSatisfactionMeasured !== null ? (
                                                                <tr>
                                                                    <th scope="row">
                                                                        {t("Nombre de plaintes évaluées dans la période")}
                                                                    </th>
                                                                    <td>{data.totalSatisfactionMeasured}</td>
                                                                </tr>
                                                            ) : (
                                                                <tr>
                                                                    <th scope="row">
                                                                        {t("Nombre de plaintes évaluées dans la période")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }
{/*                                                        <tr>
                                                            <th scope="row">
                                                                Nombre de plaintes reçues sur la période par une institution
                                                            </th>
                                                            <td>Larry</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">
                                                                Nombre de plaintes traitées sur la période par une institution
                                                            </th>
                                                            <td>Larry</td>
                                                            <td>Larry</td>
                                                        </tr>
                                                        <tr>
                                                            <th scope="row">
                                                                Nombre de plaintes évaluées sur la période par une institution
                                                            </th>
                                                            <td>Larry</td>
                                                            <td>Larry</td>
                                                        </tr>*/}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
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
}


const mapStateToProps = state => {
    return {
        plan: state.plan.plan,
        userPermissions: state.user.user.permissions,
        activePilot: state.user.user.staff.is_active_pilot
    };
};

export default connect(mapStateToProps)(ClaimSystemUsageReport);