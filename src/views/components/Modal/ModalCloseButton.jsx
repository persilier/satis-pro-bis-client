import React from "react";

const ModalCloseButton = ({children, disabled}) => {
    return (
        <button type="button" className="btn btn-secondary" data-dismiss="modal" disabled={disabled ? disabled : false}>
            {children}
        </button>
    );
};

export default ModalCloseButton;