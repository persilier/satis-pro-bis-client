import React, {useEffect, useState} from 'react';
import {verifyPermission} from "../../../helpers/permission";
import axios from "axios";
import appConfig from "../../../config/appConfig";
import {connect} from "react-redux";
import {percentageData} from "../../../helpers/function";
import LoadingTable from "../LoadingTable";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {NavLink} from "react-router-dom";


const DashboardClaimsMy = (props) => {


    const [data, setData] = useState("");
    const [totalData, setTotalData] = useState("");
    const [load, setLoad] = useState(true);
    const [componentData, setComponentData] = useState("");

    useEffect(() => {
        let isCancelled = false;

        async function fetchData() {
            if (!isCancelled) {
                setComponentData(props.component);
                setData(props.response.data.statistics);
                setTotalData(props.response.data.statistics.totalRegistered.myInstitution);
                setLoad(false);
            }
        }

        if (verifyTokenExpire())
            fetchData();
        return () => {
            isCancelled = true;
        }

    }, []);

    return (
        verifyPermission(props.userPermissions, "show-dashboard-data-my-institution") ?
            (
                <div>
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label">
                            <h5 className="kt-portlet__head-title">
                                {/*Statistiques des Réclamations de mon Institution sur les 30 derniers jours*/}
                                {componentData ? componentData.params.fr.title_my_institution.value : ""}
                            </h5>
                        </div>
                    </div>
                    {
                        load ? (
                            <LoadingTable/>
                        ) : (
                            <div className="kt-portlet__body kt-portlet__body--fit">
                                <div className="row row-no-padding row-col-separator-lg">
                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            {/*<NavLink exact to="/process/my-total-claim-register">*/}
                                                <div className="kt-widget24__details">
                                                    <div className="kt-widget24__info">
                                                        <h5 className="kt-widget24__title">
                                                            {/*Total Réclamations Enregistrées*/}
                                                            {componentData ? componentData.params.fr.total_enreg.value : ""}
                                                        </h5>
                                                        <span className="kt-widget24__desc"/>
                                                    </div>
                                                    <span className="kt-widget24__stats kt-font-brand">
                                                        {(data.totalRegistered && data.totalRegistered.myInstitution) ? data.totalRegistered.myInstitution : ""}
                                                    </span>
                                                </div>
                                            {/*</NavLink>*/}
                                        </div>
                                    </div>

                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            {/*<NavLink exact to="/process/my-total-incomplete-claim">*/}
                                                <div className="kt-widget24__details">
                                                    <div className="kt-widget24__info">
                                                        <h5 className="kt-widget24__title">
                                                            {/*Total Réclamations Incomplètes*/}
                                                            {componentData ? componentData.params.fr.total_incomplete.value : ""}
                                                        </h5>
                                                        <span className="kt-widget24__desc"/>
                                                    </div>
                                                    <span className="kt-widget24__stats kt-font-danger">
                                                    {(data.totalIncomplete && data.totalIncomplete.myInstitution) ? data.totalIncomplete.myInstitution : ""}
                                                </span>
                                                </div>
                                            {/*</NavLink>*/}

                                            <div className="progress progress--sm">

                                                {
                                                    (data.totalIncomplete && data.totalIncomplete.myInstitution) ?
                                                        <div className="progress-bar kt-bg-danger" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalIncomplete.myInstitution), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalIncomplete.myInstitution), totalData)}}>
                                                        </div>
                                                        : null
                                                }
                                            </div>
                                            <div className="kt-widget24__action">
                                                <span className="kt-widget24__change">
                                                    {/*% Réclamations Incomplètes*/}
                                                    {componentData ? componentData.params.fr.pourcent_incomplet.value : ""}
                                                </span>
                                                {
                                                    (data.totalIncomplete && data.totalIncomplete.myInstitution) ?
                                                        <span className="kt-widget24__number">
                                                            {percentageData((data.totalIncomplete.myInstitution), totalData)}
                                                        </span>
                                                        : null
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            {/*<NavLink exact to="/process/my-total-complete-claim">*/}
                                            <div className="kt-widget24__details">
                                                <div className="kt-widget24__info">
                                                    <h5 className="kt-widget24__title">
                                                        {/*Total Réclamations Complètes*/}
                                                        {componentData ? componentData.params.fr.total_complet.value : ""}
                                                    </h5>
                                                    <span className="kt-widget24__desc"/>
                                                </div>
                                                <span className="kt-widget24__stats ktkt-bg-success">
                                                                {(data.totalComplete && data.totalComplete.myInstitution) ? data.totalComplete.myInstitution : ""}
                                                            </span>
                                            </div>
                                            {/*</NavLink>*/}

                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalComplete && data.totalComplete.myInstitution) ?
                                                        <div className="progress-bar kt-bg-success" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalComplete.myInstitution), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalComplete.myInstitution), totalData)}}>
                                                        </div>
                                                        : null
                                                }
                                            </div>
                                            <div className="kt-widget24__action">
                                                        <span className="kt-widget24__change">
                                                            {/*% Réclamations Complètes*/}
                                                            {componentData ? componentData.params.fr.pourcent_complete.value : ""}
                                                        </span>

                                                <span className="kt-widget24__number">
                                                            {
                                                                (data.totalComplete && data.totalComplete.myInstitution) ?
                                                                    <span className="kt-widget24__number">
                                                                        {percentageData((data.totalComplete.myInstitution), totalData)}
                                                                   </span>
                                                                    : null
                                                            }
                                                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            {/*<NavLink exact to="/process/my-total-claim-transfer-to-unit">*/}
                                                <div className="kt-widget24__details">
                                                    <div className="kt-widget24__info">
                                                        <h5 className="kt-widget24__title">
                                                            {/*Total Réclamations Transférées à une Unité*/}
                                                            {componentData ? componentData.params.fr.total_to_unit.value : ""}
                                                        </h5>
                                                        <span className="kt-widget24__desc"/>
                                                    </div>
                                                    <span className="kt-widget24__stats kt-font-brand">
                                                    {(data.totalTransferredToUnit && data.totalTransferredToUnit.myInstitution) ? data.totalTransferredToUnit.myInstitution : ""}
                                                </span>
                                                </div>
                                            {/*</NavLink>*/}

                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalTransferredToUnit && data.totalTransferredToUnit.myInstitution) ?
                                                        <div className="progress-bar kt-bg-brand" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalTransferredToUnit.myInstitution), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalTransferredToUnit.myInstitution), totalData)}}>
                                                        </div>
                                                        : null
                                                }

                                            </div>
                                            <div className="kt-widget24__action">
                                                <span className="kt-widget24__change">
                                                    {/*% Réclamations Transférées à une Unité*/}
                                                    {componentData ? componentData.params.fr.pourcent_to_unit.value : ""}
                                                </span>
                                                <span className="kt-widget24__number">
                                                    {
                                                        (data.totalTransferredToUnit && data.totalTransferredToUnit.myInstitution) ?
                                                            <span className="kt-widget24__number">
                                                                {percentageData((data.totalTransferredToUnit.myInstitution), totalData)}
                                                           </span>
                                                            : null
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            {/*<NavLink exact to="/process/my-total-claim-in-treatment">*/}
                                                <div className="kt-widget24__details">
                                                    <div className="kt-widget24__info">
                                                        <h5 className="kt-widget24__title">
                                                            {/*Total Réclamations en Cours de Traitement*/}
                                                            {componentData ? componentData.params.fr.total_in_treatment.value : ""}
                                                        </h5>
                                                        <span className="kt-widget24__desc"/>
                                                    </div>
                                                    <span className="kt-widget24__stats kt-font-warning">
                                                    {(data.totalBeingProcess && data.totalBeingProcess.myInstitution) ? data.totalBeingProcess.myInstitution : ""}
                                                </span>
                                                </div>
                                            {/*</NavLink>*/}

                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalBeingProcess && data.totalBeingProcess.myInstitution) ?
                                                        <div className="progress-bar kt-bg-warning" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalBeingProcess.myInstitution), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalBeingProcess.myInstitution), totalData)}}>
                                                        </div>
                                                        : null
                                                }

                                            </div>
                                            <div className="kt-widget24__action">
                                                <span className="kt-widget24__change">
                                                    {/*% Réclamations en Cours de Traitement*/}
                                                    {componentData ? componentData.params.fr.pourcent_in_treatment.value : ""}
                                                </span>
                                                <span className="kt-widget24__number">
                                                    {
                                                        (data.totalBeingProcess && data.totalBeingProcess.myInstitution) ?
                                                            <span className="kt-widget24__number">
                                                                {percentageData((data.totalBeingProcess.myInstitution), totalData)}
                                                           </span>
                                                            : null
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            {/*<NavLink exact to="/process/my-total-claim-treat">*/}
                                                <div className="kt-widget24__details">
                                                    <div className="kt-widget24__info">
                                                        <h5 className="kt-widget24__title">
                                                            {/*Total Réclamations Traitées*/}
                                                            {componentData ? componentData.params.fr.total_treat.value : ""}
                                                        </h5>
                                                        <span className="kt-widget24__desc"/>
                                                    </div>
                                                    <span className="kt-widget24__stats kt-font-success">
                                                    {(data.totalTreated && data.totalTreated.myInstitution) ? data.totalTreated.myInstitution : ""}
                                                </span>
                                                </div>
                                            {/*</NavLink>*/}

                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalTreated && data.totalTreated.myInstitution) ?
                                                        <div className="progress-bar kt-bg-success" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalTreated.myInstitution), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalTreated.myInstitution), totalData)}}>
                                                        </div>
                                                        : ''
                                                }
                                            </div>
                                            <div className="kt-widget24__action">
                                                <span className="kt-widget24__change">
                                                    {/*% Réclamations Traitées*/}
                                                    {componentData ? componentData.params.fr.pourcent_treat.value : ""}
                                                </span>
                                                <span className="kt-widget24__number">
                                                    {
                                                        (data.totalTreated && data.totalTreated.myInstitution) ?
                                                            <span className="kt-widget24__number">
                                                                {percentageData((data.totalTreated.myInstitution), totalData)}
                                                           </span>
                                                            : null
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            {/*<NavLink exact to="/process/my-total-unfounded-claim">*/}
                                                <div className="kt-widget24__details">
                                                    <div className="kt-widget24__info">
                                                        <h5 className="kt-widget24__title">
                                                            {/*Total Réclamations Non Fondées*/}
                                                            {componentData ? componentData.params.fr.total_unfound.value : ""}
                                                        </h5>
                                                        <span className="kt-widget24__desc"/>
                                                    </div>
                                                    <span className="kt-widget24__stats kt-font-success">
                                                    {(data.totalUnfounded && data.totalUnfounded.myInstitution) ? data.totalUnfounded.myInstitution : ""}
                                                </span>
                                                </div>
                                            {/*</NavLink>*/}

                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalUnfounded && data.totalUnfounded.myInstitution) ?
                                                        <div className="progress-bar kt-bg-success" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalUnfounded.myInstitution), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalUnfounded.myInstitution), totalData)}}>
                                                        </div>
                                                        : null
                                                }
                                            </div>
                                            <div className="kt-widget24__action">
                                                <span className="kt-widget24__change">
                                                    {/*% Réclamations Non Fondées*/}
                                                    {componentData ? componentData.params.fr.pourcent_unfound.value : ""}
                                                </span>
                                                <span className="kt-widget24__number">
                                                    {
                                                        (data.totalUnfounded && data.totalUnfounded.myInstitution) ?
                                                            <span className="kt-widget24__number">
                                                                {percentageData((data.totalUnfounded.myInstitution), totalData)}
                                                           </span>
                                                            : null
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            {/*<NavLink exact to="/process/my-total-claim-satisfaction-measure">*/}
                                                <div className="kt-widget24__details">
                                                    <div className="kt-widget24__info">
                                                        <h5 className="kt-widget24__title">
                                                            {/*Total Satisfaction Mesurée*/}
                                                            {componentData ? componentData.params.fr.total_satisfated.value : ""}
                                                        </h5>
                                                        <span className="kt-widget24__desc"/>
                                                    </div>
                                                    <span className="kt-widget24__stats kt-font-danger">
                                                    {(data.totalMeasuredSatisfaction && data.totalMeasuredSatisfaction.myInstitution) ? data.totalMeasuredSatisfaction.myInstitution : ""}
                                                </span>
                                                </div>
                                            {/*</NavLink>*/}

                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalMeasuredSatisfaction && data.totalMeasuredSatisfaction.myInstitution) ?
                                                        <div className="progress-bar kt-bg-danger" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalMeasuredSatisfaction.myInstitution), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalMeasuredSatisfaction.myInstitution), totalData)}}>
                                                        </div>
                                                        : null
                                                }
                                            </div>
                                            <div className="kt-widget24__action">
                                                <span className="kt-widget24__change">
                                                    {/*% Satisfaction Mesurée*/}
                                                    {componentData ? componentData.params.fr.pourcent_satisfated.value : ""}
                                                </span>
                                                <span className="kt-widget24__number">
                                                    {
                                                        (data.totalMeasuredSatisfaction && data.totalMeasuredSatisfaction.myInstitution) ?
                                                            <span className="kt-widget24__number">
                                                                {percentageData((data.totalMeasuredSatisfaction.myInstitution), totalData)}
                                                           </span>
                                                            : null
                                                    }
								                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>

            ) : null
        )
    };

const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(DashboardClaimsMy);
