import React from "react";
import {NavLink} from "react-router-dom";
import InfoFormatExcel from "../../constants/InfoFormatExcel";
import {useTranslation} from "react-i18next";

const ExportButton = ({pageUrl, downloadLink}) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <div className="col-sm-6 text-right">
                <div className="dt-buttons btn-group flex-wrap">
                    {/*<button className="btn btn-secondary buttons-print" tabIndex="0" aria-controls="kt_table_1" type="button">
                    <span>Print</s  pan>
                </button>
                <button className="btn btn-secondary buttons-copy buttons-html5" tabIndex="0" aria-controls="kt_table_1" type="button">
                    <span>Copy</span>
                </button>*/}
                    <InfoFormatExcel/>
                    <a href={downloadLink} download={true} className="btn mr-1 btn-secondary buttons-copy buttons-html5" tabIndex="0" aria-controls="kt_table_1" type="button">
                        <span>{t("Télécharger le format")}</span>
                    </a>

                    <NavLink to={pageUrl} className="btn ml-1 btn-primary buttons-excel buttons-html5" tabIndex="0" aria-controls="kt_table_1" type="button">
                        <span>{t("Importer via Excel")}</span>
                    </NavLink>
                    {/*<button className="btn btn-secondary buttons-csv buttons-html5" tabIndex="0" aria-controls="kt_table_1" type="button">
                    <span>CSV</span>
                </button>
                <button className="btn btn-secondary buttons-pdf buttons-html5" tabIndex="0" aria-controls="kt_table_1" type="button">
                    <span>PDF</span>
                </button>*/}
                </div>
            </div>
        ) : null
    );
};

export default ExportButton;
