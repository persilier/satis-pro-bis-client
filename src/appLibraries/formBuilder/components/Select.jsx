import React, {useState} from "react";
import styled from "styled-components";

const LabelContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

const Select = (props) => {
    const [edit, setEdit] = useState(false);
    const {input} = props;

    const deleteInput = () => {
        props.deleteInput(props.index, props.panel)
    };
    return (
        <div
            className={input.inputClass+" mb-4"}
            onMouseEnter={() => setEdit(true)}
            onMouseLeave={() => setEdit(false)}
        >
            <LabelContainer>
                <label htmlFor={input.id}>{input.label}</label>
                {
                    edit ? (
                        <span
                            style={{marginLeft: "auto", cursor: 'pointer'}}
                            onClick={deleteInput}
                        >
                            <i className="far fa-trash-alt mr-1"/>
                        </span>
                    ) : ''
                }
            </LabelContainer>
            <select name={input.name} id={input.id} className={"form-control"}>
                <option value={input.model}>{(input.model).toUpperCase()}</option>
            </select>
        </div>
    );
};
export default Select;
