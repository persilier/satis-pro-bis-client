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
import text_area from "devextreme/ui/text_area";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ClaimReportingUemoaHeight = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    if (!(verifyPermission(props.userPermissions, 'list-reporting-claim-any-institution') || verifyPermission(props.userPermissions, 'list-global-reporting')))
        window.location.href = ERROR_401;

    const [load, setLoad] = useState(false);
    const [loadFilter, setLoadFilter] = useState(false);

    const [loadDownloadPdf, setLoadDownloadPdf] = useState(false);

    const [labelTable, setLabelTable] = useState([]);
    const [objectRankOne, setObjectRankOne] = useState([]);
    const [objectRankTwo, setObjectRankTwo] = useState([]);
    const [objectRankThree, setObjectRankThree] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [commentOne, setCommentOne] = useState("");
    const [commentTwo, setCommentTwo] = useState("");
    const [typeRapport , setTypeRapport] = useState("GLOBAL");
    const [dateStart, setDateStart] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [dateEnd, setDateEnd] = useState(moment().format('YYYY-MM-DD'));
    const defaultError = {
        date_start: [],
        date_end: [],
        institution_targeted_id: [],
        unit_targeted_id: [],
    };
    const defaultData = {
        unit_targeted_id: [],
    };
    const [units, setUnits] = useState([]);
    const [unitFilters, setUnitFilters] = useState([]);
    const [unit, setUnit] = useState([]);
    const [isLoad, setIsLoad] = useState(true)
    const [error, setError] = useState(defaultError);
    const [loadDownload, setLoadDownload] = useState(false);
    const [institution, setInstitution] = useState(null);
    const [institutions, setInstitutions] = useState([]);

    const onRadioChange = e => {
        setStatistics({});
        setUnitFilters([]);
        setObjectRankOne([]);
        setObjectRankTwo([]);
        setObjectRankThree([]);
        setLabelTable([]);
        setUnit([]);
        setTypeRapport(e.target.value);
    };


    const fetchData = async (click = false) => {
        setLoadFilter(true);
        setLoad(true);
        let endpoint = "";
        let sendData = {};
        if (verifyPermission(props.userPermissions, 'list-reporting-claim-any-institution')) {
            if (props.plan === "MACRO")
                endpoint = `${appConfig.apiDomaine}/any/uemoa/global-state-report`;
            else
                endpoint = `${appConfig.apiDomaine}/my/global-rapport`;
            sendData = {
                date_start: dateStart ? dateStart : null,
                date_end: dateEnd ? dateEnd : null,
                institution_id: institution ? institution.value : null,
            };
            if (props.plan === "HUB") {
                console.log("hub")
            } else
                console.log("hub")
        } else if (verifyPermission(props.userPermissions, 'list-global-reporting')) {
            var unitToSend = unit.map( item => item.value)
            endpoint = `${appConfig.apiDomaine}/my/global-rapport`;

            sendData = {
                date_start: dateStart ? dateStart : null,
                date_end: dateEnd ? dateEnd : null,
                unit_targeted_id: unitToSend ? unitToSend : null
            };
            if(typeRapport=== "GLOBAL"){
                delete sendData.unit_targeted_id;
            }
        }
        await axios.post(endpoint, sendData)
            .then(response => {
                if (click)
                    ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(ready ? t("Filtre effectué avec succès") : ""));
                setStatistics(response.data);
                if (typeRapport === 'SPECIFIC'){
                    setUnitFilters(unit);
                    parseSpecificReportUnit(response.data, "RateOfClaimsTreatedInTime", unit);
                    setObjectRankOne(parseObjectRank(response.data,1))
                    setObjectRankTwo(parseObjectRank(response.data,2))
                    setObjectRankThree(parseObjectRank(response.data,3))
                }

                setError(defaultError);
                setLoadFilter(false);
                setLoad(false);
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
        setIsLoad(true);
        var endpoint = "";
        if (verifyPermission(props.userPermissions, 'list-reporting-claim-any-institution')) {
            if (props.plan === "MACRO")
                endpoint = `${appConfig.apiDomaine}/any/uemoa/data-filter`;
            else
                endpoint = `${appConfig.apiDomaine}/without/uemoa/data-filter`;
        } else
            if (verifyPermission(props.userPermissions, 'list-global-reporting')) {
            endpoint = `${appConfig.apiDomaine}/my/specific-report-units`;
        }

        if (verifyTokenExpire()) {
            axios.get(endpoint)
                .then(response => {
                    console.log(response.data)
                    setUnits(formatSelectOption(response.data, "name", "fr"));
                    setIsLoad(false);
                })
                .catch(error => {
                    console.log("Something is wrong")
                })
            ;
        }

        fetchData();
    }, []);


    const handleDateEndChange = e => {
        setDateEnd(e.target.value);
    };

    const handleDateStartChange = e => {
        setDateStart(e.target.value);
    };

    const handleCommentOne = e => {
        setCommentOne(e.target.value);
    };
    const handleCommentTwo = e => {
        setCommentTwo(e.target.value);
    };

    const onChangeUnit = (selected) => {
        setUnit(selected ?? []);
    };

    const onChangeInstitution = (selected) => {
        setInstitution(selected);
    };

    const filterReporting = () => {
        setLoadFilter(true);
        setLoad(true);
        if (verifyTokenExpire())
            fetchData(true);
    };

    const printBodyTableCategory = (item, index) => {
        return (
            <tr>
                <td  style={{ fontWeight:"bold"}}> {item.CategoryClaims?.fr ?? '-'} </td>
                <td  style={{textAlign:"center", fontWeight:"bold"}} > {item.total ?? '-'} </td>
                <td  style={{textAlign:"center", fontWeight:"bold"}} > {item.taux ? item.taux + "%" : '-'} </td>
            </tr>
        );
    };

     const printBodyTableObject = (item, index) => {
            return (
                <tr>
                    <td  style={{ fontWeight:"bold"}}> {item.ClaimsObject?.fr ?? '-'} </td>
                    <td  style={{textAlign:"center", fontWeight:"bold"}} > {item.total ?? '-'} </td>
                    <td  style={{textAlign:"center", fontWeight:"bold"}} > {item.taux ? item.taux + "%" : '-'} </td>
                </tr>
            );
     };

    const printBodyTableSex = (item, index) => {
        return (
            <tr>
                <td  style={{ fontWeight:"bold"}}> {item.ClientGender ? item.ClientGender : '-'} </td>
                <td  style={{textAlign:"center", fontWeight:"bold"}} > {item.total ?? '-'} </td>
                <td  style={{textAlign:"center", fontWeight:"bold"}} > {item.taux ? item.taux + "%" : '-'} </td>
            </tr>
        );
    };

    const printBodyTableGravity= (item, index, tableSize) => {
        return (
            <tr>
                {  index === 0 ? (<td  style={{fontWeight:"bold"}} rowSpan={tableSize}>  {t("Objets de plaintes les plus récurrents")}  </td> ) : null}
                <td  style={{textAlign:"center", fontWeight:"bold"}} > {item.rank ?? '-'} </td>
                <td  style={{ fontWeight:"bold"}}> {item.ClaimsObject?.fr ?? '-'} </td>
            </tr>
        );
    };

    const parseSpecificReportTable = (object, typeStatistic, unitId, type = "total") =>{

        var stats = object[typeStatistic];

        if (stats && Array.isArray(stats)){
            for ( var i = 0; i < stats.length; i ++ ){
                if (stats[i].UnitId === unitId){
                    return stats[i][type]   ;
                }
            }
            return "-";
        }
        return "-";
    }


    const parseObjectRank = (object, rank) => {
        var resultRank = [];
        for (var i = 0 ; i < unit.length ; i ++) {
            var checkObject = 0;
            for ( var j = 0 ; j < object.RecurringClaimsByClaimObject.length ; j ++) {
                if (unit[i].label === object.RecurringClaimsByClaimObject[j].unit.fr){
                    checkObject = 1;
                    var checkUnit = 0;
                    for ( var k = 0 ; k < object.RecurringClaimsByClaimObject[j].allClaimObject.length ; k ++) {
                        if (object.RecurringClaimsByClaimObject[j].allClaimObject[k].rank === rank){
                            checkUnit= 1;
                            resultRank.push(object.RecurringClaimsByClaimObject[j].allClaimObject[k].ClaimsObject.fr);
                        }
                    }
                    if (checkUnit === 0) {
                        resultRank.push("-")
                    }
                    checkUnit = 0;
                }
            }
            if (checkObject === 0) {
                resultRank.push("-")
            }
            checkObject = 1;
        }
        console.log(rank, resultRank)
        return resultRank;
    }

    const parseSpecificReportUnit = (object, typeStatistic, unitIds) =>{

        let stats = object[typeStatistic];

        let labels = [];

        if (stats && Array.isArray(stats)){

            for ( let i = 0; i < unitIds.length; i ++ ){
                for(let j = 0; j < stats.length; j++ ) {
                    if (stats[j].UnitId === unitIds[i].value){
                        labels.push(stats[j].Unit.fr);
                    }
                }
            }
        }
        setLabelTable(labels);
    }

    const downloadReportingPdf = () => {

        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        let doc = document.cloneNode(true);
        let headTable = doc.getElementById("headReport").outerHTML
        let tablePdf = doc.getElementById("myTable").outerHTML
        let val = htmlToPdfmake(headTable + tablePdf,  {tableAutoSize: true});
        let dd = {content: val};
        pdfMake.createPdf(dd).download();

    }


    return (
        ready ? (
            verifyPermission(props.userPermissions, 'list-reporting-claim-any-institution') || verifyPermission(props.userPermissions, 'list-global-reporting') ? (
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
                                        {t("Rapport global satis")}
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
                                title={t("Rapport Satis")}
                            />

                            <div className="kt-portlet__body">



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

                                      {/*  <div className="col-md-12">
                                            <Select
                                                defaultValue={[colourOptions[2], colourOptions[3]]}
                                                isMulti
                                                name="colors"
                                                options={colourOptions}
                                                className="basic-multi-select"
                                                classNamePrefix="select"
                                            />
                                        </div>*/}

                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label style={{fontWeight:"bold"}}> Générer un rapport SATIS : </label>
                                                    <div className="kt-radio-inline">
                                                        <label className="kt-radio">
                                                            <input type="radio" value="GLOBAL" checked={typeRapport === "GLOBAL"} onChange={onRadioChange} name="radio2"/> Rapport Consolidé
                                                                <span></span>
                                                        </label>
                                                        <label className="kt-radio">
                                                            <input type="radio" value="SPECIFIC" checked={typeRapport === "SPECIFIC"} onChange={onRadioChange}  name="radio2"/> Rapport Spécifique
                                                                <span></span>
                                                        </label>
                                                    </div>

                                                </div>


                                                {
                                                props.plan === "PRO" && typeRapport === "SPECIFIC" ? (
                                                    <div className="col">
                                                        <div
                                                            className={error.unit_targeted_id.length ? "form-group validated" : "form-group"}>
                                                            <label htmlFor="">{t("Agences concernées")}</label>
                                                            <Select
                                                                isClearable
                                                                isMulti
                                                                clearValue
                                                                value={unit}
                                                                isLoading={isLoad}
                                                                placeholder={t("Veuillez sélectionner l'agence")}
                                                                onChange={onChangeUnit}
                                                                options={ (!unit || (unit && unit.length < 4))  ? units : [] }
                                                            />
                                                            {
                                                                 unit.length > 3 ? (
                                                                         <p className={"mt-1"} style={{ color:"red", fontSize:"10px", textAlign:"end"}}>Vous avez atteint le nombre maximal d'agences à sélectionner</p>
                                                                ) : null
                                                            }

                                                            {
                                                                error.unit_targeted_id.length ? (
                                                                    error.unit_targeted_id.map((error, index) => (
                                                                        <div key={index} className="invalid-feedback">
                                                                            {error}
                                                                        </div>
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>
                                                    </div>
                                                ) : null
                                                }


                                                {
                                                    props.plan === "MACRO" && typeRapport === "SPECIFIC" ? (
                                                        <div className="col">
                                                            <div
                                                                className={error.institution_targeted_id.length ? "form-group validated" : "form-group"}>
                                                                <label htmlFor="">Institution</label>
                                                                <Select
                                                                    isClearable
                                                                    isMulti
                                                                    value={institution}
                                                                    placeholder={t("Veuillez sélectionner l'institution")}
                                                                    onChange={onChangeInstitution}
                                                                    options={institutions}
                                                                />

                                                                {
                                                                    error.institution_targeted_id.length ? (
                                                                        error.institution_targeted_id.map((error, index) => (
                                                                            <div key={index} className="invalid-feedback">
                                                                                {error}
                                                                            </div>
                                                                        ))
                                                                    ) : null
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : null
                                                }


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

                                            <div className="row">

                                                <div className="mb-5 row">
                                                    <div style={{display: "none"}} id="headReport"
                                                         className="headRapport ml-5 mt-5">
                                                        { typeRapport === "GLOBAL" ? (
                                                                <div className="mb-5" style={{textAlign: "justify"}}>
                                                                    <h6 style={{textAlign: "center"}}> {statistics.title ? statistics.title : "" } DU {moment(dateStart).format('DD/MM/YYYY') + " À " +  moment(dateEnd).format('DD/MM/YYYY')} </h6>
                                                                    <p style={{textAlign: "center"}}> {statistics.description ? statistics.description : "" } </p>
                                                                </div>
                                                            ) : null
                                                        }
                                                        { typeRapport === "SPECIFIC" ? (
                                                            <div className="mb-5" style={{textAlign: "justify"}}>
                                                                <h6 style={{textAlign: "center"}}> {statistics.title ? statistics.title : "" } DU {moment(dateStart).format('DD/MM/YYYY') + " À " +  moment(dateEnd).format('DD/MM/YYYY')} </h6>
                                                                <p style={{textAlign: "center"}}> {statistics.description ? statistics.description : "" } </p>
                                                            </div>
                                                        ) : null
                                                        }

                                                    </div>
                                                </div>


                                                <div id="myTable" className="ml-3 col-sm-12">

                                                        <div className="ml-3 col-sm-12">


                                                            { typeRapport === "GLOBAL"  ? (
                                                                 <div className={"GLOBAL"} >
                                                                    <div >
                                                                        <h4> 1. {t("Rappels")}  </h4>

                                                                        <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                               role="grid" aria-describedby="kt_table_1_info"
                                                                               style={{width: "952px"}}>
                                                                            <thead>
                                                                            <tr role="row">
                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Indicateurs")}
                                                                                </th>
                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    style={{textAlign: "center"}}
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Normes")}
                                                                                </th>
                                                                            </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                            <tr>
                                                                                <td  style={{ fontWeight:"bold"}}> {t("Taux de résolution rapide des plaintes")}   </td>
                                                                                <td  style={{textAlign:"center", fontWeight:"bold"}} > { statistics.RateOfClaimsTreatedInTime?.taux !== undefined && statistics.RateOfClaimsTreatedInTime?.taux !== null ? statistics.RateOfClaimsTreatedInTime.taux + "%" : "-"} </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td  style={{fontWeight:"bold"}} > {t("Taux de satisfaction des plaignants")}  </td>
                                                                                <td  style={{textAlign:"center", fontWeight:"bold"}}> { statistics.RateOfClaimsSatisfaction?.taux !== undefined &&  statistics.RateOfClaimsSatisfaction?.taux !== null ? statistics.RateOfClaimsSatisfaction.taux + "%" : "-"} </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td  style={{fontWeight:"bold"}} > {t("Taux de résolution rapide des plaintes très graves")}  </td>
                                                                                <td  style={{textAlign:"center", fontWeight:"bold"}}> { statistics.RateOfHighlyClaimsTreatedInTime?.taux !== undefined && statistics.RateOfHighlyClaimsTreatedInTime?.taux !== null ? statistics.RateOfHighlyClaimsTreatedInTime.taux + "%" : "-"} </td>
                                                                            </tr>
                                                                            </tbody>
                                                                            <tfoot>
                                                                            <tr>
                                                                                <th>{t("Indicateurs")}</th>
                                                                                <th style={{textAlign: "center"}}>{t("Normes")}</th>
                                                                            </tr>
                                                                            </tfoot>
                                                                        </table>

                                                                    </div>
                                                                    <br/>
                                                                    <div >
                                                                        <h4> 2. {t("Données consolidées")}  </h4>

                                                                        <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                               role="grid" aria-describedby="kt_table_1_info"
                                                                               style={{width: "952px"}}>
                                                                            <thead>
                                                                            <tr role="row">

                                                                                <th className="sorting" tabIndex="0" colSpan={2}
                                                                                    aria-controls="kt_table_1"
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
                                                                                <td  style={{ fontWeight:"bold"}} colSpan={2}> {t("Nombre de plaintes reçues")}  </td>
                                                                                <td  style={{textAlign:"center", fontWeight:"bold"}} > { statistics.TotalClaimsReceived !== undefined && statistics.TotalClaimsReceived !== null ? statistics.TotalClaimsReceived : "-"} </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td  style={{fontWeight:"bold"}} colSpan={2} > {t("Nombre de plaintes traitées")}  </td>
                                                                                <td  style={{textAlign:"center", fontWeight:"bold"}}> { statistics.TotalClaimsResolved !== undefined && statistics.TotalClaimsResolved !== null ? statistics.TotalClaimsResolved : "-"} </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td  style={{fontWeight:"bold"}} colSpan={2} > {t("Nombre de plaintes non traitées")}  </td>
                                                                                <td  style={{textAlign:"center", fontWeight:"bold"}}> { statistics.TotalClaimsUnresolved !== undefined && statistics.TotalClaimsUnresolved !== null ? statistics.TotalClaimsUnresolved : "-"} </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td  style={{fontWeight:"bold"}} colSpan={2} > {t("Nombre de plaintes traitées dans les délais")}  </td>
                                                                                <td  style={{textAlign:"center", fontWeight:"bold"}}> { statistics.TotalClaimResolvedOnTime?.taux !== undefined && statistics.TotalClaimResolvedOnTime?.taux !== null ? statistics.TotalClaimResolvedOnTime.taux : "-"}  </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td  style={{fontWeight:"bold"}} colSpan={2} > {t("Nombre de plaintes traitées en retard")}  </td>
                                                                                <td  style={{textAlign:"center", fontWeight:"bold"}}> { statistics.TotalClaimResolvedLate !== undefined && statistics.TotalClaimResolvedLate !== null ? statistics.TotalClaimResolvedLate : "-"} </td>
                                                                            </tr>

                                                                            {
                                                                                statistics.RecurringClaimsByClaimObject?.length ? (
                                                                                    statistics.RecurringClaimsByClaimObject?.length ? (
                                                                                        statistics.RecurringClaimsByClaimObject.map((item, index) => (
                                                                                            printBodyTableGravity(item, index,  statistics.RecurringClaimsByClaimObject?.length)
                                                                                        ))
                                                                                    ) : (
                                                                                        statistics.RecurringClaimsByClaimObject.map((item, index) => (
                                                                                            printBodyTableGravity(item, index,  statistics.RecurringClaimsByClaimObject?.length)
                                                                                        ))
                                                                                    )
                                                                                ) : (
                                                                                    <EmptyTable colSpan={3}/>
                                                                                )
                                                                            }

                                                                            </tbody>
                                                                            <tfoot>
                                                                            <tr>
                                                                                <th colSpan={2}>{t("Libellés")}</th>
                                                                                <th style={{textAlign: "center"}}>{t("Valeurs")}</th>
                                                                            </tr>
                                                                            </tfoot>
                                                                        </table>

                                                                    </div>
                                                                    <br/>
                                                                    <div >
                                                                        <h4> 3. {t("Plaintes reçues par catégorie de plainte")}  </h4>

                                                                        <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                               role="grid" aria-describedby="kt_table_1_info"
                                                                               style={{width: "952px"}}>
                                                                            <thead>
                                                                            <tr role="row">

                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Catégorie de plaintes")}
                                                                                </th>
                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    style={{textAlign: "center"}}
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Nombres de plaintes reçues")}
                                                                                </th>
                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    style={{textAlign: "center"}}
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Pourcentage de plaintes reçues")}
                                                                                </th>

                                                                            </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                            {
                                                                                statistics.ClaimsReceivedByClaimCategory?.length ? (
                                                                                    statistics.ClaimsReceivedByClaimCategory?.length ? (
                                                                                        statistics.ClaimsReceivedByClaimCategory.map((item, index) => (
                                                                                            printBodyTableCategory(item, index)
                                                                                        ))
                                                                                    ) : (
                                                                                        statistics.ClaimsReceivedByClaimCategory.map((item, index) => (
                                                                                            printBodyTableCategory(item, index)
                                                                                        ))
                                                                                    )
                                                                                ) : (
                                                                                    <EmptyTable colSpan={3}/>
                                                                                )
                                                                            }
                                                                            </tbody>
                                                                            <tfoot>
                                                                            <tr>
                                                                                <th> {t("Catégorie de plaintes")}</th>
                                                                                <th style={{textAlign: "center"}}> {t("Nombres de plaintes reçues")}</th>
                                                                                <th style={{textAlign: "center"}}> {t("Pourcentage de plaintes reçues")}</th>
                                                                            </tr>
                                                                            </tfoot>
                                                                        </table>

                                                                    </div>
                                                                    <br/>
                                                                    <div >
                                                                        <h4> 4. {t("Plaintes reçues par objet de plainte")}  </h4>

                                                                        <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                               role="grid" aria-describedby="kt_table_1_info"
                                                                               style={{width: "952px"}}>
                                                                            <thead>
                                                                            <tr role="row">

                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Objet de plaintes")}
                                                                                </th>
                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    style={{textAlign: "center"}}
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Nombres de plaintes reçues")}
                                                                                </th>
                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    style={{textAlign: "center"}}
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Pourcentage de plaintes reçues")}
                                                                                </th>

                                                                            </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                            {
                                                                                statistics.ClaimsReceivedByClaimObject?.length ? (
                                                                                    statistics.ClaimsReceivedByClaimObject?.length ? (
                                                                                        statistics.ClaimsReceivedByClaimObject.map((item, index) => (
                                                                                            printBodyTableObject(item, index)
                                                                                        ))
                                                                                    ) : (
                                                                                        statistics.ClaimsReceivedByClaimObject.map((item, index) => (
                                                                                            printBodyTableObject(item, index)
                                                                                        ))
                                                                                    )
                                                                                ) : (
                                                                                    <EmptyTable colSpan={3}/>
                                                                                )
                                                                            }
                                                                            </tbody>
                                                                            <tfoot>
                                                                            <tr>
                                                                                <th> {t("Objet de plaintes")}</th>
                                                                                <th style={{textAlign: "center"}}> {t("Nombres de plaintes reçues")}</th>
                                                                                <th style={{textAlign: "center"}}> {t("Pourcentage de plaintes reçues")}</th>
                                                                            </tr>
                                                                            </tfoot>
                                                                        </table>

                                                                    </div>
                                                                    <br/>
                                                                    <div >
                                                                        <h4> 5. {t("Plaintes reçues par sexe de clients")}  </h4>

                                                                        <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                               role="grid" aria-describedby="kt_table_1_info"
                                                                               style={{width: "952px"}}>
                                                                            <thead>
                                                                            <tr role="row">
                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Sexe")}
                                                                                </th>
                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    style={{textAlign: "center"}}
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Nombres de plaintes reçues")}
                                                                                </th>
                                                                                <th className="sorting" tabIndex="0"
                                                                                    aria-controls="kt_table_1"
                                                                                    style={{textAlign: "center"}}
                                                                                    aria-label="Country: activate to sort column ascending">
                                                                                    {t("Pourcentage de plaintes reçues")}
                                                                                </th>
                                                                            </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                            {
                                                                                statistics.ClaimsReceivedByClientGender?.length ? (
                                                                                    statistics.ClaimsReceivedByClientGender?.length ? (
                                                                                        statistics.ClaimsReceivedByClientGender.map((item, index) => (
                                                                                            printBodyTableSex(item, index)
                                                                                        ))
                                                                                    ) : (
                                                                                        statistics.ClaimsReceivedByClientGender.map((item, index) => (
                                                                                            printBodyTableSex(item, index)
                                                                                        ))
                                                                                    )
                                                                                ) : (
                                                                                    <EmptyTable colSpan={3}/>
                                                                                )
                                                                            }
                                                                            </tbody>
                                                                            <tfoot>
                                                                            <tr>
                                                                                <th> {t("Sexe")}</th>
                                                                                <th style={{textAlign: "center"}}> {t("Nombres de plaintes reçues")}</th>
                                                                                <th style={{textAlign: "center"}}> {t("Pourcentage de plaintes reçues")}</th>
                                                                            </tr>
                                                                            </tfoot>
                                                                        </table>

                                                                    </div>
                                                                    <br/>
                                                                    <div >
                                                                    <h4> 6. {t("Satisfaction client")}  </h4>

                                                                    <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                           role="grid" aria-describedby="kt_table_1_info"
                                                                           style={{width: "952px"}}>
                                                                        <thead>
                                                                        <tr role="row">

                                                                            <th className="sorting" tabIndex="0"
                                                                                aria-controls="kt_table_1"
                                                                                aria-label="Country: activate to sort column ascending">
                                                                                {t("Libellé")}
                                                                            </th>
                                                                            <th className="sorting" tabIndex="0"
                                                                                aria-controls="kt_table_1"
                                                                                style={{textAlign: "center"}}
                                                                                aria-label="Country: activate to sort column ascending">
                                                                                {t("Valeurs ")}
                                                                            </th>
                                                                            <th className="sorting" tabIndex="0"
                                                                                aria-controls="kt_table_1"
                                                                                style={{textAlign: "center"}}
                                                                                aria-label="Country: activate to sort column ascending">
                                                                                {t("Taux de satisfaction")}
                                                                            </th>

                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        <tr>
                                                                            <td  style={{ fontWeight:"bold"}}>  {t("Nombre de clients contacté après traitement")} </td>
                                                                            <td  style={{textAlign:"center", fontWeight:"bold"}} > { statistics.ClientContactedAfterTreatment !== undefined && statistics.ClientContactedAfterTreatment !== null ? statistics.ClientContactedAfterTreatment : "-"} </td>
                                                                            <td  style={{textAlign:"center", fontWeight:"bold"}} > { statistics.ClientContactedAfterTreatment !== undefined && statistics.ClientContactedAfterTreatment !== null ? "100%" : "-"} </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{ fontWeight:"bold"}}> {t("Nombre de clients satisfaits")} </td>
                                                                            <td  style={{textAlign:"center", fontWeight:"bold"}} > { statistics.NumberOfClientSatisfied?.total !== undefined && statistics.NumberOfClientSatisfied?.total !== null ? statistics.NumberOfClientSatisfied.total : "-"} </td>
                                                                            <td  style={{textAlign:"center", fontWeight:"bold"}} > { statistics.PercentageOfClientSatisfied?.taux !== undefined && statistics.PercentageOfClientSatisfied?.taux !== null ? statistics.PercentageOfClientSatisfied.taux + "%" : "-"} </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{ fontWeight:"bold"}}> {t("Nombre de clients non-satisfaits")}</td>
                                                                            <td  style={{textAlign:"center", fontWeight:"bold"}} > { statistics.NumberOfClientDissatisfied !== undefined && statistics.NumberOfClientDissatisfied !== null ? statistics.NumberOfClientDissatisfied : "-"} </td>
                                                                            <td  style={{textAlign:"center", fontWeight:"bold"}} > { statistics.PercentageOfClientDissatisfied?.taux     !== undefined && statistics.PercentageOfClientDissatisfied?.taux !== null ? statistics.PercentageOfClientDissatisfied.taux + "%" : "-"} </td>
                                                                        </tr>
                                                                        </tbody>
                                                                        <tfoot>
                                                                        <tr>
                                                                            <th> {t("Libellé")}</th>
                                                                            <th style={{textAlign: "center"}}> {t("Valeurs")}</th>
                                                                            <th style={{textAlign: "center"}}> {t("Taux de satisfaction")}</th>
                                                                        </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                                    <br/>
                                                                    <div style={{display:"none"}} className="">
                                                                         <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                                role="grid" aria-describedby="kt_table_1_info"
                                                                                style={{width: "952px"}}>
                                                                             <thead>
                                                                             <tr role="row">
                                                                                 <th className="sorting" tabIndex="0"
                                                                                     aria-controls="kt_table_1"
                                                                                     style={{textAlign: "center"}}
                                                                                     aria-label="Country: activate to sort column ascending">
                                                                                     <label style={{color: "#48465b", textDecoration: "underline"}}><h6>{t("Raisons du retard dans le traitement des réclamations :")}</h6></label>
                                                                                 </th>
                                                                                 <th className="sorting" tabIndex="0"
                                                                                     aria-controls="kt_table_1"
                                                                                     style={{textAlign: "center"}}
                                                                                     aria-label="Country: activate to sort column ascending">
                                                                                     <label style={{color: "#48465b", textDecoration: "underline"}}><h6>{t("Commentaires / Synthèse générale :")}</h6></label>
                                                                                 </th>
                                                                             </tr>
                                                                             </thead>
                                                                             <tbody>
                                                                             <tr>
                                                                                 <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                     {commentOne}
                                                                                 </td>
                                                                                 <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                     {commentTwo}
                                                                                 </td>
                                                                             </tr>
                                                                             </tbody>

                                                                         </table>
                                                                     </div>
                                                                 </div>
                                                            ) : null }


                                                            { typeRapport === "SPECIFIC" ? (
                                                                 <div className={"SPECIFIC"}>

                                                              {/*  <div style={{width:"100%"}} >
                                                                    <h4> 1. {t("Rappels")}  </h4>

                                                                    <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                           role="grid" aria-describedby="kt_table_1_info"
                                                                           style={{width: "952px"}}>
                                                                        <thead>
                                                                        <tr role="row">

                                                                            <th className="sorting" tabIndex="0"
                                                                                aria-controls="kt_table_1"
                                                                                aria-label="Country: activate to sort column ascending">
                                                                                {t("Objectifs")}
                                                                            </th>
                                                                            <th className="sorting" tabIndex="0"
                                                                                aria-controls="kt_table_1"
                                                                                aria-label="Country: activate to sort column ascending">
                                                                                {t("Indicateurs")}
                                                                            </th>
                                                                            <th className="sorting" tabIndex="0"
                                                                                aria-controls="kt_table_1"
                                                                                style={{textAlign: "center"}}
                                                                                aria-label="Country: activate to sort column ascending">
                                                                                {t("Normes")}
                                                                            </th>

                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        <tr>
                                                                            <td  style={{ fontWeight:"bold"}}> {t("Traitement des réclamations de gravité faible et moyenne")}  </td>
                                                                            <td  style={{ fontWeight:"bold"}}> {t("Taux de résolution rapide des plaintes")}  </td>
                                                                            <td  style={{textAlign:"center", fontWeight:"bold"}} > 5% </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} > {t("Amélioration de la satisfaction des consommateurs")}  </td>
                                                                            <td  style={{fontWeight:"bold"}} > {t("Taux de satisfaction des plaignants")}  </td>
                                                                            <td  style={{textAlign:"center", fontWeight:"bold"}}> 4.5% </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} > {t("Traitement des réclamations de grande gravité")}  </td>
                                                                            <td  style={{fontWeight:"bold"}} > {t("Taux de résolution rapide des plaintes très graves")}  </td>
                                                                            <td  style={{textAlign:"center", fontWeight:"bold"}}> 2.1% </td>
                                                                        </tr>
                                                                        </tbody>
                                                                        <tfoot>
                                                                        <tr>
                                                                            <th>{t("Objectifs")}</th>
                                                                            <th>{t("Indicateurs")}</th>
                                                                            <th style={{textAlign: "center"}}>{t("Normes")}</th>
                                                                        </tr>
                                                                        </tfoot>
                                                                    </table>

                                                                </div>
                                                                <br/>*/}


                                                                <div style={{width:"100%"}}>
                                                                    <h4> {t("Données relatives aux institutions")}  </h4>

                                                                    <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                           role="grid" aria-describedby="kt_table_1_info"
                                                                           style={{width: "952px"}}>
                                                                        <thead>
                                                                        <tr>
                                                                            <th
                                                                                colSpan={"2"} rowSpan={"2"}
                                                                                className="sorting" tabIndex="0"
                                                                                aria-controls="kt_table_1"
                                                                                aria-label="Country: activate to sort column ascending" >
                                                                                {t("Libellés")}
                                                                            </th>
                                                                            {
                                                                                props.plan === "MACRO" ? (
                                                                                    <th colSpan={labelTable.length} className="sorting" tabIndex="0"
                                                                                        aria-controls="kt_table_1"
                                                                                        style={{textAlign: "center"}}
                                                                                        aria-label="Country: activate to sort column ascending">
                                                                                        {t("Institutions")}
                                                                                    </th>
                                                                                ) : null
                                                                            }
                                                                            {
                                                                                props.plan === "PRO" ? (
                                                                                    <th colSpan={labelTable.length} className="sorting" tabIndex="0"
                                                                                        aria-controls="kt_table_1"
                                                                                        style={{textAlign: "center"}}
                                                                                        aria-label="Country: activate to sort column ascending">
                                                                                        {t("Agences")}
                                                                                    </th>
                                                                                ) : null
                                                                            }

                                                                        </tr>
                                                                        <tr role="row">

                                                                            {
                                                                                labelTable.length ? (
                                                                                    labelTable.map((item, index) => (
                                                                                        <th key={index}  className="sorting" tabIndex="0"
                                                                                             aria-controls="kt_table_1"
                                                                                             style={{textAlign: "center"}}
                                                                                             aria-label="Country: activate to sort column ascending">
                                                                                            {item}
                                                                                        </th>
                                                                                    ))

                                                                                ) : (
                                                                                    <th  tabIndex="0" colSpan={labelTable.length}
                                                                                         aria-controls="kt_table_1"
                                                                                         style={{textAlign: "center"}} > - </th>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                        <tr>
                                                                            <td  style={{ fontWeight:"bold"}} colSpan={2}> {t("Nombre de plaintes reçues")}  </td>
                                                                            {
                                                                                labelTable.length ? (
                                                                                    unitFilters.map((item, index) => (
                                                                                        <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                            {parseSpecificReportTable(statistics, "TotalClaimsReceived", item.value)}
                                                                                        </td>
                                                                                    ))

                                                                                ) : (
                                                                                    <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} colSpan={2}> {t("Nombre de plaintes traitées")}  </td>
                                                                            {
                                                                                labelTable.length ? (
                                                                                    unitFilters.map((item, index) => (
                                                                                        <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                            {parseSpecificReportTable(statistics, "TotalClaimsResolved", item.value)}
                                                                                        </td>
                                                                                    ))

                                                                                ) : (
                                                                                    <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} colSpan={2}> {t("Nombre de plaintes non traitées")}  </td>
                                                                            {
                                                                                labelTable.length ? (
                                                                                    unitFilters.map((item, index) => (
                                                                                        <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                            {parseSpecificReportTable(statistics, "TotalClaimsUnresolved", item.value)}
                                                                                        </td>
                                                                                    ))

                                                                                ) : (
                                                                                    <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} colSpan={2}> {t("Nombre de plaintes traitées dans les délais")}  </td>
                                                                            {
                                                                                labelTable.length ? (
                                                                                    unitFilters.map((item, index) => (
                                                                                        <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                            {parseSpecificReportTable(statistics, "TotalClaimResolvedOnTime", item.value)}
                                                                                        </td>
                                                                                    ))

                                                                                ) : (
                                                                                    <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} colSpan={2}> {t("Nombre de plaintes traitées en retard")}  </td>
                                                                            {
                                                                                labelTable.length ? (
                                                                                    unitFilters.map((item, index) => (
                                                                                        <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                            {parseSpecificReportTable(statistics, "TotalClaimResolvedLate", item.value)}
                                                                                        </td>
                                                                                    ))

                                                                                ) : (
                                                                                    <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} colSpan={2}> {t("Nombre de clients notifiés après traitement")}  </td>
                                                                            {
                                                                                labelTable.length ? (
                                                                                    unitFilters.map((item, index) => (
                                                                                        <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                            {parseSpecificReportTable(statistics, "ClientContactedAfterTreatment", item.value)}
                                                                                        </td>
                                                                                    ))

                                                                                ) : (
                                                                                    <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} colSpan={2}> {t("Taux de satisfaction")}  </td>
                                                                            {
                                                                                labelTable.length ? (
                                                                                    unitFilters.map((item, index) => (
                                                                                        <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                            {parseSpecificReportTable(statistics, "RateOfClaimsSatisfaction", item.value, "taux") + " % "}
                                                                                        </td>
                                                                                    ))

                                                                                ) : (
                                                                                    <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                       <tr>
                                                                            <td  style={{fontWeight:"bold"}} rowSpan={3}> {t("Objets de plaintes les plus récurrents")} </td>
                                                                            <td  style={{fontWeight:"bold"}} > {t("1er")}  </td>
                                                                           {
                                                                               labelTable.length ? (
                                                                                   objectRankOne.map((item, index) => (
                                                                                       <td  style={{textAlign:"center", fontWeight:"bold"}}> {item} </td>
                                                                                   ))

                                                                               ) : (
                                                                                   <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                               )
                                                                           }
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} > {t("2eme")}  </td>
                                                                            {
                                                                                labelTable.length ? (
                                                                                    objectRankTwo.map((item, index) => (
                                                                                        <td  style={{textAlign:"center", fontWeight:"bold"}}> {item} </td>
                                                                                    ))

                                                                                ) : (
                                                                                    <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                        <tr>
                                                                            <td  style={{fontWeight:"bold"}} > {t("3eme")}  </td>
                                                                            {
                                                                                labelTable.length ? (
                                                                                    objectRankThree.map((item, index) => (
                                                                                        <td  style={{textAlign:"center", fontWeight:"bold"}}> {item} </td>
                                                                                    ))

                                                                                ) : (
                                                                                    <td colSpan={labelTable.length} style={{textAlign:"center", fontWeight:"bold"}} > - </td>
                                                                                )
                                                                            }
                                                                        </tr>

                                                                        </tbody>
                                                                        <tfoot>
                                                                        <tr>
                                                                            <th colSpan={2}>{t("Libellés")}</th>
                                                                            {
                                                                                props.plan === "MACRO" ? (
                                                                                    <th colSpan={labelTable.length} style={{textAlign: "center"}}>{t("Institutions")}</th>
                                                                                ) : null
                                                                            }
                                                                            {
                                                                                props.plan === "PRO" ? (
                                                                                    <th colSpan={labelTable.length} style={{textAlign: "center"}}>{t("Agences")}</th>
                                                                                ) : null
                                                                            }
                                                                        </tr>
                                                                        </tfoot>
                                                                    </table>

                                                                </div>
                                                                <br/>
                                                                <div style={{display:"none"}} className="">
                                                                         <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                                role="grid" aria-describedby="kt_table_1_info"
                                                                                style={{width: "952px"}}>
                                                                             <thead>
                                                                             <tr role="row">
                                                                                 <th className="sorting" tabIndex="0"
                                                                                     aria-controls="kt_table_1"
                                                                                     style={{textAlign: "center"}}
                                                                                     aria-label="Country: activate to sort column ascending">
                                                                                     <label style={{color: "#48465b", textDecoration: "underline"}}><h6>{t("Raisons du retard dans le traitement des réclamations :")}</h6></label>
                                                                                 </th>
                                                                                 <th className="sorting" tabIndex="0"
                                                                                     aria-controls="kt_table_1"
                                                                                     style={{textAlign: "center"}}
                                                                                     aria-label="Country: activate to sort column ascending">
                                                                                     <label style={{color: "#48465b", textDecoration: "underline"}}><h6>{t("Commentaires / Synthèse générale :")}</h6></label>
                                                                                 </th>
                                                                             </tr>
                                                                             </thead>
                                                                             <tbody>
                                                                             <tr>
                                                                                 <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                     {commentOne}
                                                                                 </td>
                                                                                 <td  style={{textAlign:"center", fontWeight:"bold"}} >
                                                                                     {commentTwo}
                                                                                 </td>
                                                                             </tr>
                                                                             </tbody>

                                                                         </table>
                                                                     </div>
                                                            </div>
                                                            ) : null }


                                                        </div>

                                                </div>

                                                <div className="alert alert-secondary mt-4" role="alert">
                                                    <div className="row ">
                                                        <div className="col-md-6">
                                                            <label style={{color: "#48465b", textDecoration: "underline"}}><h6>{t("Raisons du retard dans le traitement des réclamations :")}</h6></label>
                                                            <textarea name="" id="" onChange={handleCommentOne} cols="20" value={commentOne} rows="7" style={{outline: "none", padding:"10px", border: "1px solid #48465b38", width:"100%"}}>  </textarea>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label style={{color: "#48465b", textDecoration: "underline"}}><h6>{t("Commentaires / Synthèse générale :")}</h6></label>
                                                            <textarea name="" id="" onChange={handleCommentTwo}  cols="20" value={commentTwo} rows="7" style={{outline: "none",padding:"10px", border: "1px solid #48465b38", width:"100%"}}> </textarea>
                                                        </div>
                                                    </div>
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
};

const mapStateToProps = state => {
    return {
        plan: state.plan.plan,
        userPermissions: state.user.user.permissions,
        activePilot: state.user.user.staff.is_active_pilot
    };
};

export default connect(mapStateToProps)(ClaimReportingUemoaHeight);
