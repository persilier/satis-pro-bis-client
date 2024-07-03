import React, {useState} from "react";
import styled from "styled-components";

const LabelContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

const Textarea = (props) => {
    const [edit, setEdit] = useState(false);
    const {input} = props;
    const [textarea, setTextArea] = useState(input.value);

    const onChangeInput = (e) => {
        setTextArea(e.target.value);
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
            <textarea
                className={"form-control"}
                placeholder={input.placeholder}
                name={input.name}
                id={input.id}
                cols={input.cols}
                rows={input.rows}
                onChange={(e) => onChangeInput(e)}
                value={textarea || ''}
            >
                {input.value}
            </textarea>
        </div>
    );
};
export default Textarea;
