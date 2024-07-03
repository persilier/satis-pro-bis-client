import React, {useEffect, useState} from 'react';
import {verifyPermission} from "../../../helpers/permission";
import {ERROR_401} from "../../../config/errorPage";
import axios from "axios";
import appConfig from "../../../config/appConfig";
import {connect} from "react-redux";
import {percentageData} from "../../../helpers/function";
import LoadingTable from "../LoadingTable";
import {verifyTokenExpire} from "../../../middleware/verifyToken";


const DashboardClaimsUnit = (props) => {

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
                setTotalData(props.response.data.statistics.totalRegistered.myUnit);
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
        verifyPermission(props.userPermissions, "show-dashboard-data-my-unit") ?
            (
                <div>
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label">
                            <h5 className="kt-portlet__head-title">
                                {/*Statistiques des Réclamations de mon Unité sur les 30 derniers jours*/}
                                {componentData ? componentData.params.fr.title_unit.value : ""}
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
                                            <div className="kt-widget24__details">
                                                <div className="kt-widget24__info">
                                                    <h5 className="kt-widget24__title">
                                                        {/*Total Réclamations Enregistrées*/}
                                                        {componentData ? componentData.params.fr.total_enreg.value : ""}
                                                    </h5>
                                                    <span className="kt-widget24__desc">

									</span>
                                                </div>
                                                <span className="kt-widget24__stats kt-font-brand">
									{(data.totalRegistered && data.totalRegistered.myUnit) ? data.totalRegistered.myUnit : ""}
								</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            <div className="kt-widget24__details">
                                                <div className="kt-widget24__info">
                                                    <h5 className="kt-widget24__title">
                                                        {/*Total Réclamations Incomplètes*/}
                                                        {componentData ? componentData.params.fr.total_incomplete.value : ""}
                                                    </h5>
                                                    <span className="kt-widget24__desc">
									</span>
                                                </div>
                                                <span className="kt-widget24__stats kt-font-danger">
									{(data.totalIncomplete && data.totalIncomplete.myUnit) ? data.totalIncomplete.myUnit : ""}
								</span>
                                            </div>
                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalIncomplete && data.totalIncomplete.myUnit) ?
                                                        <div className="progress-bar kt-bg-danger" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalIncomplete.myUnit), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalIncomplete.myUnit), totalData)}}>
                                                        </div>
                                                        : ""
                                                }
                                            </div>
                                            <div className="kt-widget24__action">
								<span className="kt-widget24__change">
									{/*% Réclamations Incomplètes*/}
                                    {componentData ? componentData.params.fr.pourcent_incomplet.value : ""}
								</span>

                                                {
                                                    (data.totalIncomplete && data.totalIncomplete.myUnit) ?
                                                        <span className="kt-widget24__number">
                                                {percentageData((data.totalIncomplete.myUnit), totalData)}
                                           </span>
                                                        : ""
                                                }

                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            <div className="kt-widget24__details">
                                                <div className="kt-widget24__info">
                                                    <h5 className="kt-widget24__title">
                                                        {/*Total Réclamations Complètes*/}
                                                        {componentData ? componentData.params.fr.total_complet.value : ""}
                                                    </h5>
                                                    <span className="kt-widget24__desc">
									</span>
                                                </div>
                                                <span className="kt-widget24__stats kt-font-success">
									{(data.totalComplete && data.totalComplete.myUnit) ? data.totalComplete.myUnit : ""}
								</span>
                                            </div>
                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalComplete && data.totalComplete.myUnit) ?
                                                        <div className="progress-bar kt-bg-success" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalComplete.myUnit), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalComplete.myUnit), totalData)}}>
                                                        </div>
                                                        : ""
                                                }

                                            </div>
                                            <div className="kt-widget24__action">
								<span className="kt-widget24__change">
									{/*% Réclamations Complètes*/}
                                    {componentData ? componentData.params.fr.pourcent_complete.value : ""}
								</span>
                                                <span className="kt-widget24__number">
									{
                                        (data.totalComplete && data.totalComplete.myUnit) ?
                                            <span className="kt-widget24__number">
                                                {percentageData((data.totalComplete.myUnit), totalData)}
                                           </span>
                                            : ""
                                    }
								</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            <div className="kt-widget24__details">
                                                <div className="kt-widget24__info">
                                                    <h5 className="kt-widget24__title">
                                                        {/*Total Réclamations Transférées à une Unité*/}
                                                        {componentData ? componentData.params.fr.total_to_unit.value : ""}
                                                    </h5>
                                                    <span className="kt-widget24__desc">

									</span>
                                                </div>
                                                <span className="kt-widget24__stats kt-font-brand">
                                        {(data.totalTransferredToUnit && data.totalTransferredToUnit.myUnit) ? data.totalTransferredToUnit.myUnit : ""}
								</span>
                                            </div>
                                            <div className="progress progress--sm">

                                                {
                                                    (data.totalTransferredToUnit && data.totalTransferredToUnit.myUnit) ?
                                                        <div className="progress-bar kt-bg-brand" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalTransferredToUnit.myUnit), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalTransferredToUnit.myUnit), totalData)}}>
                                                        </div>
                                                        : ""
                                                }

                                            </div>
                                            <div className="kt-widget24__action">
								<span className="kt-widget24__change">
									{/*% Réclamations Transférées à une Unité*/}
                                    {componentData ? componentData.params.fr.pourcent_to_unit.value : ""}
								</span>
                                                <span className="kt-widget24__number">
									{
                                        (data.totalTransferredToUnit && data.totalTransferredToUnit.myUnit) ?
                                            <span className="kt-widget24__number">
                                                {percentageData((data.totalTransferredToUnit.myUnit), totalData)}
                                           </span>
                                            : ""
                                    }
								</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            <div className="kt-widget24__details">
                                                <div className="kt-widget24__info">
                                                    <h5 className="kt-widget24__title">
                                                        {/*Total Réclamations en Cours de Traitement*/}
                                                        {componentData ? componentData.params.fr.total_in_treatment.value : ""}
                                                    </h5>
                                                    <span className="kt-widget24__desc">

									</span>
                                                </div>
                                                <span className="kt-widget24__stats kt-font-warning">
									   {(data.totalBeingProcess && data.totalBeingProcess.myUnit) ? data.totalBeingProcess.myUnit : ""}

								</span>
                                            </div>
                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalBeingProcess && data.totalBeingProcess.myUnit) ?
                                                        <div className="progress-bar kt-bg-warning" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalBeingProcess.myUnit), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalBeingProcess.myUnit), totalData)}}>
                                                        </div>
                                                        : ""
                                                }

                                            </div>
                                            <div className="kt-widget24__action">
								<span className="kt-widget24__change">
									{/*% Réclamations en Cours de Traitement*/}
                                    {componentData ? componentData.params.fr.pourcent_in_treatment.value : ""}
								</span>
                                                <span className="kt-widget24__number">
									{
                                        (data.totalBeingProcess && data.totalBeingProcess.myUnit) ?
                                            <span className="kt-widget24__number">
                                                {percentageData((data.totalBeingProcess.myUnit), totalData)}
                                           </span>
                                            : ""
                                    }
								</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            <div className="kt-widget24__details">
                                                <div className="kt-widget24__info">
                                                    <h5 className="kt-widget24__title">
                                                        {/*Total Réclamations Traitées*/}
                                                        {componentData ? componentData.params.fr.total_treat.value : ""}
                                                    </h5>
                                                    <span className="kt-widget24__desc">

									</span>
                                                </div>
                                                <span className="kt-widget24__stats kt-font-success">
                                        {(data.totalTreated && data.totalTreated.myUnit) ? data.totalTreated.myUnit : ""}
                                    </span>
                                            </div>
                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalTreated && data.totalTreated.myUnit) ?
                                                        <div className="progress-bar kt-bg-success" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalTreated.myUnit), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalTreated.myUnit), totalData)}}>
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
                                        (data.totalTreated && data.totalTreated.myUnit) ?
                                            <span className="kt-widget24__number">
                                                {percentageData((data.totalTreated.myUnit), totalData)}
                                           </span>
                                            : ""
                                    }
								</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            <div className="kt-widget24__details">
                                                <div className="kt-widget24__info">
                                                    <h5 className="kt-widget24__title">
                                                        {/*Total Réclamations Non Fondées*/}
                                                        {componentData ? componentData.params.fr.total_unfound.value : ""}
                                                    </h5>
                                                    <span className="kt-widget24__desc">

									</span>
                                                </div>
                                                <span className="kt-widget24__stats kt-font-success">
                                        {(data.totalUnfounded && data.totalUnfounded.myUnit) ? data.totalUnfounded.myUnit : ""}
								</span>
                                            </div>
                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalUnfounded && data.totalUnfounded.myUnit) ?
                                                        <div className="progress-bar kt-bg-success" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalUnfounded.myUnit), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalUnfounded.myUnit), totalData)}}>
                                                        </div>
                                                        : ""
                                                }
                                            </div>
                                            <div className="kt-widget24__action">
								<span className="kt-widget24__change">
									{/*% Réclamations Non Fondées*/}
                                    {componentData ? componentData.params.fr.pourcent_unfound.value : ""}
								</span>
                                                <span className="kt-widget24__number">
									{
                                        (data.totalUnfounded && data.totalUnfounded.myUnit) ?
                                            <span className="kt-widget24__number">
                                                {percentageData((data.totalUnfounded.myUnit), totalData)}
                                           </span>
                                            : ""
                                    }
								</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-3 col-xl-3">
                                        <div className="kt-widget24">
                                            <div className="kt-widget24__details">
                                                <div className="kt-widget24__info">
                                                    <h5 className="kt-widget24__title">
                                                        {/*Total Satisfaction Mesurée*/}
                                                        {componentData ? componentData.params.fr.total_satisfated.value : ""}
                                                    </h5>
                                                    <span className="kt-widget24__desc">

									</span>
                                                </div>
                                                <span className="kt-widget24__stats kt-font-danger">
                                        {(data.totalMeasuredSatisfaction && data.totalMeasuredSatisfaction.myUnit) ? data.totalMeasuredSatisfaction.myUnit : ""}

								</span>
                                            </div>
                                            <div className="progress progress--sm">
                                                {
                                                    (data.totalMeasuredSatisfaction && data.totalMeasuredSatisfaction.myUnit) ?
                                                        <div className="progress-bar kt-bg-danger" role="progressbar"
                                                             aria-valuenow={percentageData((data.totalMeasuredSatisfaction.myUnit), totalData)}
                                                             aria-valuemin="0" aria-valuemax="100"
                                                             style={{width: percentageData((data.totalMeasuredSatisfaction.myUnit), totalData)}}>
                                                        </div>
                                                        : ""
                                                }
                                            </div>
                                            <div className="kt-widget24__action">
								<span className="kt-widget24__change">
									{/*% Satisfaction Mesurée*/}
                                    {componentData ? componentData.params.fr.pourcent_satisfated.value : ""}
								</span>
                                                <span className="kt-widget24__number">
									{
                                        (data.totalMeasuredSatisfaction && data.totalMeasuredSatisfaction.myUnit) ?
                                            <span className="kt-widget24__number">
                                                {percentageData((data.totalMeasuredSatisfaction.myUnit), totalData)}
                                           </span>
                                            : ""
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

            ) : ""
    )
};

const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(DashboardClaimsUnit);
