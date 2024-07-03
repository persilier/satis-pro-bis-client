import React from "react";

const Loader = () => {
    return (
        <div className={{position: 'relative'}}>
            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}} className="kt-spinner kt-spinner--v2 kt-spinner--lg kt-spinner--dark mx-auto"/>
        </div>
    );
};

export default Loader;
