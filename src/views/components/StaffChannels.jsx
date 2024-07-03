import React, {useEffect, useState} from 'react';
import HeaderTablePage from "./HeaderTablePage";
import axios from "axios";
import appConfig from "../../config/appConfig";
import {Link} from "react-router-dom";
import {ToastBottomEnd} from "./Toast";
import {toastAddErrorMessageConfig, toastAddSuccessMessageConfig} from "../../config/toastConfig";
import LoadingTable from "./LoadingTable";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const StaffChannels = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const defaultData = {
        feedback_preferred_channels: []
    };

    const [data, setData] = useState(defaultData);
    const [listChannels, setListChannels] = useState("");
    const [startRequest, setStartRequest] = useState(false);
    const [load, setLoad] = useState(true);

    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + "/feedback-channels")
                .then(response => {
                    const newChannel={...data};
                    if (response.data.staff.feedback_preferred_channels!==null){
                        newChannel.feedback_preferred_channels=response.data.staff.feedback_preferred_channels;
                        setData(newChannel);
                    }
                    setListChannels(response.data);
                    setLoad(false)
                })
                .catch(error => {
                    setLoad(false);
                    //console.log("Something is wrong");
                })
            ;
        }
    }, []);

    const onChangeOption = (e, channel) => {
        const newData = {...data};
        //console.log(e.target.checked, "OPTION");
        if (e.target.checked === true) {
            newData.feedback_preferred_channels.push(channel)
        } else newData.feedback_preferred_channels = newData.feedback_preferred_channels.filter(item => item !== channel);
        setData(newData);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        if (verifyTokenExpire()) {
            axios.put(appConfig.apiDomaine + "/feedback-channels", data)
                .then(response => {
                    //console.log(response.data);
                    setStartRequest(false);
                    ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                })
                .catch(error => {
                    setStartRequest(false);
                    //console.log("something is wrong");
                    ToastBottomEnd.fire(toastAddErrorMessageConfig());
                })
            ;
        }
    };

    return (
        ready ? (
            <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-container  kt-container--fluid ">
                        <div className="kt-subheader__main">
                            <h3 className="kt-subheader__title">
                                {t("Canaux")}
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()}
                                   className="kt-subheader__breadcrumbs-link">
                                    {t("Canaux du Personnel")}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                    <div className="col-md-6">
                        <div className="kt-portlet">
                            <HeaderTablePage
                                title={t("Les canaux du personnel")}
                            />

                            <div className="kt-portlet__body">
                                <form className="kt-form">
                                    {/*{console.log(data, "DATA")}*/}
                                    {
                                        load ? (
                                            <LoadingTable/>
                                        ) : (
                                            listChannels.channels ?
                                                listChannels.channels.map((channel, index) => (
                                                    <div className="form-group row" key={index}>
                                                        <label className="col col-form-label ">{channel}</label>
                                                        <div className="col">
                                                    <span className="kt-switch kt-switch--sm kt-switch--outline kt-switch--icon kt-switch--success ">
                                                    <label>
                                                        {data.feedback_preferred_channels.length ?
                                                            data.feedback_preferred_channels.map((feedback, i) => (
                                                                feedback === channel ?

                                                                    <input
                                                                        key={i}
                                                                        type="checkbox"
                                                                        onChange={(e) => onChangeOption(e, channel)}
                                                                        checked={"checked"}
                                                                        name={channel}
                                                                    />
                                                                    :
                                                                    <input
                                                                        key={i}
                                                                        type="checkbox"
                                                                        onChange={(e) => onChangeOption(e, channel)}
                                                                        name={channel}
                                                                    />
                                                            ))
                                                            :
                                                            <input
                                                                type="checkbox"
                                                                onChange={(e) => onChangeOption(e, channel)}
                                                                name={channel}
                                                            />

                                                        }
                                                        <span/>
                                                    </label>
                                                    </span>
                                                        </div>
                                                    </div>
                                                )) : null
                                        )
                                    }
                                    <div className="kt-portlet__foot">
                                        <div className="kt-form__actions text-right">
                                            {
                                                !startRequest ? (
                                                    <button type="submit" onClick={(e) => onSubmit(e)}
                                                            className="btn btn-primary">{t("Enregistrer")}</button>
                                                ) : (
                                                    <button
                                                        className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                        type="button" disabled>
                                                        {t("Chargement")}...
                                                    </button>
                                                )
                                            }
                                            {
                                                !startRequest ? (
                                                    <Link to="/dashbord" className="btn btn-secondary mx-2">
                                                        {t("Quitter")}
                                                    </Link>
                                                ) : (
                                                    <Link to="/dashbord" className="btn btn-secondary mx-2" disabled>
                                                        {t("Quitter")}
                                                    </Link>
                                                )
                                            }
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        ) : null
    );

};

export default StaffChannels;
