import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import axios from "axios";
import HeaderTablePage from "../components/HeaderTablePage";
import LoadingTable from "../components/LoadingTable";
import EmptyTable from "../components/EmptyTable";
import Pagination from "../components/Pagination";
import appConfig from "../../config/appConfig";
import {forceRound, getLowerCaseString, loadCss} from "../../helpers/function";
import {DeleteConfirmation} from "../components/ConfirmationAlert";
import {confirmDeleteConfig} from "../../config/confirmConfig";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastDeleteErrorMessageConfig,
    toastDeleteSuccessMessageConfig,
    toastErrorMessageWithParameterConfig
} from "../../config/toastConfig";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const Currency = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    if (!verifyPermission(props.userPermissions, "list-currency"))
        window.location.href = ERROR_401;

    const [load, setLoad] = useState(true);
    const [currencies, setCurrencies] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(NUMBER_ELEMENT_PER_PAGE);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);

    useEffect(() => {
        async function fetchData () {
            await axios.get(`${appConfig.apiDomaine}/currencies`)
                .then(response => {
                    setNumberPage(forceRound(response.data.length/NUMBER_ELEMENT_PER_PAGE));
                    setShowList(response.data.slice(0, NUMBER_ELEMENT_PER_PAGE));
                    setCurrencies(response.data);
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
        let newCurrencies = [...currencies];
        newCurrencies = newCurrencies.filter(el => (
            getLowerCaseString(el.name["fr"]).indexOf(value) >= 0 ||
            getLowerCaseString(el.iso_code).indexOf(value) >= 0
        ));

        return newCurrencies;
    };

    const searchElement = async (e) => {
        if (e.target.value) {
            setNumberPage(forceRound(filterShowListBySearchValue(e.target.value).length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(filterShowListBySearchValue(e.target.value.toLowerCase()).slice(0, NUMBER_ELEMENT_PER_PAGE));
        } else {
            setNumberPage(forceRound(currencies.length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(currencies.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setActiveNumberPage(1);
        }
    };

    const onChangeNumberPerPage = (e) => {
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
        setShowList(currencies.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(currencies.length/parseInt(e.target.value)));
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
        setShowList(currencies.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                currencies.slice(
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
                currencies.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                )
            );
        }
    };

    const deleteCurrency = (currencyId, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig())
            .then((result) => {
                if (verifyTokenExpire()) {
                    if (result.value) {
                        axios.delete(`${appConfig.apiDomaine}/currencies/${currencyId}`)
                            .then(response => {
                                const newCurrencies = [...currencies];
                                newCurrencies.splice(index, 1);
                                setCurrencies(newCurrencies);
                                if (showList.length > 1) {
                                    setShowList(
                                        newCurrencies.slice(
                                            getEndByPosition(activeNumberPage) - numberPerPage,
                                            getEndByPosition(activeNumberPage)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage);
                                } else {
                                    setShowList(
                                        newCurrencies.slice(
                                            getEndByPosition(activeNumberPage - 1) - numberPerPage,
                                            getEndByPosition(activeNumberPage - 1)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage - 1);
                                }
                                setNumberPage(forceRound(newCurrencies.length/numberPerPage));
                                ToastBottomEnd.fire(toastDeleteSuccessMessageConfig());
                            })
                            .catch(error => {
                                if (error.response.data.error)
                                    ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.error));
                                else
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

    const printBodyTable = (currency, index) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>{currency.name["fr"]}</td>
                <td>{currency.iso_code}</td>
                <td>
                    {/*{
                        verifyPermission(props.userPermissions, 'update-currency') ? (
                            <Link to={`/settings/currencies/${currency.id}/edit`}
                                  className="btn btn-sm btn-clean btn-icon btn-icon-md"
                                  title="Modifier">
                                <i className="la la-edit"/>
                            </Link>
                        ) : null
                    }*/}
                    {
                        verifyPermission(props.userPermissions, 'destroy-currency') ? (
                            <button
                                onClick={(e) => deleteCurrency(currency.id, index)}
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
            verifyPermission(["list-currency"], 'list-currency') ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Paramètres")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                        {t("Devise")}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <div className="kt-portlet">
                            <HeaderTablePage
                                addPermission={"store-currency"}
                                title={t("Devise")}
                                addText={t("Ajouter")}
                                addLink={"/settings/currencies/add"}
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
                                                                aria-label="Country: activate to sort column ascending">{t("Nom de la devise")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1"
                                                                colSpan="1" style={{ width: "70.25px" }}
                                                                aria-label="Country: activate to sort column ascending">ISO
                                                            </th>
                                                            <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{ width: "40.25px" }} aria-label="Type: activate to sort column ascending">
                                                                {t("Action")}
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            currencies.length ? (
                                                                showList ? (
                                                                    showList.map((currency, index) => (
                                                                        printBodyTable(currency, index)
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
                                                            <th rowSpan="1" colSpan="1">{t("Nom de la devise")}</th>
                                                            <th rowSpan="1" colSpan="1">ISO code</th>
                                                            <th rowSpan="1" colSpan="1">{t("Action")}</th>
                                                        </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12 col-md-5">
                                                    <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                         aria-live="polite">{t("Affichage de")} 1 {t("à")} {numberPerPage} {t("sur")} {currencies.length} {t("données")}
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

export default connect(mapStateToProps)(Currency);
