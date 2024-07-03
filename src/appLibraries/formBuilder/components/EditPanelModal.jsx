import React, {useState} from "react";
import ReactModal from "react-modal";
import {PANEL_ONE, PANEL_TWO} from "../constants/globalConstants";

const EditPanelModal = (props) => {
    const [title, setTitle] = useState('');

    const onChangeTitle = (e) => {
        setTitle(e.target.value);
    };

    const onClickSave = () => {
        if (props.panel === PANEL_ONE) {
            props.panelOne(title);
        } else if (props.panel === PANEL_TWO){
            props.panelTwo(title);
        } else {
            props.panelThree(title);
        }
        setTitle('');
        props.handleCloseModal();
    };

    return (
        <ReactModal
            isOpen={props.isOpen}
            onRequestClose={props.onRequestClose}
            contentLabel={props.contentLabel}
            ariaHideApp={props.ariaHideApp}
        >
            <div className="form-row">
                <div className="col">
                    <label htmlFor="">Title of Panel</label>
                    <input type="text" value={title} onChange={onChangeTitle} className="form-control"/>
                </div>
            </div>

            <div className="form-row mt-3" style={{display: "flex", justifyContent: "flex-end"}}>
                <button
                    onClick={props.handleCloseModal}
                    className={"btn btn-default ml-2 pr-5 pl-5"}
                >
                    Close
                </button>
                <button
                    onClick={onClickSave}
                    className={"btn btn-primary ml-2 pr-5 pl-5"}
                >
                    Save
                </button>
            </div>
        </ReactModal>
    );
};

export default EditPanelModal;
