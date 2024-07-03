import React from "react";

const ModalButton = ({idModal = "", children, color = "primary"}) => {
    return (
        <button type="button" className={`btn btn-${color} btn-icon-sm`} data-toggle="modal" data-target={"#"+idModal}>
            {children}
        </button>
    );
};

export default ModalButton;