import React, {useState} from "react";
import ReactApexChart from "react-apexcharts";
import {useTranslation} from "react-i18next";

const FiveModel = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const data = {
        prices: [100, 200, 500, 1000, 2000, 3000],
        dates: ["25 Jun", "15 Jul", "10 Aug", "8 Sep", "5 Oct", "5 Dec"]
    };

    const [series, setSeries] = useState([
        {
            name: t("Plaintes"),
            data: data.prices
        }
    ]);
    const [options, setOptions] = useState({
        chart: {
            type: 'area',
            height: 350,
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        title: {
            text: t('Suivi des plaintes'),
            align: 'left'
        },
        subtitle: {
            text: t('Evolution des plaintes réçues'),
            align: 'left'
        },
        labels: data.dates,
        xaxis: {
            type: 'datetime',
        },
        yaxis: {
            opposite: true
        },
        legend: {
            horizontalAlign: 'left'
        }
    });

    return (
        ready ? (
            <div>
                <h2>{t("Modèle 5")}</h2>
                <ReactApexChart options={options} series={series} type="area" height={350} />
            </div>
        ) : null
    )
};

export default FiveModel;
