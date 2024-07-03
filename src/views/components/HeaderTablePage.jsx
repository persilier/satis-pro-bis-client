import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {verifyPermission} from "../../helpers/permission";

const HeaderTablePage = (props) => {
    let permission = false;
    if (Array.isArray(props.addPermission)) {
        for (let i = 0; i < props.addPermission.length; i++) {
            if (verifyPermission(props.userPermissions, props.addPermission[i])) {
                permission = true;
                break;
            }
        }
    }
    else
        permission = verifyPermission(props.userPermissions, props.addPermission);

    return (
        <div id={props.id ? props.id : ""} className="kt-portlet__head kt-portlet__head--lg">
            <div className="kt-portlet__head-label">
                <span className="kt-portlet__head-icon">
                    <i className="kt-font-brand flaticon2-line-chart"/>
                </span>
                <h3 className="kt-portlet__head-title">
                    {
                        props.title
                    }
                </h3>
            </div>
            {
                permission ? (
                    <div className="kt-portlet__head-toolbar">
                        <div className="kt-portlet__head-wrapper">
                            &nbsp;
                            <div className="dropdown dropdown-inline">
                                <Link to={props.addLink} className="btn btn-brand btn-icon-sm">
                                    <i className="flaticon2-plus"/> {props.addText}
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : null
            }
        </div>
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions
    };
};

export default connect(mapStateToProps)(HeaderTablePage);
