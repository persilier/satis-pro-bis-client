import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    useParams
} from "react-router-dom";
import {loadCss, filterDataTableBySearchValue, forceRound} from "../../../helpers/function";
import LoadingTable from "../../components/LoadingTable";
import {ToastBottomEnd} from "../../components/Toast";
import {toastDeleteErrorMessageConfig, toastDeleteSuccessMessageConfig} from "../../../config/toastConfig";
import {DeleteConfirmation} from "../../components/ConfirmationAlert";
import {confirmDeleteConfig} from "../../../config/confirmConfig";
import appConfig from "../../../config/appConfig";
import Pagination from "../../components/Pagination";
import EmptyTable from "../../components/EmptyTable";
import HeaderTablePage from "../../components/HeaderTablePage";
import InfirmationTable from "../../components/InfirmationTable";
import {ERROR_401} from "../../../config/errorPage";
import {verifyPermission} from "../../../helpers/permission";
import {connect} from "react-redux";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const Participants = (props) => {
    const {id,type} = useParams();
    if (!verifyPermission(props.userPermissions, "list-discussion-contributors"))
        window.location.href = ERROR_401;

    let userDataJson = JSON.parse(localStorage.getItem("userData"));

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const [load, setLoad] = useState(true);
    const [contributor, setContributor] = useState([]);
    const [responseData, setResponseData] = useState(null);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(5);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [search, setSearch] = useState(false);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + `/discussions/${id}/staff`)
                .then(response => {
                    setLoad(false);
                    setResponseData(response.data);
                    setContributor(response.data.staff);
                    setShowList(response.data.staff.slice(0, numberPerPage));
                    setNumberPage(forceRound(response.data.staff.length / numberPerPage));
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
        setShowList(contributor.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(contributor.length / parseInt(e.target.value)));
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
        setShowList(contributor.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                contributor.slice(
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
                contributor.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                )
            );
        }
    };

    const deleteContributor = (contributorId, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig())
            .then((result) => {
                if (result.value) {
                    if (verifyTokenExpire()) {
                        axios.delete(appConfig.apiDomaine + `/discussions/${id}/staff/${contributorId}`)
                            .then(response => {
                                const newContributor = [...contributor];
                                newContributor.splice(index, 1);
                                setContributor(newContributor);
                                if (showList.length > 1) {
                                    setShowList(
                                        newContributor.slice(
                                            getEndByPosition(activeNumberPage) - numberPerPage,
                                            getEndByPosition(activeNumberPage)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage);
                                } else {
                                    setShowList(
                                        newContributor.slice(
                                            getEndByPosition(activeNumberPage - 1) - numberPerPage,
                                            getEndByPosition(activeNumberPage - 1)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage - 1);
                                }
                                setNumberPage(forceRound(newContributor.length/numberPerPage));
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

    const printBodyTable = (user, index) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>{user.identite.lastname + "  " + user.identite.firstname}</td>
                <td>{user.unit.name.fr}</td>
                <td>{user.identite.email ?
                    user.identite.email.map((mail, index) => (
                        index === user.identite.email.length - 1 ? mail : mail + " " + <br/> + " "
                    )) : null
                }</td>
                {
                    userDataJson.staff.id === responseData.created_by.id ?
                        <td style={{textAlign: 'center'}}>
                            {
                                user.id === responseData.created_by.id ?
                                    null :
                                    <button
                                        onClick={(e) => deleteContributor(user.id, index)}
                                        className="btn btn-sm btn-clean btn-icon btn-icon-md"
                                        title="Retirer du Tchat">
                                        <i className="la la-user-times fa-2x"/>
                                    </button>
                            }

                        </td>
                        : null
                }


            </tr>
        )
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, "list-discussion-contributors") ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">

                                {
                                    (type) ? (
                                        <h3 className="kt-subheader__title"> {t("Escalade")} </h3>
                                    ) : <h3 className="kt-subheader__title"> {t("Traitement")} </h3>
                                }
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
                                            {t("Liste des participants")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <InfirmationTable
                            information={t("Liste des participants")}/>

                        <div className="kt-portlet">

                            <HeaderTablePage
                                addPermission={"add-discussion-contributor"}
                                addText={t("Ajouter")}
                                addLink={`/treatment/chat/add_user/${id}/${type || ""}`}
                                title={t("Liste des participants")}
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
                                                            {t("Search")}:
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
                                                                aria-label="Ship City: activate to sort column ascending">{t("Participants")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1"
                                                                rowSpan="1"
                                                                colSpan="1" style={{width: "150px"}}
                                                                aria-label="Ship City: activate to sort column ascending">{t("Agent")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1"
                                                                rowSpan="1"
                                                                colSpan="1" style={{width: "150px"}}
                                                                aria-label="Ship City: activate to sort column ascending">Email
                                                            </th>

                                                            {
                                                                responseData ?
                                                                    userDataJson.staff.id === responseData.created_by.id ?
                                                                        <th className="sorting" tabIndex="0"
                                                                            aria-controls="kt_table_1"
                                                                            rowSpan="1" colSpan="1" style={{width: "50px"}}
                                                                            aria-label="Type: activate to sort column ascending">
                                                                            Action
                                                                        </th>
                                                                        : <th style={{display: "none"}}/>
                                                                    : null
                                                            }

                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            contributor.length ? (
                                                                search ? (
                                                                    contributor.map((user, index) => (
                                                                        printBodyTable(user, index)
                                                                    ))
                                                                ) : (
                                                                    showList.map((user, index) => (
                                                                        printBodyTable(user, index)
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
                                                        {t("à")} {numberPerPage} {t("sur")} {contributor.length} {t("données")}
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

export default connect(mapStateToProps)(Participants);
