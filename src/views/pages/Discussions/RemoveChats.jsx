import React, {useEffect, useState} from "react";
import axios from "axios";
import {loadCss, filterDataTableBySearchValue, forceRound} from "../../../helpers/function";
import LoadingTable from "../../components/LoadingTable";
import {ToastBottomEnd} from "../../components/Toast";
import {toastDeleteErrorMessageConfig, toastDeleteSuccessMessageConfig} from "../../../config/toastConfig";
import {DeleteConfirmation} from "../../components/ConfirmationAlert";
import {confirmDeleteConfig} from "../../../config/confirmConfig";
import appConfig from "../../../config/appConfig";
import Pagination from "../../components/Pagination";
import EmptyTable from "../../components/EmptyTable";
import ExportButton from "../../components/ExportButton";
import HeaderTablePage from "../../components/HeaderTablePage";
import InfirmationTable from "../../components/InfirmationTable";
import {ERROR_401} from "../../../config/errorPage";
import {verifyPermission} from "../../../helpers/permission";
import {connect} from "react-redux";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const RemoveChats = (props) => {
    if (!verifyPermission(props.userPermissions, "destroy-discussion"))
        window.location.href = ERROR_401;

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const [load, setLoad] = useState(true);
    const [chats, setChats] = useState([]);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(5);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [search, setSearch] = useState(false);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + `/discussions`)
                .then(response => {
                    //console.log(response.data, 'REMOVE');
                    setShowList(response.data.slice(0, numberPerPage));
                    setNumberPage(forceRound(response.data.length / numberPerPage));
                    setChats(response.data);
                    setLoad(false);
                })
                .catch(error => {
                    setLoad(false);
                    //console.log("Something is wrong");
                })
            ;
        }
    },[]);

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
        setShowList(chats.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(chats.length / parseInt(e.target.value)));
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
        setShowList(chats.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                chats.slice(
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
                chats.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                )
            );
        }
    };

    const deleteContributor = (chatsId, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig())
            .then((result) => {
                if (result.value) {
                    if (verifyTokenExpire()) {
                        axios.delete(appConfig.apiDomaine + `/discussions/${chatsId}`)
                            .then(response => {
                                const newChats = [...chats];
                                newChats.splice(index, 1);
                                setChats(newChats);
                                if (showList.length > 1) {
                                    setShowList(
                                        newChats.slice(
                                            getEndByPosition(activeNumberPage) - numberPerPage,
                                            getEndByPosition(activeNumberPage)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage);
                                } else {
                                    setShowList(
                                        newChats.slice(
                                            getEndByPosition(activeNumberPage - 1) - numberPerPage,
                                            getEndByPosition(activeNumberPage - 1)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage - 1);
                                }
                                setNumberPage(forceRound(newChats.length/numberPerPage));
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

    const printBodyTable = (chat, index) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>{chat.name}</td>
                <td>{chat.claim.reference}</td>

                <td style={{textAlign:'center'}}>

                    {verifyPermission(props.userPermissions, "destroy-discussion") ?
                        <button
                            onClick={(e) => deleteContributor(chat.id, index)}
                            className="btn btn-sm btn-clean btn-icon btn-icon-md"
                            title={t("Supprimer le Tchat")}>
                            <i className="la la-trash fa-2x"/>
                        </button>
                        : null
                    }
                </td>
            </tr>
        )
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, "list-my-discussions") ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Traitement")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                        className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="#button" onClick={e => e.preventDefault()}
                                       className="kt-subheader__breadcrumbs-link">
                                        {t("Tchat")}
                                    </a>
                                    <span className="kt-subheader__separator kt-hidden"/>
                                    <div className="kt-subheader__breadcrumbs">
                                        <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                            className="flaticon2-shelter"/></a>
                                        <span className="kt-subheader__breadcrumbs-separator"/>
                                        <a href="#button" onClick={e => e.preventDefault()}
                                           className="kt-subheader__breadcrumbs-link">
                                            {t("Suppression")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <InfirmationTable
                            information={"A common UI paradigm to use with interactive tables is to present buttons that will trigger some action. See official documentation"}/>

                        <div className="kt-portlet">

                            <HeaderTablePage
                                title={"Suppression de Discussion"}
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
                                                            Search:
                                                            <input id="myInput" type="text"
                                                                   onKeyUp={(e) => searchElement(e)}
                                                                   className="form-control form-control-sm"
                                                                   placeholder=""
                                                                   aria-controls="kt_table_1"/>
                                                        </label>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <table
                                                        className="table table-striped- table-bordered table-hover table-checkable dataTable dtr-inline"
                                                        id="myTable" role="grid" aria-describedby="kt_table_1_info"
                                                        style={{width: "952px"}}>
                                                        <thead>
                                                        <tr role="row">

                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1"
                                                                rowSpan="1"
                                                                colSpan="1" style={{width: "150px"}}
                                                                aria-label="Ship City: activate to sort column ascending">Nom du Tchat
                                                            </th>
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1"
                                                                rowSpan="1"
                                                                colSpan="1" style={{width: "150px"}}
                                                                aria-label="Ship City: activate to sort column ascending">{t("Référence réclamation")}
                                                            </th>

                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1"
                                                                rowSpan="1" colSpan="1" style={{width: "50px"}}
                                                                aria-label="Type: activate to sort column ascending">
                                                                Action
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            chats.length ? (
                                                                search ? (
                                                                    chats.map((chat, index) => (
                                                                        printBodyTable(chat, index)
                                                                    ))
                                                                ) : (
                                                                    showList.map((chat, index) => (
                                                                        printBodyTable(chat, index)
                                                                    ))
                                                                )
                                                            ) : (
                                                                <EmptyTable/>
                                                            )
                                                        }
                                                        </tbody>
                                                        <tfoot>
                                                        <tr>

                                                        </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12 col-md-5">
                                                    <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                         aria-live="polite">{t("Affichage de")} 1
                                                        {("à")} {numberPerPage} {t("sur")} {chats.length} {t("données")}
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
        ) : null
    );
};
const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(RemoveChats);
