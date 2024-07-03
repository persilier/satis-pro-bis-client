import React from "react";
import moment from "moment";
import KanbanElementDetail from "./KanbanElementDetail";

const ColToValidate = (props) => {
    var currentFilterData = props.claims;

    const filterTimeLimit = () => {
        currentFilterData = currentFilterData.filter(claim => {
            if (props.filterTimeLimit === "all")
                return true;
            else if (props.filterTimeLimit === "today")
                return claim.time_expire === 0;
            else if (props.filterTimeLimit === "timeout")
                return claim.time_expire < 0;
            else if (props.filterTimeLimit === "notTimeout")
                return claim.time_expire > 0;
            else
                return false;
        });
    };

    const filterByInstitution = () => {
        currentFilterData = currentFilterData.filter(claim => {
            if (props.plan === "MACRO" || props.plan === "PRO") {
                return claim.institution_targeted_id.indexOf(props.filterInstitution.value) >= 0;
            }
            else if(props.plan === "HUB")
                return claim.institution_targeted_id.indexOf(props.filterInstitution.value) >= 0;
            else
                return true;
        });
    };

    const filterByUnit = () => {
        currentFilterData = currentFilterData.filter(claim => claim.active_treatment.responsible_unit_id.indexOf(props.filterUnit.value) >= 0);
    };

    const filterByStaff = () => {
        currentFilterData = currentFilterData.filter(claim => {
            return claim.active_treatment.responsible_staff_id.indexOf(props.filterStaff.value) >= 0
        });
    };

    const filterByCategory = () => {
        currentFilterData = currentFilterData.filter(claim => (claim.claim_object !== null && claim.claim_object.claim_category_id !== null) ? claim.claim_object.claim_category_id.indexOf(props.filterCategory.value) >= 0 : false);
    };

    const filterByObject = () => {
        currentFilterData = currentFilterData.filter(claim => claim.claim_object_id !== null ? claim.claim_object_id.indexOf(props.filterObject.value) >= 0 : false);
    };

    const filterByPeriod = () => {
        currentFilterData = currentFilterData.filter( claim =>
            new Date(moment(new Date(claim.created_at)).format("YYYY-MM-DD")) >= props.filterPeriod.start && new Date(moment(new Date(claim.created_at)).format("YYYY-MM-DD")) <= props.filterPeriod.end
        );
    };

    if (props.filterUnit)
        filterByUnit();


    if (props.filterInstitution)
        filterByInstitution();

    if (props.filterStaff)
        filterByStaff();

    if (props.filterCategory)
        filterByCategory();

    if (props.filterObject)
        filterByObject();

    if (props.filterPeriod)
        filterByPeriod();

    if (props.filterTimeLimit)
        filterTimeLimit();

    return (
        <div data-id="_backlog" data-order="1" className="kanban-board" style={{ width: "250px", marginLeft: "0px", marginRight: "0px" }}>
            <header className="kanban-board-header" style={{backgroundColor: props.backgroundHeader}}>
                <div className="kanban-title-board d-flex justify-content-between align-items-center">
                    <span style={{color: props.colorHeader}}>{props.title}</span> <span className="kt-badge kt-badge--success kt-badge--lg">{currentFilterData.length}</span>
                </div>
            </header>
            <main className="kanban-drag" style={{height: "679px", overflowY: "scroll"}}>
                {
                    currentFilterData.map((claim, index) => (
                        <KanbanElementDetail
                            key={index}
                            onClick={props.onClick}
                            onShowDetail={props.onShowDetail}
                            claim={claim}
                            index={index}
                        />
                    ))
                }
            </main>
            <footer/>
        </div>
    )
};

export default ColToValidate;
