import React, {useCallback, useEffect, useState} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {Link, NavLink,} from "react-router-dom";
import moment from "moment";
import 'moment/locale/fr';
import * as LanguageAction from "../../store/actions/languageAction";
import * as authActions from "../../store/actions/authActions";
import appConfig from "../../config/appConfig";
import {EventNotification, EventNotificationPath, RelaunchNotification} from "../../constants/notification";
import EmptyNotification from "../components/EmptyNotification";
import {verifyPermission} from "../../helpers/permission";
import {ToastBottomEnd} from "../components/Toast";
import {toastSuccessMessageWithParameterConfig} from "../../config/toastConfig";
import Loader from "../components/Loader";
import {verifyTokenExpire} from "../../middleware/verifyToken";

import { useTranslation } from "react-i18next";


const Nav = (props) => {

    const {t, i18n, ready} = useTranslation();

    const [eventNotification, setEventNotification] = useState([]);
    const [relaunchNotification, setRelaunchNotification] = useState([]);
    const [loader, setLoader] = useState(false);
    const [startRead, setStartRead] = useState(false);
    const [searchData, setSearchData] = useState(null);
    var timer = null;

    const filterEventNotification = useCallback((notification) => {
        let notificationList;
        notificationList =  notification.filter(
            n => EventNotification.includes(n.type.substr(39, n.type.length))
        );
        localStorage.setItem("eventNotification", JSON.stringify(notificationList));
        return notificationList;
    }, [EventNotification]);

    const filterRelaunchNotification = useCallback((notification) => {
        return notification.filter(
            n => RelaunchNotification.includes(n.type.substr(39, n.type.length))

        );
    }, [RelaunchNotification]);

    const fetchData = async () => {
        if (verifyTokenExpire()) {
            await axios.get(`${appConfig.apiDomaine}/unread-notifications`)
                .then(response => {
                    setEventNotification(filterEventNotification(response.data));
                    setRelaunchNotification(filterRelaunchNotification(response.data));
                })
                .catch(error => {
                    //console.log("Something is wrong");
                })
            ;
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (props.user) {
            window.Echo.private(`Satis2020.ServicePackage.Models.Identite.${props?.user?.identite_id}`)
                .notification((notification) => {
                    if (notification.type.substr(39, notification.type.length) === "PostDiscussionMessage") {
                        if (window.location.pathname !== "chat#messageList")
                            ToastBottomEnd.fire(toastSuccessMessageWithParameterConfig(notification.text.length > 40 ? notification.text.substr(0, 40)+"..." : notification.text));
                    } else {
                        fetchData();
                    }
                })
            ;
        }
    }, [props?.user?.identite]);

    const onClickLanguage = useCallback((e, lang) => {
        e.preventDefault();
        props.changeLanguage(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
    }, [props.changeLanguage]);

    const onClickLogoutLink = useCallback((e) => {
        e.preventDefault();
        axios.get(`${appConfig.apiDomaine}/logout`)
            .then(response => {
                //console.log('response:', response.data);
                props.logoutUser();
                window.location.href = "/login";
            })
            .catch(error => {
                //console.log("")
                //console.log("Something is wrong");
            })
        ;
    }, [props.logoutUser]);

    const getNotificationLink = useCallback((type, data) => {
        return type !== "RegisterAClaim"
            ? EventNotificationPath[type](data.claim.id)
            : EventNotificationPath[type][data.claim.status](data.claim.id);
    });

    const readAllNotification = async (readNotification, path) => {
        if (verifyTokenExpire()) {
            await axios.put(`${appConfig.apiDomaine}/unread-notifications`, readNotification)
                .then(({data}) => {
                    setStartRead(false);
                    if (data.canReload) {
                        window.location.href = path;
                    } else {
                        setEventNotification(filterEventNotification(data.unreadNotifications));
                        setRelaunchNotification(filterRelaunchNotification(data.unreadNotifications));
                    }
                })
                .catch(({response}) => {console.log("Something is wrong")})
            ;
        }
    };

    const searchClaim = (e) => {
        var value = e.target.value;
        var endpoint = null;
        if (verifyPermission(props.userPermissions, 'search-claim-any-reference'))
            endpoint = `${appConfig.apiDomaine}/any/search-claim/${value}`;
        if (verifyPermission(props.userPermissions, 'search-claim-my-reference'))
            endpoint = `${appConfig.apiDomaine}/my/search-claim/${value}`;
        if (value) {
            setLoader(true);
            if (timer)
                clearTimeout(timer);
            timer = setTimeout(function(){
                if (verifyTokenExpire()) {
                    axios.get(endpoint)
                        .then((response) => {
                            setLoader(false);
                            setSearchData(response.data);
                        })
                        .catch((error) => {
                            setLoader(false);
                            setSearchData([]);
                            //console.log("Something is wrong");
                        })
                    ;
                }
            }.bind(value), 5000);
        }
    };

    const showDetailNotification = useCallback((e, path, idNotification, relaunchNotification = false, notification = null) => {
        e.preventDefault();
        if (!startRead) {
            setStartRead(true);
            const readNotification = {
                "notifications": [
                    idNotification
                ]
            };

            if (!relaunchNotification) {
                readAllNotification(readNotification, path);
            } else {
                if (!path) {
                    readAllNotification(readNotification, path);
                }
            }
        }
    });

    const notificationCount = eventNotification.length + relaunchNotification.length;

    return (
        <div id="kt_header" className="kt-header kt-grid__item  kt-header--fixed " data-ktheader-minimize="on"
             style={{position: "sticky", top: 0, zIndex: 2}}>

            {ready ? (<div className="kt-container  kt-container--fluid ">
                <div className="kt-header__brand " id="kt_header_brand">
                    <div className="kt-header__brand-logo">
                        <a href="index.html">
                            <img alt="Logo" src="/assets/images/satisLogo.png" width={"100"} height={"34"}/>
                            <span className="mx-2 text-white font-weight-bolder">{props.plan}</span>
                        </a>
                    </div>
                </div>

                <div className="kt-header__topbar">
                    <div className="kt-header__topbar-item kt-header__topbar-item--search dropdown"
                         id="kt_quick_search_toggle">
                        <div className="kt-header__topbar-wrapper" data-toggle="dropdown" data-offset="10px,0px">
                            <span className="kt-header__topbar-icon"><i className="flaticon2-search-1"/></span>
                        </div>
                        <div
                            className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-lg">
                            <div className="kt-quick-search kt-quick-search--dropdown kt-quick-search--result-compact"
                                 id="kt_quick_search_dropdown">
                                <form method="get" className="kt-quick-search__form">
                                    <div className="input-group">
                                        <div className="input-group-prepend"><span className="input-group-text"><i className="flaticon2-search-1"/></span></div>
                                        <input type="text" onKeyUp={e => searchClaim(e)} className="form-control " placeholder="Search..."/>
                                        {loader ? (
                                            <div className="mr-5 input-group-append"><span className="input-group-text"><i className="kt-spinner kt-spinner--sm kt-spinner--brand" style={{display: "flex"}}/></span></div>
                                        ) : null}
                                    </div>
                                </form>
                                {searchData ? (
                                    <div className={`kt-quick-search__wrapper kt-scroll ps ${true ? "ps--active-y" : ""}`} data-scroll="true" data-height="150" data-mobile-height="200" style={{height: "325px", overflow: "hidden", display: `${true ? "block" : "none"}`}}>
                                        <div className="quick-search-result">
                                            {!searchData.length ? (
                                                <div className="font-size-sm text-primary font-weight-bolder text-uppercase mb-2">
                                                    {t("Aucun Enregistrement Trouvé")}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="font-size-sm text-primary font-weight-bolder text-uppercase mb-2">
                                                        {t("Enregistrement Trouvé")}
                                                    </div>

                                                    <div className="mb-10">
                                                        <div className="d-flex align-items-center flex-grow-1 mb-2">
                                                            <div className="symbol symbol-30  flex-shrink-0">
                                                                <div className="symbol-label" style={{backgroundImage: "url('https://preview.keenthemes.com/metronic/theme/html/demo1/dist/assets/media/users/300_20.jpg')"}}/>
                                                            </div>
                                                            <div className="d-flex flex-column ml-3 mt-2 mb-2">
                                                                <a href={`/process/claims/${searchData[0].reference}/detail`} className="font-weight-bold text-dark text-hover-primary">
                                                                    {searchData[0].reference}
                                                                </a>
                                                                <span className="font-size-sm font-weight-bold text-muted">
                                                                    {t("Reclamant") + ":" + searchData[0].claimer.lastname+" "+searchData[0].claimer.firstname}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>










































                    <div className="kt-header__topbar-item dropdown">
                        <div className="kt-header__topbar-wrapper" data-toggle="dropdown" data-offset="10px,0px">
                            <span className="kt-header__topbar-icon">
                                <i className="flaticon2-bell-alarm-symbol"/>
                                {
                                    notificationCount > 0 ? (
                                        <div className="kt-badge kt-badge__pics">
                                    <span
                                        className="kt-badge__pic  kt-badge__pic--last"
                                        style={{
                                            backgroundColor: "#FEB2B2",
                                            color: "#C53030",
                                            width: "25px",
                                            height: "25px",
                                            position: "relative",
                                            bottom: "10px",
                                            left: "5px"
                                        }}
                                    >
                                        {
                                            (notificationCount) > 9 ? "+9" : notificationCount
                                        }
                                    </span>
                                        </div>
                                    ) : null
                                }
                            </span>
                            <span className="kt-hidden kt-badge kt-badge--danger"/>
                        </div>
                        <div
                            className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-xl">
                            <form>
                                <div className="kt-head kt-head--skin-light kt-head--fit-x kt-head--fit-b">
                                    <h3 className="kt-head__title">
                                        {t("Notifications")}
                                        &nbsp;
                                        <span
                                            className="btn btn-label-primary btn-sm btn-bold btn-font-md">{notificationCount} {t("nouveau")}</span>
                                    </h3>
                                    <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x nav-tabs-line-brand  kt-notification-item-padding-x"
                                        role="tablist">
                                        <li className="nav-item">
                                            <a className="nav-link active show" data-toggle="tab"
                                               href="#topbar_notifications_notifications" role="tab"
                                               aria-selected="true">{t("Alertes")}</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" data-toggle="tab"
                                               href="#topbar_notifications_events" role="tab"
                                               aria-selected="false">{t("Relances")}</a>
                                        </li>
                                    </ul>
                                </div>

                                <div className="tab-content">
                                    <div className="tab-pane active show" id="topbar_notifications_notifications"
                                         role="tabpanel">
                                        {
                                            eventNotification.length ? (
                                                <div className="kt-notification kt-margin-t-10 kt-margin-b-10 kt-scroll"
                                                     data-scroll="true" data-height="300" data-mobile-height="200"
                                                     style={eventNotification.length >= 4 ? {
                                                         height: "380px",
                                                         overflowY: "auto"
                                                     } : {}}>
                                                    {
                                                        eventNotification.map((n, index) => (
                                                            <a
                                                                href={getNotificationLink(n.type.substr(39, n.type.length), n.data)}
                                                                key={index}
                                                                className="kt-notification__item"
                                                                onClick={e => showDetailNotification(e, getNotificationLink(n.type.substr(39, n.type.length), n.data), n.id, false, n)}
                                                            >
                                                                <div className="kt-notification__item-icon">
                                                                    <i className="flaticon2-line-chart kt-font-success"/>
                                                                </div>
                                                                <div className="kt-notification__item-details">
                                                                    <div className="kt-notification__item-title"
                                                                         style={{textOverflow: "ellipsis"}}>
                                                                        {n.data.text.length >= 87 ? n.data.text.substring(0, 88) + "..." : n.data.text.substring(0, 86)}
                                                                    </div>
                                                                    <div className="kt-notification__item-time">
                                                                        {moment(new Date(n.created_at)).fromNow()}
                                                                    </div>
                                                                </div>
                                                                {
                                                                    startRead ? (
                                                                        <Loader/>
                                                                    ) : null
                                                                }
                                                            </a>
                                                        ))
                                                    }
                                                </div>
                                            ) : (
                                                <EmptyNotification/>
                                            )
                                        }
                                    </div>
                                    <div className="tab-pane" id="topbar_notifications_events" role="tabpanel">
                                        {
                                            relaunchNotification.length ? (
                                                <div className="kt-notification kt-margin-t-10 kt-margin-b-10 kt-scroll"
                                                     data-scroll="true" data-height="300" data-mobile-height="200"
                                                     style={relaunchNotification.length >= 4 ? {
                                                         height: "380px",
                                                         overflowY: "auto"
                                                     } : {}}>
                                                    {
                                                        relaunchNotification.map(((n, index) => (
                                                            <a
                                                                key={index}
                                                                href={`/read-notification-${index}`}
                                                                onClick={e => showDetailNotification(e, ``, n.id, true)}
                                                                className="kt-notification__item"
                                                            >
                                                                <div className="kt-notification__item-icon">
                                                                    <i className="flaticon2-line-chart kt-font-success"/>
                                                                </div>
                                                                <div className="kt-notification__item-details">
                                                                    <div className="kt-notification__item-title"
                                                                         style={{textOverflow: "ellipsis"}}>
                                                                        {n.data.text.length >= 87 ? n.data.text.substring(0, 85) + "..." : n.data.text.substring(0, 86)}
                                                                    </div>
                                                                    <div className="kt-notification__item-time">
                                                                        {moment(new Date(n.created_at)).fromNow()}
                                                                    </div>
                                                                </div>
                                                                {
                                                                    startRead ? (
                                                                        <Loader/>
                                                                    ) : null
                                                                }
                                                            </a>
                                                        )))
                                                    }
                                                </div>
                                            ) : (
                                                <EmptyNotification trans={t}/>
                                            )
                                        }

                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="kt-header__topbar-item kt-header__topbar-item--langs">
                        <div className="kt-header__topbar-wrapper" data-toggle="dropdown" data-offset="10px,0px">
                        <span className="kt-header__topbar-icon text-white">
                            {i18n.isInitialized && i18n.language.toUpperCase()}
                        </span>
                        </div>
                        {
                            appConfig.useManyLanguage ? (
                                <div className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-anim">
                                    <ul className="kt-nav kt-margin-t-10 kt-margin-b-10">
                                        <li className={`kt-nav__item ${i18n.language === "en" && "kt-nav__item--active"}`}>
                                            <a href="#link" onClick={(e) => onClickLanguage(e, "en")} className="kt-nav__link">
                                        <span className="kt-nav__link-icon">
                                            EN
                                        </span>
                                                <span className="kt-nav__link-text">English</span>
                                            </a>
                                        </li>

                                        <li className={`kt-nav__item ${i18n.language === "fr" && "kt-nav__item--active"}`}>
                                            <a href="#link" onClick={(e) => onClickLanguage(e, "fr")} className="kt-nav__link">
                                        <span className="kt-nav__link-icon">
                                            FR
                                        </span>
                                                <span className="kt-nav__link-text">Français</span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            ) : null
                        }
                    </div>

                    <div className="kt-header__topbar-item kt-header__topbar-item--user">
                        <div className="kt-header__topbar-wrapper" data-toggle="dropdown" data-offset="10px,0px">
                            <span className="kt-header__topbar-welcome kt-visible-desktop">{t("Salut")},</span>
                            <span className="kt-header__topbar-username kt-visible-desktop">
                                {props.user.firstName}
                            </span>
                            <img alt="Pic" src="/assets/media/users/default.jpg"/>
                            <span className="kt-header__topbar-icon kt-bg-brand kt-hidden"><b>S</b></span>
                        </div>
                        <div
                            className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-xl">
                            <div className="kt-user-card kt-user-card--skin-light kt-notification-item-padding-x">
                                <div className="kt-user-card__avatar">
                                    <img className="kt-hidden-" alt="Pic" src="/assets/media/users/default.jpg"/>
                                    <span
                                        className="kt-badge kt-badge--username kt-badge--unified-success kt-badge--lg kt-badge--rounded kt-badge--bold kt-hidden">S</span>
                                </div>
                                <div className="kt-user-card__name">
                                    {props.user.lastName + " " + props.user.firstName}
                                </div>
                            </div>

                            <div className="kt-notification">
                                {
                                    verifyPermission(props.userPermissions, 'list-my-discussions') ||
                                    verifyPermission(props.userPermissions, 'contribute-discussion') ? (
                                            <Link to={"/chat"} className="kt-notification__item">
                                                <div className="kt-notification__item-icon">
                                                    <i className="flaticon2-mail kt-font-warning"/>
                                                </div>
                                                <div className="kt-notification__item-details">
                                                    <div className="kt-notification__item-title kt-font-bold">
                                                        {t("Mes Discussions")}
                                                    </div>
                                                    <div className="kt-notification__item-time">
                                                        {t("Acceder à la liste")}
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                        : null
                                }

                                <NavLink to={"/settings/account"}
                                         className="kt-notification__item">
                                    <div className="kt-notification__item-icon">
                                        <i className="flaticon2-calendar-3 kt-font-success"/>
                                    </div>
                                    <div className="kt-notification__item-details">
                                        <div className="kt-notification__item-title kt-font-bold">
                                            {t("Mon profil")}
                                        </div>
                                        <div className="kt-notification__item-time">
                                            {t("Paramètres de compte et plus")}
                                        </div>
                                    </div>
                                </NavLink>

                                <div className="kt-notification__custom kt-space-between">
                                    <a href="/logout" onClick={onClickLogoutLink} target="_blank"
                                       className="btn btn-label btn-label-brand btn-sm btn-bold">{t("Déconnexion")}</a>
                                    {/*<a href="custom/user/login-v2.html" target="_blank"*/}
                                    {/*   className="btn btn-clean btn-sm btn-bold">Upgrade Plan</a>*/}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>) : null}


        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions,
        language: state.language,
        plan: state.plan.plan,
        user: {
            lastName: state?.user?.user?.data?.identite?.lastname,
            firstName: state?.user?.user?.data?.identite?.firstname,
            identite_id: state?.user?.user?.data?.identite?.id
        }
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeLanguage: (language) => {
            dispatch(LanguageAction.changeLanguage(language))
        },
        logoutUser: () => dispatch(authActions.logoutUser()),

    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Nav);
