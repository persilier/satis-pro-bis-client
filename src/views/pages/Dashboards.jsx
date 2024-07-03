import React, {useEffect, useState} from 'react';
import axios from "axios";
import DashboardClaimsAll from "../../APP_MACRO/Holding/DashboardClaimsAll";
import DashboardClaimsMy from "../components/DashboardForm/DashboardClaimsMy";
import DashboardClaimsUnit from "../components/DashboardForm/DashboardClaimsUnit";
import DashboardSummaryReport from "../components/DashboardForm/DashboardSummaryReport";
import DashboardStatClaim from "../components/DashboardForm/DashboardStatClaim";
import DashboardStatistic from "../components/DashboardForm/DashboardStatistic";
import GraphChannel from "../components/DashboardForm/GraphChannel";
import DashboardClaimsActivity from "../components/DashboardForm/DashboardClaimsActivity";
import ClaimToInstitution from "../components/DashboardForm/ClaimToInstitution";
import ClaimToPointOfServices from "../components/DashboardForm/ClaimToPointOfServices";
import {verifyPermission} from "../../helpers/permission";
import {connect} from "react-redux";
import appConfig from "../../config/appConfig";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import LoadingTable from "../components/LoadingTable";
import Select from "react-select";
import {formatSelectOption} from "../../helpers/function";
import DashboardPieChart from "../components/DashboardForm/DashboardPieChart";

import { useTranslation } from "react-i18next";

const Dashboards = (props) => {
    document.title = "Satis client - Dashboard";

    const {t, ready} = useTranslation();

    const defaultData = {institution_targeted_id: ""};

    const [response, setResponse] = useState(null);
    const [dataInstitution, setDataInstitution] = useState([]);
    const [institution, setInstitution] = useState([]);
    const [data, setData] = useState(defaultData);
    const [load, setLoad] = useState(true);
    const [component, setComponent] = useState(undefined);


    const getResponseAxios = (data) => {
        axios.post(appConfig.apiDomaine + "/dashboard", data)
            .then(response => {
                setResponse(response);
                setDataInstitution(response.data.institutions);
                setLoad(false)
            })
            .catch(error => console.log("Something is wrong"))
        ;
    };
    useEffect(() => {
        async function fetchData() {
            await getResponseAxios();
            await axios.get(appConfig.apiDomaine + "/components/retrieve-by-name/dashboard-text")
                .then(response => {
                    setComponent(response.data);
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
    }, []);

    const onChangeInstitution = (selected) => {
        const newData = {...data};
        setLoad(true);

        if (selected) {
            newData.institution_targeted_id = selected.value;
            setInstitution(selected);
            getResponseAxios(newData)
        } else {
            newData.institution_targeted_id = "";
            setInstitution(null);
            getResponseAxios()
        }
        setData(newData);
    };

    return (
        ready ? (<div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
            <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                <div className="kt-container  kt-container--fluid ">
                    <div className="kt-subheader__main">
                        <h3 className="kt-subheader__title">
                            {t("Tableau de bord")}
                        </h3>
                    </div>
                    {
                        verifyPermission(props.userPermissions, "show-dashboard-data-all-institution") ?
                            <div className={"col-5"}>
                                <div
                                    className={"form-group row"}>
                                    <label className="col-xl-2 col-lg-3 col-form-label"
                                           htmlFor="exampleSelect1">{t("Institution")}</label>
                                    <div className="col-lg-9 col-xl-2">
                                        {dataInstitution ? (
                                            <Select
                                                isClearable
                                                classNamePrefix="select"
                                                placeholder={t("Choisissez une institution pour le filtre")}
                                                className="basic-single"
                                                value={institution}
                                                onChange={onChangeInstitution}
                                                options={formatSelectOption(dataInstitution, 'name', false)}
                                            />
                                        ) : ''
                                        }

                                    </div>
                                </div>
                            </div>
                            : ""
                    }

                </div>
            </div>

            <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                {
                    response && component && !load ? (
                        <div>
                            {
                                verifyPermission(props.userPermissions, "show-dashboard-data-all-institution") ?
                                    <div className="kt-portlet">
                                        <DashboardClaimsAll
                                            response={response}
                                            component={component}
                                        />
                                    </div> : null
                            }

                            {
                                verifyPermission(props.userPermissions, "show-dashboard-data-my-institution") ?
                                    <div className="kt-portlet">
                                        <DashboardClaimsMy
                                            response={response}
                                            component={component}
                                        />
                                    </div> : null
                            }

                            {
                                verifyPermission(props.userPermissions, "show-dashboard-data-my-unit") ?
                                    <div className="kt-portlet">
                                        <DashboardClaimsUnit
                                            response={response}
                                            component={component}
                                        />
                                    </div> : null
                            }

                            {
                                verifyPermission(props.userPermissions, "show-dashboard-data-my-activity") ?
                                    <div className="kt-portlet">
                                        <DashboardClaimsActivity
                                            response={response}
                                            component={component}
                                        />
                                    </div> : null
                            }

                            <div>
                                <DashboardSummaryReport
                                    response={response}
                                    component={component}
                                />
                            </div>

                            <div>
                                <GraphChannel
                                    response={response}
                                    component={component}
                                />
                            </div>

                            <div>
                                <DashboardStatClaim
                                    response={response}
                                    component={component}
                                />
                            </div>

                            <div>
                                <DashboardStatistic
                                    response={response}
                                    component={component}
                                />
                            </div>
                            {
                                !data.institution_targeted_id ?
                                    <div>
                                        {
                                            verifyPermission(props.userPermissions, "show-dashboard-data-all-institution") &&
                                            (verifyPermission(props.userPermissions, "show-dashboard-data-my-institution")) ?
                                                <div className="kt-portlet">
                                                    {/*<ClaimToInstitution response={response}/>*/}
                                                    <DashboardPieChart
                                                        response={response}
                                                        component={component}/>
                                                </div> : null
                                        }
                                    </div>
                                    : ""
                            }
                            <div>
                                {
                                    !verifyPermission(props.userPermissions, "show-dashboard-data-all-institution") &&
                                    verifyPermission(props.userPermissions, "show-dashboard-data-my-institution") ?
                                        <div className="kt-portlet">
                                            <ClaimToPointOfServices
                                                response={response}
                                                component={component}
                                            />
                                        </div> : null
                                }
                            </div>
                        </div>
                    ) : (

                        <LoadingTable/>

                    )}
            </div>

        </div>) : null

    );

};

const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(Dashboards);
