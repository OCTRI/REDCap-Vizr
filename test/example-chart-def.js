export const chartId = "0361d066-7a88-42f9-96e4-771b4234174b";

// Return example charts from a function, so we always get a new copy
export function exampleChartDef(id) {
  return {
    field: "screen_date",
    dateInterval: "week",
    filter: "[screened]=1",
    group: "study_clinic",
    id: id ? `${id}` : `${chartId}`,
    title: "Screened Participants",
    description: "Participants that have been screened to date",
    start: "2016-10-04",
    chartEnd: "2017-06-04",
    end: "2017-02-25",
    targets: { "Portland": 20, "Bend": 20, "Eugene": 20}
  };
}

export function exampleNoGroupChartDef(id) {
  return {
    field: "screen_date",
    dateInterval: "week",
    filter: "[screened]=1",
    group: "",
    id: id ? `${id}` : `${chartId}`,
    title: "Screened Participants",
    start: "2016-10-04",
    chartEnd: "",
    end: "2017-02-25",
    targets: { "No Groups": 60}
  };
}

export function exampleLongitudinalChartDef(id) {
  return {
    field: "screen_date",
    dateInterval: "week",
    dateFieldEvent: "visit_1",
    filter: "[visit_1][dropdown]=1",
    groupFieldEvent: "enrollment",
    group: "study_clinic",
    id: id ? `${id}` : `${chartId}`,
    title: "Visit 1 Survey by Study Clinic",
    start: "2016-10-04",
    chartEnd: "",
    end: "2017-02-25",
    targets: { "Choice One": 20, "Choice Two": 20, "Choice Three": 20, "Etc.": 20}
  };
}
