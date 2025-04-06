"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Session_model_1 = __importDefault(require("./models/Session.model"));
const mongoose_1 = require("./config/mongoose");
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
const startedCompleted = (data) => {
    let { created, startedWhen, completedWhen } = data;
    if (!created)
        created = new Date();
    return {
        started: true,
        startedWhen: !startedWhen ? created : startedWhen,
        completed: true,
        completedWhen: !completedWhen ? created : completedWhen,
    };
};
const addUnique2 = (findStrings, data, cleanup) => {
    findStrings.forEach((s) => {
        if ((data === null || data === void 0 ? void 0 : data[s]) && !cleanup[s].includes(data[s])) {
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
        { find: "normal set", replace: "normal" },
        { find: "Lb", replace: "lb" },
        { find: "18", replace: "lb" },
    ];
    fields.forEach((field) => {
        find.forEach((f) => {
            var _a;
            if ((data === null || data === void 0 ? void 0 : data[field]) && data[field].toLowerCase().includes(f.find)) {
                if (data[field].length > f.find.length && f.addComment) {
                    data.comments = ((_a = data === null || data === void 0 ? void 0 : data.comments) !== null && _a !== void 0 ? _a : "") + " " + data[field];
                    data.comments = data.comments.trim();
                }
                data[field] = f.replace;
            }
        });
    });
    return data;
};
const gymCleanup = (sess) => {
    var _a;
    let newSesh = Object.assign({}, sess);
    let exStartCompleted = startedCompleted(newSesh);
    if ((_a = newSesh === null || newSesh === void 0 ? void 0 : newSesh.exercises) === null || _a === void 0 ? void 0 : _a.length) {
        let exs = newSesh.exercises;
        newSesh.exercises = exs.map((ex, exIdx) => {
            var _a;
            let newEx = Object.assign(Object.assign(Object.assign(Object.assign({}, ExerciseItemInitialValues), ex), exStartCompleted), { type: !(ex === null || ex === void 0 ? void 0 : ex.type) ? "normal" : ex.type.toString().toLowerCase(), object: ex.object, order: exIdx, id: exIdx });
            newEx = cleanString(newEx);
            delete newEx.unit;
            // console.log(newEx?.sets?.length);
            if ((_a = newEx === null || newEx === void 0 ? void 0 : newEx.sets) === null || _a === void 0 ? void 0 : _a.length) {
                newEx.sets = newEx.sets.map((set, setIdx) => {
                    let newSet = Object.assign(Object.assign(Object.assign(Object.assign({}, SetItemInitialValues), set), exStartCompleted), { order: setIdx, id: setIdx, no: setIdx + 1 });
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
const gymCheck = (sess, result) => {
    var _a;
    let newSesh = Object.assign({}, sess);
    //   console.log(newSesh);
    if ((_a = newSesh === null || newSesh === void 0 ? void 0 : newSesh.exercises) === null || _a === void 0 ? void 0 : _a.length) {
        let exs = newSesh.exercises;
        newSesh.exercises = exs.map((ex, exIdx) => {
            var _a;
            result.cleanup = addUnique2(["type", "object", "unit"], ex, result.cleanup);
            //   console.log(addUnique2(["type", "object", "unit"], ex, result.cleanup));
            if ((_a = ex === null || ex === void 0 ? void 0 : ex.sets) === null || _a === void 0 ? void 0 : _a.length) {
                let sets = ex.sets;
                newSesh.exercises[exIdx] = sets.map((set, setIdx) => {
                    result.cleanup = addUnique2(["type", "object", "unit"], set, result.cleanup);
                    return set;
                });
            }
            return ex;
        });
    }
    return Object.assign(Object.assign({}, result), { newSesh });
};
const cleanupWorkouts = () => __awaiter(void 0, void 0, void 0, function* () {
    let result = {
        cleanup: { object: [], type: [], unit: [] },
        newSesh: {},
        sessions: [],
    };
    console.log("Checking data");
    let sessions = yield Session_model_1.default.find({});
    sessions.forEach((newSesh) => {
        result = gymCheck(newSesh.toObject(), result);
    });
    console.log(result.cleanup);
    console.log("Cleaning data");
    let updSessions = sessions.map((session) => {
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
});
(0, mongoose_1.connectToDB)();
cleanupWorkouts();
