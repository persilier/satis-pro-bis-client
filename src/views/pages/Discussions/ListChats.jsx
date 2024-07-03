import React from 'react';
import axios from 'axios'

import moment from "moment";
import {Link} from "react-router-dom";


const ListChats = (props) => {
    const listChat=props.getList!==null?props.getList:"";

    return (
        <div>
            <div className="kt-portlet kt-portlet--last">

                <div className="kt-portlet__body">
                    <div className="kt-searchbar">
                        <div className="input-group">
                            <div className="input-group-prepend">
                                            <span className="input-group-text"
                                                  id="basic-addon1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                xmlnsXlink="http://www.w3.org/1999/xlink" width="24px" height="24px"
                                                viewBox="0 0 24 24" version="1.1" className="kt-svg-icon">
																		<g stroke="none" strokeWidth="1" fill="none"
                                                                           fillRule="evenodd">
																			<rect x="0" y="0" width="24"
                                                                                  height="24"></rect>
																			<path
                                                                                d="M14.2928932,16.7071068 C13.9023689,16.3165825 13.9023689,15.6834175 14.2928932,15.2928932 C14.6834175,14.9023689 15.3165825,14.9023689 15.7071068,15.2928932 L19.7071068,19.2928932 C20.0976311,19.6834175 20.0976311,20.3165825 19.7071068,20.7071068 C19.3165825,21.0976311 18.6834175,21.0976311 18.2928932,20.7071068 L14.2928932,16.7071068 Z"
                                                                                fill="#000000" fillRule="nonzero"
                                                                                opacity="0.3"></path>
																			<path
                                                                                d="M11,16 C13.7614237,16 16,13.7614237 16,11 C16,8.23857625 13.7614237,6 11,6 C8.23857625,6 6,8.23857625 6,11 C6,13.7614237 8.23857625,16 11,16 Z M11,18 C7.13400675,18 4,14.8659932 4,11 C4,7.13400675 7.13400675,4 11,4 C14.8659932,4 18,7.13400675 18,11 C18,14.8659932 14.8659932,18 11,18 Z"
                                                                                fill="#000000"
                                                                                fillRule="nonzero"></path>
																		</g>
																	</svg>
                                            </span>
                            </div>
                            <input type="text" className="form-control" placeholder="Search"
                                   aria-describedby="basic-addon1"/>
                        </div>
                    </div>

                    <div className="kt-widget kt-widget--users kt-mt-20">
                        <div className="kt-scroll kt-scroll--pull ps ps--active-y"
                             data-mobile-height="300" style={{height: '157px', overflow: 'hidden'}}>
                            <div className="kt-widget__items">
                                {
                                    listChat ?
                                        listChat.map((chat, i) => (

                                                <div className="kt-widget__item" key={i}>
																	<span className="kt-media kt-media--circle">
																		<img src="/assets/media/users/default.jpg"
                                                                             alt="image"/>
																	</span>
                                                    <div className="kt-widget__info">
                                                        <div className="kt-widget__section">
                                                            <Link to={`treatment/chat/${chat.id}`}
                                                               className="kt-widget__username">{chat.name}
                                                            </Link>
                                                            <span
                                                                className="kt-badge kt-badge--success kt-badge--dot"></span>
                                                        </div>

                                                        <span className="kt-widget__desc">
																			{chat.claim.reference}
																		</span>
                                                    </div>
                                                    <div className="kt-widget__action">
                                                                <span
                                                                    className="kt-widget__date">{moment(chat.created_at).format('ll')}</span>
                                                        <span
                                                            className="kt-badge kt-badge--success kt-font-bold">{listChat.length}</span>
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
    );

}

export default ListChats;