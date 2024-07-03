import React, {useEffect, useState} from "react";
// import {addData} from "../../constants/headerBuilder";
import axios from "axios";
import apiConfig from "../../config/apiConfig";
import {useTranslation} from "react-i18next";

const HeaderBuilder = (props) => {

  //usage of useTranslation i18n
  const {t, ready} = useTranslation()

  // const dataState = props.editData ? props.editData : addData;
  // const [state, setState] = useState(dataState);

  const [headerData, setHeaderData] = useState([]);

  useEffect(() => {
    // console.log('NAME', props.getHeader);
    axios.get(`${apiConfig.baseUrl}/header/${props.getHeader}`)
        .then(response=>{
          setHeaderData(response.data)
        })
  },[]);

  const onChangeDescription = (e) => {
    const newState = {...headerData};
    newState.description = e.target.value;
    setHeaderData(newState);
  };

  const onChangePrint = (index) => {
    if (headerData){
      const newState = {...headerData};
      newState.content[index].print = !newState.content[index].print;
      setHeaderData(newState);
    }
  };

  const onChangeElementDescription = (index, e) => {
    const newState = {...headerData};
    newState.content[index].description = e.target.value;
    setHeaderData(newState);
  };

  const onChangeLabel = (index, e) => {
    const newState = {...headerData};
    newState.content[index].label = e.target.value;
    setHeaderData(newState);
  };

  const onSubmit = () => {
    props.getData(headerData);
  };

  return (
      ready ? (
          <div>
            {/*<h1 className="text-center">Header Builder</h1>*/}
            <div className="kt-container  kt-container--fluid  kt-grid__item kt-grid__item--fluid">
              <div className="row">
                <div className="col-md-12">

                  <div className="kt-portlet">
                    <div className="kt-form">
                      <div className="kt-portlet__body">
                        {
                          headerData!== undefined?
                              (
                                  <div>
                                    <div className="form-group">
                                      <label htmlFor={"description"}>{t("Description")}</label>
                                      <textarea
                                          className="form-control"
                                          name="description"
                                          id="description"
                                          cols="30"
                                          rows="2"
                                          value={headerData.description}
                                          disabled={true}
                                          onChange={(e) => onChangeDescription(e)}
                                          placeholder={t("Veuillez entrer la description du header builder")}
                                      />
                                    </div>
                                    <div style={{height: "300px", overflow: "scroll", overflowX: "hidden"}}>

                                      {
                                        (headerData.content) ? (
                                            headerData.content.map((element, index) => (
                                                <div className="form-row" key={index}>
                                                  <div className="form-group col-md-3">
                                                    <label htmlFor={"label"+index}>{t("Libellé")}</label>
                                                    <input
                                                        id={"label"+index}
                                                        type="text"
                                                        className="form-control"
                                                        value={element.label}
                                                        onChange={(e) => onChangeLabel(index, e)}
                                                        placeholder={t("Veuillez entrer le libellé")}
                                                    />
                                                  </div>
                                                  <div className="form-group col">
                                                    <label htmlFor={"eDescription"+index}>Description</label>
                                                    <textarea
                                                        className="form-control"
                                                        name="description"
                                                        id={"eDescription"+index}
                                                        cols="30"
                                                        rows="2"
                                                        value={element.description}
                                                        onChange={(e) => onChangeElementDescription(index, e)}
                                                        placeholder={t("Veuillez entrer la description")}
                                                    />
                                                  </div>

                                                  <div className="col-md-2 form-group" style={{display: "flex", alignItems: "center"}}>
                                                    <label className="kt-checkbox kt-checkbox--brand">
                                                      <input
                                                          type="checkbox"
                                                          checked={element.print}
                                                          onChange={(e) => onChangePrint(index,e)}
                                                      /> {t("Afficher")}
                                                      <span/>
                                                    </label>
                                                  </div>
                                                </div>
                                            ))
                                        ) : console.log("Loading")
                                      }
                                    </div>
                                  </div>
                              ): (
                                  //console.log('end')
                              )
                        }
                      </div>

                      <div className="kt-portlet__foot">
                        <div className="kt-form__actions">
                          <button type="reset" className="btn btn-primary" onClick={() => onSubmit()}>
                            {t("Enregistrer")}
                          </button>

                          <button onClick={props.onCloseHeader} className={"btn btn-default ml-2 pr-5 pl-5"}>
                            {t("Fermer")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <pre className="mt-4" style={{backgroundColor: "#f7f7f7", padding: "10px", borderRadius: "5px", wordWrap: "normal", wordBreak: "normal"}}>
                {
                  JSON.stringify(headerData)
                }
            </pre>
          </div>
      ) : null
  );
};

export default HeaderBuilder;
