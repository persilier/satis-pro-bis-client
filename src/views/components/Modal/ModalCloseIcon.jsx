import React from "react";

const ModalCloseIcon = ({disabled = false}) => {
    return (
        <button type="button" className="close" data-dismiss="modal" aria-label="Close" disabled={disabled}/>
    );
};

export default ModalCloseIcon;