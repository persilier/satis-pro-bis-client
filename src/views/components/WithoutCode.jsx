import React from "react";
import {useTranslation} from "react-i18next";

const WithoutCode = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <>
                (<strong className="text-danger">{t("sans indicatif")}</strong>)
            </>
        ) : null

    );
};

export default WithoutCode;
