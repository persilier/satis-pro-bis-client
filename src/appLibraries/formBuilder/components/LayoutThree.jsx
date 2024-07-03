import React, {useState} from "react";
import Modal from "./Modal";
import styled from "styled-components";
import {PANEL_ONE} from "../constants/globalConstants";
import TextField from "./TextField";
import Textarea from "./Textarea";
import Select from "./Select";

const ActionButton = styled.span`
    margin-left: auto;
    cursor: pointer;
`;

const LayoutThree = (props) => {
    const contentData = props.editFormData ? props.editFormData.content.content : [];
    const actionData = props.editFormData ? props.editFormData.content.action : {title: '', endpoint: '/login'};
    const descriptionData = props.editFormData ? props.editFormData.description : '';

    const [showModal, setShowModal] = useState(false);
    const [panelOne, setPanelOne] = useState({content: contentData});
    const [action, setAction] = useState(actionData);
    const [description, setDescription] = useState(descriptionData);
    const [editPanel, setEditPanel] = useState(undefined);

    const onClickAddButton = (layout) => {
        setEditPanel(layout);
        setShowModal(true);
    };

    const handleCloseModal =  () => {
        setShowModal(false);
    };

    const returnLayoutChoice = () => {
        props.returnLayoutChoice();
    };

    const addElementPanelOne = (element) => {
        let newPanelOne = panelOne;
        newPanelOne.content.push(element);
        setPanelOne(newPanelOne);
    };

    const onClickSaveButton = () => {
        const newForm = {
            name: '',
            description: description,
            content: {
                'layout': 'layout-3',
                'content': panelOne.content,
                'action': action,
            }
        };
        props.getFormData(newForm);
    };

    const deleteInput = (index, panel) => {
        let newPanelOne = {...panelOne};
        newPanelOne.content.splice(index, 1);
        setPanelOne(newPanelOne);
    };

    const printInputs = (input, index, panel) => {
        if (input.type === 'text' || input.type === 'password' || input.type === 'email' || input.type === 'number' || input.type === 'date' || input.type === 'file' || input.type === 'tel') {
            return (
                <TextField
                    deleteInput={(index, panel) => deleteInput(index, panel)}
                    key={index}
                    input={input}
                    panel={panel}
                    index={index}
                />
            )
        } else if (input.type === 'textarea') {
            return (
                <Textarea
                    deleteInput={(index, panel) => deleteInput(index, panel)}
                    key={index}
                    input={input}
                    panel={panel}
                    index={index}
                />
            )
        } else if (input.type === 'select' || input.type === 'checkbox-group' || input.type === 'radio-group') {
            return (
                <Select
                    deleteInput={(index, panel) => deleteInput(index, panel)}
                    key={index}
                    input={input}
                    panel={panel}
                    index={index}
                />
            );
        }
    };

    const onChangeInput = (e) => {
        let newAction = {...action};
        if (e.target.id === 'select') {
            newAction.endpoint = e.target.value
        } else if (e.target.id === 'text') {
            newAction.title = e.target.value;
        } else {
            setDescription(e.target.value);
        }
        setAction(newAction);
    };

    return (
        <div className={"mb-4"}>
            <div className="form-row mb-3">
                <div className="col">
                    <label htmlFor="description">Description du formulaire</label>
                    <textarea
                        id="description"
                        cols="10"
                        rows="3"
                        className="form-control"
                        placeholder={"Veillez entrer la description du formulaire"}
                        value={description}
                        onChange={(e) => onChangeInput(e)}
                    />
                </div>
            </div>

            <div className={"row"}>
                <div className="col">
                    <div className="card">
                        <ActionButton>
                            <i
                                className={"fa fa-plus ml-1 mr-3"}
                                onClick={() => onClickAddButton(PANEL_ONE)}
                            />
                        </ActionButton>
                        <div className="card-body">
                            {
                                panelOne.content.length ? (
                                    <div className="form-row">
                                        {
                                            panelOne.content.map((input, index) => printInputs(input, index, 'without-panel'))
                                        }
                                    </div>
                                ) : 'Veillez editer votre Formulaire'
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="col">
                    <label htmlFor="select">Action Submit Button</label>
                    <select name="" id="select" className={"form-control"} value={action.endpoint} onChange={(e) => onChangeInput(e)}>
                        <option value="/login">/login</option>
                        <option value="/sing-up">/sign-up</option>
                        <option value="/actor/create">/actor/create</option>
                        <option value="/institution/create">/institution/create</option>
                        <option value="/agent/create">/agent/create</option>
                        <option value="/unit-institution/create">/unite-institution/create</option>
                    </select>
                </div>
                <div className="col">
                    <label htmlFor="text">Title Submit Button</label>
                    <input id={"text"} type="text" className={"form-control"} value={action.title} onChange={(e) => onChangeInput(e)}/>
                </div>
            </div>

            <div className="form-row mt-3" style={{display: "flex", justifyContent: "flex-end"}}>
                {
                    props.layoutSelected ? "" : (
                        <button
                            onClick={() => returnLayoutChoice()}
                            className={"btn btn-default ml-2 pr-5 pl-5"}
                        >
                            Close
                        </button>
                    )
                }
                <button
                    onClick={onClickSaveButton}
                    className={"btn btn-primary ml-2 pr-5 pl-5"}
                >
                    Save
                </button>
            </div>

            <Modal
                isOpen={showModal}
                panel={editPanel}
                panelOne={addElementPanelOne}
                onRequestClose={handleCloseModal}
                contentLabel="Minimal Modal Example"
                ariaHideApp={false}
                handleCloseModal={handleCloseModal}
            />
        </div>
    );
};

export default LayoutThree;
