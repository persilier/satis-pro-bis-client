import React from "react";
import styled from "styled-components";

const LayoutContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
`;

const Container = styled.div`
    border: 3px solid lightgrey;
    border-radius: 8px;
    padding: 5px;
    cursor: pointer;
`;

const Panel = styled.div`
    background-color: lightgrey;
    width: 100%;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    margin-bottom: 7px;
`;

const SmallPanel = styled.div`
    background-color: lightgrey;
    width: 100%;
    height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    margin-bottom: 7px;
`;

const margin = {
    marginBottom: "30px"
};

const LayoutChoice = (props) => {
    const onClickLayout = (layout) => {
        props.onChooseLayout(layout);
    };

    return (
        <LayoutContainer>
            <div className="row">

                <div className="col-6"
                     style={{...margin}}
                     onClick={() => onClickLayout("layout-1")}
                >
                    <Container>
                        <div className={"row text-center"}>
                            <div className="col" style={{paddingRight: "2px"}}>
                                <Panel>
                                    <h5>Panel 1</h5>
                                </Panel>
                            </div>
                            <div className="col" style={{paddingLeft: "2px"}}>
                                <Panel>
                                    <h5>Panel 2</h5>
                                </Panel>
                            </div>
                        </div>
                        <h5 className={"text-center"}>layout 1</h5>
                    </Container>
                </div>

                <div
                    className="col-6"
                    style={{...margin, cursor: "pointer"}}
                    onClick={() => onClickLayout("layout-2")}
                >
                    <Container>
                        <div className={"row text-center"}>
                            <div className="col">
                                <Panel>
                                    <h5>Panel 1</h5>
                                </Panel>
                            </div>
                        </div>
                        <h5 className={"text-center"}>Layout 2</h5>
                    </Container>
                </div>

                <div
                    className="col-6"
                    style={{...margin, cursor: "pointer"}}
                    onClick={() => onClickLayout("layout-3")}
                >
                    <Container>
                        <div className={"row text-center"}>
                            <div className="col">
                                <Panel>
                                    <h5>Without Panel</h5>
                                </Panel>
                            </div>
                        </div>
                        <h5 className={"text-center"}>layout 3</h5>
                    </Container>
                </div>

                <div
                    className="col-6"
                    style={{...margin, cursor: "pointer"}}
                    onClick={() => onClickLayout("layout-4")}
                >
                    <Container>
                        <div className={"row text-center"}>
                            <div className="col">
                                <SmallPanel>
                                    <h5>Panel 1</h5>
                                </SmallPanel>
                            </div>
                        </div>
                        <div className={"row text-center"}>
                            <div className="col">
                                <SmallPanel>
                                    <h5>Panel 2</h5>
                                </SmallPanel>
                            </div>
                        </div>
                        <div className={"row text-center"}>
                            <div className="col">
                                <SmallPanel>
                                    <h5>Panel 3</h5>
                                </SmallPanel>
                            </div>
                        </div>
                        <h5 className={"text-center"}>Layout 4</h5>
                    </Container>
                </div>
            </div>

        </LayoutContainer>
    )
};

export default LayoutChoice;