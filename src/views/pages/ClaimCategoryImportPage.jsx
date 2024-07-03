import React from "react";
import {connect} from "react-redux";
import appConfig from "../../config/appConfig";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import ImportFileForm from "../components/ImportFileForm";
import {useTranslation} from "react-i18next";

const ClaimCategoryImportPage = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - "+ ready ? t("Importation catégories de reclamation") : "";
    if (!verifyPermission(props.userPermissions, 'store-claim-category'))
        window.location.href = ERROR_401;

    return (
        ready ? (
            verifyPermission(props.userPermissions, 'store-claim-category') ? (
                <ImportFileForm
                    submitEndpoint={`${appConfig.apiDomaine}/import-claim-categories`}
                    pageTitleLink="/settings/claim_categories"
                    pageTitle={t("Catégorie de réclamation")}
                    panelTitle={t("Importation catégorie reclamation au format excel")}
                />
            ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(ClaimCategoryImportPage);
