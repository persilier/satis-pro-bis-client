import React, {useEffect, useState} from "react";
import axios from "axios";
import {connect} from "react-redux";
import {forceRound, formatDateToTime, getLowerCaseString, loadCss, reduceCharacter} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import HtmlDescriptionModal from "../components/DescriptionDetail/HtmlDescriptionModal";
import HtmlDescription from "../components/DescriptionDetail/HtmlDescription";
import {useTranslation} from "react-i18next";


loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");


const HistoricClaimsAdd = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - " + (ready ? t("Paramètre Historique") : "");

    if (!verifyPermission(props.userPermissions, "history-list-treat-claim")) {
        window.location.href = ERROR_401;
    }
    const [load, setLoad] = useState(true);
    const [claimsAdd, setClaimsAdd] = useState([]);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(10);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [currentMessage, setCurrentMessage] = useState("");

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + "/history/list-treat")
                .then(response => {
                    setLoad(false);
                    setClaimsAdd(response.data);
                    setShowList(response.data.slice(0, numberPerPage));
                    setNumberPage(forceRound(response.data.length / numberPerPage));
                })
                .catch(error => {
                    setLoad(false);
                    //console.log("Something is wrong");
                })
            ;
        }
    }, []);

    const filterShowListBySearchValue = (value) => {
        value = getLowerCaseString(value);
        let newClaimsAdd = [...claimsAdd];
        newClaimsAdd = newClaimsAdd.filter(el => (
            getLowerCaseString(el.reference).indexOf(value) >= 0 ||
            getLowerCaseString(el.claim_object ? el.claim_object.name.fr : "").indexOf(value) >= 0 ||
            getLowerCaseString(el.description).indexOf(value) >= 0 ||
            getLowerCaseString(`${el.claimer.lastname} ${el.claimer.firstname}  ${el.account_targeted ? " / "+el.account_targeted.number : (el.account_number ? " / "+el.account_number : "")}`).indexOf(value) >= 0
    ));

        return newClaimsAdd;
    };

    const searchElement = async (e) => {
        if (e.target.value) {
            setNumberPage(forceRound(filterShowListBySearchValue(e.target.value).length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(filterShowListBySearchValue(e.target.value.toLowerCase()).slice(0, NUMBER_ELEMENT_PER_PAGE));
        } else {
            setNumberPage(forceRound(claimsAdd.length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(claimsAdd.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setActiveNumberPage(1);
        }
    };

    const onChangeNumberPerPage = (e) => {
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
        setShowList(claimsAdd.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(claimsAdd.length / parseInt(e.target.value)));
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
        setShowList(claimsAdd.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                claimsAdd.slice(
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
                claimsAdd.slice(
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

    const printBodyTable = (claim, index) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>{claim.reference ? claim.reference : ""} </td>
                <td>{`${claim.claimer && claim.claimer.lastname ? claim.claimer.lastname : ""} ${claim.claimer && claim.claimer.firstname ? claim.claimer.firstname : ""}`} {claim.account_targeted !== null ? "/" + claim.account_targeted.number : (claim.account_number ? " / "+claim.account_number : "")}</td>
                <td>{claim.claim_object && claim.claim_object.name["fr"] ? claim.claim_object.name["fr"] : ""}</td>
                <td style={{textAlign: 'center'}}>
                    <HtmlDescription onClick={() => showModal(claim.description ? claim.description : '-')}/>
                </td>
                {/*<td>{claim.description.length > 15 ? reduceCharacter(claim.description) : claim.description}</td>*/}
                <td>
                    {
                        (props.plan === 'PRO') ?
                            (claim.unit_targeted ? claim.unit_targeted.name.fr : "-")
                            : claim.institution_targeted.name
                    }
                </td>
                <td style={{textAlign: "center"}}>
                    {
                        claim.status === "archived" ?
                            <span className="kt-badge kt-badge--inline kt-badge--dark">{t("Archivé")}</span>
                            : claim.status === "validated" ?
                            <span className="kt-badge kt-badge--inline kt-badge--success">{t("Traité")}</span>
                            : <span className="kt-badge kt-badge--inline kt-badge--warning">{t("En cours de traitement")}</span>

                    }
                </td>
            </tr>
        )
    };

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
                                    {t("Réclamations traitées")}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                    <div className="kt-portlet">
                        <HeaderTablePage
                            title={t("Réclamations traitées")}
                        />

                        {
                            load ? (
                                <LoadingTable/>
                            ) : (
                                <div className="kt-portlet__body">
                                    <div id="kt_table_1_wrapper" className="dataTables_wrapper dt-bootstrap4">
                                        <div className="row">
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
                                                            rowSpan="1"
                                                            colSpan="1" style={{width: "70.25px"}}
                                                            aria-label="Country: activate to sort column ascending">{t("Référence")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0"
                                                            aria-controls="kt_table_1"
                                                            rowSpan="1"
                                                            colSpan="1" style={{width: "80px"}}
                                                            aria-label="Country: activate to sort column ascending">{t("Réclamant")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0"
                                                            aria-controls="kt_table_1"
                                                            rowSpan="1"
                                                            colSpan="1" style={{width: "100px"}}
                                                            aria-label="Country: activate to sort column ascending">{t("Objets de réclamation")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0"
                                                            aria-controls="kt_table_1"
                                                            rowSpan="1"
                                                            colSpan="1" style={{width: "150px"}}
                                                            aria-label="Country: activate to sort column ascending">{t("Description de la réclamation")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0"
                                                            aria-controls="kt_table_1"
                                                            rowSpan="1"
                                                            colSpan="1" style={{width: "70.25px"}}
                                                            aria-label="Country: activate to sort column ascending">
                                                            {(props.plan === 'PRO') ? t("Point de service visé") : t("Institution ciblée")}

                                                        </th>
                                                        <th className="sorting" tabIndex="0"
                                                            aria-controls="kt_table_1"
                                                            rowSpan="1"
                                                            colSpan="1" style={{width: "50px"}}
                                                            aria-label="Ship City: activate to sort column ascending">{t("Statut")}
                                                        </th>

                                                        {/*<th className="sorting" tabIndex="0"*/}
                                                        {/*    aria-controls="kt_table_1"*/}
                                                        {/*    rowSpan="1" colSpan="1" style={{width: "70.25px"}}*/}
                                                        {/*    aria-label="Type: activate to sort column ascending">*/}
                                                        {/*    Action*/}
                                                        {/*</th>*/}
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {
                                                        claimsAdd.length ? (
                                                            showList.length ? (
                                                                showList.map((claim, index) => (
                                                                    printBodyTable(claim, index)
                                                                ))
                                                            ) : (
                                                                <EmptyTable search={true}/>
                                                            )
                                                        ) : (
                                                            <EmptyTable/>
                                                        )
                                                    }
                                                    </tbody>
                                                    <tfoot>
                                                    <tr style={{textAlign:"center"}}>
                                                        <th rowSpan="1" colSpan="1">{t("Référence")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Réclamant")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Objets de réclamations")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Description")}</th>
                                                        <th rowSpan="1"
                                                            colSpan="1">{(props.plan === 'PRO') ? t("Point de service visé") : t("Institution ciblée")}
                                                        </th>
                                                        <th rowSpan="1" colSpan="1">{t("Statut")}</th>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                                <button id="button_modal" type="button" className="btn btn-secondary btn-icon-sm d-none" data-toggle="modal" data-target="#message_email"/>
                                                <HtmlDescriptionModal title={"Description"} message={currentMessage}/>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12 col-md-5">
                                                <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                     aria-live="polite">{t("Affichage de")} 1
                                                    {t("à")} {numberPerPage} {t("sur")} {claimsAdd.length} {t("données")}
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
        ) : null

    );
};
const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions,
        plan:state.plan.plan
    };
};

export default connect(mapStateToProps)(HistoricClaimsAdd);
