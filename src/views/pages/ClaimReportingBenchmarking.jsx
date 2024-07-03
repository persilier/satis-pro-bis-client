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

import htmlToPdfmake from "html-to-pdfmake";
import pdfMake from "pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {benchmarkingReport} from "../../http/crud";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");



const ClaimReportingBenchmarking = (props) => {
    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    if (!verifyPermission(props.userPermissions, 'list-benchmarking-reporting'))
        window.location.href = ERROR_401;

    const defaultError = {
        date_start: [],
        date_end: [],
    };

    const [load, setLoad] = useState(false);
    const [loadFilter, setLoadFilter] = useState(false);
    const [loadDownload, setLoadDownload] = useState(false);

    const [data, setData] = useState({});
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
            };

            await benchmarkingReport(props.userPermissions, removeNullValueInObject(sendData))
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
        fetchData().catch(error => console.log("Something is wrong"));
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
        let benchmarkingHeader = doc.getElementById("benchmarking-header").outerHTML
        let benchmarkingTable = doc.getElementById("benchmarking-div").outerHTML;
        let htmlTable = htmlToPdfmake(benchmarkingHeader + benchmarkingTable,  {
            tableAutoSize: true
        });
        let docDefinition = {
            content: htmlTable
        };
        pdfMake.createPdf(docDefinition).download(`BenchmarkingReport.pdf`, function () {
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
            verifyPermission(props.userPermissions, 'list-benchmarking-reporting') ? (
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
                                        {t("Benchmarking")}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <InfirmationTable information={(
                            <div>
                                {t("Benchmarking sur une période donnée")}
                            </div>
                        )}/>

                        <div className="kt-portlet">
                            <HeaderTablePage
                                id={"benchmarking-header"}
                                title={t("Rapport benchmarking")}
                            />

                            <div className="kt-portlet__body">

                                {
                                    props.plan !== "PRO" ? (
                                        <div className="row">
                                            {verifyPermission(props.userPermissions, 'list-benchmarking-reporting') ? (
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
                                                                       disabled={(loadDownload)}>{t("Filtrer le rapport")}</button>
                                            )}

                                            {loadDownload ? (
                                                <button
                                                    className="btn btn-secondary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3"
                                                    type="button" disabled>
                                                    {t("Chargement" + "...")}
                                                </button>
                                            ) : (
                                                /*<button /!*onClick={}*!/ className="btn btn-secondary ml-3"
                                                        disabled={(loadFilter)}>EXCEL</button>*/
                                                <ReactHTMLTableToExcel
                                                    id="test-table-xls-button"
                                                    className="btn btn-secondary ml-3"
                                                    table="benchmarking-table"
                                                    filename="BenchmarkingReport"
                                                    sheet="benchmarking-report"
                                                    buttonText="EXCEL"
                                                />

                                            )}

                                            {loadDownload ? (
                                                <button
                                                    className="btn btn-secondary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3"
                                                    type="button" disabled>
                                                    {t("Chargement" + "...")}
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
                                                <div className="table-responsive col-sm-12" id="benchmarking-div">
                                                    <table className="table table-striped table-bordered table-hover table-checkable dtr-inline" id="benchmarking-table">
                                                        <thead>
                                                            <tr>
                                                                <th scope="col" colSpan="2">{t("Titre")}</th>
                                                                <th scope="col">{t("Valeur")}</th>
                                                            </tr>
{/*                                                            <tr>
                                                                <th>Satis</th>
                                                                <th>Dmd</th>
                                                            </tr>*/}
                                                        </thead>
                                                        <tbody>

                                                        {
                                                            (data.RateOfReceivedClaimsBySeverityLevel && data.RateOfReceivedClaimsBySeverityLevel.length) ? (
                                                                <>
                                                                    <tr>
                                                                        <th rowSpan={data.RateOfReceivedClaimsBySeverityLevel.length} scope="rowGroup">
                                                                            {t("Taux de plaintes reçues par niveau de gravité sur la période")}
                                                                        </th>
                                                                        {
                                                                            data.RateOfReceivedClaimsBySeverityLevel[0] ?
                                                                                (
                                                                                    <>
                                                                                        <th>{data.RateOfReceivedClaimsBySeverityLevel[0].severityLevel.fr ? data.RateOfReceivedClaimsBySeverityLevel[0].severityLevel.fr : '-'}</th>
                                                                                        <td>{data.RateOfReceivedClaimsBySeverityLevel[0].rate ? data.RateOfReceivedClaimsBySeverityLevel[0].rate + " %" : 0}</td>
                                                                                    </>
                                                                                ) : null
                                                                        }
                                                                    </tr>
                                                                    {
                                                                        data.RateOfReceivedClaimsBySeverityLevel.length > 1 ? (
                                                                            data.RateOfReceivedClaimsBySeverityLevel.map((value, index) => {
                                                                                if (index !== 0)
                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <th>{value.severityLevel.fr ? value.severityLevel.fr :"-"}</th>
                                                                                            <td>{value.rate ? value.rate + " %" :0}</td>
                                                                                        </tr>
                                                                                    )
                                                                            })
                                                                        ) : null
                                                                    }
                                                                </>
                                                            ) : (
                                                                <tr>
                                                                    <th colSpan={2} scope="row">
                                                                        {t("Taux de plaintes reçues par niveau de gravité sur la période")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }

                                                        {
                                                            (data.RateOfTreatedClaimsBySeverityLevel && data.RateOfTreatedClaimsBySeverityLevel.length) ? (
                                                                <>
                                                                    <tr>
                                                                        <th rowSpan={data.RateOfTreatedClaimsBySeverityLevel.length} scope="rowGroup">
                                                                            {t("Taux de traitement des plaintes par niveau de gravité sur la période")}
                                                                        </th>
                                                                        {
                                                                            data.RateOfTreatedClaimsBySeverityLevel[0] ?
                                                                                (
                                                                                    <>
                                                                                        <th>{data.RateOfTreatedClaimsBySeverityLevel[0].severityLevel.fr ? data.RateOfTreatedClaimsBySeverityLevel[0].severityLevel.fr : '-'}</th>
                                                                                        <td>{data.RateOfTreatedClaimsBySeverityLevel[0].rate ? data.RateOfTreatedClaimsBySeverityLevel[0].rate + " %": 0}</td>
                                                                                    </>
                                                                                ) : null
                                                                        }
                                                                    </tr>
                                                                    {
                                                                        data.RateOfTreatedClaimsBySeverityLevel.length > 1 ? (
                                                                            data.RateOfTreatedClaimsBySeverityLevel.map((value, index) => {
                                                                                if (index !== 0)
                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <th>{value.severityLevel.fr ? value.severityLevel.fr :"-"}</th>
                                                                                            <td>{value.rate ? value.rate + " %" :0}</td>
                                                                                        </tr>
                                                                                    )
                                                                            })
                                                                        ) : null
                                                                    }
                                                                </>
                                                            ) : (
                                                                <tr>
                                                                    <th colSpan={2} scope="row">
                                                                        {t("Taux de traitement des plaintes par niveau de gravité sur la période")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }

                                                        {
                                                            (data.recurringClaimObject && data.recurringClaimObject.length) ? (
                                                                <>
                                                                    <tr>
                                                                        <th rowSpan={data.recurringClaimObject.length} scope="rowGroup">
                                                                            {t("Nature de plaintes réccurentes et rang sur la période")}
                                                                        </th>
                                                                        {
                                                                            data.recurringClaimObject[0] ?
                                                                                (
                                                                                    <>
                                                                                        <th>{data.recurringClaimObject[0].ClaimsObject.fr ? data.recurringClaimObject[0].ClaimsObject.fr  : '-'}</th>
                                                                                        <td>{data.recurringClaimObject[0].total ? data.recurringClaimObject[0].total : 0}</td>
                                                                                    </>
                                                                                ) : null
                                                                        }
                                                                    </tr>
                                                                    {
                                                                        data.recurringClaimObject.length > 1 ? (
                                                                            data.recurringClaimObject.map((value, index) => {
                                                                                if (index !== 0)
                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <th>{value.ClaimsObject.fr ? value.ClaimsObject.fr :"-"}</th>
                                                                                            <td>{value.total ? value.total :0}</td>
                                                                                        </tr>
                                                                                    )
                                                                            })
                                                                        ) : null
                                                                    }
                                                                </>
                                                            ) : (
                                                                <tr>
                                                                    <th colSpan={2} scope="row">
                                                                        {t("Nature de plaintes réccurentes et rang sur la période")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }

                                                        {
                                                            (data.ClaimsByCategoryClient && data.ClaimsByCategoryClient.length) ? (
                                                                <>
                                                                    <tr>
                                                                        <th rowSpan={data.ClaimsByCategoryClient.length} scope="rowGroup">
                                                                            {t("Nombre de plaintes reçues par catégorie client (VIP ou Non VIP) sur la période")}
                                                                        </th>
                                                                        {
                                                                            data.ClaimsByCategoryClient[0] ?
                                                                                (
                                                                                    <>
                                                                                        <th>{data.ClaimsByCategoryClient[0].CategoryClient.fr ? data.ClaimsByCategoryClient[0].CategoryClient.fr  : '-'}</th>
                                                                                        <td>{data.ClaimsByCategoryClient[0].total ? data.ClaimsByCategoryClient[0].total : 0}</td>
                                                                                    </>
                                                                                ) : null
                                                                        }
                                                                    </tr>
                                                                    {
                                                                        data.ClaimsByCategoryClient.length > 1 ? (
                                                                            data.ClaimsByCategoryClient.map((value, index) => {
                                                                                if (index !== 0)
                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <th>{value.CategoryClient.fr ? value.CategoryClient.fr :"-"}</th>
                                                                                            <td>{value.total ? value.total :0}</td>
                                                                                        </tr>
                                                                                    )
                                                                            })
                                                                        ) : null
                                                                    }
                                                                </>
                                                            ) : (
                                                                <tr>
                                                                    <th colSpan={2} scope="row">
                                                                        {t("Nombre de plaintes reçues par catégorie client (VIP ou Non VIP) sur la période")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }

                                                        {
                                                            (data.ClaimsByUnit && data.ClaimsByUnit.length) ? (
                                                                <>
                                                                    <tr>
                                                                        <th rowSpan={data.ClaimsByUnit.length} scope="rowGroup">
                                                                            {t("Points de service les plus concernés")}
                                                                        </th>
                                                                        {
                                                                            data.ClaimsByUnit[0] ?
                                                                                (
                                                                                    <>
                                                                                        <th>{data.ClaimsByUnit[0].Unit.fr ? data.ClaimsByUnit[0].Unit.fr  : '-'}</th>
                                                                                        <td>{data.ClaimsByUnit[0].total ? data.ClaimsByUnit[0].total : 0}</td>
                                                                                    </>
                                                                                ) : null
                                                                        }
                                                                    </tr>
                                                                    {
                                                                        data.ClaimsByUnit.length > 1 ? (
                                                                            data.ClaimsByUnit.map((value, index) => {
                                                                                if (index !== 0)
                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <th>{value.Unit.fr ? value.Unit.fr :"-"}</th>
                                                                                            <td>{value.total ? value.total :0}</td>
                                                                                        </tr>
                                                                                    )
                                                                            })
                                                                        ) : null
                                                                    }
                                                                </>
                                                            ) : (
                                                                <tr>
                                                                    <th colSpan={2} scope="row">
                                                                        {t("Points de service les plus concernés")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }

                                                        {
                                                            data.ClaimsTreatedByUnit && data.ClaimsTreatedByUnit.length ? (
                                                                <>
                                                                    <tr>
                                                                        <th rowSpan={data.ClaimsTreatedByUnit.length} scope="rowGroup">
                                                                            {t("Unité de traitement les plus solicité")}
                                                                        </th>
                                                                        {
                                                                            data.ClaimsTreatedByUnit[0] ?
                                                                                (
                                                                                    <>
                                                                                        <th>{data.ClaimsTreatedByUnit[0].TreatmentUnit.fr ? data.ClaimsTreatedByUnit[0].TreatmentUnit.fr  : '-'}</th>
                                                                                        <td>{data.ClaimsTreatedByUnit[0].total ? data.ClaimsTreatedByUnit[0].total : 0}</td>
                                                                                    </>
                                                                                ) : null
                                                                        }
                                                                    </tr>
                                                                    {
                                                                        data.ClaimsTreatedByUnit.length > 1 ? (
                                                                            data.ClaimsTreatedByUnit.map((value, index) => {
                                                                                if (index !== 0)
                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <th>{value.TreatmentUnit.fr ? value.TreatmentUnit.fr :"-"}</th>
                                                                                            <td>{value.total ? value.total :0}</td>
                                                                                        </tr>
                                                                                    )
                                                                            })
                                                                        ) : null
                                                                    }
                                                                </>
                                                            ) : (
                                                                <tr>
                                                                    <th colSpan={2} scope="row">
                                                                        {t("Unité de traitement les plus solicité")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }

                                                        {
                                                            (data.ClaimsByRequestChanel && data.ClaimsByRequestChanel.length) ? (
                                                                <>
                                                                    <tr>
                                                                        <th rowSpan={data.ClaimsByRequestChanel.length} scope="rowGroup">
                                                                            {t("Canaux les plus sollicités pour la réception des plaintes sur la période")}
                                                                        </th>
                                                                        {
                                                                            data.ClaimsByRequestChanel[0] ?
                                                                                (
                                                                                    <>
                                                                                        <th>{data.ClaimsByRequestChanel[0].RequestChanel ? data.ClaimsByRequestChanel[0].RequestChanel  : '-'}</th>
                                                                                        <td>{data.ClaimsByRequestChanel[0].total ? data.ClaimsByRequestChanel[0].total : 0}</td>
                                                                                    </>
                                                                                ) : null
                                                                        }
                                                                    </tr>
                                                                    {
                                                                        data.ClaimsByRequestChanel.length > 1 ? (
                                                                            data.ClaimsByRequestChanel.map((value, index) => {
                                                                                if (index !== 0)
                                                                                    return (
                                                                                        <tr key={index}>
                                                                                            <th>{value.RequestChanel ? value.RequestChanel :"-"}</th>
                                                                                            <td>{value.total ? value.total :0}</td>
                                                                                        </tr>
                                                                                    )
                                                                            })
                                                                        ) : null
                                                                    }
                                                                </>
                                                            ) : (
                                                                <tr>
                                                                    <th colSpan={2} scope="row">
                                                                        {t("Canaux les plus sollicités pour la réception des plaintes sur la période")}
                                                                    </th>
                                                                    <td>0</td>
                                                                </tr>
                                                            )
                                                        }

{/*                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Taux de plaintes reçues par une institution par niveau
                                                                    de gravité sur la période
                                                                </th>
                                                                <td>Lisa</td>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Taux de traitement des plaintes par une institution par
                                                                    niveau de gravité sur la période
                                                                </th>
                                                                <td>Lisa</td>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Nature de plaintes réccurentes
                                                                    et rang sur la période pour une institution
                                                                </th>
                                                                <td>Lisa</td>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Nombre de plaintes reçues par
                                                                    catégorie client (VIP ou Non VIP)
                                                                    sur la période par une institution
                                                                </th>
                                                                <td>Lisa</td>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Nombre de plaintes évaluées sur la période par une institution
                                                                </th>
                                                                <td>Lisa</td>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Nombre de plaintes traitées par une institution relatives
                                                                    aux catégories d'agent
                                                                </th>
                                                                <td>Lisa</td>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Point de service d'une institution les plus
                                                                    indexé dans les plaintes
                                                                </th>
                                                                <td>Lisa</td>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Services d'une institution les plus solicité dans
                                                                    le traitement des plaintes
                                                                </th>
                                                                <td>Lisa</td>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Canaux les plus sollicités pour la réception
                                                                    des plaintes sur la période
                                                                </th>
                                                                <td>Lisa</td>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={2} scope="row">
                                                                    Canaux les plus sollicités au sein d'une institution
                                                                    pour la réception des plaintes sur la période
                                                                </th>
                                                                <td>Lisa</td>

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

export default connect(mapStateToProps)(ClaimReportingBenchmarking);