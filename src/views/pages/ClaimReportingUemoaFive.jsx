import React, {useEffect, useState, useRef} from "react";
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
    loadCss, reduceCharacter, removeNullValueInObject,
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
import HtmlDescriptionDiv from "../components/DescriptionDetail/HtmlDescriptionDiv";


loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ClaimReportingUemoaFive = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    if (!(verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-any-institution') || verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-my-institution')))
        window.location.href = ERROR_401;

    const [load, setLoad] = useState(false);
    const [loadFilter, setLoadFilter] = useState(false);

    const [loadDownloadPdf, setLoadDownloadPdf] = useState(false);

    const [claims, setClaims] = useState([]);
    const [receivedClaims, setReceivedClaims] = useState([]);
    const [treatedClaims, setTreatedClaims] = useState([]);
    const [unresolvedClaims, setUnresolvedClaims] = useState([]);
    const [currentInstitution, setCurrentInstitution] = useState({});
    const [country, setCountry] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [libellePeriode, setLibellePeriode] = useState("");
    const [numberPerPage, setNumberPerPage] = useState(10);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [dateStart, setDateStart] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [dateEnd, setDateEnd] = useState(moment().format('YYYY-MM-DD'));
    const defaultError = {
        date_start: [],
        date_end: [],
        institution_targeted_id: [],
        claim_category_id: [],
        claim_object_id: [],
        request_channel_slug: [],
        unit_targeted_id: [],
        responsible_unit_id: [],
        account_type_id: [],
        status: [],
        relationShip: [],
        number_of_claims_litigated_in_court: [],
        total_amount_of_claims_litigated_in_court: [],

    };

    const defaultData = {
        number_of_claims_litigated_in_court: null,
        total_amount_of_claims_litigated_in_court: null,
    };


    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [loadDownload, setLoadDownload] = useState(false);
    const [institution, setInstitution] = useState(null);
    const [institutions, setInstitutions] = useState([]);

    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(null);

    const [objects, setObjects] = useState([]);
    const [object, setObject] = useState(null);

    const [canals, setCanals] = useState([]);
    const [canal, setCanal] = useState(null);

    const [clientTypes, setClientTypes] = useState([]);
    const [clientType, setClientType] = useState(null);

    const [units, setUnits] = useState([]);
    const [unit, setUnit] = useState(null);

    const [responsibles, setResponsibles] = useState([]);
    const [responsible, setResponsible] = useState(null);

    const [statutes, setStatutes] = useState([]);
    const [status, setStatus] = useState(null);

    const [relations, setRelations] = useState([]);
    const [relation, setRelation] = useState(null);

    const [filterObjectData, setFilterObjectData] = useState([]);
    const [filterUnitsData, setFilterUnitsData] = useState([]);
    const [filterResponsiblesData, setFilterResponsiblesData] = useState([]);

    const fetchData = async (click = false) => {
        setLoadFilter(true);
        setLoad(true);
        let endpoint = "";
        let sendData = {};
        if (verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-any-institution')) {
            if (props.plan === "MACRO")
                endpoint = `${appConfig.apiDomaine}/any/uemoa/global-state-report`;
            else
                endpoint = `${appConfig.apiDomaine}list-regulatory-reporting-claim-my-institution`;
            sendData = {
                date_start: dateStart ? dateStart : null,
                date_end: dateEnd ? dateEnd : null,
                institution_id: institution ? institution.value : null,
                number_of_claims_litigated_in_court: null,
                total_amount_of_claims_litigated_in_court: null,
            };
            if (props.plan === "HUB") {
                delete sendData.unit_targeted_id;
                delete sendData.account_type_id;
            } else
                delete sendData.relationShip
        } else if (verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-my-institution')) {
            endpoint = `${appConfig.apiDomaine}/my/reporting-claim/regulatory-state`;
            sendData = {
                date_start: dateStart ? dateStart : null,
                date_end: dateEnd ? dateEnd : null,
                institution_id: institution ? institution.value : null,
                number_of_claims_litigated_in_court: data.number_of_claims_litigated_in_court != null ? data.number_of_claims_litigated_in_court : null,
                total_amount_of_claims_litigated_in_court: data.total_amount_of_claims_litigated_in_court != null ? data.total_amount_of_claims_litigated_in_court : null,
            };
        }
        await axios.post(endpoint, sendData)
            .then(response => {
                if (click)
                    ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(ready ? t("Filtre effectué avec succès") : ""));
                //console.log(response.data)
                /*setNumberPage(forceRound(response.data.length / numberPerPage));
                setShowList(response.data.slice(0, numberPerPage));*/
                setReceivedClaims(response.data.receivedClaims)
                setTreatedClaims(response.data.treatedClaims)
                setUnresolvedClaims(response.data.unresolvedClaims)
                setCurrentInstitution(response.data.institution)
                setLibellePeriode(response.data.libellePeriode)
                setCountry(response.data.country)
                setTitle(response.data.title)
                setDescription(response.data.description)
                setClaims(response.data);
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
                //console.log("Something is wrong");
            })
        ;
    };

    /*useEffect(() => {
        if (verifyTokenExpire())
            fetchData();
    }, []);*/

    useEffect(() => {
        var endpoint = "";
        if (verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-any-institution')) {
            if (props.plan === "MACRO")
                endpoint = `${appConfig.apiDomaine}/any/uemoa/data-filter`;
            else
                endpoint = `${appConfig.apiDomaine}/without/uemoa/data-filter`;
        }

        if (verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-my-institution'))
            endpoint = `${appConfig.apiDomaine}/my/uemoa/data-filter`;

        if (verifyTokenExpire()) {
            axios.get(endpoint)
                .then(response => {
                    setFilterObjectData(response.data.categories);
                    if (verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-any-institution')) {
                        setInstitutions(formatSelectOption(response.data.institutions, "name", false));
                        if (props.plan === "MACRO") {
                            setFilterUnitsData(response.data.agences);
                            setFilterResponsiblesData(response.data.functionTreating);
                        } else {
                            setResponsibles(formatSelectOption(response.data.functionTreating, 'name', 'fr'));
                            setRelations(formatSelectOption(response.data.relationShip, 'name', 'fr'));
                        }
                    }
                    if (verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-my-institution')) {
                        setUnits(formatSelectOption(response.data.agences, "name", "fr"));
                        setResponsibles(formatSelectOption(response.data.functionTreating, "name", "fr"));
                    }
                    setCategories(formatSelectOption(response.data.categories, "name", "fr"));
                    if (props.plan !== "HUB")
                        setClientTypes(formatSelectOption(response.data.clientTypes, "name", "fr"));
                    setCanals(formatSelectOption(response.data.requestChannels, "name", "fr", 'slug'));
                    setStatutes(formatStatus(response.data.status));
                })
                .catch(error => {
                    //console.log("Something is wrong")
                });
        }
        fetchData();
    }, []);

    const filterShowListBySearchValue = (value) => {
        value = getLowerCaseString(value);
        let newClaims = [...claims];
        newClaims = newClaims.filter(el => {
            return (
                getLowerCaseString(el.filiale ? el.filiale : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.account ? el.account : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.accountCurrency ? el.accountCurrency : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.agence ? el.agence : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.amountDisputed ? el.amountDisputed : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.amountDisputed ? el.amountDisputed : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.claimCategorie ? el.claimCategorie : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.claimObject ? el.claimObject : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.client ? el.client : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.commentClient ? el.commentClient : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.dateClosing ? el.dateClosing : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.dateQualification ? el.dateQualification : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.dateRegister ? el.dateRegister : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.dateTreatment ? el.dateTreatment : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.delayQualifWithWeekend ? el.delayQualifWithWeekend : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.delayTreatWithWeekend ? el.delayTreatWithWeekend : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.delayTreatWithoutWeekend ? el.delayTreatWithoutWeekend : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.functionTreating ? el.functionTreating : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.requestChannel ? el.requestChannel : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.solution ? el.solution : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.staffTreating ? el.staffTreating : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.status ? el.status : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.telephone ? el.telephone : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.relationShip ? el.relationShip : '-').indexOf(value) >= 0 ||
                getLowerCaseString(el.typeClient ? el.typeClient : '-').indexOf(value) >= 0
            )
        });

        return newClaims;
    };

    const searchElement = async (e) => {
        if (e.target.value) {
            setNumberPage(forceRound(filterShowListBySearchValue(e.target.value).length / NUMBER_ELEMENT_PER_PAGE));
            setShowList(filterShowListBySearchValue(e.target.value.toLowerCase()).slice(0, NUMBER_ELEMENT_PER_PAGE));
        } else {
            setNumberPage(forceRound(claims.length / NUMBER_ELEMENT_PER_PAGE));
            setShowList(claims.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setActiveNumberPage(1);
        }
    };

    const onChangeNumberPerPage = (e) => {
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
        setShowList(claims.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(claims.length / parseInt(e.target.value)));
    };

    const getEndByPosition = (position) => {
        let end = numberPerPage;
        for (let i = 1; i < position; i++) {
            end = end + numberPerPage;
        }
        return end;
    };

    const onClickPage = (e, page) => {
        e.preventDefault();
        setActiveNumberPage(page);
        setShowList(claims.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                claims.slice(
                    getEndByPosition(
                        activeNumberPage + 1) - numberPerPage,
                    getEndByPosition(activeNumberPage + 1)
                )
            );
        }
    };

    const onClickPreviousPage = (e) => {
        e.preventDefault();
        if (activeNumberPage >= 1) {
            setActiveNumberPage(activeNumberPage - 1);
            setShowList(
                claims.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                )
            );
        }
    };

    const handleDateEndChange = e => {
        setDateEnd(e.target.value);
    };

    const handleDateStartChange = e => {
        setDateStart(e.target.value);
    };

    const onChangeInstitution = (selected) => {
        setUnit(null);
        if (props.plan === "MACRO")
            setResponsible(null);
        if (selected === null) {
            setUnits([]);
            if (props.plan === "MACRO")
                setResponsibles([]);
        } else {
            if (props.plan === "MACRO") {
                const newUnits = filterUnitsData.filter(item => item.institution_id === selected.value);
                if (newUnits.length > 0)
                    setUnits(formatSelectOption(newUnits, 'name', 'fr'));
                else
                    setUnits([]);

                const newResponsibles = filterResponsiblesData.filter(item => item.institution_id === selected.value);
                if (newResponsibles.length > 0)
                    setResponsibles(formatSelectOption(newResponsibles, 'name', 'fr'));
                else
                    setResponsibles([]);
            }
        }
        setInstitution(selected);
    };

    const handleRecurencePeriod = (e) => {
        const newData = {...data};
        newData.number_of_claims_litigated_in_court = parseInt(e.target.value);
        setData(newData);
    };

    const handleMountTotal= (e) => {
        const newData = {...data};
        newData.total_amount_of_claims_litigated_in_court = parseInt(e.target.value);
        setData(newData);
    };

    const arrayNumberPage = () => {
        const pages = [];
        for (let i = 0; i < numberPage; i++) {
            pages[i] = i;
        }
        return pages
    };

    const filterReporting = () => {
        setLoadFilter(true);
        setLoad(true);
        if (verifyTokenExpire())
            fetchData(true);
    };


    const downloadReporting = async () => {
        setLoadDownload(true);
        let endpoint = "";
        let sendData = {};
        if (verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-any-institution')) {
            if (props.plan === "MACRO")
                endpoint = `${appConfig.apiDomaine}/any/uemoa/global-state-report`;
            else
                endpoint = `${appConfig.apiDomaine}/without/uemoa/global-state-report`;
            sendData = {
                date_start: dateStart ? dateStart : null,
                date_end: dateEnd ? dateEnd : null,
                institution_id: institution ? institution.value : null,
                claim_category_id: category ? category.value : null,
                claim_object_id: object ? object.value : null,
                request_channel_slug: canal ? canal.value : null,
                unit_targeted_id: unit ? unit.value : null,
                responsible_unit_id: responsible ? responsible.value : null,
                account_type_id: clientType ? clientType.value : null,
                status: status ? status.value : null,
                title: title ? title.value : null,
                description: description ? description.value : null,
                relationship_id: relation ? relation.value : null,
            };
        } else if (verifyPermission(props.userPermissions, 'list-regulatory-reporting-claim-my-institution')) {
            endpoint = `${appConfig.apiDomaine}/my/uemoa/global-state-report`;
            sendData = {
                date_start: dateStart ? dateStart : null,
                date_end: dateEnd ? dateEnd : null,
                claim_category_id: category ? category.value : null,
                claim_object_id: object ? object.value : null,
                request_channel_slug: canal ? canal.value : null,
                unit_targeted_id: unit ? unit.value : null,
                responsible_unit_id: responsible ? responsible.value : null,
                account_type_id: clientType ? clientType.value : null,
                status: status ? status.value : null,
                title: title ? title.value : null,
                description: description ? description.value : null,
            };
        }

        if (verifyTokenExpire()) {
            await axios({
                method: 'post',
                url: endpoint,
                responseType: 'json',
                data: removeNullValueInObject(sendData)
            })
                .then(async ({data}) => {
                    setError(defaultError);
                    const downloadButton = document.getElementById("downloadButton");
                    downloadButton.href = `${appConfig.apiDomaine}/download-uemoa-reports/${data.file}`;
                    downloadButton.click();
                    setLoadDownload(false);
                    // ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig('Téléchargement éffectuer avec succès'));
                })
                .catch(error => {
                    setError({
                        ...defaultError,
                        ...error.response.data.error
                    });
                    console.log("Something is wrong");
                    setLoadDownload(false);
                })
            ;
        }
    };

    const downloadReportingPdf = () => {

        pdfMake.vfs = pdfFonts.pdfMake.vfs;
        var headTable= document.getElementById("headRapport")
        var footTable = document.getElementById("footRapport")
        var tablePdf = document.getElementById("myTable")
        var val = htmlToPdfmake(headTable.innerHTML + tablePdf.innerHTML + footTable.innerHTML);
        var dd = {content:val};
        pdfMake.createPdf(dd).download();


    }

    const pages = arrayNumberPage();

    const printBodyTable = (claim, index) => {
        return (
            <tr style={{textAlign:"center"}} key={index} role="row" className="odd">
                <td >{index + 1}</td>
                <td> { claim.reference ? claim.reference : ""} </td>
                <td> { claim.claim_object && claim.claim_object.name ?  claim.claim_object.name.fr : "-"} </td>
                {/*<td><HtmlDescriptionDiv message={claim.description}/></td>*/}
                <td> { claim.plain_text_description ? claim.plain_text_description : ""} </td>
            </tr>
        );
    };

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
                                        {t("Etat réglementaire")}
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
                                title={t("Rapport état réglementaire")}
                            />

                            <div className="kt-portlet__body">

                                <div className="row">
                                    <div className="col">
                                        { verifyPermission(props.userPermissions, 'list-reporting-claim-any-institution') ? (
                                            <div className="col-md-12">
                                                <div
                                                    className={error.institution_targeted_id.length ? "form-group validated" : "form-group"}>
                                                    <label htmlFor="">Institution</label>
                                                    <Select
                                                        isClearable
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
                                        ) : null}
                                    </div>
                                </div>


                                {props.plan !== "HUB" ? (
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
                                                        filename="rapport_etat_reglementaire"
                                                        sheet="etat_reglementaire"
                                                        buttonText="EXCEL"/>
                                                    /*<button onClick={downloadReporting} className="btn btn-secondary ml-3"
                                                            disabled={(loadFilter || loadDownloadPdf)}>EXCEL</button>*/
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
                                      {/*      <div className="row">
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

                                                <div style={{display:"none"}} id={"headRapport"} className="headRapport mt-5">
                                                    <div className="mb-5" style={{textAlign:"justify"}}>
                                                        <h6 style={{textAlign:"center"}}> { title.toUpperCase() ? title.toUpperCase() : "-"}  DU {moment(dateStart).format('DD/MM/YYYY') + " À " +  moment(dateEnd).format('DD/MM/YYYY')} </h6>
                                                        <p style={{textAlign:"left"}}> { description ? description : "-"} </p>
                                                    </div>
                                                    <p>
                                                        <span style={{fontWeight:"bold", fontSize:"13px", textDecoration:"underline"}} className={"mr-2"} >{t("Pays")}:</span>
                                                        <span> { country ? country : "-"} </span>
                                                    </p>
                                                    <p>
                                                        <span style={{fontWeight:"bold", fontSize:"13px", textDecoration:"underline"}} className={"mr-2"} >{t("Etablissement Déclarant")}:</span>
                                                        <span> { currentInstitution.name ? currentInstitution.name : "-"} </span>
                                                    </p>
                                                    <p>
                                                        <span style={{fontWeight:"bold", fontSize:"13px", textDecoration:"underline"}} className={"mr-2"} >{t("Période")}:</span>
                                                        <span> { libellePeriode ? libellePeriode : "-"}</span>
                                                    </p>
                                                </div>

                                                <div id="myTable"  className="col-sm-12">
                                                    <table id="myExcel"
                                                        className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                       role="grid" aria-describedby="kt_table_1_info"
                                                        style={{width: "952px"}}>
                                                        <thead>
                                                        <tr role="row">
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1" rowSpan="1" colSpan="1"
                                                                style={{textAlign:"center"}}
                                                                aria-label="Country: activate to sort column ascending">
                                                                {t("Nº")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1" rowSpan="1" colSpan="1"
                                                                style={{textAlign:"center"}}
                                                                aria-label="Country: activate to sort column ascending">
                                                                {t("Référence")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1" rowSpan="1" colSpan="1"
                                                                style={{textAlign:"center"}}
                                                                aria-label="Country: activate to sort column ascending">
                                                                {t("Produits ou services concernés")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1" rowSpan="1" colSpan="1"
                                                                style={{textAlign:"center"}}
                                                                aria-label="Country: activate to sort column ascending">
                                                                {t("Résumé synthétique de la réclamation")}
                                                            </th>

                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        <tr>
                                                            <td  style={{ textAlign:"center",fontWeight:"bold", color:"lavenderblush", background:"lightslategray"}} colSpan="4"> {t("RÉCLAMATIONS RECUES AU COURS DU ")}  { libellePeriode ? libellePeriode : "-"} </td>
                                                        </tr>
                                                        {
                                                           receivedClaims.length ? (
                                                               receivedClaims.length ? (
                                                                   receivedClaims.map((claim, index) => (
                                                                        printBodyTable(claim, index)
                                                                    ))
                                                                ) : (
                                                                   receivedClaims.map((claim, index) => (
                                                                        printBodyTable(claim, index)
                                                                    ))
                                                                )
                                                            ) : (
                                                                <EmptyTable colSpan={4}/>
                                                            )
                                                        }


                                                        <tr>
                                                            <td  style={{textAlign:"center",color:"lavenderblush", background:"lightslategray", fontWeight:"bold"}} colSpan="4"> {t("RÉCLAMATIONS TRAITÉES AU COURS DU ")} { libellePeriode ? libellePeriode : "-"} </td>
                                                        </tr>
                                                        {
                                                            treatedClaims.length ? (
                                                                treatedClaims.length ? (
                                                                    treatedClaims.map((claim, index) => (
                                                                        printBodyTable(claim, index)
                                                                    ))
                                                                ) : (
                                                                    treatedClaims.map((claim, index) => (
                                                                        printBodyTable(claim, index)
                                                                    ))
                                                                )
                                                            ) : (
                                                                <EmptyTable colSpan={4}/>
                                                            )
                                                        }

                                                        <tr>
                                                            <td  style={{textAlign:"center",color:"lavenderblush", background:"lightslategray", fontWeight:"bold"}} colSpan="4"> {t("RÉCLAMATIONS NON RÉSOLUES OU EN SUSPENS DU")} { libellePeriode ? libellePeriode : "-"} </td>
                                                        </tr>
                                                        {
                                                            unresolvedClaims.length ? (
                                                                unresolvedClaims.length ? (
                                                                    unresolvedClaims.map((claim, index) => (
                                                                        printBodyTable(claim, index)
                                                                    ))
                                                                ) : (
                                                                    unresolvedClaims.map((claim, index) => (
                                                                        printBodyTable(claim, index)
                                                                    ))
                                                                )
                                                            ) : (
                                                                <EmptyTable colSpan={4}/>
                                                            )
                                                        }
                                                        </tbody>
                                                        <tfoot>
                                                        <tr>
                                                            <th  style={{textAlign:"center"}} rowSpan="1" colSpan="1">{t("Nº")}</th>
                                                            <th  style={{textAlign:"center"}} rowSpan="1" colSpan="1">{t("Référence")}</th>
                                                            <th  style={{textAlign:"center"}} rowSpan="1" colSpan="1">{t("Produits ou services concernés")}</th>
                                                            <th  style={{textAlign:"center"}} rowSpan="1" colSpan="1">{t("Résumé synthétique de la réclamation")}</th>

                                                        </tr>
                                                        </tfoot>
                                                    </table>

                                                </div>

                                                <div style={{display:"none"}} id={"footRapport"} className="footRapport mt-5">
                                                    <p>
                                                        <span style={{fontWeight:"bold", fontSize:"13px", textDecoration:"underline"}} className={"mr-2"} >{t("Nombre de réclamations faisant l'objet de contentieux pendants devant les tribunaux :")}</span>
                                                        <span> {data.number_of_claims_litigated_in_court} </span>
                                                    </p>
                                                    <p>
                                                        <span style={{fontWeight:"bold", fontSize:"13px", textDecoration:"underline"}} className={"mr-2"} >{t("Montant Total des réclamations faisant l'objet de contentieux pendants devant les tribunaux :")}</span>
                                                        <span> {data.total_amount_of_claims_litigated_in_court}</span>
                                                    </p>
                                                </div>

                                            </div>

                                          {/*  <div className="row">
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
                                            </div>*/}



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

export default connect(mapStateToProps)(ClaimReportingUemoaFive);
