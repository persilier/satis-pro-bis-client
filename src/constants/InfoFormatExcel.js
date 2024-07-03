import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";

const InfoFormatExcel = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()
    const [show, setShow] = useState("show");

    useEffect( ()=>{
        setTimeout(() => {
            setShow("");
        }, 5000);
    }, [])

    /*setTimeout(() => {
       setShow("");
    }, 5000);*/

    const showDropdown = () =>{
        if (show === ""){
            setShow("show")
        } else {
            setShow("");
        }
    }


    return (
        ready ? (
            <div className={"dropdown dropdown-inline dropup " + show}>
                <button type="button"
                        onClick={showDropdown}
                        className="btn btn-clean btn-sm btn-icon btn-icon-md"><i className="fa fa-info-circle"/>
                </button>
                <div
                    className={"dropdown-menu " + show}
                    style={{
                        fontSize: '11px',
                        lineHeight: '20px',
                        width: "300px",
                        left: "-165px",
                        padding: "0",
                        zIndex: "1"
                    }}
                >
                    <p className="mt-2 ml-3">
                    <span
                        className="kt-nav__link-text">1- {t("Cliquer d'abord sur")} <strong>{t("Télécharger Format")}</strong> {t("pour récupérer le format du fichier excel")}</span>
                        <br/>
                        <span
                            className="kt-nav__link-text">2- {t("Cliquer ensuite sur")} <strong>{t("Importer réclamation")}</strong> {t("pour importer les reclamations saisies dans le fichier excel téléchargé")} </span>
                    </p>
                </div>
            </div>
        ) : null
    );

};

export default InfoFormatExcel;