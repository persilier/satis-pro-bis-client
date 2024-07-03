import React, {useEffect, useState} from "react";
import {connect} from "react-redux"
import {verifyPermission} from "../../helpers/permission";
import InfirmationTable from "../components/InfirmationTable";
import HeaderTablePage from "../components/HeaderTablePage";
import LoadingTable from "../components/LoadingTable";
import EmptyTable from "../components/EmptyTable";
import Pagination from "../components/Pagination";
import {ERROR_401} from "../../config/errorPage";
import axios from "axios";
import appConfig from "../../config/appConfig";
import {
    forceRound, formatDateToTime,
    getLowerCaseString,
    loadCss, truncateString
} from "../../helpers/function";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import HtmlDescription from "../components/DescriptionDetail/HtmlDescription";
import HtmlDescriptionCommittee from "../components/DescriptionDetail/HtmlDescriptionCommittee";
import HtmlDescriptionModal from "../components/DescriptionDetail/HtmlDescriptionModal";
import MemberDescriptionModal from "../components/DescriptionDetail/MemberDescriptionModal";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import CreateCommitteeSpecific from "../components/CreateCommitteeSpecific";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const CommitteeAdhoc = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    if (!(verifyPermission(props.userPermissions, "list-treatment-board") && props.activePilot))
        window.location.href = ERROR_401;

    const [load, setLoad] = useState(true);
    //  const [claims, setClaims] = useState([]);
    const [committee, setCommittee] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(10);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [memberList, setMemberList] = useState([]);

    useEffect(() => {
        async function fetchData() {
            axios.get(`${appConfig.apiDomaine}/treatments-boards`)
                .then(response => {
                    console.log(response.data)
                    setNumberPage(forceRound(response.data.data.length / numberPerPage));
                    setShowList(response.data.data.slice(0, numberPerPage));
                    setCommittee(response.data.data);
                    setLoad(false);
                })
                .catch(error => {
                    setLoad(false);
                    console.log("erreur", error);
                })
            ;
        }

        if (verifyTokenExpire())
            fetchData();
    }, [numberPerPage]);

    const filterShowListBySearchValue = (value) => {
        value = getLowerCaseString(value);
        let newCommittee = [...committee];
        newCommittee = newCommittee.filter(el => {
            return (
                getLowerCaseString(el.reference).indexOf(value) >= 0 ||
                getLowerCaseString(`${(el.claimer && el.claimer.lastname) ? el.claimer.lastname : ''} ${(el.claimer && el.claimer.firstname) ? el.claimer.firstname : ''}  ${el.account_targeted ? " / " + el.account_targeted.number : (el.account_number ? " / " + el.account_number : "")}`).indexOf(value) >= 0 ||
                getLowerCaseString(formatDateToTime(el.created_at)).indexOf(value) >= 0 ||
                getLowerCaseString(el.claim_object ? el.claim_object.name["fr"] : "").indexOf(value) >= 0 ||
                getLowerCaseString(truncateString(el.description, 41)).indexOf(value) >= 0 ||
                getLowerCaseString(props.plan === "PRO" ? el.unit_targeted ? el.unit_targeted.name["fr"] : "-" : (el.institution_targeted ? el.institution_targeted.name : "")).indexOf(value) >= 0
            )
        });

        return newCommittee;
    };

    const searchElement = async (e) => {
        if (e.target.value) {
            setNumberPage(forceRound(filterShowListBySearchValue(e.target.value).length / NUMBER_ELEMENT_PER_PAGE));
            setShowList(filterShowListBySearchValue(e.target.value.toLowerCase()).slice(0, NUMBER_ELEMENT_PER_PAGE));
        } else {
            setNumberPage(forceRound(committee.length / NUMBER_ELEMENT_PER_PAGE));
            setShowList(committee.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setActiveNumberPage(1);
        }
    };

    const onChangeNumberPerPage = (e) => {
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
        setShowList(committee.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(committee.length / parseInt(e.target.value)));
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
        setShowList(committee.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                committee.slice(
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
                committee.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                )
            );
        }
    };

    const arrayNumberPage = () => {
        const pages = [];
        for (let i = 0; i < numberPage; i++) {
            pages[i] = i;
        }
        return pages
    };

    const pages = arrayNumberPage();

    const showModal = (message) => {
        setCurrentMessage(message);
        document.getElementById("button_modal").click();
    };

    const showMemberModal = (mlist) => {
        setMemberList(mlist);
        document.getElementById("button_modal1").click();
    };

    const printBodyTable = (committee, index, id) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>{committee.name ? committee.name : "-"}</td>
                <td className={"text-center"}>
                    {
                        committee.type === "specific" ?
                            <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("Spécific")}</span>
                            : committee.type === "standard" ?
                            <span className="kt-badge kt-badge--inline kt-badge--primary h2">{t("Standard")}</span>
                            :  <span className="kt-badge kt-badge--inline kt-badge--primary h2">{t("Standard")}</span>
                    }


                    {/*{committee.type ? committee.type : "-"}*/}
                </td>
                <td> <span style={{marginRight: "5px",}}>{committee.members.length}</span>
                    <HtmlDescriptionCommittee
                        onClick={() => showMemberModal(committee.members ?
                            committee.members : '-')}/>

                </td>
                <td className={"d-contents"}
                    style={{display: "reverts"}}>{committee.claim && committee.claim.reference ? committee.claim.reference :
                    <td style={{color: "red", borderTop: "1px solid transparent"}}><i
                        className="kt-menu__link-icon flaticon-questions-circular-button"/></td>}</td>
                <td>{committee.claim ? committee.claim.claim_object.name["fr"] :
                    <td style={{color: "red", borderTop: "1px solid transparent"}}><i
                        className="kt-menu__link-icon flaticon-questions-circular-button"/></td>}</td>
                <td style={{textAlign: 'center'}}>
                    <HtmlDescription
                        onClick={() => showModal(committee.claim && committee.claim.description ? committee.claim.description : '-')}/>
                </td>
                <td>{formatDateToTime(committee.created_at)} <br/></td>
                <td className={"text-center"}>

                    {
                        verifyPermission(props.userPermissions, 'update-treatment-board') ? (
                            <Link to={`/settings/committee/${committee.id}/edit`}
                                  id={`committee-edit-${committee.id}`}
                                  className="btn btn-sm btn-clean btn-icon btn-icon-md"
                                  title={t("Modifier")}>
                                <i className="la la-edit"/>
                            </Link>
                        ) : null
                    }
                </td>
            </tr>
        );
    };

    return (
        ready ? (verifyPermission(props.userPermissions, 'list-treatment-board') && props.activePilot ? (
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
                                    {t("Escalade")}
                                </a>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                        className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()}
                                       className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                        {t("Liste des comités Ad'hoc")}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                    <InfirmationTable information={(
                        <div>
                            {t("Cette page présente la liste complète des comités Ad'hoc")}
                            <br/>
                            {/* <span className="kt-badge kt-badge--danger kt-badge--md">R</span>
                            {t("représente les réclamations réjetées")}*/}
                        </div>
                    )}/>

                    <div className="kt-portlet">
                        <HeaderTablePage
                            title={t("Liste des comités Ad'hoc")}
                        />

                        {
                            load ? (
                                <LoadingTable/>
                            ) : (
                                <div className="kt-portlet__body">
                                    <div id="kt_table_1_wrapper" className="dataTables_wrapper dt-bootstrap4">
                                        <div className="row">
                                            {/*    <div className="col-sm-6 text-left">
                                                <div id="kt_table_1_filter" className="dataTables_filter">
                                                    <label>
                                                        {t("Recherche")}:
                                                        <input id="myInput" type="text"
                                                               onKeyUp={(e) => searchElement(e)}
                                                               className="form-control form-control-sm" placeholder=""
                                                               aria-controls="kt_table_1"/>
                                                    </label>
                                                </div>
                                            </div>*/}
                                        </div>

                                        <div className="row">
                                            <div className="col-sm-12">
                                                <table
                                                    className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                    id="myTable" role="grid" aria-describedby="kt_table_1_info"
                                                    style={{width: "952px"}}>
                                                    <thead>
                                                    <tr role="row">
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                            rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                            aria-label="Country: activate to sort column ascending">
                                                            {t("Comité")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                            rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                            aria-label="Country: activate to sort column ascending">
                                                            {t("Types")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                            rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                            aria-label="Country: activate to sort column ascending">
                                                            {t("Nombre de membres")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                            rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                            aria-label="Country: activate to sort column ascending">
                                                            {t("Référence")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                            rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                            aria-label="Country: activate to sort column ascending">
                                                            {t("Objet de réclamation")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                            rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                            aria-label="Country: activate to sort column ascending">
                                                            {t("Description")}
                                                        </th>
                                                        <th className="sorting sorter-dates" tabIndex="0" aria-controls="kt_table_1"
                                                            rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                            aria-label="Country: activate to sort column ascending">
                                                            {t("Date de création")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                            rowSpan="1" colSpan="1" style={{width: "40.25px"}}
                                                            aria-label="Type: activate to sort column ascending">
                                                            {t("Action")}
                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {
                                                        committee.length ? (
                                                            showList.length ? (
                                                                showList.map((committee, index) => (
                                                                    printBodyTable(committee, index)
                                                                ))
                                                            ) : (
                                                                showList.map((committee, index) => (
                                                                    printBodyTable(committee, index)
                                                                ))
                                                            )
                                                        ) : (
                                                            <EmptyTable/>
                                                        )
                                                    }
                                                    </tbody>
                                                    <tfoot>
                                                    <tr>
                                                        <th rowSpan="1" colSpan="1">{t("Comité")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Types")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Nombre de membres")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Référence")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Objet de réclamation")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Description")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Date de création")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Action")}</th>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                                <button id="button_modal" type="button"
                                                        className="btn btn-secondary btn-icon-sm d-none"
                                                        data-toggle="modal" data-target="#message_email"/>
                                                <button id="button_modal1" type="button"
                                                        className="btn btn-secondary btn-icon-sm d-none"
                                                        data-toggle="modal" data-target="#member"/>
                                                <HtmlDescriptionModal title={t("Description")}
                                                                      message={currentMessage}/>
                                                <MemberDescriptionModal title={t("Liste des membres du comité")}
                                                                        message={memberList}/>
                                            </div>
                                        </div>


                                        <div className="row">
                                            <div className="col-sm-12 col-md-5">
                                                <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                     aria-live="polite">{t("Affichage de")} 1
                                                    {t("à")} {numberPerPage} {t("sur")} {committee.length} {t("données")}
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
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        ) : null) : null
    );
};

const mapStateToProps = state => {
    return {
        plan: state.plan.plan,
        userPermissions: state.user.user.permissions,
        activePilot: state.user.user.staff.is_active_pilot
    };
};

export default connect(mapStateToProps)(CommitteeAdhoc);
