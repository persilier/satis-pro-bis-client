import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    Link
} from "react-router-dom";
import {filterDataTableBySearchValue, forceRound, loadCss, loadScript} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import {ToastBottomEnd} from "../components/Toast";
import {toastDeleteErrorMessageConfig, toastDeleteSuccessMessageConfig} from "../../config/toastConfig";
import {DeleteConfirmation} from "../components/ConfirmationAlert";
import {confirmDeleteConfig} from "../../config/confirmConfig";
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import {connect} from "react-redux";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const RelationShip = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = (ready ? t("Satis client - Paramètre type relation client") : "");
    if (!verifyPermission(props.userPermissions, "list-relationship"))
        window.location.href = ERROR_401;

    const [load, setLoad] = useState(true);
    const [relation, setRelation] = useState([]);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(NUMBER_ELEMENT_PER_PAGE);
    const [activeNumberPage, setActiveNumberPage] = useState(1);
    const [search, setSearch] = useState(false);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + "/relationships")
                .then(response => {
                    console.log(response.data,"DATA")
                    setRelation(response.data);
                    setShowList(response.data.slice(0, NUMBER_ELEMENT_PER_PAGE));
                    setNumberPage(forceRound(response.data.length / NUMBER_ELEMENT_PER_PAGE));
                    setLoad(false);
                })
                .catch(error => {
                    setLoad(false);
                    console.log("Something is wrong");
                })
            ;
        }
    }, [appConfig.apiDomaine, NUMBER_ELEMENT_PER_PAGE]);

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
        setShowList(relation.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(relation.length / parseInt(e.target.value)));
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
        setShowList(relation.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                relation.slice(
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
                relation.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                )
            );
        }
    };

    const deleteTypeClient = (relationId, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig())
            .then((result) => {
                if (result.value) {
                    if (verifyTokenExpire()) {
                        axios.delete(appConfig.apiDomaine + `/relationships/${relationId}`)
                            .then(response => {
                                console.log(response, "OK");
                                const newType = [...relation];
                                newType.splice(index, 1);
                                setRelation(newType);
                                if (showList.length > 1) {
                                    setShowList(
                                        newType.slice(
                                            getEndByPosition(activeNumberPage) - numberPerPage,
                                            getEndByPosition(activeNumberPage)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage);
                                } else {
                                    setShowList(
                                        newType.slice(
                                            getEndByPosition(activeNumberPage - 1) - numberPerPage,
                                            getEndByPosition(activeNumberPage - 1)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage - 1);
                                }
                                setNumberPage(forceRound(newType.length/numberPerPage));
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

    const printBodyTable = (typeRelation, index) => {
        return (
            <tr className="d-flex justify-content-center align-content-center odd" key={index} role="row"
                className="odd">
                <td>{typeRelation.name.fr}</td>
                <td>{typeRelation.description?typeRelation.description.fr:null}</td>
                <td style={{textAlign:"center"}}>
                    {
                        verifyPermission(props.userPermissions, 'show-relationship')?
                            <Link to={`/settings/relationship/edit/${typeRelation.id}`}
                                  className="btn btn-sm btn-clean btn-icon btn-icon-md"
                                  title={t("Modifier")}>
                                <i className="la la-edit"/>
                            </Link>
                            :""
                    }

                    {
                        verifyPermission(props.userPermissions, 'destroy-relationship') ?
                            <button
                                onClick={(e) => deleteTypeClient(typeRelation.id, index)}
                                className="btn btn-sm btn-clean btn-icon btn-icon-md"
                                title={t("Supprimer")}>
                                <i className="la la-trash"/>
                            </button>
                            : null
                    }

                </td>
            </tr>
        )
    };

    return (
        ready ? (
            verifyPermission(props.userPermissions, "list-relationship") ? (
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    {t("Paramètres")}
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#" className="kt-subheader__breadcrumbs-home"><i
                                        className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
                                        {t("Relation client")}
                                    </a>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <div className="kt-portlet">
                            <HeaderTablePage
                                addPermission={"store-relationship"}
                                title={t("Type de relation client")}
                                addText={t("Ajouter")}
                                addLink={"/settings/relationship/add"}
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
                                                                   className="form-control form-control-sm" placeholder=""
                                                                   aria-controls="kt_table_1"/>
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
                                                                colSpan="1" style={{width: "150px"}}
                                                                aria-label="Ship City: activate to sort column ascending">{t("Nom")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                                rowSpan="1"
                                                                colSpan="1" style={{width: "200px"}}
                                                                aria-label="Ship City: activate to sort column ascending">{t("Description")}
                                                            </th>
                                                            <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                                                rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                                aria-label="Type: activate to sort column ascending">
                                                                {t("Action")}
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            relation.length ? (
                                                                search ? (
                                                                    relation.map((type, index) => (
                                                                        printBodyTable(type, index)
                                                                    ))
                                                                ) : (
                                                                    showList.map((type, index) => (
                                                                        printBodyTable(type, index)
                                                                    ))
                                                                )
                                                            ) : (
                                                                <EmptyTable/>
                                                            )
                                                        }
                                                        </tbody>
                                                        <tfoot>
                                                        <tr></tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12 col-md-5">
                                                    <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                         aria-live="polite">
                                                        {relation.length ?
                                                            `${t("Affichage de")} 1 ${t("à")} ${numberPerPage} ${t("sur")} ${relation.length} ${t("données")}`
                                                            :
                                                            t("Affichage de 0 page")
                                                        }

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
export default connect(mapStateToProps)(RelationShip);
