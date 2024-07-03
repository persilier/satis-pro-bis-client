import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import appConfig from "./config/appConfig";

i18n
    .use(Backend)
    /*.use(LanguageDetector)*/ // for browser detection
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        debug: false,
        lng: localStorage.getItem('i18nextLng') !== null ? localStorage.getItem('i18nextLng') : appConfig.language,
        fallbackLng: "fr",
        interpolation: {
            escapeValue: false // react already safes from xss
        },
        react: {
            useSuspense: false,
        }
    });

export default i18n;