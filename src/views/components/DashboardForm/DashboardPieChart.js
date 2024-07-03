import React, {useEffect, useState} from 'react';
import PieChart, {
    Legend,
    Export,
    Series,
    Label,
    Font,
    Connector
} from 'devextreme-react/pie-chart';
import LoadingTable from "../LoadingTable";


const DashboardPieChart = (props) => {
    const [load, setLoad] = useState(true);
    const [institutionData, setInstitutionData] = useState(undefined);
    const dataSource = institutionData ? institutionData : [];
    const [componentData, setComponentData] = useState("");

    function customizeText(arg) {
        return `${arg.argumentText} (${arg.percentText})`;
    }

    useEffect(() => {

        let institutionTarget = props.response.data.institutionsTargeted;
        let dataInstitution = [];
        for (const processus in institutionTarget) {
            dataInstitution.push(processus);
        }
        let newData = [...dataSource];
        if (institutionData === undefined) {
            for (let i = 0; i < dataInstitution.length; i++) {
                newData.push({
                    label: dataInstitution[i],
                    value: Object.values(institutionTarget)[i].allInstitution
                })
            }
            setInstitutionData(newData);
        }
        setComponentData(props.component);
        setLoad(false)
    }, []);

    return (
        <div>
            <div className="kt-portlet__head">
                <div className="kt-portlet__head-label">
                    <h3 className="kt-portlet__head-title">
                        {/*Statistique des institutions qui reçoivent plus de réclamations sur les 30 derniers jours*/}
                        {componentData ? componentData.params.fr.title_stat_institution.value : ""}
                    </h3>
                </div>
            </div>
            {
                load ? (
                    <LoadingTable/>
                ) : (
                    <PieChart id="pie"
                              palette="Bright"
                              dataSource={dataSource}
                        // title="Olympic Medals in 2008"
                    >
                        <Legend
                            orientation="horizontal"
                            itemTextPosition="right"
                            horizontalAlignment="center"
                            verticalAlignment="bottom"
                            columnCount={4}/>
                        <Export enabled={true}/>
                        <Series argumentField="label" valueField="value">
                            <Label
                                visible={true}
                                position="columns"
                                customizeText={customizeText}>
                                <Font size={16}/>
                                <Connector visible={true} width={0.5}/>
                            </Label>
                        </Series>
                    </PieChart>

                )}
        </div>
    );

};


export default DashboardPieChart;