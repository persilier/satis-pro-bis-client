import React from "react";
import ClaimDetails from "./ClaimDetails";
import {loadCss, loadScript} from "../../../helpers/function";
import {useTranslation} from "react-i18next";

loadCss("/assets/css/pages/wizard/wizard-2.css");
loadScript("/assets/js/pages/custom/wizard/wizard-2.js");
loadScript("/assets/js/pages/custom/chat/chat.js");

const DetailModal = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <div className="modal modal-sticky-lg fade w-100" id="kt_modal_4_2" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content" style={{width: "1000px"}}>
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{t("Détail réclamation")}</h5>
                            <button onClick={() => props.onCloseModal()} type="button" className="close" data-dismiss="modal" aria-label="Close">
                            </button>
                        </div>
                        <div className="modal-body">
                            {
                                props.claim ? (
                                    <ClaimDetails claim={props.claim}/>
                                ) : null
                            }
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => props.onCloseModal()} type="button" className="btn btn-secondary" data-dismiss="modal">{t("Fermer")}</button>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default DetailModal;
