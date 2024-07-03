import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {
    Link
} from "react-router-dom";
import {forceRound, getLowerCaseString, loadCss} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import {ToastBottomEnd} from "../components/Toast";
import {toastDeleteErrorMessageConfig, toastDeleteSuccessMessageConfig} from "../../config/toastConfig";
import {DeleteConfirmation} from "../components/ConfirmationAlert";
import {confirmDeleteConfig} from "../../config/confirmConfig";
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const PerformanceIndicator = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    if (!verifyPermission(props.userPermissions, "list-performance-indicator"))
        window.location.href = ERROR_401;

    const [load, setLoad] = useState(true);
    const [performances, setPerformances] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(NUMBER_ELEMENT_PER_PAGE);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);

    useEffect(() => {
       async function fetchData () {
           await axios.get(`${appConfig.apiDomaine}/performance-indicators`)
               .then(response => {
                   setNumberPage(forceRound(response.data.length/NUMBER_ELEMENT_PER_PAGE));
                   setShowList(response.data.slice(0, NUMBER_ELEMENT_PER_PAGE));
                   setPerformances(response.data);
                   setLoad(false);
               })
               .catch(error => {
                   setLoad(false);
                   //console.log("Something is wrong");
               })
           ;
       }
       if (verifyTokenExpire())
           fetchData();
    }, [appConfig.apiDomaine, NUMBER_ELEMENT_PER_PAGE]);

    const filterShowListBySearchValue = (value) => {
        value = getLowerCaseString(value);
        let newPerformances = [...performances];
        newPerformances = newPerformances.filter(el => (
            getLowerCaseString(el.name["fr"]).indexOf(value) >= 0 ||
            getLowerCaseString(el.description["fr"]).indexOf(value) >= 0 ||
            getLowerCaseString(el.value).indexOf(value) >= 0 ||
            getLowerCaseString(el.mesure_unit).indexOf(value) >= 0
        ));

        return newPerformances;
    };

    const searchElement = async (e) => {
        if (e.target.value) {
            setNumberPage(forceRound(filterShowListBySearchValue(e.target.value).length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(filterShowListBySearchValue(e.target.value.toLowerCase()).slice(0, NUMBER_ELEMENT_PER_PAGE));
        } else {
            setNumberPage(forceRound(performances.length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(performances.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setActiveNumberPage(1);
        }
    };

    const onChangeNumberPerPage = (e) => {
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
        setShowList(performances.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(performances.length/parseInt(e.target.value)));
    };

    const getEndByPosition = (position) => {
        let end = numberPerPage;
        for (let i = 1; i<position; i++) {
            end = end+numberPerPage;
        }
        return end;
    };

    const onClickPage = (e, page) => {
        e.preventDefault();
        setActiveNumberPage(page);
        setShowList(performances.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                performances.slice(
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
                performances.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                )
            );
        }
    };

    const deletePerformanceIndicator = (performanceId, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig())
            .then((result) => {
                if (result.value) {
                    if (verifyTokenExpire()) {
                        axios.delete(`${appConfig.apiDomaine}/performance-indicators/${performanceId}`)
                            .then(response => {
                                const newPerformances = [...performances];
                                newPerformances.splice(index, 1);
                                setPerformances(newPerformances);
                                if (showList.length > 1) {
                                    setShowList(
                                        newPerformances.slice(
                                            getEndByPosition(activeNumberPage) - numberPerPage,
                                            getEndByPosition(activeNumberPage)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage);
                                } else {
                                    setShowList(
                                        newPerformances.slice(
                                            getEndByPosition(activeNumberPage - 1) - numberPerPage,
                                            getEndByPosition(activeNumberPage - 1)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage - 1);
                                }
                                setNumberPage(forceRound(newPerformances.length/numberPerPage));
                                ToastBottomEnd.fire(toastDeleteSuccessMessageConfig());
                            })
                            .catch(error => {
                                ToastBottomEnd.fire(toastDeleteErrorMessageConfig());
                            })
                        ;
                    }
                }
            })
        ;
    };

    const arrayNumberPage = () => {
        const pages = [];
        for (let i = 0; i < numberPage; i++) {
            pages[i] = i;
        }
        return pages
    };

    const pages = arrayNumberPage();

    const printBodyTable = (performance, index) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>{performance.name["fr"]}</td>
                <td style={{ textOverflow: "ellipsis", width: "300px" }}>{performance.description["fr"]}</td>
                <td>{performance.value}</td>
                <td>{performance.mesure_unit}</td>
                <td>
                    {
                        verifyPermission(props.userPermissions, "update-performance-indicator") ? (
                            <Link to={`/settings/performance_indicator/${performance.id}/edit`}
                                  className="btn btn-sm btn-clean btn-icon btn-icon-md"
                                  title={t("Modifier")}>
                                <i className="la la-edit"/>
                            </Link>
                        ) : null
                    }
                    {
                        verifyPermission(props.userPermissions, "destroy-performance-indicator") ? (
                            <button
                                onClick={(e) => deletePerformanceIndicator(performance.id, index)}
                                className="btn btn-sm btn-clean btn-icon btn-icon-md"
                                title={t("Supprimer")}>
                                <i className="la la-trash"/>
                            </button>
                        ) : null
                    }
                </td>
            </tr>
        );
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, "list-performance-indicator") ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Paramètres")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#/icon" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#indicatorPerformance" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                        {t("Indicateur de performance")}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <div className="kt-portlet">
                            <HeaderTablePage
                                addPermission={"store-performance-indicator"}
                                title={t("Indicateur de performance")}
                                addText={t("Ajouter")}
                                addLink={"/settings/performance_indicator/add"}
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
                                                            <input id="myInput" type="text" onKeyUp={(e) => searchElement(e)} className="form-control form-control-sm" placeholder="" aria-controls="kt_table_1"/>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <table
                                                        className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                        id="myTable" role="grid" aria-describedby="kt_table_1_info"
                                                        style={{ width: "952px" }}>
                                                        <thead>
                                                        <tr role="row">
                                                            <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1"
                                                                colSpan="1" style={{ width: "70.25px" }}
                                                                aria-label="Country: activate to sort column ascending">{t("Nom")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1"
                                                                colSpan="1" style={{ width: "250px" }}
                                                                aria-label="Ship City: activate to sort column ascending">{t("Description")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1"
                                                                colSpan="1" style={{ width: "20px" }}
                                                                aria-label="Ship Address: activate to sort column ascending">{t("Valeur")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1"
                                                                colSpan="1" style={{ width: "15px" }}
                                                                aria-label="Company Agent: activate to sort column ascending">{t("Unité de mésure")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{ width: "40.25px" }} aria-label="Type: activate to sort column ascending">
                                                                {t("Action")}
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            performances.length ? (
                                                                showList.length ? (
                                                                    showList.map((performance, index) => (
                                                                        printBodyTable(performance, index)
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
                                                        <tr>
                                                            <th rowSpan="1" colSpan="1">{t("Nom")}</th>
                                                            <th rowSpan="1" colSpan="1">{t("Description")}</th>
                                                            <th rowSpan="1" colSpan="1">{t("Valeur")}</th>
                                                            <th rowSpan="1" colSpan="1">{t("Unité de mésure")}</th>
                                                            <th rowSpan="1" colSpan="1">{t("Action")}</th>
                                                        </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12 col-md-5">
                                                    <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                         aria-live="polite">{t("Affichage de")} 1 {t("à")} {numberPerPage} {t("sur")} {performances.length} {t("données")}
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
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(PerformanceIndicator);
