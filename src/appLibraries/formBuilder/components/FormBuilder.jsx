import React, {useState} from "react";
import {
    BrowserRouter as Router,
} from "react-router-dom";
import LayoutChoice from "./LayoutChoice";
import LayoutOne from "./LayoutOne";
import LayoutTwo from "./LayoutTwo";
import LayoutThree from "./LayoutThree";
import LayoutFour from "./LayoutFour";
import {loadCss, loadScript} from "../../../helpers/function";

/*loadCss("assets/plugins/global/plugins.bundle.css");
loadCss("assets/css/style.bundle.css");
loadScript("assets/plugins/global/plugins.bundle.js");
loadScript("assets/js/scripts.bundle.js");*/

const FormBuilder = (props) => {
    let choice = undefined;
    let layoutSelected = false;

    if (props.editForm) {
        if (props.editForm.content.layout === 'layout-1' || props.editForm.content.layout === 'layout-2' || props.editForm.content.layout === 'layout-3' || props.editForm.content.layout === 'layout-4') {
            choice = props.editForm.content.layout;
            layoutSelected = false;
        }
    } else {
        if (props.layout) {
            if (props.layout === 'layout-1' || props.layout === 'layout-2' || props.layout === 'layout-3' || props.layout === 'layout-4') {
                choice = props.layout;
                layoutSelected = true;
            }
        }
    }

    const [layoutChoice, setLayoutChoice] = useState(choice);

    const onChooseLayout = (layout) => {
        setLayoutChoice(layout);
    };

    const returnLayoutChoice = () => {
        setLayoutChoice(undefined);
    };

    const printLayout = () => {
        if (props.editForm) {
            switch (layoutChoice) {
                case "layout-1":
                    if (props.editForm.content.layout === "layout-1")
                        return (
                            <LayoutOne
                                editFormData={props.editForm}
                                layoutSelected={layoutSelected}
                                getFormData={(data) => props.getFormData(data)}
                                returnLayoutChoice={() => returnLayoutChoice()}
                            />
                        );
                    else
                        return (
                            <LayoutOne
                                layoutSelected={layoutSelected}
                                getFormData={(data) => props.getFormData(data)}
                                returnLayoutChoice={() => returnLayoutChoice()}
                            />
                        );
                case "layout-2":
                    if (props.editForm.content.layout === "layout-2")
                        return (
                            <LayoutTwo
                                editFormData={props.editForm}
                                layoutSelected={layoutSelected}
                                getFormData={(data) => props.getFormData(data)}
                                returnLayoutChoice={() => returnLayoutChoice()}
                            />
                        );
                    else
                        return (
                            <LayoutTwo
                                layoutSelected={layoutSelected}
                                getFormData={(data) => props.getFormData(data)}
                                returnLayoutChoice={() => returnLayoutChoice()}
                            />
                        );
                case "layout-4":
                    if (props.editForm.content.layout === "layout-4")
                        return (
                            <LayoutFour
                                editFormData={props.editForm}
                                layoutSelected={layoutSelected}
                                getFormData={(data) => props.getFormData(data)}
                                returnLayoutChoice={() => returnLayoutChoice()}
                            />
                        );
                    else
                        return (
                            <LayoutFour
                                layoutSelected={layoutSelected}
                                getFormData={(data) => props.getFormData(data)}
                                returnLayoutChoice={() => returnLayoutChoice()}
                            />
                        );
                default :
                    if (props.editForm.content.layout === "layout-3")
                        return (
                            <LayoutThree
                                editFormData={props.editForm}
                                layoutSelected={layoutSelected}
                                getFormData={(data) => props.getFormData(data)}
                                returnLayoutChoice={() => returnLayoutChoice()}
                            />

                        );
                    else
                        return (
                            <LayoutThree
                                layoutSelected={layoutSelected}
                                getFormData={(data) => props.getFormData(data)}
                                returnLayoutChoice={() => returnLayoutChoice()}
                            />
                        );
            }
        } else {
            switch (layoutChoice) {
                case "layout-1":
                    return (
                        <LayoutOne
                            layoutSelected={layoutSelected}
                            getFormData={(data) => props.getFormData(data)}
                            returnLayoutChoice={() =>
                                returnLayoutChoice()}
                        />
                    );
                case "layout-2":
                    return (
                        <LayoutTwo
                            layoutSelected={layoutSelected}
                            getFormData={(data) => props.getFormData(data)}
                            returnLayoutChoice={() => returnLayoutChoice()}
                        />
                    );
                case "layout-4":
                    return (
                        <LayoutFour
                            layoutSelected={layoutSelected}
                            getFormData={(data) => props.getFormData(data)}
                            returnLayoutChoice={() => returnLayoutChoice()}
                        />
                    );
                default :
                    return (
                        <LayoutThree
                            layoutSelected={layoutSelected}
                            getFormData={(data) => props.getFormData(data)}
                            returnLayoutChoice={() => returnLayoutChoice()}
                        />
                    );
            }
        }
    };

    return (
        <Router>
            <div className={"container"}>
                <h3 className="text-center" style={{marginBottom: '4rem'}}>Form Builder</h3>
                {
                    !layoutChoice ? (
                        <LayoutChoice onChooseLayout={onChooseLayout}/>
                    ) : (
                        printLayout()
                    )
                }
            </div>
        </Router>
    );
};

export default FormBuilder;
