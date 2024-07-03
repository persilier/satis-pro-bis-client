import React from "react";
import {connect} from "react-redux";
import appConfig from "../../config/appConfig";
import {verifyPermission} from "../../helpers/permission";
import {ERROR_401} from "../../config/errorPage";
import ImportFileForm from "../components/ImportFileForm";
import {useTranslation} from "react-i18next";

const ClaimObjectImportPage = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = "Satis client - " + ready ? t("Importation objet de réclamation") : "";
    if (!verifyPermission(props.userPermissions, 'store-claim-object'))
        window.location.href = ERROR_401;

    return (
        ready ? (
            verifyPermission(props.userPermissions, 'store-claim-object') ? (
                <ImportFileForm
                    submitEndpoint={`${appConfig.apiDomaine}/import-claim-objects`}
                    pageTitleLink="/settings/claim_objects"
                    pageTitle={t("Objet de réclamation")}
                    panelTitle={t("Importation d'objet et catégorie de réclamation au format excel")}
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

export default connect(mapStateToProps)(ClaimObjectImportPage);
