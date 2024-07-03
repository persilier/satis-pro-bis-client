import React, {useEffect, useState} from 'react';
import axios from 'axios';
import appConfig from "../../config/appConfig";
import LoadingTable from "./LoadingTable";


const FaqListe = () => {
    const [load, setLoad] = useState(true);
    const [data, setData] = useState([]);
    const [category, setCategory] = useState([]);

    useEffect(() => {

        axios.get(appConfig.apiDomaine + `/category-faq`)
            .then(response => {
                setLoad(false);
                setCategory(response.data)
            });

        axios.get(appConfig.apiDomaine + `/faqs`)
            .then(response => {
                //console.log(response)
                setLoad(false);
                setData(response.data)
            })
    }, []);

    return (
        <div>
            {
                load ? (
                    <LoadingTable/>
                ) : (
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="accordion accordion-solid accordion-toggle-plus" id="accordionExample1">

                                {category ? (
                                    category.map((cat, i) => (
                                        <div className="card" key={i}>
                                            <h6 className="text-dark">
                                                {cat.name.fr}
                                            </h6>

                                            {
                                                data ? (
                                                    data.map((elemt, id) => (
                                                        <div className="card-header" id={"heading" + id} key={id}>
                                                            {(elemt.faq_category.name.fr === cat.name.fr) ? (
                                                                <div className="ml-4">
                                                                    <div className="card-title" data-toggle="collapse"
                                                                         data-target={"#collapse" + id}
                                                                         aria-expanded="false"
                                                                         aria-controls={"collapse" + id}>
                                                                        {elemt.question.fr}
                                                                    </div>

                                                                    <div id={"collapse" + id} className="collapse show"
                                                                         aria-labelledby={"heading" + id}
                                                                         data-parent="#accordionExample1">
                                                                        <div className="card-body">
                                                                            <p className="ml-3">
                                                                                {elemt.answer.fr}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : ''}
                                                        </div>
                                                    ))
                                                ) : ''}
                                        </div>
                                    ))
                                ) : ""}

                            </div>
                        </div>
                    </div>
                )
            }

        </div>
    )
};

export default FaqListe;