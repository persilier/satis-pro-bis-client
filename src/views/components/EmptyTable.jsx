import React from "react";
import {useTranslation} from "react-i18next";

const EmptyTable = ({search, colSpan=100 }) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <tr>
                <td style={{textAlign:"center"}}  colSpan={colSpan} className="text-center">
                <span className="kt-datatable--error">
                    {
                        search ? t("Pas d'élément pour cette recherche" ): t("Le tableau est vide")
                    }
                </span>
                </td>
            </tr>
        ) : null
    )
};

export default EmptyTable;
