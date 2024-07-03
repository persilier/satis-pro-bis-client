import React, {useEffect, useState} from "react";
import axios from 'axios';
import HeaderBuilder from "../components/HeaderBuilder";
import {editData} from "../../constants/headerBuilder";
import AppLibrariesModel from "../../appLibraries/models/AppLibrariesModel";
import apiConfig from "../../config/apiConfig";

const TestHeaderBuilder = () => {
    const [headerForm, setHeaderForm] = useState(undefined);
    const [getHeader, setGetHeader] = useState(undefined);

    useEffect(() => {
        setHeaderForm(AppLibrariesModel.allHeader()
            .then(response => {
                //console.log('FormHeader', response);
                setGetHeader(response.data.map(header => (header.name)))
            })
            .catch(error => console.log(error))
        );
    }, []);

    const upDateHeaderBuilder = (data) => {
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

    };

    const updateHeaderBuilder = (data) => {
        //console.log(data, "Update header builder");
    };
    return (
        <div className="container">
            {console.log(getHeader, 'GET')}
            {
                getHeader !== undefined ? (
                    <HeaderBuilder getData={data => upDateHeaderBuilder(data)} getHeader={getHeader}/>
                ) : 'Loading...'
            }

        </div>
    );
};

export default TestHeaderBuilder;
