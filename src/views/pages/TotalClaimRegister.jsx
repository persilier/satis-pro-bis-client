import React from 'react';
import {connect} from "react-redux";
import ModelNumberToClaimList from "../components/ModelNumberToClaimList";
import {verifyPermission} from "../../helpers/permission"
import appConfig from "../../config/appConfig";
import {useTranslation} from "react-i18next";

const endPointConfig = {
    PRO: {
        plan: "PRO",
        list: `${appConfig.apiDomaine}/my/claim-satisfaction-measured`,
    },
    MACRO: {
        holding: {
            list: `${appConfig.apiDomaine}/my/claim-satisfaction-measured`,
        },
        filial: {
            list: `${appConfig.apiDomaine}/my/claim-satisfaction-measured`,
        }
    },
    HUB: {
        plan: "HUB",
        list: `${appConfig.apiDomaine}/any/claim-satisfaction-measured`,
    }
};

const TotalClaimRegister = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    document.title = (ready ? t("Satis client - Les réclamations enregistrées") : "");
    let endPoint = "";

    if (props.plan === "MACRO") {
        if (verifyPermission(props.userPermissions, 'list-satisfaction-measured-my-claim'))
            endPoint = endPointConfig[props.plan].holding;
        else if (verifyPermission(props.userPermissions, 'list-satisfaction-measured-my-claim'))
            endPoint = endPointConfig[props.plan].filial
    } else
        endPoint = endPointConfig[props.plan];
    return (
        ready ? (
            <ModelNumberToClaimList
                navigationTitle={t("Les réclamations enregistrées")}
                description={t('La liste des réclamations enreigstrées')}
                title={t('Les réclamations enregistrées')}
                endpoint={endPoint}
                userPermissions={props.userPermissions}
                plan={props.plan}
            />
        ) : null
    );
};

const mapStateToProps = (state) => {
    return {
        userPermissions: state.user.user.permissions,
        plan: state.plan.plan,
    };
};

export default connect(mapStateToProps)(TotalClaimRegister);
