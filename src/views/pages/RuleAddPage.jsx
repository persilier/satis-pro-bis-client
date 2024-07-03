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
import {formatPermissions, formatSelectOption} from "../../helpers/function";
import {ToastBottomEnd} from "../components/Toast";
import {
    toastAddErrorMessageConfig,
    toastAddSuccessMessageConfig, toastEditErrorMessageConfig,
    toastEditSuccessMessageConfig, toastErrorMessageWithParameterConfig
} from "../../config/toastConfig";
import {useTranslation} from "react-i18next";


const RuleAddPage = (props) => {

    //usage of useTranslation i18n
    const {t, ready} = useTranslation();

    const {id} = useParams();
    if (id) {
        if (!(verifyPermission(props.userPermissions, 'update-any-institution-type-role') || verifyPermission(props.userPermissions, 'update-my-institution-type-role')))
            window.location.href = ERROR_401;
    } else {
        if (!(verifyPermission(props.userPermissions, 'store-any-institution-type-role') || verifyPermission(props.userPermissions, 'store-my-institution-type-role')))
            window.location.href = ERROR_401;
    }
    const defaultData = {
        name: "",
        description: "",
        institution_type: [],
    };
    const defaultError = {
        name: [],
        description: [],
        institutionTypes: [],
        permissions: []
    };
    const [institutionTypes, setInstitutionTypes] = useState([]);
    const [institutionType, setInstitutionType] = useState([]);
    const [modulesPermissions, setModulesPermissions] = useState(null);
    const [proModule, setProModule] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [data, setData] = useState(defaultData);
    const [error, setError] = useState(defaultError);
    const [startRequest, setStartRequest] = useState(false);

    useEffect(() => {
        async function fetchData () {
            var endpoint = '';
            if (id) {
                if (verifyPermission(props.userPermissions, 'update-any-institution-type-role'))
                    endpoint = `${appConfig.apiDomaine}/any/roles/${id}/edit`;
                if (verifyPermission(props.userPermissions, 'update-my-institution-type-role'))
                    endpoint = `${appConfig.apiDomaine}/my/roles/${id}/edit`;
                await axios.get(endpoint)
                    .then(response => {
                        if (verifyPermission(props.userPermissions, 'update-any-institution-type-role')) {
                            const newInstitutionTypes = [];
                            response.data.role.institution_types.map((el, index) => newInstitutionTypes.push({value: index, label: el}));

                            setInstitutionTypes(formatSelectOption(response.data.institutionTypes, 'name'));
                            setModulesPermissions(response.data.modulesPermissions);

                            const newData = {...data};
                            newData.name = response.data.role.name;
                            newData.description = response.data.role.description;
                            newData.institution_type = response.data.role.institution_types;
                            setPermissions(formatPermissions(response.data.role.permissions));
                            setData(newData);
                            setInstitutionType(newInstitutionTypes);
                        } else if (verifyPermission(props.userPermissions, 'update-my-institution-type-role')) {
                            setPermissions(formatPermissions(response.data.role.permissions));
                            const newData = {...data};
                            newData.name = response.data.role.name;
                            newData.description = response.data.role.description;
                            setData(newData);
                            setProModule(response.data.modulesPermissions.independant);
                        }
                    })
                    .catch(({response}) => {
                        if (response.data && response.data.error)
                            ToastBottomEnd.fire(toastErrorMessageWithParameterConfig(response.data.error));
                        console.log("Something is wrong");
                    })
                ;
            } else {
                if (verifyPermission(props.userPermissions, 'store-any-institution-type-role'))
                    endpoint = `${appConfig.apiDomaine}/any/roles/create`;
                if (verifyPermission(props.userPermissions, 'store-my-institution-type-role'))
                    endpoint = `${appConfig.apiDomaine}/my/roles/create`;
                await axios.get(endpoint)
                    .then(response => {
                        console.log(response.data);
                        if (verifyPermission(props.userPermissions, 'store-any-institution-type-role')) {
                            setInstitutionTypes(formatSelectOption(response.data.institutionTypes, 'name'));
                            setModulesPermissions(response.data.modulesPermissions);
                        } else if (verifyPermission(props.userPermissions, 'store-my-institution-type-role'))
                            setProModule(response.data);
                    })
                    .catch(error => {
                        console.log("Something is wrong");
                    })
                ;
            }
        }
        if (verifyTokenExpire())
            fetchData();
    }, [id, props.userPermissions]);

    const handleNameChange = (e) => {
        const newData = {...data};
        newData.name = e.target.value;
        setData(newData);
    };

    const handleDescriptionChange = (e) => {
        const newData = {...data};
        newData.description = e.target.value;
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

/*    const printModule = (module, index, allModule) => {
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
                                        <input className={"checkInput"} type="checkbox" name={el.name} onClick={handlePermissionChange} defaultChecked={permissions.includes(el.name)}/> {el.name}<span/>
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
    };*/


    const printModule = (module, index, allModule) => {
        return (
            <div key={index} className={error.permissions.length ? "validated" : ""}>
                {
                    error.permissions.length ? (
                        index === allModule.length - 1 ? (
                            error.permissions.map((error, indEr) => (
                                <div key={indEr} className="invalid-feedback text-center mt-3 mb-3">
                                    {error}
                                </div>
                            ))
                        ) : null
                    ) : null
                }
                <div key={index} className="card mb-3">
                    <div className="card-header" id={"headingOne" + index}>
                        <div className="card-title collapsed" data-toggle="collapse" data-target={"#collapseOne" + index} aria-expanded="false" aria-controls={"collapseOne" + index}>
                            <i className="flaticon2-layers-1" /> Module: {module.name["fr"]}
                        </div>
                    </div>
                    <div id={"collapseOne" + index} className="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
                        <div className="card-body">
                            <label className="" htmlFor="unit_type">{t("Permissions")} <InputRequire/></label>
                            <div className={error.permissions.length ? "form-group row validated" : "form-group row"}>
                                <div className="col-lg-12 col-xl-6">
                                    <div className="kt-checkbox-inline">
                                        {
                                            module.permissions.map((el, ind) => (
                                                <React.Fragment key={ind}>
                                                    {/*<span className="btn" style={{width: "30%"}}>*/}
                                                    <label className="kt-checkbox"  style={{width: "30%"}}>
                                                        <input className={"checkInput"} type="checkbox" name={el.name} onClick={handlePermissionChange} defaultChecked={permissions.includes(el.name)}/> {el.description}<span/>
                                                    </label>
                                                    {/*</span>*/}
                                                    {
                                                        ((ind+1) % 3 === 0 && <br/>)
                                                    }
                                                </React.Fragment>
                                            ))
                                        }
{/*                                        {
                                            error.permissions.length ? (
                                                index === allModule.length - 1 ? (
                                                    error.permissions.map((error, indEr) => (
                                                        <div key={indEr} className="invalid-feedback text-center">
                                                            {error}
                                                        </div>
                                                    ))
                                                ) : null
                                            ) : null
                                        }*/}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    const resetAllCheckbox = () => {
        const checkbox = document.getElementsByClassName("checkInput");
        for (var i = 0; i < checkbox.length; i++)
            checkbox[i].checked = false;
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
                                                <label className="col-xl-2 col-lg-2 col-form-label" htmlFor="name">{t("Nom")} <InputRequire/></label>
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

                                            <div className={error.description.length ? "form-group row validated" : "form-group row"}>
                                                <label className="col-xl-2 col-lg-2 col-form-label" htmlFor="name">{t("Description")} <InputRequire/></label>
                                                <div className="col-lg-9 col-xl-6">
                                                    <input
                                                        id="description"
                                                        type="text"
                                                        className={error.description.length ? "form-control is-invalid" : "form-control"}
                                                        placeholder={t("Veuillez entrer la description du type d'unité")}
                                                        value={data.description}
                                                        onChange={(e) => handleDescriptionChange(e)}
                                                    />
                                                    {
                                                        error.description.length ? (
                                                            error.description.map((error, index) => (
                                                                <div key={index} className="invalid-feedback">
                                                                    {error}
                                                                </div>
                                                            ))
                                                        ) : null
                                                    }
                                                </div>
                                            </div>

                                            {
                                                verifyPermission(props.userPermissions, 'store-any-institution-type-role') || verifyPermission(props.userPermissions, 'update-any-institution-type-role') ? (
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
                                                ) : null
                                            }

                                            {
                                                verifyPermission(props.userPermissions, 'store-any-institution-type-role') || verifyPermission(props.userPermissions, 'update-any-institution-type-role') ? (
                                                    institutionType.length ? (
                                                        <div className="accordion  accordion-toggle-arrow" id="accordionExample4">
                                                            {
                                                                data.institution_type.length ? (
                                                                    data.institution_type.length === 2 ? (
                                                                        modulesPermissions.all.map((el, index) => (
                                                                            printModule(el, index, modulesPermissions.all)
                                                                        ))
                                                                    ) : (
                                                                        modulesPermissions[data.institution_type[0]].map((el, index) => (
                                                                            printModule(el, index, modulesPermissions[data.institution_type[0]])
                                                                        ))
                                                                    )
                                                                ) : null
                                                            }
                                                        </div>
                                                    ) : null
                                                ) : (
                                                    verifyPermission(props.userPermissions, 'store-my-institution-type-role') || verifyPermission(props.userPermissions, 'update-my-institution-type-role') ? (
                                                        <div className={error.permissions.length ? "accordion  accordion-toggle-arrow validated" : "accordion  accordion-toggle-arrow"} id="accordionExample">
                                                            {
                                                                proModule ? (
                                                                    proModule.map((el, index) => (
                                                                        printModule(el, index, proModule)
                                                                    ))
                                                                ) : null
                                                            }
                                                        </div>

                                                    ) : null
                                                )
                                            }
                                        </div>

                                        <div className="kt-portlet__foot">
                                            <div className="kt-form__actions text-right">
                                                {
                                                    !startRequest ? (
                                                        <button type="submit" onClick={(e) => onSubmit(e)} className="btn btn-primary">
                                                            {
                                                                id ? t("Modifier") : t("Enregistrer")
                                                            }
                                                        </button>
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
            description: data.description,
            permissions: permissions,
            institutionTypes: data.institution_type
        };
        if (verifyPermission(props.userPermissions, 'store-my-institution-type-role') || verifyPermission(props.userPermissions, 'update-my-institution-type-role'))
            delete sendData.institutionTypes;
        if (verifyTokenExpire()) {
            if (id) {
                var endpoint = "";
                if (verifyPermission(props.userPermissions, 'update-any-institution-type-role'))
                    endpoint = `${appConfig.apiDomaine}/any/roles/${id}`;
                if (verifyPermission(props.userPermissions, 'update-my-institution-type-role'))
                    endpoint = `${appConfig.apiDomaine}/my/roles/${id}`;

                axios.put(endpoint, sendData)
                    .then(() => {
                        setStartRequest(false);
                        setError(defaultError);
                        ToastBottomEnd.fire(toastEditSuccessMessageConfig());
                    })
                    .catch(({response}) => {
                        setError({...defaultError, ...response.data.error});
                        setStartRequest(false);
                        ToastBottomEnd.fire(toastEditErrorMessageConfig());
                    })
                ;
            } else {
                var endpoint = "";
                if (verifyPermission(props.userPermissions, 'store-any-institution-type-role'))
                    endpoint = `${appConfig.apiDomaine}/any/roles`;
                if (verifyPermission(props.userPermissions, 'store-my-institution-type-role'))
                    endpoint = `${appConfig.apiDomaine}/my/roles`;
                axios.post(endpoint, sendData)
                    .then(() => {
                        if (verifyPermission(props.userPermissions, 'store-any-institution-type-role'))
                            setInstitutionType([]);
                        if (verifyPermission(props.userPermissions, 'store-my-institution-type-role'))
                            resetAllCheckbox();
                        setPermissions([]);
                        setStartRequest(false);
                        setError(defaultError);
                        setData(defaultData);
                        ToastBottomEnd.fire(toastAddSuccessMessageConfig());
                    })
                    .catch(({response}) => {
                        setError({...defaultError, ...response.data.error});
                        setStartRequest(false);
                        ToastBottomEnd.fire(toastAddErrorMessageConfig());
                    })
                ;
            }
        }
    };

    return (
        ready ? (
            id ?
                verifyPermission(props.userPermissions, 'update-any-institution-type-role') || verifyPermission(props.userPermissions, 'update-my-institution-type-role') ? (
                    printJsx()
                ) : null
                : verifyPermission(props.userPermissions, 'store-any-institution-type-role') || verifyPermission(props.userPermissions, 'store-my-institution-type-role') ? (
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
