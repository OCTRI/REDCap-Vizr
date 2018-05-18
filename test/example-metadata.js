import exampleDictionary from './example-data-dictionary';

export const exampleMetadata = {
  recordIdField: "record_id",
  dataDictionary : exampleDictionary,
  events: null
};

export const exampleLongitudinalMetadata = {
  recordIdField: "record_id",
  dataDictionary : exampleDictionary,
  events: {
    enrollment: ["study_status"],
    visit_1: ["survey"],
    visit_2: ["survey"]
  }
};
