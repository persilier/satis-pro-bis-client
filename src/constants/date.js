import i18n from "../i18n";


export const month = () => {
    return (
        i18n.isInitialized ? (
            {
                "01": i18n.t("Jan"),
                "02": i18n.t("Fév"),
                "03": i18n.t("Mar"),
                "04": i18n.t("Avr"),
                "05": i18n.t("Mai"),
                "06": i18n.t("Jun"),
                "07": i18n.t("Jul"),
                "08": i18n.t("Aoû"),
                "09": i18n.t("Sep"),
                "10": i18n.t("Oct"),
                "11": i18n.t("Nov"),
                "12": i18n.t("Déc"),
            }
        ) : null
    )
};
