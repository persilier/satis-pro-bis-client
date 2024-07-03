import React from "react";

const ModalTitle = (props) => {
    return (
        <h5 className="modal-title" id="exampleModalLabel">{props.children}</h5>
    );
};

export default ModalTitle;