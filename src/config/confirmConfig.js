import i18n from "../i18n";

export const passwordExpireConfig = (message)=>  {
    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Attention!'),
                text: message,
                icon: 'warring',
                confirmButtonColor: '#3085d6',
                confirmButtonText: i18n.t('Réinitialiser'),
            }
        ) : null
    )
};

export const ExpireConfig = (message)=>  {
    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Information!'),
                text: message,
                icon: 'warring',
                allowOutsideClick: false,
            }
        ) : null
    )
};


export const confirmDeleteConfig = () => {
    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Êtes-vous sûr?'),
                text: i18n.t("Vous ne pourrez pas revenir en arrière!"),
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18n.t('Oui, Supprimer!'),
                cancelButtonText: i18n.t("Quitter")
            }
        ) : null
    )
};

export const confirmDeleteUser = () => {
    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Êtes-vous sûr?'),
                text: i18n.t("Vous ne pourrez pas revenir en arrière!"),
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18n.t('Oui, Déconnecter!'),
                cancelButtonText: i18n.t("Quitter")
            }
        ) : null
    )
};

export const confirmRevokeConfig = () => {
    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Êtes-vous sûr?'),
                text: i18n.t("Vous ne pourrez pas revenir en arrière!"),
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18n.t('Oui, Revoquer!'),
                cancelButtonText: i18n.t("Quitter")
            }
        ) : null
    )
};

export const confirmActivation =  (label) => {
    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Êtes-vous sûr?'),
                text: `${i18n.t("Le compte sera")} ${label}`,
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: `${i18n.t("Oui")}, ${label}!`,
                cancelButtonText: i18n.t("Quitter")
            }
        ) : null
    )
};
export const confirmActivationChannel =  ( is_response) => {
    return {
        title: i18n.t('Êtes-vous sûr?'),
        text: is_response ? i18n.t(`Le canal ne sera plus un canal de réponse`) : i18n.t(`Le canal sera de nouveau un canal de réponse`),
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: is_response ? i18n.t(`Oui, désactiver!`):i18n.t(`Oui, activer!`),
        cancelButtonText: i18n.t("Quitter")
    };
};

export const confirmLeadConfig = (lead) =>  {

    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Confirmation'),
                text: lead ? `${i18n.t("Cette unité à déjà un responsable")}: ${lead}. ${i18n.t("Êtes-vous sûr de vouloire continuer?")}` : i18n.t("Êtes-vous sûr de vouloire continuer?"),
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18n.t('Oui, Confirmer!'),
                cancelButtonText: i18n.t("Quitter")
            }
        ) : null
    )
};

export const confirmAssignConfig =  () => {

    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Attention!'),
                text: i18n.t("Cette plainte vous sera affectée!"),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18n.t('Oui, confirmer!'),
                cancelButtonText: i18n.t("Quitter")
            }
        ) : null
    )
};

export const confirmTranfertConfig =  () => {

    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Confirmation!'),
                text: i18n.t("Voulez-vous tranférer Cette Réclamation?"),
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18n.t('Oui, confirmer!'),
                cancelButtonText: i18n.t("Quitter")
            }
        ) : null
    )
};

export const toastDeleteErrorMessageConfig = () => {

    return (
        i18n.isInitialized ? (
            {
                background: "#3c3e40",
                icon: 'error',
                title: `<strong style='font-weight: bold; font-size: 1.1rem; color: white' class='m-4'>${i18n.t("Echec de la suppression")}</strong>`
            }
        ) : null
    )

};

export const chosePlan = (plan) => {

    return (
        i18n.isInitialized ? (
            {
                title: `${i18n.t("Êtes-vous sûr de vouloir choisir")} ${plan} ${i18n.t("comme plan")}?`,
                text: i18n.t("Vous ne pouvez pas revenir en arrière!"),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18n.t('Oui, Choisir!'),
                cancelButtonText: i18n.t("Quitter")
            }
        ) : null
    )

};
