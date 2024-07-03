import React from "react";

const ModalContainer = ({children, modalId}) => {
    return (
        <div className="modal fade" id={modalId} tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" data-backdrop="static">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModalContainer;