import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    Link
} from "react-router-dom";
import {connect} from "react-redux";
import {loadCss, forceRound, getLowerCaseString} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import InfirmationTable from "../components/InfirmationTable";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {DeleteConfirmation} from "../components/ConfirmationAlert";
import {confirmDeleteConfig} from "../../config/confirmConfig";
import {ToastBottomEnd} from "../components/Toast";
import {toastDeleteErrorMessageConfig, toastDeleteSuccessMessageConfig} from "../../config/toastConfig";


loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ConfigTitreRapport = (props) => {
    document.title = "Satis Paramètre Titre Rapport - Configuration formulaire";

    if (!verifyPermission(props.userPermissions, "update-reporting-titles-configs"))
        window.location.href = ERROR_401;

    const [load, setLoad] = useState(true);
    const [component, setComponent] = useState([]);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(NUMBER_ELEMENT_PER_PAGE);
    const [activeNumberPage, setActiveNumberPage] = useState(1);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + "/reporting-metadata")
                .then(response => {
                    console.log(response.data, 'RESPONSE');
                    setLoad(false);
                    setComponent(response.data);
                    setShowList(response.data.slice(0, numberPerPage));
                    setNumberPage(forceRound(response.data.length / numberPerPage));
                })
                .catch(error => {
                    setLoad(false);
                    console.log("Something is wrong");
                })
            ;
        }

    },[]);

    const filterShowListBySearchValue = (value) => {
        value = getLowerCaseString(value);
        let newComponent = [...component];
        newComponent = newComponent.filter(el => (
            getLowerCaseString(el.params["fr"].title ? el.params["fr"].title.value : "").indexOf(value) >= 0
        ));

        return newComponent;
    };

    const searchElement = async (e) => {
        if (e.target.value) {
            setNumberPage(forceRound(filterShowListBySearchValue(e.target.value).length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(filterShowListBySearchValue(e.target.value.toLowerCase()).slice(0, NUMBER_ELEMENT_PER_PAGE));
        } else {
            setNumberPage(forceRound(component.length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(component.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setActiveNumberPage(1);
        }
    };

    const onChangeNumberPerPage = (e) => {
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
        setShowList(component.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(component.length / parseInt(e.target.value)));
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
        setShowList(component.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                component.slice(
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
                component.slice(
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

    const deleteComponent = (id, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig)
            .then((result) => {
                if (result.value) {
                    if (verifyTokenExpire()) {
                        axios.delete(appConfig.apiDomaine + `/my/reporting-claim/config/${id}`)
                            .then(response => {
                                console.log(response, "OK");
                                const newComponent = [...component];
                                newComponent.splice(index, 1);
                                setComponent(newComponent);
                                ToastBottomEnd.fire(toastDeleteSuccessMessageConfig);
                            })
                            .catch(error => {
                                ToastBottomEnd.fire(toastDeleteErrorMessageConfig);
                            })
                        ;
                    }
                }
            })
        ;
    };

    const pages = arrayNumberPage();

    const printBodyTable = (component, index) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>{component.name === null ? "" : component.name}</td>
                <td>{component.title === null ? "" : component.title}</td>
                <td>{component.description === null ? "" : component.description}</td>
                <td style={{textAlign:'center'}}>
                    <Link
                        to={`/settings/config-rapport/edit/${component.name}`}
                        className="btn btn-sm btn-clean btn-icon btn-icon-md"
                        title="Modifier">
                        <i className="la la-edit"/>
                    </Link>
                   {/* <button
                        onClick={(e) => deleteComponent(component.id, index)}
                        className="btn btn-sm btn-clean btn-icon btn-icon-md"
                        title="Supprimer">
                        <i className="la la-trash"/>
                    </button>*/}
                </td>
            </tr>
        )
    };

    return (
        verifyPermission(props.userPermissions, "update-reporting-titles-configs")?(
                <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                    <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                        <div className="kt-container  kt-container--fluid ">
                            <div className="kt-subheader__main">
                                <h3 className="kt-subheader__title">
                                    Paramètres
                                </h3>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <span className="kt-subheader__separator kt-hidden"/>
                                    <div className="kt-subheader__breadcrumbs">
                                        <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                            className="flaticon2-shelter"/></a>
                                        <span className="kt-subheader__breadcrumbs-separator"/>
                                        <a href="#button" onClick={e => e.preventDefault()}
                                           className="kt-subheader__breadcrumbs-link">
                                            Configurations Titre Rapport
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                        <InfirmationTable
                            information={"Configuration des titres"}/>

                        <div className="kt-portlet">

                            <HeaderTablePage
                                title={"Configuration Titre Rapport"}
                            />
                            {
                                load ? (
                                    <LoadingTable/>
                                ) : (
                                    <div className="kt-portlet__body">
                                        <div id="kt_table_1_wrapper" className="dataTables_wrapper dt-bootstrap4">

                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <table
                                                        className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                                                        id="myTable" role="grid" aria-describedby="kt_table_1_info"
                                                        style={{width: "952px"}}>
                                                        <thead>
                                                        <tr role="row">
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1"
                                                                rowSpan="1"
                                                                colSpan="1" style={{width: "150px"}}
                                                                aria-label="Ship City: activate to sort column ascending">Type de Rapport
                                                            </th>
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1"
                                                                rowSpan="1"
                                                                colSpan="1" style={{width: "150px"}}
                                                                aria-label="Ship City: activate to sort column ascending">Titre du Rapport
                                                            </th>
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1"
                                                                rowSpan="1"
                                                                colSpan="1" style={{width: "150px"}}
                                                                aria-label="Ship City: activate to sort column ascending">Description
                                                            </th>
                                                            <th className="sorting" tabIndex="0"
                                                                aria-controls="kt_table_1"
                                                                rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                                                aria-label="Type: activate to sort column ascending">
                                                                Action
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {
                                                            component.length ? (
                                                                showList ? (
                                                                    showList.map((component, index) => (
                                                                        printBodyTable(component, index)
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

                                                        </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            ):null
    );
};
const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(ConfigTitreRapport);
