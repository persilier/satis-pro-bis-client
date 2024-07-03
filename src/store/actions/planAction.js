export const CHANGE_PLAN = "CHANGE_PLAN";
export const LOAD_PLAN = "LOAD_PLAN";

export const changePlan = (plan) => {
    return {type: "CHANGE_PLAN", plan: plan}
};

export const loadPlan = (plan) => {
    return {type: "LOAD_PLAN", plan: plan}
};
