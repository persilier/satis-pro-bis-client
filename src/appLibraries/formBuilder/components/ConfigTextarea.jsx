import React, {useState} from "react";

const ConfigTextarea = (props) => {
    const [label, setLabel] = useState('');
    const [id, setId] = useState('');
    const [placeholder, setPlaceholder] = useState('');
    const [inputClass, setInputClass] = useState('col-md-12');
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [cols, setCols] = useState('30');
    const [rows, setRows] = useState('10');
    const [required, setRequired] = useState(false);
    const [maxLength, setMaxLength] = useState('');
    const [minLength, setMinLength] = useState('');
    const [regExp, setRegExp] = useState('');

    const onChangeInput = (e) => {
        switch (e.target.id) {
            case 'label':
                setLabel(e.target.value);
                break;
            case 'id':
                setId(e.target.value);
                break;
            case 'cols':
                setCols(e.target.value);
                break;
            case 'rows':
                setRows(e.target.value);
                break;
            case 'minLength':
                setMinLength(e.target.value);
                break;
            case 'maxLength':
                setMaxLength(e.target.value);
                break;
            case 'value':
                setValue(e.target.value);
                break;
            case 'inputClass':
                setInputClass(e.target.value);
                break;
            case 'name':
                setName(e.target.value);
                break;
            case 'placeholder':
                setPlaceholder(e.target.value);
                break;
            case 'regExp':
                setRegExp(e.target.value);
                break;
            default:
                setRequired(!required);
                break;
        }
    };

    if (props.information) {
        props.getElementData({
            type: 'textarea',
            id: id,
            placeholder: placeholder,
            label: label,
            inputClass: inputClass,
            name: name,
            value: value,
            cols: cols,
            rows: rows,
            required: required,
            maxLength: maxLength,
            minLength: minLength,
            regExp: regExp
        });
    }

    return (
        <div className="col-md-9">
            <h4 className={"text-center"}>Textarea</h4>
            <div className="form-row">
                <div className="col">
                    <label htmlFor="label">Label</label>
                    <input
                        id={"label"}
                        type="text"
                        className="form-control"
                        value={label}
                        onChange={(e) => onChangeInput(e)}
                    />
                </div>

                <div className="col">
                    <label htmlFor="id">Id</label>
                    <input
                        id={"id"}
                        type="text"
                        className="form-control"
                        value={id}
                        onChange={(e) => onChangeInput(e)}
                    />
                </div>

                <div className="col">
                    <label htmlFor="placeholder">Placeholder</label>
                    <input
                        id={"placeholder"}
                        type="text"
                        className="form-control"
                        value={placeholder}
                        onChange={(e) => onChangeInput(e)}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="col">
                    <label htmlFor="inputClass">Class</label>
                    <select
                        id="inputClass"
                        className="form-control"
                        value={inputClass}
                        onChange={(e) => onChangeInput(e)}
                    >
                        <option value="col-md-3">col-md-3</option>
                        <option value="col-md-4">col-md-4</option>
                        <option value="col-md-5">col-md-5</option>
                        <option value="col-md-6">col-md-6</option>
                        <option value="col-md-7">col-md-7</option>
                        <option value="col-md-8">col-md-8</option>
                        <option value="col-md-9">col-md-9</option>
                        <option value="col-md-10">col-md-10</option>
                        <option value="col-md-11">col-md-11</option>
                        <option value="col-md-12">col-md-12</option>
                    </select>
                </div>

                <div className="col">
                    <label htmlFor="name">Name</label>
                    <input id={"name"} type="text" className="form-control" value={name} onChange={(e) => onChangeInput(e)}/>
                </div>
            </div>

            <div className="form-row">
                <div className="col">
                    <label htmlFor="value">Value</label>
                    <input id={"value"} type="text" className="form-control" value={value} onChange={(e) => onChangeInput(e)}/>
                </div>
            </div>

            <div className="form-row">
                <div className="col">
                    <label htmlFor="cols">Cols</label>
                    <input
                        id={"cols"}
                        type="number"
                        className="form-control"
                        onChange={(e) => onChangeInput(e)}
                        value={cols}
                    />
                </div>

                <div className="col">
                    <label htmlFor="rows">Rows</label>
                    <input
                        id={"rows"}
                        type="number"
                        className="form-control"
                        onChange={(e) => onChangeInput(e)}
                        value={rows}
                    />
                </div>
            </div>

            <h4 className={"text-center"}>Validation</h4>
            <div className="form-row">
                <div className="custom-control custom-checkbox">
                    <input
                        type="checkbox"
                        id="customCheck1"
                        name={"required"}
                        className="custom-control-input"
                        value={required}
                        onChange={(e) => onChangeInput(e)}
                    />
                    <label htmlFor="customCheck1" className="custom-control-label">Required</label>
                </div>
            </div>

            <div className="form-row">
                <div className="col">
                    <label htmlFor="minLength">Min length</label>
                    <input id={"minLength"} type="number" className={"form-control"} value={minLength} onChange={(e) => onChangeInput(e)}/>
                </div>

                <div className="col">
                    <label htmlFor="maxLength">Max length</label>
                    <input id={"maxLength"} type="number" className={"form-control"} value={maxLength} onChange={(e) => onChangeInput(e)}/>
                </div>

                <div className="col">
                    <label htmlFor="regExp">RegExp</label>
                    <input id={"regExp"} type="text" className={"form-control"} value={regExp} onChange={(e) => onChangeInput(e)}/>
                </div>
            </div>
        </div>
    )
};

export default ConfigTextarea;
