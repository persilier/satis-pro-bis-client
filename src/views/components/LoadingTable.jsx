import React from "react";
import {useTranslation} from "react-i18next";

const LoadingTable = () => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation()


    return (
        ready ? (
            <div className="kt-portlet__body kt-padding-b-65 kt-padding-t-65">
                <div id="kt_table_1_wrapper" className="dataTables_wrapper dt-bootstrap4">
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="blockUI" style={{display: "none"}}/>
                            <div
                                className="blockUI blockOverlay"
                                style={{
                                    zIndex: "1",
                                    border: "none",
                                    margin: "0px",
                                    padding: "0px",
                                    width: "100%",
                                    height: "100%",
                                    top: "0px",
                                    left: "0px",
                                    backgroundColor: "rgb(0, 0, 0)",
                                    opacity: "0",
                                    cursor: "wait",
                                    position: "absolute"
                                }}

                            />

                            <div className="blockUI blockMsg blockElement" style={{ zIndex: "1", position: "absolute", padding: "0px", margin: "0px", width: "169px", top: "0px", left: "417.5px", textAlign: "center", color: "rgb(0, 0, 0)", border: "0px", cursor: "wait" }}>
                                <div className="blockui ">
                                <span>
                                    {t("Chargement")}...
                                </span>

                                    <span>
                                    <div className="kt-spinner kt-spinner--loader kt-spinner--brand "/>
                                </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default LoadingTable;
