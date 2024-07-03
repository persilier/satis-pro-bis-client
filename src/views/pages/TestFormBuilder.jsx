import React, {useEffect, useState} from 'react';
import FormBuilder from "../../appLibraries/formBuilder/components/FormBuilder";
import {layoutFour, layoutOne,} from "../../constants/formData";
import AppLibrariesModel from "../../appLibraries/models/AppLibrariesModel";

function TestFormBuilder() {
    const [formData, setFormData] = useState(undefined);
    const [formEdit, setFormEdit] = useState(undefined);
    const [loginForm, setLoginForm] = useState(undefined);

    useEffect(() => {
        // setFormEdit(AppLibrariesModel.all()
        //     .then(response => {
        //     console.log('FormEdit', response);
        //     setLoginForm(response.data)
        //     })
        //     .catch(error => console.log(error))
        //     );
        setLoginForm(layoutFour)
    }, []);
    return (
        <div>

         {/*{   console.log(loginForm, 'loginForm')}*/}
            {

                loginForm === undefined ? (
                    <FormBuilder getFormData={(data) => {setFormData(data); console.log(data)}}/>
                ) : (
                    "Loading..."
                    )

            }
            <code className="mt-4" style={{lineHeight: '2px', textAlign: 'left', whiteSpace: 'pre', wordBreak: 'normal', wordWrap: 'normal', backgroundColor: '#f7f7f7', padding: '15px', margin: '10px', borderRadius: '5px'}}>
                {
                    JSON.stringify(formData)
                }
            </code>
        </div>
    );
}

export default TestFormBuilder;
