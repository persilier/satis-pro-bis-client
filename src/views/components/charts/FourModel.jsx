import React from "react";
import ReactApexChart from "react-apexcharts";
import {month} from "../../../constants/date";
import {useTranslation} from "react-i18next";

const FourModel = ({data, type}) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    var categories = [];
    var newSeries = {
        claims_received: [],
        claims_resolved: []
    };
    const getDetailData = () => {
        for (const property in data[type].claims_received) {
            categories.push(property);
            newSeries.claims_received.push(data[type].claims_received[property]);
        }
        for (const property in data[type].claims_resolved) {
            newSeries.claims_resolved.push(data[type].claims_resolved[property]);
        }
    };

    const formatCategoriesMouths = () => {
        for (var i = 0; i < categories.length; i++)
            categories[i] = `${ month()[categories[i].split("-")[1]] } ${ categories[i].split("-")[0][2] }${ categories[i].split("-")[0][3] }`;
    };

    const formatCategoriesDays = () => {
        for (var i = 0; i < categories.length; i++) {
            categories[i] = `${ categories[i].split("-")[2] } ${ month()[categories[i].split("-")[1]] } ${ categories[i].split("-")[0][2] }${ categories[i].split("-")[0][3] }`;
        }
    };

    const formatCategoriesWeeks = () => {
        var start = "";
        var end = "";
        for (var i = 0; i < categories.length; i++) {
            start = `${categories[i].replace(/\s/g, '').split("-")[2]} ${month()[categories[i].replace(/\s/g, '').split("-")[1]]} ${categories[i].replace(/\s/g, '').split("-")[0][2]}${categories[i].replace(/\s/g, '').split("-")[0][3]}`;
            end = `${categories[i].replace(/\s/g, '').split("-")[5]} ${month()[categories[i].replace(/\s/g, '').split("-")[4]]} ${categories[i].replace(/\s/g, '').split("-")[3][2]}${categories[i].replace(/\s/g, '').split("-")[3][3]}`;
            categories[i] = `${start} - ${end}`;
        }
    };

    getDetailData();

    if (type === "months")
        formatCategoriesMouths();
    else if (type === "days")
        formatCategoriesDays();
    else
        formatCategoriesWeeks();

    const series = [
        {
            name: t('Réclamations réçues'),
            data: newSeries.claims_received
        },
        {
            name: t('Réclamations résolues'),
            data: newSeries.claims_resolved
        }
    ];

    const options = {
        chart: {
            height: 350,
            type: 'area'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            categories: categories
        },
        tooltip: {
            x: {
                format: 'MMM \'yyyy'
            },
        },
    };

    return (
        ready ? (
            <div id="chart" style={{position: "relative", zIndex: 0}}>
                <div className="row d-flex justify-content-center">
                    <div id="graphTwo" className="col-10">
                        <ReactApexChart options={options} series={series} type="area" height={350} />
                    </div>
                </div>
                <h5 className="text-center">{t("Évolution des réclamations")}</h5>
            </div>
        ) : null
    )
};

export default FourModel;
