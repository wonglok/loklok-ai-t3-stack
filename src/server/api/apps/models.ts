import mongoose, { Schema } from "mongoose";

const AppIDSchema = new Schema(
    {
        name: String,
        userID: String,
    },
    { timestamps: true, versionKey: false },
);

if (mongoose.models["AppIDSchema"]) {
    mongoose.deleteModel("AppIDSchema");
}
if (!mongoose.models["AppIDSchema"]) {
    mongoose.model("AppIDSchema", AppIDSchema);
}

export const AppIDDB = mongoose.model("AppIDSchema");

const AppCodeSchema = new Schema(
    {
        userID: String,
        appID: String,

        path: String,
        content: String,
        summary: String,
    },
    { timestamps: true, versionKey: false },
);

if (mongoose.models["AppCodeSchema"]) {
    mongoose.deleteModel("AppCodeSchema");
}
if (!mongoose.models["AppCodeSchema"]) {
    mongoose.model("AppCodeSchema", AppCodeSchema);
}

export const AppCodeDB = mongoose.model("AppCodeSchema");
