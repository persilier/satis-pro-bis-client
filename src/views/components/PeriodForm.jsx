import React from "react";
import InputRequire from "./InputRequire";
import {useTranslation} from "react-i18next";

const PeriodForm = ({error, data, handleBorneInfChange, handleBorneSupChange, handleInfiniteChange, infinite }) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()

    return (
        ready ? (
            <div className="row">
                <div className={error.borne_inf.length ? "form-group col validated" : "form-group col"}>
                    <label htmlFor="borne_inf">{t("Borne inférieure")} <InputRequire/></label>
                    <input
                        id="borne_inf"
                        type="number"
                        className={error.borne_inf.length ? "form-control is-invalid mt-1" : "form-control mt-1"}
                        placeholder="[2]"
                        min={0}
                        value={data.borne_inf}
                        onChange={(e) => handleBorneInfChange(e)}
                    />
                    {
                        error.borne_inf.length ? (
                            error.borne_inf.map((error, index) => (
                                <div key={index} className="invalid-feedback">
                                    {error}
                                </div>
                            ))
                        ) : null
                    }
                </div>

                <div className={error.borne_sup.length ? "form-group col validated" : "form-group col"}>
                <span className="d-flex justify-content-between">
                    <label htmlFor={"borne_sup"}>{t("Borne supérieure")} <InputRequire/></label>
                    <label className="kt-checkbox">
                        <input id={"duplicate"} type="checkbox" checked={infinite} onChange={e => handleInfiniteChange(e)}/>
                        {t("Infini")}
                        <span/>
                    </label>
                </span>
                    <input
                        id="borne_sup"
                        type="number"
                        min={0}
                        className={error.borne_sup.length ? "form-control is-invalid" : "form-control"}
                        placeholder="[4]"
                        disabled={infinite}
                        value={data.borne_sup}
                        onChange={(e) => handleBorneSupChange(e)}
                    />
                    {
                        error.borne_sup.length ? (
                            error.borne_sup.map((error, index) => (
                                <div key={index} className="invalid-feedback">
                                    {error}
                                </div>
                            ))
                        ) : null
                    }
                </div>
            </div>
        ) : null
    );
};

export default PeriodForm;
