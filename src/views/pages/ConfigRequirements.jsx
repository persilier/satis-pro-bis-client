import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { Link } from "react-router-dom";
import {
  loadCss,
  forceRound,
  formatSelectOption,
  getLowerCaseString,
  debug,
} from "../../helpers/function";
import LoadingTable from "../components/LoadingTable";
import appConfig from "../../config/appConfig";
import Pagination from "../components/Pagination";
import EmptyTable from "../components/EmptyTable";
import InfirmationTable from "../components/InfirmationTable";
import { ToastBottomEnd } from "../components/Toast";
import {
  toastEditErrorMessageConfig,
  toastEditSuccessMessageConfig,
} from "../../config/toastConfig";
import HeaderTablePage from "../components/HeaderTablePage";
import { NUMBER_ELEMENT_PER_PAGE } from "../../constants/dataTable";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import { useTranslation } from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const ConfigRequirements = () => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  document.title = "Satis client - " + (ready ? t("Paramètre exigences") : "");
  const defaultData = {
    objectData: {},
    requirements: [],
  };
  const [load, setLoad] = useState(true);
  const [requirement, setRequirement] = useState([]);
  const [claimObject, setClaimObject] = useState([]);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(10);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [data, setData] = useState(defaultData);
  const [startRequest, setStartRequest] = useState(false);

  useEffect(() => {
    async function fetchData() {
      axios
        .get(appConfig.apiDomaine + "/claim-object-requirements")
        .then((response) => {
          let newObjectData = [];
          response.data.claimCategories.map((claimCategory) =>
            claimCategory.claim_objects.map(
              (claimObject) =>
                (newObjectData[claimObject.id] = claimObject.requirements.map(
                  (requirement) => ({
                    value: requirement.id,
                    label: requirement.description.fr,
                  })
                ))
            )
          );

          setData(newObjectData);
          setLoad(false);
          setClaimObject(response.data.claimCategories);
          setRequirement(response.data.requirements);
          setShowList(response.data.claimCategories.slice(0, numberPerPage));
          setNumberPage(
            forceRound(response.data.claimCategories.length / numberPerPage)
          );
        })
        .catch((error) => {
          setLoad(false);
          console.log("Something is wrong");
        });
    }
    window.sortHandlerGlobal = fetchData;

    if (verifyTokenExpire()) {
      fetchData();
    }
  }, []);

  const matchRequirement = (requirement, value) => {
    var match = false;
    requirement.map((el) => {
      match =
        match || getLowerCaseString(el.description["fr"]).indexOf(value) >= 0;
    });
    return match;
  };

  const matchObject = (objects, value) => {
    var match = false;
    objects.map((el) => {
      match =
        match ||
        getLowerCaseString(el.name["fr"]).indexOf(value) >= 0 ||
        matchRequirement(el.requirements, value);
    });
    return match;
  };

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newClaimObject = [...claimObject];
    debug(newClaimObject, "object");
    newClaimObject = newClaimObject.filter(
      (el) =>
        getLowerCaseString(el.name.fr).indexOf(value) >= 0 ||
        (!el.claim_objects.length
          ? false
          : matchObject(el.claim_objects, value))
    );

    return newClaimObject;
  };

  const searchElement = async (e) => {
    if (e.target.value) {
      setNumberPage(
        forceRound(
          filterShowListBySearchValue(e.target.value).length /
            NUMBER_ELEMENT_PER_PAGE
        )
      );
      setShowList(
        filterShowListBySearchValue(e.target.value.toLowerCase()).slice(
          0,
          NUMBER_ELEMENT_PER_PAGE
        )
      );
    } else {
      setNumberPage(forceRound(claimObject.length / NUMBER_ELEMENT_PER_PAGE));
      setShowList(claimObject.slice(0, NUMBER_ELEMENT_PER_PAGE));
      setActiveNumberPage(1);
    }
  };

  const onChangeNumberPerPage = (e) => {
    setActiveNumberPage(1);
    setNumberPerPage(parseInt(e.target.value));
    setShowList(claimObject.slice(0, parseInt(e.target.value)));
    setNumberPage(forceRound(claimObject.length / parseInt(e.target.value)));
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
    setShowList(
      claimObject.slice(
        getEndByPosition(page) - numberPerPage,
        getEndByPosition(page)
      )
    );
  };

  const onClickNextPage = (e) => {
    e.preventDefault();
    if (activeNumberPage <= numberPage) {
      setActiveNumberPage(activeNumberPage + 1);
      setShowList(
        claimObject.slice(
          getEndByPosition(activeNumberPage + 1) - numberPerPage,
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
        claimObject.slice(
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
    return pages;
  };

  const pages = arrayNumberPage();

  const onChangeExigence = (e, object_id) => {
    let newData = { ...data };
    newData[object_id] = e
      ? e.map((sel) => ({ value: sel.value, label: sel.label }))
      : "";
    setData(newData);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setStartRequest(true);
    let claimObjects = { ...data };
    let values = {};

    for (const claim_object_id in claimObjects) {
      let requirements = claimObjects[claim_object_id];
      // console.log(requirements, 'requirement_for_' + claim_object_id);
      values[claim_object_id] = requirements
        ? requirements.map((requirement) => requirement.value)
        : null;
    }
    // console.log(values, 'values');

    if (verifyTokenExpire()) {
      axios
        .put(appConfig.apiDomaine + `/claim-object-requirements`, values)
        .then((response) => {
          setStartRequest(false);
          ToastBottomEnd.fire(toastEditSuccessMessageConfig());
        })
        .catch((error) => {
          setStartRequest(false);
          ToastBottomEnd.fire(toastEditErrorMessageConfig());
        });
    }
  };

  const printBodyTable = (category, index) => {
    return category.claim_objects
      ? category.claim_objects.map((object, i) => (
          <tr key={i} role="row" className="odd">
            {i === 0 ? (
              <td data-sort="name" rowSpan={category.claim_objects.length}>
                {category.name.fr}
              </td>
            ) : null}
            <td data-sort="name">{object.name.fr}</td>
            <td>
              {requirement ? (
                <Select
                  value={data[object.id]}
                  onChange={(e) => onChangeExigence(e, object.id)}
                  options={formatSelectOption(requirement, "description", "fr")}
                  isMulti
                  key={object.id}
                />
              ) : null}
            </td>
          </tr>
        ))
      : null;
  };

  return ready ? (
    <div
      className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor"
      id="kt_content"
    >
      <div className="kt-subheader   kt-grid__item" id="kt_subheader">
        <div className="kt-container  kt-container--fluid ">
          <div className="kt-subheader__main">
            <h3 className="kt-subheader__title">{t("Paramètres")}</h3>
            <span className="kt-subheader__separator kt-hidden" />
            <div className="kt-subheader__breadcrumbs">
              <div className="kt-subheader__breadcrumbs">
                <a href="#" className="kt-subheader__breadcrumbs-home">
                  <i className="flaticon2-shelter" />
                </a>
                <span className="kt-subheader__breadcrumbs-separator" />
                <a
                  href=""
                  onClick={(e) => e.preventDefault()}
                  className="kt-subheader__breadcrumbs-link"
                >
                  {t("Configuration des exigences")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
        <InfirmationTable information={t("Configuration des exigences")} />

        <div className="kt-portlet">
          <HeaderTablePage
            addPermission={""}
            title={t("Exigences")}
            addText={t("Ajouter une exigence")}
            addLink={"/settings/requirement"}
          />

          {load ? (
            <LoadingTable />
          ) : (
            <div className="kt-portlet__body">
              <div
                id="kt_table_1_wrapper"
                className="dataTables_wrapper dt-bootstrap4"
              >
                <div className="row">
                  <div className="col-sm-6 text-left">
                    <div id="kt_table_1_filter" className="dataTables_filter">
                      <label>
                        {t("Recherche")}:
                        <input
                          id="myInput"
                          type="text"
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
                      className="table table-striped- table-bordered table-hover table-checkable dataTable dtr-inline"
                      id="myTable"
                      role="grid"
                      aria-describedby="kt_table_1_info"
                      style={{ width: "952px" }}
                    >
                      <thead>
                        <tr role="row">
                          <th
                            className="sorting"
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "80px" }}
                            aria-label="Ship City: activate to sort column ascending"
                          >
                            {t("Catégorie de plainte")}
                          </th>
                          <th
                            className="sorting"
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "100px" }}
                            aria-label="Ship City: activate to sort column ascending"
                          >
                            {t("Objet de réclamation")}
                          </th>
                          <th
                            className="sorting"
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "170px" }}
                            aria-label="Ship City: activate to sort column ascending"
                          >
                            {t("Exigences")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {claimObject ? (
                          showList.length ? (
                            showList.map((category, index) =>
                              printBodyTable(category, index)
                            )
                          ) : (
                            <EmptyTable search={true} />
                          )
                        ) : (
                          <EmptyTable />
                        )}
                      </tbody>
                    </table>
                    <div className="kt-portlet__foot">
                      <div className="kt-form__actions text-right">
                        {!startRequest ? (
                          <button
                            type="submit"
                            onClick={(e) => onSubmit(e)}
                            className="btn btn-primary"
                          >
                            {t("Enregistrer")}
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                            type="button"
                            disabled
                          >
                            {t("Chargement")}...
                          </button>
                        )}
                        {!startRequest ? (
                          <Link
                            to="/dashboard"
                            className="btn btn-secondary mx-2"
                          >
                            {t("Quitter")}
                          </Link>
                        ) : (
                          <Link
                            to="/dashboard"
                            className="btn btn-secondary mx-2"
                            disabled
                          >
                            {t("Quitter")}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12 col-md-5">
                    <div
                      className="dataTables_info"
                      id="kt_table_1_info"
                      role="status"
                      aria-live="polite"
                    >
                      {t("Affichage de")} 1 {t("à")} {numberPerPage} {t("sur")}{" "}
                      {claimObject.length} {t("données")}
                    </div>
                  </div>

                  {showList.length ? (
                    <div className="col-sm-12 col-md-7 dataTables_pager">
                      <Pagination
                        numberPerPage={numberPerPage}
                        onChangeNumberPerPage={onChangeNumberPerPage}
                        activeNumberPage={activeNumberPage}
                        onClickPreviousPage={(e) => onClickPreviousPage(e)}
                        pages={pages}
                        onClickPage={(e, number) => onClickPage(e, number)}
                        numberPage={numberPage}
                        onClickNextPage={(e) => onClickNextPage(e)}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

export default ConfigRequirements;
