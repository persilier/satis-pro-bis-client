import React from "react";

const ModalHead = (props) => {
    return (
        <div className="modal-header">
            {props.children}
        </div>
    );
};

export default ModalHead;