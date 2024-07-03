import React from 'react';
import moment from 'moment';
import './Message.css';
import appConfig from "../../../config/appConfig";
import {useTranslation} from "react-i18next";


export default function Message(props) {

    const {
        data,
        isMine,
        startsSequence,
        endsSequence,
        showTimestamp,
    } = props;

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const friendlyTimestamp = moment(data.created_at).format('LL');
    const chatTimestamp = moment(data.created_at).format('LT');

    const deletedProps = (key) => {
        props.deleted(key)
    };

    const responseItemProps = (key, text) => {
        props.responseItem(key, text);

    };

    const ouvrirFermerSpoiler = (id) => {
        if (document.getElementById(id).style.display === "none")
            document.getElementById(id).style.display = "block";
        else
            document.getElementById(id).style.display = "none";
    };

    return (
        ready ? (
            <div className={[
                'message',
                `${isMine ? 'mine' : ''}`,
                `${startsSequence ? 'start' : ''}`,
                `${endsSequence ? 'end' : ''}`
            ].join(' ')}>

                {
                    showTimestamp &&
                    <div className="timestamp">
                        {friendlyTimestamp}
                    </div>
                }
                <div className="author">

                    {
                        !isMine && startsSequence && data.posted_by.identite_id ?
                            <div>
                        <span
                            className="kt-media kt-media--circle kt-media--sm"><img
                            src="/assets/media/users/default.jpg"
                            alt="image"/>
                        </span>
                                {data.posted_by.identite.lastname + " " + data.posted_by.identite.firstname}
                            </div> : ""
                    }

                </div>
                <div className="bubble-container" onMouseEnter={() => ouvrirFermerSpoiler(data.id)}>

                    {
                        data.files.length ?
                            data.files.map((file, index) => (
                                <div className="bubble-media" key={index}>
                                    <div>
                                        <img src={appConfig.apiDomaine + file.url} alt=""
                                             style={{
                                                 maxWidth: "115px",
                                                 maxHeight: "115px",
                                                 textAlign: 'center'
                                             }}
                                        />
                                    </div>

                                    {index === file.length - 1 ? file.title : file.title + " "}
                                    <br/>
                                    <a href={appConfig.apiDomaine + '/download/' + file.id}
                                       download={file.title}><strong>{t("Télécharger")}</strong></a>
                                    <hr/>
                                    <div className="">
                                        {data.text}
                                        <div className="time">
                                            {chatTimestamp}
                                        </div>
                                    </div>
                                </div>
                            )) :
                            <div className="bubble">

                                {
                                    data.parent_id && data.parent ?
                                        <div>
                                            <div><i className="la la-tags"></i></div>
                                            <em> {data.parent.text} </em>
                                            <div style={{fontSize: '12px'}}>
                                                {"By:" + " " + data.parent.posted_by.identite.lastname + ' ' + data.parent.posted_by.identite.firstname}
                                            </div>
                                            <hr/>
                                            {data.text}
                                        </div> :
                                        data.text
                                }

                                <div className="time">
                                    {chatTimestamp}
                                </div>
                            </div>
                    }
                    <div className="dropdown dropdown-inline"
                         style={{cursor: "pointer"}}>
                        <div
                            id={data.id}
                            style={{display: "none"}}
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                            <i className="flaticon-more-v5"></i>
                        </div>

                        <div
                            className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-md w-auto">

                            <ul className="kt-nav">
                                <li className="kt-nav__head">
                               <span
                                   className="kt-nav__link-text">{t("Citer")}
                               </span>
                                    <a href={"#"} onClick={() => responseItemProps(data.id, data.text)}>
                                        <i className="kt-nav__link-icon flaticon-reply"></i>
                                    </a>
                                </li>

                                <li className="kt-nav__head">
                               <span
                                   className="kt-nav__link-text">{t("Supprimer")}
                               </span>
                                    <a href={"#"} onClick={(e) => deletedProps(data.id)}>
                                        <i className="kt-nav__link-icon flaticon2-trash"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
}
