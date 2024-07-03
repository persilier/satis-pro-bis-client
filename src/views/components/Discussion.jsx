import React, {useEffect, useState} from 'react';
import axios from "axios";
import appConfig from "../../config/appConfig";
import moment from "moment";
import RemoveChats from "../pages/Discussions/RemoveChats";
import {useTranslation} from "react-i18next";

const MY_USER_ID = 'ODJO Estelle';

const Discussion = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    const [listChat, setListChat] = useState("");

    useEffect(() => {
        axios.get(appConfig.apiDomaine + "/discussions")
            .then(response => {
                //console.log(response.data, 'RESPONSE');
                setListChat(response.data)
            })
            .catch(error => {
                //console.log("Something is wrong");
            })
    }, []);


    return (

        ready ? (
            <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-container  kt-container--fluid ">
                        <div className="kt-subheader__main">
                            <h3 className="kt-subheader__title">
                                {t("Traitement")}
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                    className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()}
                                   className="kt-subheader__breadcrumbs-link">
                                    {t("Chats")}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">

                    <div className="kt-grid kt-grid--desktop kt-grid--ver kt-grid--ver-desktop kt-app">
                        <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                            <div className="kt-portlet" data-spy="scroll" data-offset="0">
                                <div className="kt-portlet__body kt-portlet__body--fit">
                                    {
                                        listChat ?
                                            listChat.map((chat, i) => (
                                                <div className="kt-grid  kt-wizard-v2 kt-wizard-v2--white"
                                                     id="kt_wizard_v2"
                                                     data-ktwizard-state="first">
                                                    <div className="kt-grid__item kt-wizard-v2__aside">

                                                        <div className="kt-wizard-v2__nav ">

                                                            <div
                                                                className="kt-wizard-v2__nav-items kt-wizard-v2__nav-items--clickable">
                                                                <div className="kt-wizard-v2__nav-item" key={i}
                                                                     data-ktwizard-type="step"
                                                                     data-ktwizard-state="current">
                                                                    <div className="kt-wizard-v2__nav-body">
                                                                        <div className="kt-wizard-v2__nav-icon">
                                                                            <i className="flaticon-chat-1"></i>
                                                                        </div>
                                                                        <div className="kt-wizard-v2__nav-label">
                                                                            <div
                                                                                className="kt-wizard-v2__nav-label-title">
                                                                                <div className="kt-widget__item">
                                                                                    <div className="kt-widget__info">
                                                                                        <div
                                                                                            className="kt-widget__section">
                                                                                            <a href={'#'}
                                                                                                // to={`/chat/${chat.id}`}
                                                                                               className="kt-widget__username"> {chat.name}
                                                                                            </a>
                                                                                        </div>
                                                                                    </div>

                                                                                    <span className="kt-widget__desc">
																			{t("Référence")}: {chat.claim.reference}
																		</span>
                                                                                </div>
                                                                            </div>
                                                                            <div
                                                                                className="kt-wizard-v2__nav-label-desc">
                                                                            <span
                                                                                className="kt-widget__date">{t("Créer")}: {moment(chat.created_at).format('ll')}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div
                                                        className="kt-grid__item kt-grid__item--fluid kt-wizard-v2__wrapper">

                                                        <form className="m-5" id="kt_form" noValidate="novalidate">

                                                            <div className="kt-wizard-v2__content"
                                                                 data-ktwizard-type="step-content"
                                                                 data-ktwizard-state="current">
                                                                {/*<div className="kt-heading kt-heading--md">*/}
                                                                {/*    {chat.name}*/}
                                                                {/*</div>*/}
                                                                <div
                                                                    className="kt-form__section kt-form__section--first">
                                                                    <div className="kt-wizard-v2__form">

                                                                        <RemoveChats
                                                                            getList={chat}
                                                                        />

                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </form>

                                                    </div>
                                                </div>
                                            )) : ""

                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default Discussion;