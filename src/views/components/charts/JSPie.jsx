import React, {useEffect} from "react";
import ApexCharts from 'apexcharts';
import {debug} from "../../../helpers/function";

const JSPie = props => {
    var one = "";
    var two = "";
    useEffect(() => {
        var options = {
            chart: {
                height: 350,
                type: "line",
                stacked: false
            },
            dataLabels: {
                enabled: false
            },
            colors: ["#FF1654", "#247BA0"],
            series: [
                {
                    name: "Series A",
                    data: [1.4, 2, 2.5, 1.5, 2.5, 2.8, 3.8, 4.6]
                },
                {
                    name: "Series B",
                    data: [20, 29, 37, 36, 44, 45, 50, 58]
                }
            ],
            stroke: {
                width: [4, 4]
            },
            plotOptions: {
                bar: {
                    columnWidth: "20%"
                }
            },
            xaxis: {
                categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016]
            },
            yaxis: [
                {
                    axisTicks: {
                        show: true
                    },
                    axisBorder: {
                        show: true,
                        color: "#FF1654"
                    },
                    labels: {
                        style: {
                            colors: "#FF1654"
                        }
                    },
                    title: {
                        text: "Series A",
                        style: {
                            color: "#FF1654"
                        }
                    }
                },
                {
                    opposite: true,
                    axisTicks: {
                        show: true
                    },
                    axisBorder: {
                        show: true,
                        color: "#247BA0"
                    },
                    labels: {
                        style: {
                            colors: "#247BA0"
                        }
                    },
                    title: {
                        text: "Series B",
                        style: {
                            color: "#247BA0"
                        }
                    }
                }
            ],
            tooltip: {
                shared: false,
                intersect: true,
                x: {
                    show: false
                }
            },
            legend: {
                horizontalAlign: "left",
                offsetX: 40
            }
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        debug(chart, "chart = one");
        one = new ApexCharts(document.querySelector("#chart"), options);

        chart.render();


        var optionss = {
            series: [44, 55, 13, 43, 22],
            chart: {
                width: 380,
                type: 'pie',
            },
            labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
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

        var charts = new ApexCharts(document.querySelector("#charts"), optionss);
        debug(charts, "charts = two");
        two = new ApexCharts(document.querySelector("#charts"), optionss);
        charts.render();

        function myFunction() {
            chart.dataURI().then(({ imgURI, blob }) => {
                debug(imgURI, "one")
            });

            charts.dataURI().then(({ imgURI, blob }) => {
                debug(imgURI, "two");
            });
        }
    });

    const generateBase64 = () => {
        const button = document.getElementById("myClick");
        debug(button,"buttonBefore");
        button.onclick = "myFunction()";
        debug(button,"buttonAfter");
        button.click();
        /*debug(one, "one");
        debug(two, "two");
        one.dataURI().then(({ imgURI, blob }) => {
            debug(imgURI, "one")
        });

        two.dataURI().then(({ imgURI, blob }) => {
            debug(imgURI, "two");
        });*/
    };

    return (
        <div>
            <div id="chart">
            </div>

            <div id="charts">
            </div>

            <div id="chartImage">
            </div>

            <div id="chartImages">
            </div>

            <button style={{display: "none"}} id="myClick" onclick="myFunction()" className={"btn btn-secondary"}/>
            <button onClick={generateBase64} className={"btn btn-secondary"}>GenerateBase64</button>
        </div>
    );
};

export default JSPie;
