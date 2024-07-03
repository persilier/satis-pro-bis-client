import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    loadCss,
    filterDataTableBySearchValue,
    forceRound,
    formatDateToTime,
    reduceCharacter
} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import InfirmationTable from "../components/InfirmationTable";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ModelNumberToClaimList = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    if (!(verifyPermission(props.userPermissions, 'list-satisfaction-measured-my-claim') ||
        verifyPermission(props.userPermissions, "list-satisfaction-measured-any-claim")))
        window.location.href = ERROR_401;

    let endPoint = props.endpoint;

    const [load, setLoad] = useState(true);
    const [satisfactionMeasure, setModelNumberToClaimList] = useState([]);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(5);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [search, setSearch] = useState(false);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(endPoint.list)
                .then(response => {
                    setLoad(false);
                    setModelNumberToClaimList(response.data);
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

    const searchElement = async (e) => {
        if (e.target.value) {
            await setSearch(true);
            filterDataTableBySearchValue(e);
        } else {
            await setSearch(true);
            filterDataTableBySearchValue(e);
            setSearch(false);
        }
    };

    const onChangeNumberPerPage = (e) => {
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
        setShowList(satisfactionMeasure.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(satisfactionMeasure.length / parseInt(e.target.value)));
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
        setShowList(satisfactionMeasure.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                satisfactionMeasure.slice(
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
                satisfactionMeasure.slice(
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

    const printBodyTable = (measure, index) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>{measure.reference === null ? "" : measure.reference}</td>
                <td>{`${measure.claimer.lastname} ${measure.claimer.firstname}  ${measure.account_targeted ? " / "+measure.account_targeted.number : (measure.account_number ? " / " + measure.account_number : "")}`}</td>
                <td>
                    {
                        (props.plan === 'PRO') ?
                            (measure.unit_targeted ? measure.unit_targeted.name.fr : "-")
                            : measure.institution_targeted.name
                    }
                </td>
                <td>{formatDateToTime(measure.created_at)} <br/>
                    {measure.timeExpire >= 0 ? <span style={{color: "forestgreen", fontWeight:"bold"}}>{"J+" + measure.timeExpire}</span> :
                        <span style={{color: "red", fontWeight:"bold"}}>{"J" + measure.timeExpire}</span>}
                </td>
                <td>{measure.claim_object.name["fr"]}</td>
                <td>{measure.description.length >= 15 ? reduceCharacter(measure.description) : measure.description}</td>
                <td>{`${measure.active_treatment.responsible_staff ? measure.active_treatment.responsible_staff.identite.lastname : null} ${measure.active_treatment.responsible_staff ? measure.active_treatment.responsible_staff.identite.firstname : "-"}/${measure.active_treatment ? measure.active_treatment.responsible_staff.unit.name["fr"] : null}`}</td>
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
                                {t("Processus")}
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
                                        {props.navigationTitle}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                    <InfirmationTable information={props.description}/>

                    <div className="kt-portlet">

                        <HeaderTablePage
                            title={props.title}
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
                                                        {t("Rechercher")}:
                                                        <input id="myInput" type="text" onKeyUp={(e) => searchElement(e)} className="form-control form-control-sm" placeholder="" aria-controls="kt_table_1"/>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <table className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline" id="myTable" role="grid" aria-describedby="kt_table_1_info" style={{width: "952px"}}>
                                                    <thead>
                                                    <tr role="row">
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{width: "70.25px"}} aria-label="Country: activate to sort column ascending">{t("Référence")}</th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{width: "70.25px"}} aria-label="Country: activate to sort column ascending">{t("Réclamant")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{width: "80.25px"}} aria-label="Country: activate to sort column ascending">
                                                            {(props.plan === 'PRO') ? t("Point de service visé") : t("Institution ciblée")}
                                                        </th>
                                                        <th className="sorting sorter-dates" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{width: "50px"}} aria-label="Country: activate to sort column ascending">
                                                            {t("Date de réception")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{width: "70.25px"}} aria-label="Country: activate to sort column ascending">
                                                            {t("Objet de réclamation")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{width: "70.25px"}} aria-label="Country: activate to sort column ascending">
                                                            {t("Description")}
                                                        </th>

                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{width: "70.25px"}} aria-label="Country: activate to sort column ascending">
                                                            {t("Agent traiteur")}
                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {
                                                        satisfactionMeasure.length ? (
                                                            search ? (
                                                                satisfactionMeasure.map((measure, index) => (
                                                                    printBodyTable(measure, index)
                                                                ))
                                                            ) : (
                                                                showList.map((measure, index) => (
                                                                    printBodyTable(measure, index)
                                                                ))
                                                            )
                                                        ) : (
                                                            <EmptyTable/>
                                                        )
                                                    }
                                                    </tbody>
                                                    <tfoot>
                                                    <tr>
                                                        <th rowSpan="1" colSpan="1">{t("Référence")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Réclamant")}</th>
                                                        <th rowSpan="1"
                                                            colSpan="1">{(props.plan === 'PRO') ? t("Point de service visé") : t("Institution ciblée")}
                                                        </th>
                                                        <th rowSpan="1" colSpan="1">{t("Date de réception")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Objet de réclamation")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Description")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Agent traiteur")}</th>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-sm-12 col-md-5">
                                                <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                     aria-live="polite">{t("Affichage de")} 1
                                                    {t("à")} {numberPerPage} {t("sur")} {satisfactionMeasure.length} {t("données")}
                                                </div>
                                            </div>
                                            {
                                                !search ? (
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
    )
};

export default ModelNumberToClaimList;
