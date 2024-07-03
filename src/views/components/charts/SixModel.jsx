import React from "react";
import ReactApexChart from "react-apexcharts";
import {useTranslation} from "react-i18next";

const SixModel = ({data})  => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    var label = [];
    var series = [];
    const getData = () => {
        data.map(el => {
            label.push(el.name["fr"]);
            series.push(el.pourcentage)
        });
    };
    getData();

    var options = {
        chart: {
            chart: {
                width: 380,
                type: 'pie',
            },
        },
        labels: label,
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
    };

    return (
        ready ? (
            <div className="mt-4">
                <div id="graphOne" className="d-flex justify-content-center">
                    <ReactApexChart options={options} series={series} type="pie" width={450}/>
                </div>
                <h5 className="text-center">{t("Pourcentage d'utilisation des canneaux")}</h5>
            </div>
        ) : null
    );
};

export default SixModel;
