import React from "react";
import {Link} from "react-router-dom";

const ListElement = () => {
    return (
        <div className="col-md-3" style={{display: "flex", flexDirection: "column"}}>
            <Link to={"/text-field"} style={{marginBottom: "8px"}} className="btn btn-outline-secondary">TextField</Link>
            <Link to={"/textarea"} style={{marginBottom: "8px"}} className="btn btn-outline-secondary">Textarea</Link>
            <Link to={"/select"} style={{marginBottom: "8px"}} className="btn btn-outline-secondary">Select</Link>
            <Link to={"/checkbox-group"} style={{marginBottom: "8px"}} className="btn btn-outline-secondary">Checkbox Group</Link>
            <Link to={"/radio-group"} style={{marginBottom: "8px"}} className="btn btn-outline-secondary">Radio Group</Link>
        </div>
    );
};

export default ListElement;