import React, {useEffect, useState} from "react";
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
import InfirmationTable from "../components/InfirmationTable";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import {connect} from "react-redux";
import {NUMBER_ELEMENT_PER_PAGE} from "../../constants/dataTable";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");


const CategoryFAQs = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - " + ready ? t("Paramètre Categorie FAQs") : "";

    if (!verifyPermission(props.userPermissions, "list-faq-category"))
        window.location.href = ERROR_401;

    const [load, setLoad] = useState(true);
    const [categoryFaqs, setCategoryFaqs] = useState(undefined);
    const [numberPage, setNumberPage] = useState(0);
    const [showList, setShowList] = useState([]);
    const [numberPerPage, setNumberPerPage] = useState(10);
    const [activeNumberPage, setActiveNumberPage] = useState(1);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine+"/faq-categories")
                .then(response => {
                    setLoad(false);
                    setCategoryFaqs(response.data);
                    setShowList(response.data.slice(0, numberPerPage));
                    setNumberPage(forceRound(response.data.length / numberPerPage));
                })
                .catch(error => {
                    setLoad(false);
                    console.log("Something is wrong");
                })
            ;
        }
    }, []);

    const filterShowListBySearchValue = (value) => {
        value = getLowerCaseString(value);
        let newCategoryfaqs = [...categoryFaqs];
        newCategoryfaqs = newCategoryfaqs.filter(el => (
            getLowerCaseString(el.name["fr"]).indexOf(value) >= 0 ||
            getLowerCaseString(el.slug["fr"]).indexOf(value) >= 0
        ));

        return newCategoryfaqs;
    };

    const searchElement = async (e) => {
        if (e.target.value) {
            setNumberPage(forceRound(filterShowListBySearchValue(e.target.value).length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(filterShowListBySearchValue(e.target.value.toLowerCase()).slice(0, NUMBER_ELEMENT_PER_PAGE));
        } else {
            setNumberPage(forceRound(categoryFaqs.length/NUMBER_ELEMENT_PER_PAGE));
            setShowList(categoryFaqs.slice(0, NUMBER_ELEMENT_PER_PAGE));
            setActiveNumberPage(1);
        }
    };

    const onChangeNumberPerPage = (e) => {
        setActiveNumberPage(1);
        setNumberPerPage(parseInt(e.target.value));
        setShowList(categoryFaqs.slice(0, parseInt(e.target.value)));
        setNumberPage(forceRound(categoryFaqs.length / parseInt(e.target.value)));
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
        setShowList(categoryFaqs.slice(getEndByPosition(page) - numberPerPage, getEndByPosition(page)));
    };

    const onClickNextPage = (e) => {
        e.preventDefault();
        if (activeNumberPage <= numberPage) {
            setActiveNumberPage(activeNumberPage + 1);
            setShowList(
                categoryFaqs.slice(
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
                categoryFaqs.slice(
                    getEndByPosition(activeNumberPage - 1) - numberPerPage,
                    getEndByPosition(activeNumberPage - 1)
                )
            );
        }
    };

    const deleteCategoryFaqs = (categoryId, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig())
            .then((result) => {
                if (verifyTokenExpire()) {
                    if (result.value) {
                        axios.delete(appConfig.apiDomaine+`/faq-categories/${categoryId}`)
                            .then(response => {
                                console.log(response, "OK");
                                const newCategory = [setCategoryFaqs];
                                newCategory.splice(index, 1);
                                setCategoryFaqs(newCategory);
                                if (showList.length > 1) {
                                    setShowList(
                                        newCategory.slice(
                                            getEndByPosition(activeNumberPage) - numberPerPage,
                                            getEndByPosition(activeNumberPage)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage);
                                } else {
                                    setShowList(
                                        newCategory.slice(
                                            getEndByPosition(activeNumberPage - 1) - numberPerPage,
                                            getEndByPosition(activeNumberPage - 1)
                                        )
                                    );
                                    setActiveNumberPage(activeNumberPage - 1);
                                }
                                setNumberPage(forceRound(newCategory.length/numberPerPage));
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

    const printBodyTable = (category, index) => {
        return (
            <tr key={index} role="row" className="odd">
                <td>{category.name.fr}</td>
                <td >{category.slug.fr}</td>
                <td className="d-flex justify-content-center">
                    <Link to={`/settings/faqs/category/edit/${category.id}`}
                          className="btn btn-sm btn-clean btn-icon btn-icon-md"
                          title={t("Modifier")}>
                        <i className="la la-edit"/>
                    </Link>

                </td>
            </tr>
        )
    };

    return (
        ready ? (verifyPermission(props.userPermissions, "list-faq-category") ? (
            <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-container  kt-container--fluid ">
                        <div className="kt-subheader__main">
                            <h3 className="kt-subheader__title">
                                {t("Paramètres")}
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
                                    {t("FAQs")}
                                </a>
                                <span className="kt-subheader__separator kt-hidden"/>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                    <span className="kt-subheader__breadcrumbs-separator"/>
                                    <a href="" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link">
                                        {t("Categorie FAQs")}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                    <InfirmationTable
                        information={t("Liste des catégories de FAQs")}/>

                    <div className="kt-portlet">

                        <HeaderTablePage
                            addPermission={"store-faq-category"}
                            title={t("Catégorie FAQs")}
                            addText={t("Ajouter une catégorie FAQ")}
                            addLink={"/settings/faqs/category/add"}
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
                                                        <input id="myInput" type="text" onKeyUp={(e) => searchElement(e)}
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
                                                    style={{ width: "952px" }}>
                                                    <thead>
                                                    <tr role="row">
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1"
                                                            colSpan="1" style={{ width: "150px" }}
                                                            aria-label="Country: activate to sort column ascending">{t("Libellé")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1"
                                                            colSpan="1" style={{ width: "200px" }}
                                                            aria-label="Ship City: activate to sort column ascending">{t("Slug")}
                                                        </th>
                                                        <th className="sorting" tabIndex="0" aria-controls="kt_table_1" rowSpan="1" colSpan="1" style={{ width: "40.25px" }} aria-label="Type: activate to sort column ascending">
                                                            {t("Action")}
                                                        </th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {
                                                        categoryFaqs?
                                                            categoryFaqs.length ? (
                                                                showList.length ? (
                                                                    showList.map((category, index) => (
                                                                        printBodyTable(category, index)
                                                                    ))
                                                                ) : (
                                                                    <EmptyTable search={true}/>
                                                                )
                                                            ) : (
                                                                <EmptyTable/>
                                                            ):null
                                                    }
                                                    </tbody>
                                                    <tfoot>
                                                    <tr/>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12 col-md-5">
                                                <div className="dataTables_info" id="kt_table_1_info" role="status"
                                                     aria-live="polite">{t("Affichage de")} 1 {t("à")} {numberPerPage} {t("sur")} {categoryFaqs?categoryFaqs.length:0} {t("données")}
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
        ): null) : null
    );
};
const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(CategoryFAQs);
