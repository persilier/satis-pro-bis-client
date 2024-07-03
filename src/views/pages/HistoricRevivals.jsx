import React, {useCallback, useEffect, useState} from "react";
import {
    displayStatus,
    forceRound,
    formatDateToTimeStampte,
    formatSelectOption,
    getLowerCaseString,
    loadCss
} from "../../helpers/function";
import {connect} from "react-redux";
import {useTranslation} from "react-i18next";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import HeaderTablePage from "../components/HeaderTablePage";
import LoadingTable from "../components/LoadingTable";
import EmptyTable from "../components/EmptyTable";
import HtmlDescriptionModal from "../components/DescriptionDetail/HtmlDescriptionModal";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import Pagination from "../components/Pagination";
import Select from "react-select";
import {getHistoricRevivals, getStaffs} from "../../http/crud";
import HtmlDescription from "../components/DescriptionDetail/HtmlDescription";
import RelaunchModal from "../components/RelaunchModal";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const HistoricRevivals = (props) => {
    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - " + (ready ? t("Paramètre Historique") : "");

    if (!verifyPermission(props.userPermissions, "list-unit-revivals") || !verifyPermission(props.userPermissions, "list-staff-revivals")) {
        window.location.href = ERROR_401;
    }

    const defaultError = {
        staff: []
    };

    const [load, setLoad] = useState(false);
    const [loadSelect, setLoadSelect] = useState(false);
    const [error, setError] = useState(defaultError);
    const [revivals, setRevivals] = useState([]);
    const [staff, setStaff] = useState(null);
    const [staffs, setStaffs] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [numberPerPage, setNumberPerPage] = useState(NUMBER_ELEMENT_PER_PAGE);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [total, setTotal] = useState(0);
    const [nextUrl, setNextUrl] = useState(null);
    const [prevUrl, setPrevUrl] = useState(null);


    const fetchData = useCallback(
        (staffId) => {
            setLoad(true);
            getHistoricRevivals(props.userPermissions, numberPerPage, activeNumberPage, staffId)
                .then(response => {
                    console.log(response.data.data);
                    setNumberPage(forceRound(response.data.total/numberPerPage));
                    setShowList(response.data.data.slice(0, numberPerPage));
                    setRevivals(response.data["data"]);
                    setTotal(response.data.total);
                    setPrevUrl(response.data["prev_page_url"]);
                    setNextUrl(response.data["next_page_url"]);
                })
                .catch(error => {
                    console.error(error.message);
                })
                .finally(() => setLoad(false));
        }, [numberPerPage, activeNumberPage]
    )

    useEffect(() => {
        setLoadSelect(true);
        getStaffs(props.userPermissions)
            .then(response => {
                console.log(response.data);
                setStaffs(formatStaffsOption(response.data.staffs))
            })
            .catch(error => {
                console.error(error.message);
            }).finally(() => setLoadSelect(false));
    },  []);

    useEffect(() => {
        fetchData(props.userStaff.is_lead === true ? null : props.userStaff.id);
    }, [fetchData]);

    const formatStaffsOption = function (options) {
        const newOptions = [];
        for (let i = 0; i < options.length; i++) {
            newOptions.push({value: (options[i])["id"], label: `${(options[i])["identite"]["firstname"]} ${(options[i])["identite"]["lastname"]}`});
        }
        return newOptions;
    };

    const searchElement = async (e) => {
        if (e.target.value) {
            setLoad(true);
/*            getHistoricRevivals(props.userPermissions, numberPerPage, activeNumberPage, props.userStaff.is_lead === true ? null : props.userStaff.id, getLowerCaseString(e.target.value))
                .then(response => {
                    console.log(response.data.data);
                    setNumberPage(forceRound(response.data.total/numberPerPage));
                    setShowList(response.data.data.slice(0, numberPerPage));
                    setRevivals(response.data["data"]);
                    setTotal(response.data.total);
                    setPrevUrl(response.data["prev_page_url"]);
                    setNextUrl(response.data["next_page_url"]);
                })
                .catch(error => {
                    console.error(error.message);
                })
                .finally(() => setLoad(false));*/
        }
    }
    const onChangeNumberPerPage = (e) => {
        e.persist();
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
    };

    const onClickPage = (e, page) => {
        e.preventDefault();
        setActiveNumberPage(page);
        setLoad(true);
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage && nextUrl !== null) {
            setActiveNumberPage(activeNumberPage + 1);
        }
    };

    const onClickPreviousPage = (e) => {
        e.preventDefault();
        if (activeNumberPage >= 1 && prevUrl !== null) {
            setActiveNumberPage(activeNumberPage - 1);
        }
    };

    const showModal = (message) => {
        setCurrentMessage(message);
        document.getElementById("button_modal").click();
    };

    const onChangeStaff = (selected) => {
        setStaff(selected);
        //console.log(selected);
        if (selected === null)
            fetchData(props.userStaff.is_lead === true ? null : props.userStaff.id);
    }

    const onClickFilter = async (e) => {
        e.preventDefault();
        console.log(staff);
        if (staff)
            fetchData(staff?.value);
        else {
            setError({...defaultError, staff: ["Veuillez choisir un staff"]});
            console.log(error);
        }
    }

    const printBodyTable = (revival, index) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>
                    {
                        revival?.claim?.reference ? revival.claim.reference : ""
                    }
                </td>
                <td>
                    {
                        `${revival?.created_by?.identite?.firstname ? revival.created_by.identite.firstname : ""} ${revival?.created_by?.identite?.lastname ? revival.created_by.identite.lastname : ""}`
                    }
                </td>
                <td>
                    {
                        formatDateToTimeStampte(revival.created_at)
                    }
                </td>
                <td>
                    {
                        (revival?.claim_status ? revival.claim_status : "") === "archived" ?
                            <span className="kt-badge kt-badge--inline kt-badge--dark h2">{t("Archivé")}</span>
                            : (revival?.claim_status ? revival.claim_status : "") === "validated" ?
                            <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Validé")}</span>
                            :  (revival?.claim_status ? revival.claim_status : "") === "incomplete" ?
                                <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("Incomplète")}</span>
                                :  (revival?.claim_status ? revival.claim_status : "") === "full" ?
                                    <span className="kt-badge kt-badge--inline kt-badge--primary h2">{t("Complète")}</span>
                                    :  (revival?.claim_status ? revival.claim_status : "") === "transferred_to_unit" ?
                                        <span className="kt-badge kt-badge--inline kt-badge--unified-dark h2">{t("Transférer à une unité")}</span>
                                        :  (revival?.claim_status ? revival.claim_status : "") === "assigned_to_staff" ?
                                            <span className="kt-badge kt-badge--inline kt-badge--info h2">{t("Assigner à un staff")}</span>
                                            :  (revival?.claim_status ? revival.claim_status : "") === "treated" ?
                                                <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Traité")}</span>
                                                :  (revival?.claim_status ? revival.claim_status : "") === "considered" ?
                                                    <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Considéré")}</span>
                                                    :  (revival?.claim_status ? revival.claim_status : "") === "awaiting" ?
                                                        <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("En attente")}</span>
                                                        :  <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("En cours de traitement")}</span>
                    }
                  {/*  {
                        revival?.claim_status ? displayStatus(revival.claim_status) : ""
                    }*/}
                </td>
                <td>
                    {
                        `${revival?.staff?.identite?.firstname ? revival.staff.identite.firstname : ""} ${revival?.staff?.identite?.lastname ? revival.staff.identite.lastname : ""}`

                    }
                </td>
                <td>
                    {
                        (revival?.status ? revival.status : "") === "archived" ?
                            <span className="kt-badge kt-badge--inline kt-badge--dark h2">{t("Archivé")}</span>
                            : (revival?.status ? revival.status : "") === "validated" ?
                            <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Validé")}</span>
                            :  (revival?.status ? revival.status : "") === "incomplete" ?
                                <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("Incomplète")}</span>
                                :  (revival?.status ? revival.status : "") === "full" ?
                                    <span className="kt-badge kt-badge--inline kt-badge--primary h2">{t("Complète")}</span>
                                    :  (revival?.status ? revival.status : "") === "transferred_to_unit" ?
                                        <span className="kt-badge kt-badge--inline kt-badge--unified-dark h2">{t("Transférer à une unité")}</span>
                                        :  (revival?.status ? revival.status : "") === "assigned_to_staff" ?
                                            <span className="kt-badge kt-badge--inline kt-badge--info h2">{t("Assigner à un staff")}</span>
                                            :  (revival?.status ? revival.status : "") === "treated" ?
                                                <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Traité")}</span>
                                                :  (revival?.status ? revival.status : "") === "considered" ?
                                                    <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Considéré")}</span>
                                                    :  (revival?.status ? revival.status : "") === "awaiting" ?
                                                        <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("En attente")}</span>
                                                        :  <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("En cours de traitement")}</span>
                    }
                  {/*  {
                        revival?.status ? displayStatus(revival.status) : ""
                    }*/}
                </td>
                <td>
                    {
                        ( revival?.claim?.status ? revival.claim.status : "" ) === "archived" ?
                            <span className="kt-badge kt-badge--inline kt-badge--dark h2">{t("Archivé")}</span>
                            : ( revival?.claim?.status ? revival.claim.status : "" ) === "validated" ?
                            <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Validé")}</span>
                            :  ( revival?.claim?.status ? revival.claim.status : "" ) === "incomplete" ?
                                <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("Incomplète")}</span>
                                :  ( revival?.claim?.status ? revival.claim.status : "" ) === "full" ?
                                    <span className="kt-badge kt-badge--inline kt-badge--primary h2">{t("Complète")}</span>
                                    :  ( revival?.claim?.status ? revival.claim.status : "" ) === "transferred_to_unit" ?
                                        <span className="kt-badge kt-badge--inline kt-badge--unified-dark h2">{t("Transférer à une unité")}</span>
                                        :  ( revival?.claim?.status ? revival.claim.status : "" ) === "assigned_to_staff" ?
                                            <span className="kt-badge kt-badge--inline kt-badge--info h2">{t("Assigner à un staff")}</span>
                                            :  ( revival?.claim?.status ? revival.claim.status : "" ) === "treated" ?
                                                <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Traité")}</span>
                                                :  ( revival?.claim?.status ? revival.claim.status : "" ) === "considered" ?
                                                    <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Considéré")}</span>
                                                    :  ( revival?.claim?.status ? revival.claim.status : "" ) === "awaiting" ?
                                                        <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("En attente")}</span>
                                                        :  <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("En cours de traitement")}</span>
                    }
                   {/* {
                        revival?.claim?.status ? displayStatus(revival.claim.status) : ""
                    }*/}
                </td>
                <td style={{textAlign: 'center'}}>
                    <HtmlDescription onClick={() => showModal(revival?.message ? revival.message : "-")}/>
                </td>
                <td>
                    {
                        verifyPermission(props.userPermissions, "revive-staff") &&  ((props.userStaff.is_lead === true) || (props.userStaff.is_active_pilot === true)) ? (
                        <>
                            <a type="button" data-keyboard="false" data-backdrop="static" data-toggle="modal" data-target="#kt_modal_4"
                               className={`btn btn-sm btn-clean btn-icon btn-icon-md ${revival?.status === "considered" && "disabled"}`}

                               title={t("Relancer")}
                            >
                                <i className="la la-bullhorn"/>
                            </a>
                            <RelaunchModal id={revival?.claim?.id ? revival.claim.id : ''} onClose={() => {}}/>
                        </>

                        ) : null
                    }
                    {
                        /*verifyPermission(props.userPermissions, "assignment-claim-awaiting-treatment") ? (*/
                            <a href={`/monitoring/claims/staff/${revival?.claim?.id}/detail`}
                               className="btn btn-sm btn-clean btn-icon btn-icon-md"
                               title={t("Détails")}>
                                <i className="la la-eye"/>
                            </a>
                        /*) : null*/
                    }
                </td>

            </tr>
        )
    }

    return (
        ready ? (
            <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">

                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-container  kt-container--fluid ">
                        <div className="kt-subheader__main">
                            <h3 className="kt-subheader__title">
                                {t("Historiques")}
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()}
                                   className="kt-subheader__breadcrumbs-link">
                                    {t("Relances")}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                    <div className="kt-portlet">
                        <HeaderTablePage
                            title={t("Relances")}
                        />

                        <div className="kt-portlet__body">
                                    <div id="kt_table_1_wrapper" className="dataTables_wrapper dt-bootstrap4">

                                        {
                                            props.userStaff.is_lead === true ? (
                                                <div className="m-auto col-xl-4 col-lg-12 order-lg-3 order-xl-1">
                                                    <div className="" style={{marginBottom: "30px"}}>
                                                        <div className="kt-portlet__body" style={{padding: "10px 25px"}}>
                                                            <div className="kt-widget6">
                                                                <div className={error.staff.length ? "kt-widget6__body validated" : "kt-widget6__body"}>
                                                                    <div className={"kt-widget6__item row"} style={{padding: "0.5rem 0"}}>
                                                                        <div className="col-lg-1">{t("Agent")}</div>
                                                                        <div className={"col-lg-9"}>
                                                                            <Select
                                                                                value={staff}
                                                                                isClearable
                                                                                isLoading={loadSelect}
                                                                                onChange={onChangeStaff}
                                                                                placeholder={t("Veuillez sélectionner l'agent")}
                                                                                options={staffs}
                                                                            />
                                                                            {
                                                                                error.staff.length ? (
                                                                                    error.staff.map((error, index) => (
                                                                                        <div key={index}
                                                                                             className="invalid-feedback mb-2">
                                                                                            {error}
                                                                                        </div>
                                                                                    ))
                                                                                ) : null
                                                                            }
                                                                        </div>
                                                                        <div className="col-lg-2">
                                                                            {
                                                                                load ? (
                                                                                    <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--dark ml-3" type="button" disabled>
                                                                                        {t("Chargement")}...
                                                                                    </button>
                                                                                ) : (
                                                                                    <button type="submit" onClick={(e) => onClickFilter(e)} className="btn btn-primary">{t("Filtrer")}</button>

                                                                                )
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null
                                        }

                                        {/*<div className="row">
                                            <div className="col-sm-6 text-left">
                                                <div id="kt_table_1_filter" className="dataTables_filter">
                                                    <label>
                                                        {t("Recherche")}:
                                                        <input id="myInput" type="text"
                                                               onKeyUp={(e) => searchElement(e)}
                                                               className="form-control form-control-sm"
                                                               placeholder=""
                                                               aria-controls="kt_table_1"
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                        </div>*/}

                                        {
                                            load ? <LoadingTable/> : (
                                                <>

                                                    <div className="row">
                                                        <div className="col-sm-12">
                                                            <table
                                                                className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                                id="myTable" role="grid" aria-describedby="kt_table_1_info"
                                                                style={{width: "952px"}}>
                                                                <thead>
                                                                <tr role="row">
                                                                    <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                                        rowSpan="1"
                                                                        colSpan="1" style={{width: "70.25px"}}
                                                                        aria-label="Country: activate to sort column ascending">{t("Référence")}
                                                                    </th>
                                                                    <th className="sorting" tabIndex="0"
                                                                        aria-controls="kt_table_1"
                                                                        rowSpan="1"
                                                                        colSpan="1" style={{width: "80px"}}
                                                                        aria-label="Country: activate to sort column ascending">{t("Expéditeur")}
                                                                    </th>
                                                                    <th className="sorting" tabIndex="0"
                                                                        aria-controls="kt_table_1"
                                                                        rowSpan="1"
                                                                        colSpan="1" style={{width: "120px"}}
                                                                        aria-label="Country: activate to sort column ascending">{t("Date de relance")}
                                                                    </th>
                                                                    <th className="sorting" tabIndex="0"
                                                                        aria-controls="kt_table_1"
                                                                        rowSpan="1"
                                                                        colSpan="1" style={{width: "150px"}}
                                                                        aria-label="Country: activate to sort column ascending">{t("Statut avant relance")}
                                                                    </th>
                                                                    <th className="sorting" tabIndex="0"
                                                                        aria-controls="kt_table_1"
                                                                        rowSpan="1"
                                                                        colSpan="1" style={{width: "70.25px"}}
                                                                        aria-label="Country: activate to sort column ascending">
                                                                        {t("Staff relancé")}

                                                                    </th>

                                                                    <th className="sorting" tabIndex="0"
                                                                        aria-controls="kt_table_1"
                                                                        rowSpan="1"
                                                                        colSpan="1" style={{width: "150px"}}
                                                                        aria-label="Ship City: activate to sort column ascending">{t("Statut de la relance")}
                                                                    </th>

                                                                    <th className="sorting" tabIndex="0"
                                                                        aria-controls="kt_table_1"
                                                                        rowSpan="1"
                                                                        colSpan="1" style={{width: "50px"}}
                                                                        aria-label="Ship City: activate to sort column ascending">{t("Statut actuel")}
                                                                    </th>

                                                                    <th className="sorting" tabIndex="0"
                                                                        aria-controls="kt_table_1"
                                                                        rowSpan="1"
                                                                        colSpan="1" style={{width: "50px"}}
                                                                        aria-label="Ship City: activate to sort column ascending">{t("Message")}
                                                                    </th>


                                                                    <th className="sorting" tabIndex="0"
                                                                        aria-controls="kt_table_1"
                                                                        rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                                        aria-label="Type: activate to sort column ascending">
                                                                        {t("Action")}
                                                                    </th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {
                                                                    revivals.length ? (
                                                                        showList ? (
                                                                            showList.map((revival, index) => (
                                                                                printBodyTable(revival, index)
                                                                            ))
                                                                        ) : (
                                                                            <EmptyTable />
                                                                        )
                                                                    ) : (<EmptyTable/>)
                                                                }
                                                                </tbody>
                                                                <tfoot>
                                                                <tr style={{textAlign:"center"}}>
                                                                    <th rowSpan="1" colSpan="1">{t("Référence")}</th>
                                                                    <th rowSpan="1" colSpan="1">{t("Expéditeur")}</th>
                                                                    <th rowSpan="1" colSpan="1">{t("Date de relance")}</th>
                                                                    <th rowSpan="1" colSpan="1">{t("Statut avant relance")}</th>
                                                                    <th rowSpan="1" colSpan="1">{t("Staff relancé")}</th>
                                                                    <th rowSpan="1" colSpan="1">{t("Statut de la relance")}</th>
                                                                    <th rowSpan="1" colSpan="1">{t("Statut actuel")}</th>
                                                                    <th rowSpan="1" colSpan="1">{t("Message")}</th>
                                                                    <th rowSpan="1" colSpan="1">{t("Action")}</th>
                                                                </tr>
                                                                </tfoot>
                                                            </table>
                                                            <button id="button_modal" type="button" className="btn btn-secondary btn-icon-sm d-none" data-toggle="modal" data-target="#message_email"/>
                                                            <HtmlDescriptionModal title={"Message"} message={currentMessage}/>

                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-5">
                                                            <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                                 aria-live="polite">{t("Affichage de")} 1
                                                                {t("à")} {showList.length} {t("sur")} {total} {t("données")}
                                                            </div>
                                                        </div>

                                                        {
                                                            showList.length ? (
                                                                <div className="col-sm-12 col-md-7 dataTables_pager">
                                                                    <Pagination
                                                                        numberPerPage={numberPerPage}
                                                                        onChangeNumberPerPage={onChangeNumberPerPage}
                                                                        activeNumberPage={activeNumberPage}
                                                                        onClickPage={(e, number) => onClickPage(e, number)}
                                                                        onClickPreviousPage={e => onClickPreviousPage(e)}
                                                                        onClickNextPage={e => onClickNextPage(e)}
                                                                        numberPage={numberPage}
                                                                    />
                                                                </div>
                                                            ) : null
                                                        }
                                                    </div>
                                                </>
                                            )
                                        }
                                    </div>
                                </div>

                    </div>
                </div>

            </div>
        ) : null
    );

}

const mapStateToProps = (state) => {
    return {
        plan: state.plan.plan,
        userPermissions: state.user.user.permissions,
        userStaff: state.user.user.staff
    };
};

export default connect(mapStateToProps)(HistoricRevivals);
