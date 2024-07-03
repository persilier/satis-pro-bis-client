import React, {useState} from "react";
import styled from "styled-components";

const LabelContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

const TextField = (props) => {
    const [edit, setEdit] = useState(false);
    const {input} = props;
    const [textField, setTextField] = useState(input.value);

    const onChangeInput = (e) => {
        setTextField(e.target.value);
    };

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
            <input
                id={input.id}
                required={input.required}
                placeholder={input.placeholder}
                type={input.type}
                className="form-control"
                name={input.name}
                value={textField || ''}
                onChange={(e) => onChangeInput(e)}
            />
        </div>
    );
};
export default TextField;
