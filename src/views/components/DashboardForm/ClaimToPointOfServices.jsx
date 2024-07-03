import React, {useEffect, useState} from 'react';
import Chart from "react-apexcharts";
import LoadingTable from "../LoadingTable";
import {connect} from "react-redux";
import axios from "axios";
import appConfig from "../../../config/appConfig";
import {verifyTokenExpire} from "../../../middleware/verifyToken";


const ClaimToInstitution = (props) => {
    const [load, setLoad] = useState(true);
    const [pointOfServiceData, setPointOfServiceData] = useState("");
    const [componentData, setComponentData] = useState("");

    const defaultData = {
        series: pointOfServiceData ? pointOfServiceData.series : [],
        options: {
            chart: {
                width: 380,
                type: 'pie',
            },
            labels: pointOfServiceData ? pointOfServiceData.options.labels : [],
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        },
    };

    useEffect(() => {
        let pointOfService = props.response.data.pointOfServicesTargeted;
        let ServiceData = [];
        for (const processus in pointOfService) {
            ServiceData.push(processus);
        }
        let newData = {...defaultData};

        newData.options.labels = ServiceData;
        newData.series = Object.values(pointOfService).map(serie => serie.myInstitution);
        setPointOfServiceData(newData);
        setComponentData(props.component);
        setLoad(false)
    }, []);

    return (

        <div>
            <div className="kt-portlet__head">
                <div className="kt-portlet__head-label">
                    <h3 className="kt-portlet__head-title">
                        {/*Statistique les services techniques qui reçoivent plus de réclamations sur les 30 derniers jours*/}
                        {componentData ? componentData.params.fr.title_stat_service.value : ""}

                    </h3>
                </div>
            </div>
            {
                load ? (
                    <LoadingTable/>
                ) : (
                    <div className="kt-portlet__body">
                        <div id="chart" className="d-flex justify-content-center" style={{position: "relative"}}>
                            {pointOfServiceData?(
                                <Chart options={pointOfServiceData.options} series={pointOfServiceData.series}
                                       type="pie" width={550}/>
                            ):""
                            }

                        </div>
                    </div>
                )
            }
        </div>
    );
};
const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(ClaimToInstitution);
