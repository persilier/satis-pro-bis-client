import React, { useEffect, useState } from "react";
import axios from "axios";
import { connect } from "react-redux";
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
  toastAddErrorMessageConfig,
  toastAddSuccessMessageConfig,
} from "../../config/toastConfig";
import HeaderTablePage from "../components/HeaderTablePage";
import { verifyPermission } from "../../helpers/permission";
import { ERROR_401 } from "../../config/errorPage";
import { NUMBER_ELEMENT_PER_PAGE } from "../../constants/dataTable";
import { verifyTokenExpire } from "../../middleware/verifyToken";
import { useTranslation } from "react-i18next";

loadCss("/assets/plugins/custom/datatables/datatables.bundle.css");

const endPointConfig = {
  PRO: {
    plan: "PRO",
    list: `${appConfig.apiDomaine}/my/processing-circuits`,
  },
  MACRO: {
    holding: {
      list: `${appConfig.apiDomaine}/any/processing-circuits`,
    },
    filial: {
      list: `${appConfig.apiDomaine}/my/processing-circuits`,
    },
  },
  HUB: {
    plan: "HUB",
    list: `${appConfig.apiDomaine}/without-institution/processing-circuits`,
  },
};

const ConfigProcessingCircuit = (props) => {
  //usage of useTranslation i18n
  const { t, ready } = useTranslation();

  document.title =
    "Satis client - " + ready ? t("Paramètre entités de traitement") : "";

  if (
    !(
      verifyPermission(
        props.userPermissions,
        "update-processing-circuit-my-institution"
      ) ||
      verifyPermission(
        props.userPermissions,
        "update-processing-circuit-any-institution"
      ) ||
      verifyPermission(
        props.userPermissions,
        "update-processing-circuit-without-institution"
      )
    )
  )
    window.location.href = ERROR_401;

  let endPoint = "";
  if (props.plan === "MACRO") {
    if (
      verifyPermission(
        props.userPermissions,
        "update-processing-circuit-any-institution"
      )
    )
      endPoint = endPointConfig[props.plan].holding;
    else if (
      verifyPermission(
        props.userPermissions,
        "update-processing-circuit-my-institution"
      )
    )
      endPoint = endPointConfig[props.plan].filial;
  } else endPoint = endPointConfig[props.plan];

  const defaultData = {
    institution_id: [],
  };

  const [load, setLoad] = useState(true);
  const [units, setUnits] = useState([]);
  const [claimObject, setClaimObject] = useState([]);
  const [numberPage, setNumberPage] = useState(0);
  const [showList, setShowList] = useState([]);
  const [numberPerPage, setNumberPerPage] = useState(5);
  const [activeNumberPage, setActiveNumberPage] = useState(1);
  const [data, setData] = useState(undefined);
  const [institutionId, setInstitutionId] = useState(undefined);
  const [error] = useState(defaultData);
  const [startRequest, setStartRequest] = useState(false);
  const [institutionData, setInstitutionData] = useState(undefined);
  const [institution, setInstitution] = useState([]);

  useEffect(() => {
    if (
      verifyPermission(
        props.userPermissions,
        "update-processing-circuit-any-institution"
      )
    ) {
      axios.get(endPoint.list).then((response) => {
        const options = [
          response.data.institutions.length
            ? response.data.institutions.map((institution) => ({
                value: institution.id,
                label: institution.name,
              }))
            : null,
        ];
        setInstitutionData(options);
      });
    }

    async function fetchData() {
      axios
        .get(endPoint.list)
        .then((response) => {
          let newObjectData = [];
          response.data.claimCategories.map((claimCategory) =>
            claimCategory.claim_objects.map(
              (claimObject) =>
                (newObjectData[claimObject.id] = claimObject.units.map(
                  (unit) => ({
                    value: unit.id,
                    label: unit.name.fr,
                  })
                ))
            )
          );
          setData(newObjectData);
          setLoad(false);
          setClaimObject(response.data.claimCategories);
          setUnits(response.data.units);
          setInstitutionId(response.data.institution_id);
          setShowList(response.data.claimCategories.slice(0, numberPerPage));
          setNumberPage(
            forceRound(response.data.claimCategories.length / numberPerPage)
          );
        })
        .catch((error) => {
          setLoad(false);
          //console.log("Something is wrong");
        });
    }
    window.sortHandlerGlobal = fetchData;

    if (verifyTokenExpire()) {
      fetchData();
    }
  }, [endPoint.list, numberPerPage, props.userPermissions]);

  {
    /*<tr key={i} role="row" className="odd">
        {
            i === 0 ?
                <td rowSpan={category.claim_objects.length}>{category.name.fr}</td>
                : <td style={{display: "none"}}/>
        }
        <td>
            {object.name.fr}
        </td>
        <td>
            {units ? (
                <Select
                    value={data[object.id]}
                    onChange={(e) => onChangeProcessing(e, object.id)}
                    options={formatSelectOption(units, 'name', "fr")}
                    isMulti
                    placeholder={"Veillez selectionez le circuit"}
                    key={object.id}
                />
            ) : null
            }
        </td>
    </tr>*/
  }

  const matchToClaimObjectOrEntity = (list, value) => {
    let match = false;
    list.map((el) => {
      match =
        match ||
        getLowerCaseString(el.name["fr"]).indexOf(value) >= 0 ||
        (el.units ? matchToClaimObjectOrEntity(el.units, value) : false);
    });
    return match;
  };

  const filterShowListBySearchValue = (value) => {
    value = getLowerCaseString(value);
    let newClaimObject = [...claimObject];
    debug(newClaimObject, "all");
    newClaimObject = newClaimObject.filter(
      (el) =>
        getLowerCaseString(el.name["fr"]).indexOf(value) >= 0 ||
        matchToClaimObjectOrEntity(el.claim_objects, value)
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

  const onChangeProcessing = (e, object_id) => {
    let newData = { ...data };
    let all = false;
    let newUnits = e
      ? e.map((sel) => {
          if (sel.value !== "all")
            return { value: sel.value, label: sel.label };
          else if (sel.value === "all") all = true;
        })
      : "";
    newData[object_id] =
      all && newUnits ? formatSelectOption(units, "name", "fr") : newUnits;

    //console.log(e);
    setData(newData);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    setStartRequest(true);
    let claimObjects = { ...data };
    let values = {};

    for (const claim_object_id in claimObjects) {
      let processings = claimObjects[claim_object_id];

      values[claim_object_id] = processings
        ? processings.map((processing) => processing.value)
        : null;
    }

    let newEndPoint = "";
    if (
      verifyPermission(
        props.userPermissions,
        "update-processing-circuit-any-institution"
      )
    ) {
      newEndPoint = endPoint.list + `/${institutionId}`;
    } else {
      newEndPoint = endPoint.list;
    }
    // {console.log(values, 'valeur à enregistrer')}

    if (verifyTokenExpire()) {
      axios
        .put(newEndPoint, values)
        .then((response) => {
          setStartRequest(false);
          ToastBottomEnd.fire(toastAddSuccessMessageConfig());
        })
        .catch((error) => {
          setStartRequest(false);
          ToastBottomEnd.fire(toastAddErrorMessageConfig());
        });
    }
  };

  const onChangeInstitution = (selected) => {
    setInstitutionId(selected.value);
    setInstitution(selected);
    if (verifyTokenExpire()) {
      axios
        .get(
          appConfig.apiDomaine + `/any/processing-circuits/${selected.value}`
        )
        .then((response) => {
          setUnits(
            response.data.units ? response.data.units.map((unit) => unit) : null
          );
          let newObjectData = [];
          response.data.claimCategories.map((claimCategory) =>
            claimCategory.claim_objects.map(
              (claimObject) =>
                (newObjectData[claimObject.id] = claimObject.units.map(
                  (unit) => ({
                    value: unit.id,
                    label: unit.name.fr,
                  })
                ))
            )
          );
          setData(newObjectData);
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
            ) : (
              <td style={{ display: "none" }} />
            )}
            <td data-sort="claimObjects.name">{object.name.fr}</td>
            <td>
              {units ? (
                <Select
                  value={data[object.id]}
                  onChange={(e) => onChangeProcessing(e, object.id)}
                  options={[
                    {
                      value: "all",
                      label: (
                        <strong>
                          <em>Tout sélectionner</em>
                        </strong>
                      ),
                    },
                    ...formatSelectOption(units, "name", "fr"),
                  ]}
                  isMulti
                  placeholder={t("Veillez sélectionnez le circuit")}
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
                <a href="#icone" className="kt-subheader__breadcrumbs-home">
                  <i className="flaticon2-shelter" />
                </a>
                <span className="kt-subheader__breadcrumbs-separator" />
                <a
                  href="#button"
                  onClick={(e) => e.preventDefault()}
                  className="kt-subheader__breadcrumbs-link"
                >
                  {t("Configuration entités de traitement")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
        <InfirmationTable
          information={t(
            "Paramètre de configuration des entités de traitement"
          )}
        />
        <div className="kt-portlet">
          <HeaderTablePage
            addPermission={""}
            title={t("Entités de traitement")}
            addText={t("Ajouter une entité de traitement")}
            addLink={"/settings/processing-circuit"}
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
                    <br />
                    <br />
                    {verifyPermission(
                      props.userPermissions,
                      "update-processing-circuit-any-institution"
                    ) ? (
                      <div
                        className={
                          error.institution_id.length
                            ? "form-group row validated"
                            : "form-group row"
                        }
                      >
                        <label
                          className="col-xl-3 col-lg-3 col-form-label"
                          htmlFor="exampleSelect1"
                        >
                          {t("Sélectionnez une institution")}
                        </label>
                        <div className="col-lg-9 col-xl-6">
                          {institutionData ? (
                            <Select
                              placeholder={t(
                                "Veuillez sélectionner l'institution"
                              )}
                              value={institution}
                              onChange={onChangeInstitution}
                              options={
                                institutionData.length
                                  ? institutionData[0].map((name) => name)
                                  : null
                              }
                            />
                          ) : (
                            <select
                              name="category"
                              className={
                                error.institution_id.length
                                  ? "form-control is-invalid"
                                  : "form-control"
                              }
                              id="category"
                            >
                              <option value="" />
                            </select>
                          )}
                        </div>
                        {error.institution_id.length
                          ? error.institution_id.map((error, index) => (
                              <div key={index} className="invalid-feedback">
                                {error}
                              </div>
                            ))
                          : null}
                      </div>
                    ) : null}

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
                            data-sort="name"
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
                            data-sort="name"
                            className="sorting"
                            tabIndex="0"
                            aria-controls="kt_table_1"
                            rowSpan="1"
                            colSpan="1"
                            style={{ width: "100px" }}
                            aria-label="Ship City: activate to sort column ascending"
                          >
                            {t("Objets de plainte")}
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
                            {t("Entités de traitement")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/*{console.log(data,'data')}*/}
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

const mapStateToProps = (state) => {
  return {
    userPermissions: state.user.user.permissions,
    plan: state.plan.plan,
  };
};

export default connect(mapStateToProps)(ConfigProcessingCircuit);
