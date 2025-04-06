// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("workouts");

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

const startedCompleted = (created, startedWhen, completedWhen) => {
  if (!created) created = new Date();
  return {
    started: true,
    startedWhen: !startedWhen ? created : startedWhen,
    completed: true,
    completedWhen: !completedWhen ? created : completedWhen,
  };
};

const addUnique2 = (findStrings, data, cleanup) => {
  findStrings.forEach((s) => {
    if (data?.[s] && !cleanup[s].includes(data[s])) {
      cleanup[s].push(data[s]);
    }
  });
  return cleanup;
};

const cleanString = (data) => {
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
    { find: "normal set", replace: "normal set" },
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

const gymCleanup = async (sess, cleanup) => {
  let newSesh = { ...sess };
  let exStartCompleted = startedCompleted(newSesh.created);
  if (newSesh?.exercises?.length) {
    let exs = newSesh.exercises;
    newSesh.exercises = exs.map((ex, exIdx) => {
      cleanup = addUnique2(["type", "object", "unit"], ex, cleanup);
      // console.log(cleanup);
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
      if (newEx?.sets?.length) {
        let sets = newEx.sets;
        newSesh.exercises[exIdx] = sets.map((set, setIdx) => {
          // console.log(sets[0].no);
          let newSet = {
            ...SetItemInitialValues,
            ...set,
            ...exStartCompleted,
            order: setIdx,
            id: setIdx,
            no: setIdx + 1,
          };
          newSet = cleanString(newSet);
          return newSet;
        });
      }
      return newEx;
    });
  }
  return { newSesh, cleanup };
};

const gymCheck = (sess, cleanup) => {
  let newSesh = { ...sess };
  if (newSesh?.exercises?.length) {
    let exs = newSesh.exercises;
    newSesh.exercises = exs.map((ex, exIdx) => {
      cleanup = addUnique2(["type", "object", "unit"], ex, cleanup);
      if (ex?.sets?.length) {
        let sets = ex.sets;
        newSesh.exercises[exIdx] = sets.map((set, setIdx) => {
          cleanup = addUnique2(["type", "object", "unit"], set, cleanup);
          return set;
        });
      }
      return ex;
    });
  }
  return { newSesh, cleanup };
};

let result = {
  cleanup: { object: [], type: [], unit: [] },
  newSesh: {},
  sessions: [],
};
const updateData = async () => {
  return await db.getCollection("sessions").find({});
  // .then((session) => {
  //   console.log(session);
  // });
};

updateData()
  .then(async (sessions) => {
    // console.log(sessions);
    sessions = sessions.map((oldSesh) => {
      let newSesh = { ...oldSesh };
      result = gymCheck(newSesh, result.cleanup);
      return newSesh;
      // console.log(newSesh);
      // console.log(oldSesh);
    });
    // console.log(sessions);
    console.log(result);
    // console.log(sessions);
    // console.log(result);
    // result.sessions = await sessions;
    // console.log(result.sessions);
    return sessions;
  })
  .then((result) => {
    console.log(result);
    // result.forEach((res) => {
    //   console.log(res);
    // });
    // console.log(result.cleanup);
    // console.log(result?.length);
    // return result.sessions.map(async (session) => {
    //   let cleanedResult = await gymCleanup(session, result.cleanup);
    //   console.log(cleanedResult);
    //   return cleanedResult.newSesh;
    // });
    return result;
  })
  .then((result) => {
    // console.log(result);
  });

// const checkData = async (data) => {
//   data.forEach((oldSesh) => {
//     result = gymCheck(oldSesh, result.cleanup);
//   });
// };

// checkData(data);
// result;

//   db.getCollection("sessions")
//   .find({})
//   .forEach((oldSesh) => {
//     result = gymCheck(oldSesh, result.cleanup);
//     // console.log(result.newSesh);
//   });
// console.log(result.cleanup);

// let cleanData = async () => {
//   return await db
//     .getCollection("sessions")
//     .find({})
//     .map((oldSesh) => {
//       result = gymCleanup(oldSesh, result.cleanup);
//       return result.newSesh;
//       // console.log(result.newSesh);
//     });
// };
// // .then((data) => console.log(data.length));

// result = { cleanup: { object: [], type: [], unit: [] }, newSesh: {} };
// cleanData.forEach((oldSesh) => {
//   result = gymCheck(oldSesh, result.cleanup);
// });
// console.log(cleanData());
// console.log(result.cleanup);
// // const cleanData = async () => {
// //   let result = { cleanup: { object: [], type: [], unit: [] }, newSesh: {} };
// //   let dataDirty = await db
// //     .getCollection("sessions")
// //     .find({})
// //     .map(async (sess) => {
// //       // console.log(sess);
//       return await gymCleanup(sess, result.cleanup).then((result) => {
//         return result.newSesh;
//       });
//       // console.log(result.newSesh);
//     });
//   console.log(dataDirty);
// };

// cleanData();

// console.log(dataDirty);
// .map((sess) => {
//   console.log(sess);
//   let result = gymCleanup(sess, cleanup);
//   console.log(result.newSesh);
//   return result.newSesh;
// });

// console.log("first cleanup");
// console.log(cleanup);

// cleanup = { object: [], type: [], unit: [] };
// let dataClean = dataDirty.map((sess) => {
//   let { newSesh, cleanup } = gymCleanup(sess, cleanup);
//   return newSesh;
// });

// console.log("second cleanup");
// console.log(cleanup);
// // console.log(data);

// console.log(gymCleanup());

// const getSess = async () => {
//   await db
//     .getCollection("sessions")
//     .find({})
//     .then((sess) => {
//       sess;
//     });
// };

// getSess();
