import React, {useState, useEffect} from "react";
import axios from "axios";
import {connect} from "react-redux";
import {
    useParams,
    Link
} from "react-router-dom";
import Select from "react-select";
import appConfig from "../../config/appConfig";
import {ERROR_401} from "../../config/errorPage";
import {verifyPermission} from "../../helpers/permission";
import InputRequire from "../components/InputRequire";
import {verifyTokenExpire} from "../../middleware/verifyToken";
import {formatSelectOption} from "../../helpers/function";
import {ToastBottomEnd} from "../components/Toast";
import {toastAddErrorMessageConfig, toastAddSuccessMessageConfig} from "../../config/toastConfig";
import {useTranslation} from "react-i18next";


const RuleAddPage = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const {id} = useParams();
    if (id) {
        if (!verifyPermission(props.userPermissions, 'store-any-institution-type-role'))
            window.location.href = ERROR_401;
    } else {
        if (!verifyPermission(props.userPermissions, 'update-any-institution-type-role'))
            window.location.href = ERROR_401;
    }
    const defaultData = {
        name: "",
        institution_type: [],
    };
    const defaultError = {
        name: [],
        institutionTypes: [],
        permissions: []
    };
    const [institutionTypes, setInstitutionTypes] = useState([]);
    const [institutionType, setInstitutionType] = useState([]);
    const [modulesPermissions, setModulesPermissions] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        async function fetchData () {
            if (id) {
                await axios.get(`${appConfig.apiDomaine}/any/roles/${id}/edit`)
                    .then(response => {
                        console.log("response:", response.data);
                    })
                    .catch(error => {
                        console.log("Something is wrong");
                    })
                ;
            } else {
                await axios.get(`${appConfig.apiDomaine}/any/roles/create`)
                    .then(response => {
                        setInstitutionTypes(formatSelectOption(response.data.institutionTypes, 'name'));
                        setModulesPermissions(response.data.modulesPermissions);
                    })
                    .catch(error => {
                        console.log("Something is wrong");
                    })
                ;
            }
        }
        if (verifyTokenExpire())
            fetchData();
    }, [id]);

    const handleNameChange = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };

    const handleInstitutionType = (selected) => {
        const values = [];
        const newData = {...data};
        if (selected)
            selected.map(el => values.push(el.label));
        newData.institution_type = values;
        setPermissions([]);
        setData(newData);

        setInstitutionType(selected);
        setInstitutionType(selected ? selected : []);
    };

    const handlePermissionChange = (e) => {
        var newPermission = [...permissions];
        if (newPermission.includes(e.target.name))
            newPermission.splice(newPermission.indexOf(e.target.name), 1);
        else
            newPermission.push(e.target.name);
        setPermissions(newPermission);
    };

    const printModule = (module, index, allModule) => {
        return (
            <div key={index}>
                <h5 className="text-center">Module: {module.name["fr"]}</h5>
                <div className={error.permissions.length ? "form-group row validated" : "form-group row"}>
                    <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="unit_type">{t("Permissions")} <InputRequire/></label>
                    <div className="col-lg-9 col-xl-6">
                        <div className="kt-checkbox-inline">
                            {
                                module.permissions.map((el, ind) => (
                                    <label className="kt-checkbox" key={ind}>
                                        <input type="checkbox" name={el.name} onClick={handlePermissionChange}/> {el.name}<span/>
                                    </label>
                                ))
                            }
                            {
                                error.permissions.length ? (
                                    index === allModule.length - 1 ? (
                                        error.permissions.map((error, indEr) => (
                                            <div key={indEr} className="invalid-feedback text-center">
                                                {error}
                                            </div>
                                        ))
                                    ) : null
                                ) : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    const printJsx = () => {
        return (
            <div className="kt-content  kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor" id="kt_content">
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-container  kt-container--fluid ">
                        <div className="kt-subheader__main">
                            <h3 className="kt-subheader__title">
                                {t("Paramètres")}
                            </h3>
                            <span className="kt-subheader__separator kt-hidden"/>
                            <div className="kt-subheader__breadcrumbs">
                                <a href="#icone" className="kt-subheader__breadcrumbs-home"><i className="flaticon2-shelter"/></a>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <Link to="/settings/rules" className="kt-subheader__breadcrumbs-link">
                                    {t("Rôles")}
                                </Link>
                                <span className="kt-subheader__breadcrumbs-separator"/>
                                <a href="#button" onClick={e => e.preventDefault()} className="kt-subheader__breadcrumbs-link" style={{cursor: "text"}}>
                                    {
                                        id ? t("Modification") : t("Ajout")
                                    }
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
                    <div className="row">
                        <div className="col">
                            <div className="kt-portlet">
                                <div className="kt-portlet__head">
                                    <div className="kt-portlet__head-label">
                                        <h3 className="kt-portlet__head-title">
                                            {
                                                id ? t("Modification de rôle") : t("Ajout de rôle")
                                            }
                                        </h3>
                                    </div>
                                </div>

                                <form method="POST" className="kt-form">
                                    <div className="kt-form kt-form--label-right">
                                        <div className="kt-portlet__body">
                                            <div className={error.name.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="name">{t("Nom")} <InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        className={error.name.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer le nom du type d'unité")}
                                                        value={data.name}
                                                        onChange={(e) => handleNameChange(e)}
                                                    />
                                                    {
                                                        error.name.length ? (
                                                            error.name.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>
                                            </div>

                                            <div className={error.institutionTypes.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-3 col-lg-3 col-form-label" htmlFor="unit_type">{t("Type d'institution")} <InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <Select
                                                        isClearable
                                                        isMulti
                                                        value={institutionType}
                                                        placeholder={"filial"}
                                                        onChange={handleInstitutionType}
                                                        options={institutionTypes}
                                                    />
                                                    {
                                                        error.institutionTypes.length ? (
                                                            error.institutionTypes.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>
                                            </div>

                                            {
                                                institutionType.length ? (
                                                    <>
                                                        {
                                                            data.institution_type.length === 2 ? (
                                                                modulesPermissions.all.map((el, index) => (
                                                                    printModule(el, index, modulesPermissions.all)
                                                                ))
                                                            ) : (
                                                                modulesPermissions[data.institution_type[0]].map((el, index) => (
                                                                    printModule(el, index, modulesPermissions[data.institution_type[0]])
                                                                ))
                                                            )
                                                        }
                                                    </>
                                                ) : null
                                            }
                                        </div>

                                        <div className="kt-portlet__foot">
                                            <div className="kt-form__actions text-right">
                                                {
                                                    !startRequest ? (
                                                        <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">{t("Envoyer")}</button>
                                                    ) : (
                                                        <button className="btn btn-primary kt-spinner kt-spinner--left kt-spinner--md kt-spinner--light" type="button" disabled>
                                                            {t("Chargement")}...
                                                        </button>
                                                    )
                                                }
                                                {
                                                    !startRequest ? (
                                                        <Link to="/settings/rules" className="btn btn-secondary mx-2">
                                                            {t("Quitter")}
                                                        </Link>
                                                    ) : (
                                                        <Link to="/settings/rules" className="btn btn-secondary mx-2" disabled>
                                                            {t("Quitter")}
                                                        </Link>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setStartRequest(true);
        const sendData = {
            name: data.name,
            permissions: permissions,
            institutionTypes: data.institution_type
        };
        if (id) {

        } else {
            axios.post(`${appConfig.apiDomaine}/any/roles`, sendData)
                .then(() => {
                    setInstitutionType([]);
                    setPermissions([]);
                    setStartRequest(false);
                    setError(defaultError);
                    setData(defaultData);
                    ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                })
                .catch(({response}) => {
                    console.log("errors:", {...defaultError, ...response.data.error});
                    setError({...defaultError, ...response.data.error});
                    setStartRequest(false);
                    ToastBottomEnd.fire(toastAddErrorMessageConfig());
                });
        }
    };

    return (
        ready ? (
            id ?
                verifyPermission(props.userPermissions, 'update-unit-type') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'store-unit-type') ? (
                    printJsx()
                ) : null
        ) : null
    );
};

const mapStateToProps = state => {
    return {
        userPermissions: state.user.user.permissions,
    };
};

export default connect(mapStateToProps)(RuleAddPage);
