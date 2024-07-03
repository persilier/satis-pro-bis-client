import React, {useState} from "react";
import {Bar, Line, Pie} from "react-chartjs-2";
import {useTranslation} from "react-i18next";

const SecondModel = props => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const [chartData, setChartData] = useState({
        labels: ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford'],
        datasets: [
            {
                label: 'Population',
                data: [
                    617594,
                    181045,
                    106519,
                    105162,
                    95072
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                ]
            }
        ]
    });

    const defaultProps = {
        displayTitle: true,
        displayLegend: true,
        legendPosition: 'right',
    };

    return (
        ready ? (
            <div className="chart">
                <Line
                    data={chartData}
                    options={{
                        title: {
                            display: props.displayTitle,
                            text: t('Modèle 2'),
                            fontSize: 25
                        },
                        legend: {
                            display: props.displayLegend,
                            position: props.legentPosition
                        }
                    }}
                />
            </div>
        ) : null
    );
};

export default SecondModel;
