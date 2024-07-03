import React, {useEffect, useState} from 'react';

import {verifyPermission} from "../../../helpers/permission";
import {connect} from "react-redux";
import LoadingTable from "../LoadingTable";
import {useTranslation} from "react-i18next";

const DashboardSummaryReport = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const [load, setLoad] = useState(true);
    const reportColor = [
        {
            id: 0,
            rowColor: "table-primary",
            rang:1,
        },
        {
            id: 1,
            rowColor: "table-success",
            rang:2,
        },
        {
            id: 2,
            rowColor: "table-bland",
            rang:3,
        },
        {
            id: 3,
            rowColor: "table-warning",
            rang:4,
        },
        {
            id: 4,
            rowColor: "table-danger",
            rang:5
        },

    ];

    const [data, setData] = useState("");
    const [componentData, setComponentData] = useState("");

    useEffect(() => {
        let claimObjects = props.response.data.claimObjectsUse;
        let newData = [];
        for (const key in claimObjects) {
            let totalObjectUse = claimObjects[key];
            if (verifyPermission(props.userPermissions, "show-dashboard-data-all-institution")) {
                newData.push({canal: key, label: totalObjectUse.allInstitution})
            } else if (verifyPermission(props.userPermissions, "show-dashboard-data-my-institution")) {
                newData.push({canal: key, label: totalObjectUse.myInstitution})
            }
        }
        newData.sort(function (a, b) {
            return b.label - a.label;
        });
        const result = newData.filter(function (event) {
            return newData.indexOf(event) < 5
        });
        setData(result);
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
                                {/*Statistique des cinq (05) plus fréquents Objets de Réclamations sur les 30 derniers jours*/}
                                {componentData ? componentData.params.fr.stat_object.value : ""}
                            </h3>
                        </div>
                    </div>
                    {
                        load ? (
                            <LoadingTable/>
                        ) : (
                            <div className="kt-portlet__body">
                                <table className="table table-striped table-bordered">
                                    <thead>
                                    <tr>
                                        <th>{t("Rang")}</th>
                                        <th>{t("Objets de Réclamations")}</th>
                                        <th>{t("Total")}</th>
                                    </tr>
                                    </thead>
                                    <tbody>

                                    {data ?
                                        data.map((report, i) => (
                                            reportColor.map((color, j) => (
                                                i === j ?
                                                    report.label!==0?
                                                        <tr key={i}>
                                                            <td>{color.rang}</td>

                                                            <td>{report.canal}</td>

                                                            <td>{report.label}</td>
                                                        </tr> : null
                                                    : null
                                            ))
                                        ))
                                        : null
                                    }

                                    </tbody>
                                </table>

                            </div>
                        )
                    }
                </div>
                : null
        ) : null
    );
};
const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(DashboardSummaryReport);
