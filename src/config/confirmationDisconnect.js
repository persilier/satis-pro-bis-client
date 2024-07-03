import i18n from "../i18n";


export const confirmDeleteUser = () => {
    return (
        i18n.isInitialized ? (
            {
                title: i18n.t('Êtes-vous sûr?', 'ok'),
                text: i18n.t("Vous ne pourrez pas revenir en arrière!"),
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: i18n.t('Oui, déconnectez-le!'),
                cancelButtonText: i18n.t("Quitter")
            }
        ) : null
    )
}