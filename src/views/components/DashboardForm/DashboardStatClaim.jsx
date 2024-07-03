import React, {useEffect, useState} from 'react';
import Chart from "react-apexcharts";
import {verifyPermission} from "../../../helpers/permission";
import axios from "axios";
import appConfig from "../../../config/appConfig";
import {connect} from "react-redux";
import LoadingTable from "../LoadingTable";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


const DashboardStatClaim = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const [componentData, setComponentData] = useState("");
    const [satisfactionData, setSatisfactionData] = useState("");
    const [load, setLoad] = useState(true);

    const tooltipHoverFormatter = (val, opts) => {
        return val + ' : ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
    };

    const defaultData = {
        series: [

            {
                name: t("Mesure Satisfaction"),
                data: satisfactionData ? satisfactionData.series.data1 : []
            },
            {
                name: t("Satisfaisantes"),
                data: satisfactionData ? satisfactionData.series.data2 : []
            },
            {
                name: t('Non Satisfaisantes'),
                data: satisfactionData ? satisfactionData.series.data3 : []
            }
        ],
        options: {
            chart: {
                height: 350,
                type: 'line',
                zoom: {
                    enabled: false
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: [3, 5, 3],
                curve: 'smooth',
                dashArray: [0, 3, 3]
            },
            title: {
                text: t('Évolution des satisfactions par mois'),
                align: 'left'
            },
            legend: {
                tooltipHoverFormatter
            },

            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.2
                },
            },
            xaxis: {
                categories:satisfactionData ? satisfactionData.options.xaxis.categories : [],
                title: {
                    text: t('Mois')
                }
            },

        },
    };

    useEffect(() => {
        let claimSatifaction = props.response.data.claimerSatisfactionEvolution;
        let satisfiedData = [];
        for (const satisfied in Object.values(claimSatifaction)[0]) {
            satisfiedData.push(satisfied);
        }
        // console.log(satisfiedData,"satisfiedData")
        let newData = [];
        for (const key in claimSatifaction) {
            let totalSatisfaction = claimSatifaction[key];
            if (verifyPermission(props.userPermissions, "show-dashboard-data-all-institution")) {
                newData.push({
                    month: key,
                    data0: totalSatisfaction.measured.allInstitution,
                    data1: totalSatisfaction.satisfied.allInstitution,
                    data2: totalSatisfaction.unsatisfied.allInstitution
                })
            } else if (verifyPermission(props.userPermissions, "show-dashboard-data-my-institution")) {
                newData.push({
                    month: key,
                    data0: totalSatisfaction.measured.myInstitution,
                    data1: totalSatisfaction.satisfied.myInstitution,
                    data2: totalSatisfaction.unsatisfied.myInstitution
                })
            }
        }
        let newSatisfaction = {...defaultData};
        newSatisfaction.options.xaxis.categories=Object.values(newData.map(label=>label.month));
        for (let i = 0; i <= satisfiedData.length - 1; i++) {
            newSatisfaction.series[i].data = Object.values(newData).map(serie => serie['data' + i]);
        }
        // console.log(newSatisfaction,"WITH_MONTH");
        setSatisfactionData(newSatisfaction);
        setComponentData(props.component);
        setLoad(false)
    }, []);

    return (
        ready ? (
            (verifyPermission(props.userPermissions, "show-dashboard-data-all-institution") ||
                verifyPermission(props.userPermissions, "show-dashboard-data-my-institution")) ?
                <div className="kt-portlet">
                    <div className="kt-portlet__head">
                        <div className="kt-portlet__head-label">
                            <h3 className="kt-portlet__head-title">
                                {/*Evolution de la satisfaction des réclamants sur les 11 derniers mois*/}
                                {componentData ? componentData.params.fr.satisfaction_chart.value : ""}
                            </h3>
                        </div>
                    </div>
                    {
                        load ? (
                            <LoadingTable/>
                        ) : (
                            satisfactionData ?
                                <div id="chart" className="kt-portlet__body">
                                    <Chart options={satisfactionData.options} series={satisfactionData.series} type="line"
                                           height={350}/>
                                </div>
                                : null
                        )}
                </div>
                : null
        ) : null
    )

};

const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(DashboardStatClaim);
