import React from "react";

const ModalBody = (props) => {
    return (
        <div className="modal-body">
            {props.children}
        </div>
    );
};

export default ModalBody;