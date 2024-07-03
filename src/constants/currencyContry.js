
import i18n from "../i18n";

const currencies =  () => {
    return (
        i18n.isInitialized ? (
            [
                {
                    value: 0,
                    label: i18n.t("dinar algérien"),
                    iso_code: "DZD"
                },
                {
                    value: 1,
                    label: i18n.t("livre égyptienne"),
                    iso_code: "EGP"
                },
                {
                    value: 2,
                    label: i18n.t("dinar libyen"),
                    iso_code: "LYD"
                },
                {
                    value: 3,
                    label: i18n.t("dirham marocain"),
                    iso_code: "MAD"
                },
                {
                    value: 4,
                    label: i18n.t("ouguiya"),
                    iso_code: "MRU"
                },
                {
                    value: 5,
                    label: i18n.t("livre soudanaise"),
                    iso_code: "SDG"
                },
                {
                    value: 6,
                    label: i18n.t("dinar tunisien"),
                    iso_code: "TND"
                },
                {
                    value: 7,
                    label: i18n.t("Franc CFA (UEMOA)"),
                    iso_code: "XOF"
                },
                {
                    value: 8,
                    label: i18n.t("escudo du Cap-Vert"),
                    iso_code: "CVE"
                },
                {
                    value: 9,
                    label: i18n.t("dalasi"),
                    iso_code: "GMD"
                },
                {
                    value: 10,
                    label: i18n.t("cedi"),
                    iso_code: "GHS"
                },
                {
                    value: 11,
                    label: i18n.t("franc guinéen"),
                    iso_code: "GNF"
                },
                {
                    value: 12,
                    label: i18n.t("dollar libérien"),
                    iso_code: "LRD"
                },
                {
                    value: 13,
                    label: i18n.t("naira"),
                    iso_code: "NGN"
                },
                {
                    value: 14,
                    label: i18n.t("leone"),
                    iso_code: "SLL"
                },
                {
                    value: 16,
                    label: i18n.t("franc congolais"),
                    iso_code: "CDF"
                },
                {
                    value: 17,
                    label: i18n.t("dobra"),
                    iso_code: "STD"
                },
                {
                    value: 18,
                    label: i18n.t("franc burundais"),
                    iso_code: "BIF"
                },
                {
                    value: 19,
                    label: i18n.t("franc de Djibouti"),
                    iso_code: "DJF"
                },
                {
                    value: 20,
                    label: i18n.t("nakfa"),
                    iso_code: "ERN"
                },
                {
                    value: 21,
                    label: i18n.t("birr"),
                    iso_code: "ETB"
                },
                {
                    value: 22,
                    label: i18n.t("shilling kényan"),
                    iso_code: "KES"
                },
                {
                    value: 23,
                    label: i18n.t("shilling ougandais"),
                    iso_code: "UGX"
                },
                {
                    value: 24,
                    label: i18n.t("franc rwandais"),
                    iso_code: "RWF"
                },
                {
                    value: 25,
                    label: i18n.t("roupie seychelloise"),
                    iso_code: "SCR"
                },
                {
                    value: 26,
                    label: i18n.t("shilling somalien"),
                    iso_code: "SOS"
                },
                {
                    value: 27,
                    label: i18n.t("livre sud-soudanaise"),
                    iso_code: "SSP"
                },
                {
                    value: 28,
                    label: i18n.t("shilling tanzanien"),
                    iso_code: "TZS"
                },
                {
                    value: 29,
                    label: "rand",
                    iso_code: "ZAR"
                },
                {
                    value: 30,
                    label: i18n.t("kwanza"),
                    iso_code: "AOA"
                },
                {
                    value: 31,
                    label: i18n.t("pula"),
                    iso_code: "BWP"
                },
                {
                    value: 32,
                    label: i18n.t("couronne norvégienne"),
                    iso_code: "NOK"
                },
                {
                    value: 33,
                    label: i18n.t("franc comorien"),
                    iso_code: "KMF"
                },
                {
                    value: 34,
                    label: i18n.t("loti"),
                    iso_code: "LSL"
                },
                {
                    value: 35,
                    label: i18n.t("ariary"),
                    iso_code: "MGA"
                },
                {
                    value: 36,
                    label: i18n.t("kwacha malawien"),
                    iso_code: "MWK"
                },
                {
                    value: 37,
                    label: i18n.t("roupie mauricienne"),
                    iso_code: "MUR"
                },
                {
                    value: 38,
                    label: i18n.t("metical"),
                    iso_code: "MZN"
                },
                {
                    value: 39,
                    label: i18n.t("dollar namibien"),
                    iso_code: "NAD"
                },
                {
                    value: 40,
                    label: i18n.t("livre de Sainte-Hélène"),
                    iso_code: "SHP"
                },
                {
                    value: 41,
                    label: i18n.t("lilangeni"),
                    iso_code: "SZL"
                },
                {
                    value: 42,
                    label: i18n.t("euro"),
                    iso_code: "EUR"
                },
                {
                    value: 43,
                    label: i18n.t("kwacha de Zambie"),
                    iso_code: "ZMW"
                },
                {
                    value: 44,
                    label: i18n.t("dollar du Zimbabwe"),
                    iso_code: "ZWL"
                },
                {
                    value: 45,
                    label: i18n.t("dollar américain"),
                    iso_code: "USD"
                },
            ]
        ) : null
    )
};

export default currencies;
