import React, {useEffect, useState} from "react";
import ReactModal from "react-modal";
import {Switch, Route} from "react-router-dom";
import ConfigTextField from "./ConfigTextField";
import ConfigTextarea from "./ConfigTextarea";
import ConfigSelect from "./ConfigSelect";
import ConfigCheckboxGroup from "./ConfigCheckboxGroup";
import ConfigRadioGroup from "./ConfigRadioGroup";
import ListElement from "./ListElements";
import {PANEL_ONE, PANEL_TWO} from "../constants/globalConstants";

const Modal = (props) => {
    const [informChild, setInformChild] = useState(false);

    const getElementData = (data) => {
        if (props.panel === PANEL_ONE) {
            props.panelOne(data);
        } else if (props.panel === PANEL_TWO) {
            props.panelTwo(data);
        } else {
            props.panelThree(data);
        }
        props.handleCloseModal();
        setInformChild(false);
    };

    const onClickSaveButton = () => {
        setInformChild(true);
    };

    return (
        <ReactModal
            isOpen={props.isOpen}
            onRequestClose={props.onRequestClose}
            contentLabel={props.contentLabel}
            ariaHideApp={props.ariaHideApp}
        >
            <div className="row">
                <ListElement/>

                <Switch>
                    <Route path={"/text-field"}>
                        <ConfigTextField
                            getElementData={(data) => getElementData(data)}
                            information={informChild}
                        />
                    </Route>
                    <Route path={"/textarea"}>
                        <ConfigTextarea
                            getElementData={(data) => getElementData(data)}
                            information={informChild}
                        />
                    </Route>
                    <Route path={"/select"}>
                        <ConfigSelect
                            getElementData={(data) => getElementData(data)}
                            information={informChild}
                        />
                    </Route>
                    <Route path={"/checkbox-group"}>
                        <ConfigCheckboxGroup
                            getElementData={(data) => getElementData(data)}
                            information={informChild}
                        />
                    </Route>
                    <Route path={"/radio-group"}>
                        <ConfigRadioGroup
                            getElementData={(data) => getElementData(data)}
                            information={informChild}
                        />
                    </Route>
                </Switch>
            </div>

            <div className="form-row mt-3" style={{display: "flex", justifyContent: "flex-end"}}>
                <button
                    onClick={props.handleCloseModal}
                    className={"btn btn-default ml-2 pr-5 pl-5"}
                >
                    Close
                </button>
                <button
                    onClick={() => onClickSaveButton()}
                    className={"btn btn-primary ml-2 pr-5 pl-5"}
                >
                    Save
                </button>
            </div>
        </ReactModal>
    );
};

export default Modal;
