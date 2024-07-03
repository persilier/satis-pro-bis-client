import React, {useEffect, useState} from 'react';
import Chart from "react-apexcharts";
import LoadingTable from "../LoadingTable";

import {verifyPermission} from "../../../helpers/permission";
import {connect} from "react-redux";
import axios from "axios";
import appConfig from "../../../config/appConfig";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";


const ClaimToInstitution = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const [load, setLoad] = useState(true);
    const [institutionData, setInstitutionData] = useState("");

    const defaultData = {
        series: institutionData ? institutionData.series : [],
        options: {
            chart: {
                width: 380,
                type: 'pie',
            },
            labels: institutionData ? institutionData.options.labels : [],
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200,
                    },

                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        },
    };

    useEffect(() => {
        let institutionTarget = props.response.data.institutionsTargeted;
        let institutionData = [];
        for (const processus in institutionTarget) {
            institutionData.push(processus);
        }
        let newData = {...defaultData};
        newData.options.labels = institutionData;
        newData.series = Object.values(institutionTarget).map(serie => serie.allInstitution);
        setInstitutionData(newData);
        setLoad(false)
    }, []);

    return (
        ready ? (
            <div>
                <div className="kt-portlet__head">
                    <div className="kt-portlet__head-label">
                        <h3 className="kt-portlet__head-title">
                            {t("Satisfaction des institutions qui reçoivent plus de réclamations sur les 30 derniers jours")}
                        </h3>
                    </div>
                </div>
                {
                    load ? (
                        <LoadingTable/>
                    ) : (
                        <div id="chart" className="d-flex justify-content-center" style={{position: "relative"}}>
                            <Chart options={institutionData.options} series={institutionData.series} type="pie"
                                   width={380}/>

                        </div>
                    )}
            </div>
        ) : null
    );
};
const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(ClaimToInstitution);
