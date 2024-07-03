import React, {useEffect, useState} from 'react';
import axios from "axios";
import appConfig from "../../../config/appConfig";
import {Link, useParams} from "react-router-dom";
import moment from "moment";
import {connect} from "react-redux";
import MessageList from "./MessageList";
import {ToastBottomEnd} from "../../components/Toast";
import {
    toastDeleteErrorMessageConfig,
    toastDeleteSuccessMessageConfig,
    toastErrorMessageWithParameterConfig,
} from "../../../config/toastConfig";
import {DeleteConfirmation} from "../../components/ConfirmationAlert";
import {confirmDeleteConfig} from "../../../config/confirmConfig";
import {debug, filterDiscussionBySearchValue} from "../../../helpers/function";
import {verifyPermission} from "../../../helpers/permission";
import {ERROR_401} from "../../../config/errorPage";
import LoadingTable from "../../components/LoadingTable";
import {verifyTokenExpire} from "../../../middleware/verifyToken";
import {useTranslation} from "react-i18next";

const Chats = (props) => {
    const {type} = useParams();

    if (!verifyPermission(props.userPermissions, "list-my-discussions"))
        window.location.href = ERROR_401;

    const defaultData = {
        text: '',
        files: [],
        parent_id: "",
    };
    const defaultError = {
        text: '',
        files: [],
        parent_id: "",
    };

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const [data, setData] = useState(defaultData);
    const [listChat, setListChat] = useState("");
    const [listChatUsers, setListChatUsers] = useState([]);
    const [listChatMessages, setListChatMessage] = useState([]);
    const [idChat, setIdChat] = useState(null);
    const [startRequest, setStartRequest] = useState(false);
    const [messageTarget, setMessageTarget] = useState('');
    const [search, setSearch] = useState(false);
    const [load, setLoad] = useState(true);
    const [activeChat, setActiveChat] = useState(false);

    let userDataJson = JSON.parse(localStorage.getItem("userData"));
    useEffect(() => {
        if (verifyTokenExpire()) {
            axios.get(appConfig.apiDomaine + `/discussions${ type ? "?type=unsatisfied" : ""}`)
                .then(response => {
                    setListChat(response.data);
                    setLoad(false)
                })
                .catch(error => {
                    setLoad(false);
                })
            ;
        }
    }, [type]);

    useEffect(() => {
        if (userDataJson.staff.identite_id && idChat) {
            window.Echo.private(`Satis2020.ServicePackage.Models.Identite.${userDataJson.staff.identite_id}`)
                .notification((notification) => {
                    if (notification.type.substr(39, notification.type.length) === "PostDiscussionMessage") {
                        if (notification.discussion.id === idChat) {
                            setListChatMessage(notification.messages.reverse());
                        }

                    }
                });
        }
    }, [userDataJson.staff.identite_id, idChat]);

    const searchElement = async (e) => {
        if (e.target.value) {
            await setSearch(true);
            filterDiscussionBySearchValue(e);
        } else {
            await setSearch(true);
            filterDiscussionBySearchValue(e);
            setSearch(false);
        }
    };

    const onChangeText = (e) => {
        let newData = {...data};
        newData.text = e.target.value;
        setData(newData);
    };

    const onChangeFile = (e) => {
        let newData = {...data};
        newData.files = Object.values(e.target.files);
        setData(newData);
    };

    const responseToMessage = (id, text) => {
        const newData = {...data};
        newData.parent_id = id;
        setMessageTarget(text);
        setData(newData);
    };

    const closeTag = () => {
        const newData = {...data};
        newData.parent_id = "";
        newData.files = "";
        setMessageTarget("");
        setData(newData);
    };

    const onChangeDiscussion = (id) => {

        async function fetchData() {
            await axios.get(appConfig.apiDomaine + `/discussions/${id}/staff`)
                .then(response => {
                    setActiveChat(true);
                    setListChatUsers(response.data.staff);
                    setIdChat(response.data.id);
                })
                .catch(error => {
                    setActiveChat(false);
                    setLoad(false);
                });
            await getListMessage(id)
        }

        if (verifyTokenExpire())
            fetchData();
    };

    const getListMessage = (id) => {
        async function fetchData() {
            await axios.get(appConfig.apiDomaine + `/discussions/${id}/messages`)
                .then(response => {
                    setListChatMessage(response.data.reverse());
                    document.getElementById('kt-scroll').scrollTo(0, 10000);
                    document.getElementById("monChamp").focus();
                })
                .catch(error => {
                });
        }

        if (verifyTokenExpire())
            fetchData();
    };

    const formatFormData = (newData) => {
        const formData = new FormData();
        formData.append("_method", "post");
        for (const key in newData) {
            if (key === "files") {
                for (let i = 0; i < (newData.files).length; i++)
                    formData.append("files[]", (newData[key])[i], ((newData[key])[i]).name);
            } else
                formData.set(key, newData[key]);
        }
        return formData;
    };

    const deleteContributor = (chatsId, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig())
            .then((result) => {
                if (result.value) {
                    if (verifyTokenExpire()) {
                        axios.delete(appConfig.apiDomaine + `/discussions/${chatsId}`)
                            .then(response => {
                                const newChats = [...listChat];
                                newChats.splice(index, 1);
                                setListChat(newChats);
                                ToastBottomEnd.fire(toastDeleteSuccessMessageConfig());
                            })
                            .catch(error => {
                                ToastBottomEnd.fire(toastDeleteErrorMessageConfig());
                            })
                        ;
                    }
                }
            })
        ;
    };

    const addItem = (e) => {

        e.preventDefault();
        let newData = {...data};
        if (!newData.files.length)
            delete newData.files;
        if (newData.parent_id === "")
            delete newData.parent_id;

        if ((data.text !== '' && idChat) || (data.files !== [] && idChat)) {
            setStartRequest(true);
            if (verifyTokenExpire()) {
                axios.post(appConfig.apiDomaine + `/discussions/${idChat}/messages`, formatFormData(newData))
                    .then(response => {
                        // getListMessage(idChat);
                        const newItems = [...listChatMessages, response.data];
                        setListChatMessage(newItems);
                        setData(defaultError);
                        getListMessage(idChat);
                        setStartRequest(false);
                    })
                    .catch(error => {
                        setStartRequest(false);
                        ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(error.response.data.error.text));
                    })
                ;
            }
        }
    };

    const deletedItem = (key, index) => {
        DeleteConfirmation.fire(confirmDeleteConfig())
            .then((result) => {
                if (result.value) {
                    if (verifyTokenExpire()) {
                        axios.delete(appConfig.apiDomaine + `/discussions/${idChat}/messages/${key}`)
                            .then(response => {
                                getListMessage(idChat);
                                const filteredItems = listChatMessages.filter(item => item.key !== key);
                                setListChatMessage(filteredItems);
                                ToastBottomEnd.fire(toastDeleteSuccessMessageConfig());
                            })
                            .catch(error => {
                                ToastBottomEnd.fire(toastDeleteErrorMessageConfig());
                            })
                        ;
                    }
                }
            })
        ;
    };
    return (

        ready ? (<div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
            <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                <div className="kt-container  kt-container--fluid ">
                    <div className="kt-subheader__main">
                        {
                            (type) ? (
                                <h3 className="kt-subheader__title"> {t("Escalade")} </h3>
                            ) : <h3 className="kt-subheader__title"> {t("Traitement")} </h3>
                        }
                        <span className="kt-subheader__separator kt-hidden"/>
                        <div className="kt-subheader__breadcrumbs">
                            <a href="#icone" className="kt-subheader__breadcrumbs-home"><i
                                className="flaticon2-shelter"/></a>
                            <span className="kt-subheader__breadcrumbs-separator"/>
                            <a href="#button" onClick={e => e.preventDefault()}
                               className="kt-subheader__breadcrumbs-link">
                                {t("Tchats")}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">

                <div className="kt-grid kt-grid--desktop kt-grid--ver kt-grid--ver-desktop kt-app">
                    {
                        load ? (
                            <LoadingTable/>
                        ) : (
                            <div
                                className="kt-grid__item kt-app__toggle kt-app__aside kt-app__aside--lg kt-app__aside--fit"
                                id="kt_chat_aside">
                                {
                                    listChat ?
                                        <div className="kt-portlet kt-portlet--last">

                                            <div className="kt-portlet__body">

                                 {/*   RECHERCHE*/}
                                   <div className="kt-searchbar">
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text" id="basic-addon1">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        xmlnsXlink="http://www.w3.org/1999/xlink" width="24px" height="24px"
                                                        viewBox="0 0 24 24" version="1.1" className="kt-svg-icon">
                                                    <g stroke="none" strokeWidth="1" fill="none"
                                                       fillRule="evenodd">
                                                        <rect x="0" y="0" width="24" height="24">
                                                        </rect>
                                                        <path d="M14.2928932,16.7071068 C13.9023689,16.3165825 13.9023689,15.6834175 14.2928932,15.2928932 C14.6834175,14.9023689 15.3165825,14.9023689 15.7071068,15.2928932 L19.7071068,19.2928932 C20.0976311,19.6834175 20.0976311,20.3165825 19.7071068,20.7071068 C19.3165825,21.0976311 18.6834175,21.0976311 18.2928932,20.7071068 L14.2928932,16.7071068 Z"
                                                            fill="#000000" fillRule="nonzero" opacity="0.3">
                                                        </path>
                                                        <path d="M11,16 C13.7614237,16 16,13.7614237 16,11 C16,8.23857625 13.7614237,6 11,6 C8.23857625,6 6,8.23857625 6,11 C6,13.7614237 8.23857625,16 11,16 Z M11,18 C7.13400675,18 4,14.8659932 4,11 C4,7.13400675 7.13400675,4 11,4 C14.8659932,4 18,7.13400675 18,11 C18,14.8659932 14.8659932,18 11,18 Z"
                                                            fill="#000000" fillRule="nonzero">
                                                        </path>
                                                    </g>
                                                                        </svg>
                                                </span>
                                            </div>
                                                     <input id="myInput" type="text"
                                                       onKeyUp={(e) => searchElement(e)}
                                                       className="form-control"
                                                       placeholder={t("Search")}
                                                       aria-controls="basic-addon1"/>
                                        </div>
                                   </div>

                                    <div className="kt-widget kt-widget--users kt-mt-20">
                                        <div className="kt-scroll kt-scroll--pull ps ps--active-y"
                                             data-mobile-height="300"
                                             style={{height: '250px', overflow: 'hidden'}}>
                                            <ul id="myUL">
                                                {
                                                    listChat.map((chat, i) => (
                                                        <li key={i}>

                                                            {/*LISTE DISCUSSION GAUCHE*/}
                                                            <div className="kt-widget__items">
                                                                <div className="kt-widget__item">

                                                                    {/*ICONE*/}
                                                                   <i className="fa-2x flaticon2-chat-2"></i>

                                                                    {/*DISCUSSION*/}
                                                                    <div className="kt-widget__info">

                                                                        {/*NOM*/}
                                                                        <div className="kt-widget__section">
                                                                            <a href={"#messageList"}
                                                                               activeclassname="kt-menu__item--active"
                                                                               aria-haspopup="true"
                                                                               onClick={(e) => onChangeDiscussion(chat.id)}
                                                                               className="kt-widget__username">{chat.name}
                                                                            </a>
                                                                        {
                                                                            activeChat && idChat === chat.id ?
                                                                               (
                                                                                   (type) ? (
                                                                                     <span className="kt-badge kt-badge--danger kt-badge--dot"> </span>
                                                                                   ) :  <span className="kt-badge kt-badge--success kt-badge--dot"> </span>
                                                                                )
                                                                            : ""
                                                                        }
                                                                        </div>

                                                                        {/*REFERENCE DE LA RECLAMATION*/}
                                                                        <span className="kt-widget__desc">{chat.claim.reference} </span>

                                                                    </div>


                                                                    <div className="kt-widget__action">
                                                                        <span className="kt-widget__date">{moment(chat.created_at).format('ll')}</span>
                                                                                    {idChat === chat.id}
                                                                                    {/*<span*/}
                                                                                    {/*    className="kt-badge kt-badge--success kt-font-bold">{listChatUsers.length}</span>*/}
                                                                                    <div
                                                                                        className="dropdown dropdown-inline" >
                                                                                        <button type="button"
                                                                                                className="btn btn-clean btn-sm btn-icon btn-icon-md"
                                                                                                data-toggle="dropdown"
                                                                                                aria-haspopup="true"
                                                                                                aria-expanded="false">
                                                                                            <i className="flaticon2-menu-1"></i>
                                                                                        </button>

                                                                                        <div
                                                                                            className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-md">

                                                                                            <ul className="kt-nav">

                                                                                                <li className="kt-nav__item">
                                                                                                    <Link
                                                                                                        to={chat.id ? `/treatment/chat/contributor/${chat.id}/${type || ""}` : ""}
                                                                                                        className="kt-nav__link">
                                                                                                        <i className="kt-nav__link-icon flaticon2-group"></i>
                                                                                                        <span
                                                                                                            className="kt-nav__link-text">{t("Liste des participants")}</span>

                                                                                                        <span  className="kt-nav__link-badge">
                                                                                                             <span
                                                                                                                 className="kt-badge kt-badge--success  kt-badge--rounded-">
                                                                                                               {chat.staff ? chat.staff.length : 0}
                                                                                                           </span>
                                                                                                        </span>



                                                                                                    </Link>
                                                                                                </li>

                                                                                                <li className="kt-nav__separator"></li>

                                                                                            {/*                                    <li className="kt-nav__item">*/}
                                                                                            {/*                                        <Link*/}
                                                                                            {/*                                            to={chat.id ? `/treatment/chat/add_user/${chat.id}` : ""}*/}
                                                                                            {/*                                            className="kt-nav__link">*/}
                                                                                            {/*                                            <i className="kt-nav__link-icon flaticon2-group"></i>*/}
                                                                                            {/*                                            <span*/}
                                                                                            {/*                                                className="kt-nav__link-text">Ajouter un Membre</span>*/}
                                                                                            {/*                                            <span*/}
                                                                                            {/*                                                className="kt-nav__link-badge">*/}
                                                                                            {/*    <span*/}
                                                                                            {/*        className="kt-badge kt-badge--brand  kt-badge--rounded-">{listChatUsers.length}</span>*/}
                                                                                                {/*</span>*/}
                                                                                                {/*                                        </Link>*/}
                                                                                                {/*                                    </li>*/}

                                                                                                {
                                                                                                    userDataJson.staff.id === chat.created_by ?
                                                                                                        <li className="kt-nav__item">
                                                                                                            <a
                                                                                                                href="#remove_chat"
                                                                                                                className="kt-nav__link"
                                                                                                                onClick={(e) => deleteContributor(chat.id, i)}
                                                                                                            >
                                                                                                                <i className="kt-nav__link-icon flaticon-delete"></i>
                                                                                                                <span
                                                                                                                    className="kt-nav__link-text">{t("Supprimer un Tchat")}</span>
                                                                                                            </a>
                                                                                                        </li>
                                                                                                        : null
                                                                                                }


                                                                                            </ul>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </li>
                                                                ))
                                                            }

                                            </ul>
                                        </div>
                                    </div>


                                </div>
                            </div>
                                        : ""
                                }
                            </div>
                        )}

                    <div className="kt-grid__item kt-grid__item--fluid kt-app__content" id="messageList">
                        <div className="kt-chat" id="kt-chat">
                            <div className="kt-portlet kt-portlet--head-lg- ">
                                <div className="kt-portlet__head">
                                    <div className="kt-chat__head ">

                                        <div className="kt-chat__left"><span></span></div>
                                        <div className="kt-chat__center">
                                            <h5>{t("Discussions")}</h5>
                                        </div>
                                        {
                                            verifyPermission(props.userPermissions, "store-discussion") ?
                                                <div className="kt-chat__right">
                                                    <div className="dropdown dropdown-inline">
                                                        <button type="button"
                                                                className="btn btn-clean btn-sm btn-icon btn-icon-md"
                                                                data-toggle="dropdown" aria-haspopup="true"
                                                                aria-expanded="false">
                                                            <i className="flaticon2-add-1"></i>
                                                        </button>

                                                        <div
                                                            className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-md">

                                                            <ul className="kt-nav">
                                                                {/*<li className="kt-nav__head">*/}
                                                                {/*    Messagerie*/}
                                                                {/*    <Link*/}
                                                                {/*        to={idChat ? `/treatment/chat/contributor/${idChat}` : ""}>*/}
                                                                {/*        <i className="kt-nav__link-icon flaticon-eye"></i>*/}
                                                                {/*    </Link>*/}

                                                                {/*</li>*/}
                                                                {/*<li className="kt-nav__separator"></li>*/}
                                                                <li className="kt-nav__item">
                                                                    <Link to={`/treatment/chat/add/${type || ""}`}
                                                                          className="kt-nav__link">
                                                                        <i className="kt-nav__link-icon flaticon-chat-1"></i>
                                                                        <span
                                                                            className="kt-nav__link-text">{t("Créer un Tchat")}</span>
                                                                    </Link>
                                                                </li>

                                                                {/*    <li className="kt-nav__item">*/}
                                                                {/*        <Link to={"treatment/chat/remove_chat"}*/}
                                                                {/*              className="kt-nav__link">*/}
                                                                {/*            <i className="kt-nav__link-icon flaticon-delete"></i>*/}
                                                                {/*            <span*/}
                                                                {/*                className="kt-nav__link-text">Supprimer un Tchat</span>*/}
                                                                {/*        </Link>*/}
                                                                {/*    </li>*/}

                                                                {/*    <li className="kt-nav__separator"></li>*/}

                                                                {/*    <li className="kt-nav__item">*/}
                                                                {/*        <Link*/}
                                                                {/*            to={idChat ? `/treatment/chat/add_user/${idChat}` : ""}*/}
                                                                {/*            className="kt-nav__link">*/}
                                                                {/*            <i className="kt-nav__link-icon flaticon2-group"></i>*/}
                                                                {/*            <span*/}
                                                                {/*                className="kt-nav__link-text">Ajouter un Membre</span>*/}
                                                                {/*            <span className="kt-nav__link-badge">*/}
                                                                {/*    <span*/}
                                                                {/*        className="kt-badge kt-badge--brand  kt-badge--rounded-">{listChatUsers.length}</span>*/}
                                                                {/*</span>*/}
                                                                {/*        </Link>*/}
                                                                {/*    </li>*/}
                                                                {/*    <li className="kt-nav__item">*/}
                                                                {/*        <Link*/}
                                                                {/*            to={idChat ? `/treatment/chat/contributor/${idChat}` : ""}*/}
                                                                {/*            className="kt-nav__link">*/}
                                                                {/*            <i className="kt-nav__link-icon flaticon-delete"></i>*/}
                                                                {/*            <span*/}
                                                                {/*                className="kt-nav__link-text">Retirer un Membre</span>*/}
                                                                {/*        </Link>*/}
                                                                {/*    </li>*/}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                <div className="kt-chat__right"></div>
                                        }

                                    </div>
                                </div>
                                <div className="kt-portlet__body">
                                    <div className="kt-scroll kt-scroll--pull ps ps--active-y overflow-auto"
                                         id="kt-scroll" data-mobile-height="350"
                                         style={{height: '250px', overflow: 'auto'}}>
                                        <div className="message-list">

                                            {
                                                listChatUsers && listChatMessages.length ?
                                                    <MessageList
                                                        idChat={idChat}
                                                        load={load}
                                                        getList={listChatUsers}
                                                        getMessage={listChatMessages}
                                                        deletedItem={deletedItem}
                                                        responseItem={responseToMessage}/>
                                                    : ""
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="kt-portlet__foot">
                                    <div className="kt-chat__input">

                                        <input style={{display: "none"}}
                                               id="parent_id"
                                               type="text"
                                               value={data.parent_id}
                                               onChange={responseToMessage}
                                        />

                                        <div className="kt-chat__editor">
                                            {
                                                data.parent_id ?
                                                    <div className="message_target">
                                                        <i className="d-flex justify-content-end flaticon-close"
                                                           onClick={(e) => closeTag(e)}></i>
                                                        <i className="la la-tags"></i>
                                                        <br/>
                                                        <em>{messageTarget}</em>
                                                    </div> : ""
                                            }

                                            {
                                                data.files ?
                                                    data.files.map((file, i) => (
                                                        <div className="message_target" key={i}>
                                                            <i className="d-flex justify-content-end flaticon-close" onClick={(e) => closeTag(e)}/>
                                                            <img src="/assets/media/users/file-icon.png" alt=""
                                                                 style={{
                                                                     maxWidth: "55px",
                                                                     maxHeight: "55px",
                                                                 }}/>
                                                            {
                                                                file.name
                                                            }
                                                        </div>
                                                    ))
                                                    : ""
                                            }

                                            <textarea
                                                id={"monChamp"}
                                                style={{height: "35px"}}
                                                autoFocus={true}
                                                placeholder="Type here..."
                                                value={data.text}
                                                onChange={(e) => onChangeText(e)}
                                            />
                                        </div>
                                        <div className="kt-chat__toolbar">
                                            <div className="image-upload">
                                                <label htmlFor="file-input"
                                                       data-toggle="kt-tooltip"
                                                       title={t("Ajouter un fichier")}>
                                                    <i className="fas fa-paperclip"/>
                                                </label>
                                                <input id="file-input"
                                                       type="file"
                                                       onChange={onChangeFile}
                                                       multiple={true}
                                                />

                                            </div>

                                            <div className="kt_chat__actions">
                                                {
                                                    !startRequest ? (
                                                        <button type="button"
                                                                onClick={(e) => addItem(e)}
                                                                className="btn btn-brand btn-md btn-upper btn-bold kt-chat__reply ">{t("Envoyer")}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light"
                                                            type="button" disabled>
                                                            {t("Chargement")}...
                                                        </button>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>) : null
    );
};
const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(Chats);
