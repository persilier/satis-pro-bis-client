import React from "react";
import {connect} from "react-redux";

const HeaderMobile = (props) => {

    return (
            <div id="kt_header_mobile" className="kt-header-mobile  kt-header-mobile--fixed ">
                <div className="kt-header-mobile__logo">
                    <a href="index.html">
                        <img alt="Logo" src="/assets/images/satisLogo.png" width={"100"} height={"34"}/>
                        <span className="mx-2 text-white font-weight-bolder">{props.plan}</span>
                    </a>
                </div>
                <div className="kt-header-mobile__toolbar">
                    <button className="kt-header-mobile__toolbar-toggler kt-header-mobile__toolbar-toggler--left" id="kt_aside_mobile_toggler"><span/></button>
                    <button className="kt-header-mobile__toolbar-topbar-toggler" id="kt_header_mobile_topbar_toggler"><i className="flaticon-more-1"/></button>
                </div>
            </div>
    );
};

const mapStateToProps = (state) => {
    return {
        plan: state.plan.plan,
    };
};

export default connect(mapStateToProps)(HeaderMobile);
