import React from "react";
import {connect} from "react-redux";
import {loadCss} from "./helpers/function";
import {DeleteConfirmation} from "./views/components/ConfirmationAlert";
import {chosePlan} from "./config/confirmConfig";
import {changePlan} from "./store/actions/planAction";
import axios from "axios";
import appConfig from "./config/appConfig";


loadCss("/assets/css/pages/pricing/pricing-3.css");

const NatureAppChoice = (props) => {

    const onMakeChoice = (e, choice) => {
        e.preventDefault();
        const data={
            plan:choice.toLowerCase()
        };
        DeleteConfirmation.fire(chosePlan("SATIS "+choice))
            .then((result) => {
                if (result.value) {
                    axios.put(`${appConfig.apiDomaine}/plan`, data)
                        .then(response => {
                            console.log("Updata Plan:", response.data);
                            props.changePlan(choice);
                            // localStorage.setItem('plan', choice);
                        })
                        .catch(error => {
                            console.log("Something is wrong");
                        });
                }
            })
        ;
    };

    return (
        <div className="kt-portlet">
            <div className="kt-portlet__head">
                <div className="kt-portlet__head-label">
                    <span className="kt-portlet__head-icon">
                        <i className="la la-puzzle-piece"/>
                    </span>
                    <h3 className="kt-portlet__head-title">
                       BIENVENUE SUR SATIS 2020
                    </h3>
                </div>
            </div>
            <div className="kt-portlet__body">
                <div className="kt-pricing-3 kt-pricing-3--fixed">
                    <div className="kt-pricing-3__items">
                        <div className="row row-no-padding">
                            <div className="kt-pricing-3__item col-lg-4">
                                <div className="kt-pricing-3__wrapper">
                                    <h3 className="kt-pricing-3__title">PRO</h3>
                                    <span className="kt-pricing-3__price">
                                        <span className="kt-pricing-3__label">CFA</span>
                                        <span className="kt-pricing-3__number">10.000.000.000</span>
                                        <span className="kt-pricing-3__text">/&nbsp;&nbsp;Par Installation</span>
                                    </span>
                                    <br/>
                                    <span className="kt-pricing-3__description">
                                        <span>Lorem ipsum dolor sit amet adipiscing elit</span>
                                        <span>sed do eiusmod tempors labore et dolore</span>
                                        <span>magna siad enim aliqua</span>
                                    </span>
                                    <div className="kt-pricing-3__btn">
                                        <button onClick={e => onMakeChoice(e, "PRO")} type="button" className="btn btn-brand btn-wide btn-upper btn-bold">Souscrire</button>
                                    </div>
                                </div>
                            </div>
                            <div className="kt-pricing-3__item kt-pricing-3__item--focus col-lg-4">
                                <div className="kt-pricing-3__wrapper">
                                    <h3 className="kt-pricing-3__title kt-font-light">MACRO</h3>
                                    <span className="kt-pricing-3__price">
                                        <span className="kt-pricing-3__label kt-font-brand kt-opacity-7">CFA</span>
                                        <span className="kt-pricing-3__number kt-font-brand">50.000.000.000</span>
                                        <span className="kt-pricing-3__text kt-font-brand kt-opacity-7">/&nbsp;&nbsp;Par Installation</span>
                                    </span>
                                    <br/>
                                    <span className="kt-pricing-3__description">
                                        <span>Lorem ipsum dolor sit amet adipiscing elit</span>
                                        <span>sed do eiusmod tempors labore et dolore</span>
                                        <span>magna siad enim aliqua</span>
                                    </span>
                                    <div className="kt-pricing-3__btn">
                                        <button onClick={e => onMakeChoice(e, "MACRO")} type="button" className="btn btn-light btn-wide btn-upper btn-bold">Souscrire</button>
                                    </div>
                                </div>
                            </div>
                            <div className="kt-pricing-3__item col-lg-4">
                                <div className="kt-pricing-3__wrapper">
                                    <h3 className="kt-pricing-3__title">HUB</h3>
                                    <span className="kt-pricing-3__price">
                                        <span className="kt-pricing-3__label">CFA</span>
                                        <span className="kt-pricing-3__number">20.000.000.000</span>
                                        <span className="kt-pricing-3__text">/&nbsp;&nbsp;Par Installation</span>
                                    </span>
                                    <br/>
                                    <span className="kt-pricing-3__description">
                                        <span>Lorem ipsum dolor sit amet adipiscing elit</span>
                                        <span>sed do eiusmod tempors labore et dolore</span>
                                        <span>magna siad enim aliqua</span>
                                    </span>
                                    <div className="kt-pricing-3__btn">
                                        <button onClick={e => onMakeChoice(e, "HUB")} type="button" className="btn btn-brand btn-wide btn-upper btn-bold">Souscrire</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = (dispatch) => {
    return {
        changePlan: (plan) => dispatch(changePlan(plan))
    };
};

export default connect(null, mapDispatchToProps)(NatureAppChoice);
