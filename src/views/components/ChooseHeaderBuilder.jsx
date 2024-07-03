import React, {useEffect, useState} from "react";
import axios from 'axios';
import HeaderBuilder from "../components/HeaderBuilder";
import TestFormBuilder from "../pages/TestFormBuilder";
import {update} from "sweetalert2";
import apiConfig from "../../config/apiConfig";
import {useTranslation} from "react-i18next";

const ChooseHeaderBuilder = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const [getHeader, setGetHeader] = useState(undefined);
    const [model, setModel] = useState('Choose one herder');

    const [modelData, setModelData] = useState([]);

    useEffect(() => {
        axios.get(`${apiConfig.baseUrl}/metadata/headers/data`)
            .then(response => setModelData(response.data))

    }, []);
    const onChangeSelect = (e) => {
        setModel(e.target.value);
        let select = document.getElementById("model");
        let choice = select.selectedIndex;
        let valeur = select.options[choice].value;
        setGetHeader(document.getElementById('model').value = valeur)
    };


    const addHeaderBuilder = (data) => {
        //console.log(data, "Add header builder");
        axios({
            method: 'post',
            url: `http://127.0.0.1:8000/header`,
            data: {
                name: data.name,
                content_default: data.content
            },
        })
            .then(function (response) {
                //console.log(response, 'OK');
            })
            .catch(function (response) {
                //console.log(response);
            });
    };
    const updateHeaderBuilder = (data) => {
        //console.log(data, "Add header builder");
        if (getHeader !== undefined) {
            axios({
                method: 'put',
                url: `${apiConfig.baseUrl}/header/${getHeader}`,
                data: {
                    name: data.name,
                    content_default: data.content
                },
            })
                .then(function (response) {
                    //console.log(response, 'OK');
                })
                .catch(function (response) {
                    //console.log(response);
                });
        }
        onCloseHeader()
    };
    const onCloseHeader = () => {
        setGetHeader(undefined)
    };
    return (
        ready ? (
            <div className="container">
                <h1 className="text-center">Header Builder</h1>
                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="kt-portlet">
                                <div className="kt-form">
                                    <div className="kt-portlet__body">
                                        <select name="model" id="model" className="form-control" value={model}
                                                onChange={(e) => onChangeSelect(e)}>
                                            <option value="" disabled> {t("Sélectionnez un formulaire")}</option>
                                            {modelData.map((model, i) => (
                                                <option key={i} value={model.name}>{model.description}</option>

                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {getHeader ? (
                        <HeaderBuilder getData={data => updateHeaderBuilder(data)} getHeader={getHeader}
                                       onCloseHeader={() => onCloseHeader()}/>
                    ) : t('Chargement') + ("...")
                    }
                </div>
            </div>
        ) : null
    );
};

export default ChooseHeaderBuilder;
