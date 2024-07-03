import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    Link
} from "react-router-dom";
import {loadCss, forceRound, getLowerCaseString} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import {ToastBottomEnd} from "../components/Toast";
import {toastDeleteErrorMessageConfig, toastDeleteSuccessMessageConfig} from "../../config/toastConfig";
import {DeleteConfirmation} from "../components/ConfirmationAlert";
import {confirmDeleteConfig} from "../../config/confirmConfig";
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import HeaderTablePage from "../components/HeaderTablePage";
import InfirmationTable from "../components/InfirmationTable";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import {connect} from "react-redux";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const endPointConfig = {
    PRO: {
        plan: "PRO",
        list: `${appConfig.apiDomaine}/my/reporting-claim/config`,
    },
    MACRO: {
        holding: {
            list: `${appConfig.apiDomaine}/any/reporting-claim/config`,
        },
        filial: {
            list: `${appConfig.apiDomaine}/my/reporting-claim/config`,
        }
    },
};

const ConfigRapportAuto = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis rapport - " + (ready ? t("Paramètre configuration rapport automatique") : "");
    if (
       // !verifyPermission(props.userPermissions, "config-reporting-claim-any-institution") ||
        !verifyPermission(props.userPermissions, "list-config-reporting-claim-my-institution"))
        window.location.href = ERROR_401;

    let endPoint = "";
    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'list-config-reporting-claim-any-institution'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'list-config-reporting-claim-my-institution'))
            endPoint = endPointConfig[props.plan]
    } else {
        endPoint = endPointConfig[props.plan]
    }

    const [load, setLoad] = useState(true);
    const [rapportAuto, setRapportAuto] = useState([]);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(5);
    const [activeNumberPage, setActiveNumberPage] = useState(1);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(endPoint.list)
                .then(response => {
                    setLoad(false);
                    setRapportAuto(response.data);
                    setShowList(response.data.slice(0, numberPerPage));
                    setNumberPage(forceRound(response.data.length / numberPerPage));
                })
                .catch(error => {
                    setLoad(false);
                    //console.log("Something is wrong");
                })
            ;
        }
    },[]);

    const getEmailString = (email) => {
        let emailString = "";
        email.map((mail, index) => (
            index === email.length - 1 ? emailString + mail : emailString + mail  +"/ "
        ));
        return emailString;
    };

    const filterShowListBySearchValue = (value) => {
        value = getLowerCaseString(value);
        let newRapportAuto = [...rapportAuto];
        newRapportAuto = newRapportAuto.filter(el => (
            getLowerCaseString(el.institution_targeted ? el.institution_targeted.name : "").indexOf(value) >= 0 ||
            getLowerCaseString(el.period ? el.period_tag.label : "").indexOf(value) >= 0 ||
            getLowerCaseString(getEmailString(el.email)).indexOf(value) >= 0 ||
            getLowerCaseString(el.email ? el.email : "").indexOf(value) >= 0
        ));

        return newRapportAuto;
    };

    const searchElement = async (e) => {
        if (e.target.value) {
            setNumberPage(forceRound(filterShowListBySearchValue(e.target.value).length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(filterShowListBySearchValue(e.target.value.toLowerCase()).slice(0, NUMBER_ELEMENT_PER_PAGE));
        } else {
            setNumberPage(forceRound(rapportAuto.length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(rapportAuto.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setActiveNumberPage(1);
        }
    };

    const onChangeNumberPerPage = (e) => {
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
        setShowList(rapportAuto.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(rapportAuto.length / parseInt(e.target.value)));
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
        setShowList(rapportAuto.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                rapportAuto.slice(
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
                rapportAuto.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                )
            );
        }
    };

    const deleteCategoryClient = (rapportAutoId, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig())
            .then((result) => {
                if (verifyTokenExpire()) {
                    if (result.value) {
                        axios.delete(endPoint.list + `/${rapportAutoId}`)
                            .then(response => {
                                const newRapport = [...rapportAuto];
                                newRapport.splice(index, 1);
                                setRapportAuto(newRapport);
                                if (showList.length > 1) {
                                    setShowList(
                                        newRapport.slice(
                                            getEndByPosition(activeNumberPage) - numberPerPage,
                                            getEndByPosition(activeNumberPage)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage);
                                } else {
                                    setShowList(
                                        newRapport.slice(
                                            getEndByPosition(activeNumberPage - 1) - numberPerPage,
                                            getEndByPosition(activeNumberPage - 1)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage - 1);
                                }
                                setNumberPage(forceRound(newRapport.length/numberPerPage));
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

    const printBodyTable = (rapport, index) => {
        return (
            <tr key={index} role="row" className="odd">

                {
                    props.plan === "MACRO" ? (
                        <td>{rapport.institution_targeted ? rapport.institution_targeted.name:""}</td>
                    ) : null
                }
                {
                    props.plan === "PRO" ? (
                        <td>
                            {rapport.staffs ?
                                rapport.staffs.map((staff, index) => (
                                    staff.identite.firstname + " "  + staff.identite.lastname + " ,"
                                )) : null
                            }
                        </td>
                    ) : null
                }

                <td className={"text-center"}>
                    {
                        (rapport?.period ? rapport.period : (rapport?.period_tag && rapport.period_tag.label ? rapport.period_tag.label : "" )) === "biannual" ?
                            <span className="kt-badge kt-badge--inline kt-badge--info h2">{t("Semestriel")}</span>
                            : (rapport?.period ? rapport.period : (rapport?.period_tag && rapport.period_tag.label ? rapport.period_tag.label : "" )) === "weeks" ?
                            <span className="kt-badge kt-badge--inline kt-badge--success h2">{t("Hebdomadaire")}</span>
                            :  (rapport?.period ? rapport.period : (rapport?.period_tag && rapport.period_tag.label ? rapport.period_tag.label : "" )) === "quarterly" ?
                                <span className="kt-badge kt-badge--inline kt-badge--dark h2">{t("Trimestriel")}</span>
                                 :  (rapport?.period ? rapport.period : (rapport?.period_tag && rapport.period_tag.label ? rapport.period_tag.label : "" )) === "months" ?
                                <span className="kt-badge kt-badge--inline kt-badge--danger h2">{t("Mensuel")}</span>
                                   :  <span className="kt-badge kt-badge--inline kt-badge--warning h2">{t("Journalier")}</span>
                    }
                     {/* {rapport.period === null ? "" : rapport.period_tag.label}*/}




                </td>
                <td>{rapport.reporting_type === null ? "-" : rapport.reporting_type}</td>
                <td>
                    {rapport.staffs ?
                        rapport.staffs.map((staff, index) => (
                           staff.identite.email ? staff.identite.email.map((email, index) => (
                                email +" "
                            )) : null
                        )) : null
                    }
                </td>
                <td style={{textAlign:'center'}}>

                    {
                        verifyPermission(props.userPermissions, 'update-config-reporting-claim-my-institution') ?
                            <Link
                                to={`/settings/rapport/edit/${rapport.id}`}
                                className="btn btn-sm btn-clean btn-icon btn-icon-md"
                                title={t("Modifier")}>
                                <i className="la la-edit"/>
                            </Link>
                            : null
                    }

                    {verifyPermission(props.userPermissions, "delete-config-reporting-claim-my-institution") ?
                        <button
                            onClick={(e) => deleteCategoryClient(rapport.id, index)}
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
            <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-container  kt-container--fluid ">
                        <div className="kt-subheader__main">
                            <h3 className="kt-subheader__title">
                                {t("Paramètres")}
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()}
                                   className="kt-subheader__breadcrumbs-link">
                                    {t("Rapport automatique")}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                    <InfirmationTable
                        information={t("Liste des rapports automatiques")}/>

                    <div className="kt-portlet">

                        <HeaderTablePage
                            addPermission={"store-config-reporting-claim-my-institution"}
                            title={t("Rapport Automatique")}
                            addText={t("Ajouter une configuration")}
                            addLink={"/settings/rapport/add"}
                        />
                        {
                            load ? (
                                <LoadingTable/>
                            ) : (
                                <div className="kt-portlet__body">
                                    <div id="kt_table_1_wrapper" className="dataTables_wrapper dt-bootstrap4">
                                        <div className="row">
                                            <div className="col-sm-6 text-left">
                                              {/*  <div id="kt_table_1_filter" className="dataTables_filter">
                                                    <label>
                                                        {t("Recherche")}:
                                                        <input id="myInput" type="text"
                                                               onKeyUp={(e) => searchElement(e)}
                                                               className="form-control form-control-sm"
                                                               placeholder=""
                                                               aria-controls="kt_table_1"/>
                                                    </label>
                                                </div>*/}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <table
                                                    className="table table-striped- table-bordered table-hover table-checkable dataTable dtr-inline"
                                                    id="myTable" role="grid" aria-describedby="kt_table_1_info"
                                                    style={{width: "952px"}}>
                                                    <thead>
                                                    <tr role="row" style={{textAlign:"center"}}>
                                                        {
                                                            props.plan === "MACRO" ? (
                                                                <th className="sorting" tabIndex="0"
                                                                    aria-controls="kt_table_1"
                                                                    rowSpan="1"
                                                                    colSpan="1" style={{width: "100px"}}
                                                                    aria-label="Ship City: activate to sort column ascending">{t("Institutions")}
                                                                </th>
                                                            ) : null
                                                        }
                                                        {
                                                            props.plan === "PRO" ? (
                                                                <th className="sorting" tabIndex="0"
                                                                    aria-controls="kt_table_1"
                                                                    rowSpan="1"
                                                                    colSpan="1" style={{width: "100px"}}
                                                                    aria-label="Ship City: activate to sort column ascending">{t("Agents")}
                                                                </th>
                                                            ) : null
                                                        }
                                                        <th className="sorting" tabIndex="0"
                                                            aria-controls="kt_table_1"
                                                            rowSpan="1"
                                                            colSpan="1" style={{width: "100px"}}
                                                            aria-label="Ship City: activate to sort column ascending">{t("Périodes")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0"
                                                            aria-controls="kt_table_1"
                                                            rowSpan="1"
                                                            colSpan="1" style={{width: "100px"}}
                                                            aria-label="Ship City: activate to sort column ascending">{t("Rapports")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0"
                                                            aria-controls="kt_table_1"
                                                            rowSpan="1"
                                                            colSpan="1" style={{width: "150px"}}
                                                            aria-label="Ship City: activate to sort column ascending">Emails
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
                                                        rapportAuto.length ? (
                                                            showList ? (
                                                                showList.map((rapport, index) => (
                                                                    printBodyTable(rapport, index)
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
                                                        {
                                                            props.plan === "MACRO" ? (
                                                                <th rowSpan="1" colSpan="1">{t("Institutions")}</th>
                                                            ) : null
                                                        }
                                                        {
                                                            props.plan === "PRO" ? (
                                                                <th rowSpan="1" colSpan="1">{t("Agents")}</th>
                                                            ) : null
                                                        }
                                                        <th rowSpan="1" colSpan="1">{t("Périodes")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Rapports")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Emails")}</th>
                                                        <th rowSpan="1" colSpan="1">{t("Action")}</th>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12 col-md-5">
                                                <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                     aria-live="polite">{t("Affichage de")} 1 {t("à")} {numberPerPage} {t("sur")} {rapportAuto.length} {t("données")}
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
        plan: state.plan.plan,
    };
};

export default connect(mapStateToProps)(ConfigRapportAuto);
