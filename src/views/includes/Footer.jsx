import React from "react";

const Footer = () => {
    return (
        <div className="kt-footer kt-grid__item" id="kt_footer">
            <div className="kt-container  kt-container--fluid ">
                <div className="kt-footer__wrapper">
                    <div className="kt-footer__copyright">
                        &nbsp;&copy;&nbsp;<a href="http://www.dmdconsult.com/" target="_blank" className="kt-link">Satis FinTech SA {new Date().getFullYear()}</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
