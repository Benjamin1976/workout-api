import Session from "./models/Session.model";
import Exercise from "./models/Exercise.model";
import { connectToDB } from "./config/mongoose";
// import { writeFile, writeFileSync } from "fs";
// import connectDB from "./db";

const SetItemInitialValues = {
  // _id: "",
  unit: "kg",
  rating: null,
  started: false,
  startedWhen: null,
  completed: false,
  completedWhen: null,
  no: 1,
  id: 0,
  order: 0,
  // reps: 12,
  // weight: 0,
  link: false,
};

const ExerciseNameInitialValues = {
  // _id: "new",
  // name: "new",
  comments: "",
  created: new Date(),
  updated: new Date(),
};

const ExerciseItemInitialValues = {
  //   _id: "",
  //   name: ExerciseNameInitialValues,
  rating: null,
  started: false,
  startedWhen: null,
  completed: false,
  completedWhen: null,
  visible: false,
  type: "normal",
  object: "",
  comments: null,
  id: 0,
  order: 0,
  //   sets: [],
  supersetNo: null,
};

const startedCompleted = (data: any) => {
  let { created, startedWhen, completedWhen } = data;
  if (!created) created = new Date();
  return {
    started: true,
    startedWhen: !startedWhen ? created : startedWhen,
    completed: true,
    completedWhen: !completedWhen ? created : completedWhen,
  };
};

const addUnique2 = (findStrings: string[], data: any, cleanup: any) => {
  findStrings.forEach((s) => {
    if (data?.[s] && !cleanup[s].includes(data[s])) {
      cleanup[s].push(data[s]);
    }
  });
  return cleanup;
};

const cleanString = (data: any) => {
  let fields = ["type", "unit", "object"];
  let find = [
    { find: "dumb", replace: "dumbbell" },
    { find: "cable", replace: "cable", addComment: true },
    { find: "body weight", replace: "body weight" },
    { find: "kettle", replace: "kettlebell" },
    { find: "bench", replace: "cable" },
    { find: "barbell", replace: "barbell" },
    { find: "lat", replace: "cable", addComment: true },
    { find: "subset", replace: "subset" },
    { find: "superset", replace: "superset" },
    { find: "normal set", replace: "normal" },
    { find: "Lb", replace: "lb" },
    { find: "18", replace: "lb" },
  ];

  fields.forEach((field) => {
    find.forEach((f) => {
      if (data?.[field] && data[field].toLowerCase().includes(f.find)) {
        if (data[field].length > f.find.length && f.addComment) {
          data.comments = (data?.comments ?? "") + " " + data[field];
          data.comments = data.comments.trim();
        }
        data[field] = f.replace;
      }
    });
  });
  return data;
};

const gymCleanup = (sess: any) => {
  let newSesh = { ...sess };
  let exStartCompleted = startedCompleted(newSesh);
  if (newSesh?.exercises?.length) {
    let exs = newSesh.exercises;
    newSesh.exercises = exs.map((ex: any, exIdx: number) => {
      let newEx = {
        ...ExerciseItemInitialValues,
        ...ex,
        ...exStartCompleted,
        type: !ex?.type ? "normal" : ex.type.toString().toLowerCase(),
        object: ex.object,
        order: exIdx,
        id: exIdx,
      };
      newEx = cleanString(newEx);
      delete newEx.unit;
      // console.log(newEx?.sets?.length);
      if (newEx?.sets?.length) {
        newEx.sets = newEx.sets.map((set: any, setIdx: number) => {
          let newSet = {
            ...SetItemInitialValues,
            ...set,
            ...exStartCompleted,
            order: setIdx,
            id: setIdx,
            no: setIdx + 1,
          };
          newSet = cleanString(newSet);
          delete newSet.sets;
          return newSet;
        });
      }
      return newEx;
    });
  }
  return newSesh;
};

const gymCheck = (sess: any, result: any) => {
  let newSesh = { ...sess };
  //   console.log(newSesh);
  if (newSesh?.exercises?.length) {
    let exs = newSesh.exercises;
    newSesh.exercises = exs.map((ex: any, exIdx: number) => {
      result.cleanup = addUnique2(
        ["type", "object", "unit"],
        ex,
        result.cleanup
      );
      //   console.log(addUnique2(["type", "object", "unit"], ex, result.cleanup));
      if (ex?.sets?.length) {
        let sets = ex.sets;
        newSesh.exercises[exIdx] = sets.map((set: any, setIdx: number) => {
          result.cleanup = addUnique2(
            ["type", "object", "unit"],
            set,
            result.cleanup
          );
          return set;
        });
      }
      return ex;
    });
  }
  return { ...result, newSesh };
};

const cleanupWorkouts = async () => {
  let result = {
    cleanup: { object: [], type: [], unit: [] },
    newSesh: {},
    sessions: [],
  };

  console.log("Checking data");
  let sessions = await Session.find({});
  sessions.forEach((newSesh: any) => {
    result = gymCheck(newSesh.toObject(), result);
  });
  console.log(result.cleanup);

  console.log("Cleaning data");
  let updSessions = sessions.map((session: any) => {
    let newSesh = session.toObject();
    return gymCleanup(newSesh);
  });
  // console.log(updSessions[0].exercises[0].sets[0]);
  // console.log(updSessions[0].exercises[0]);

  // console.log("Checking result");
  // result = {
  //   cleanup: { object: [], type: [], unit: [] },
  //   newSesh: {},
  //   sessions: [],
  // };
  // updSessions.forEach((newSesh) => {
  //   result = gymCheck(newSesh, result);
  // });
  // console.log(result.cleanup);
  // writeFileSync("./sessions.json", JSON.stringify(updSessions));
};

connectToDB();
cleanupWorkouts();
