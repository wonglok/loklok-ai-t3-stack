import mongoose from "mongoose";
import { toJSON } from "./toJSON";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import z from "zod";

export const buildProcedures = async ({
    appHashID,
    dbPlatform,
    phase,
    models,
}) => {
    // User.find({ username: {$regex : "^" + req.params.username} });

    let defineBackendProceduresContent = "";

    let queryResult = await dbPlatform
        .model("AppCodeStore")
        .find({ path: { $regex: "^" + "/trpc" } })
        .lean();

    let data = queryResult.map((r) => {
        r = { ...r };
        delete r.__v;
        return { ...r, _id: `${r._id}` };
    });

    console.log("trpcProcedures", data);

    for await (let item of data) {
        defineBackendProceduresContent += item.content + "\n";
    }

    // let defineBackendProceduresContent =
    //     toJSON(defineBackendProcedures)?.content || "";

    let func = new Function(
        `args`,
        `
const createTRPCRouter = args.createTRPCRouter;
const protectedProcedure = args.protectedProcedure;
const publicProcedure = args.publicProcedure;
const z = args.z;
const post = args.post;
const mongoose = args.mongoose;
const dbInstance = args.dbInstance;
const Schema = args.Schema;
const models = args.models;

let procedures = {};

${defineBackendProceduresContent}

try {
    if (typeof defineBackendProcedures !== 'undefined') {
        procedures = defineBackendProcedures({ z, models, otherProcedures: {}, publicProcedure, protectedProcedure })
    }
} catch (e) {
    console.error(e);
}

return procedures;
    `,
    );

    const dbAppInstance = mongoose.connection.useDb(
        `app_${phase}_${appHashID}`,
        {
            useCache: true,
        },
    );

    let output;

    try {
        output = func({
            createTRPCRouter,
            protectedProcedure,
            publicProcedure,
            z,
            mongoose,
            appHashID: appHashID,
            dbPlatform: dbPlatform,
            dbInstance: dbAppInstance,
            Schema: mongoose.Schema,
            models: models,
        });
    } catch (e) {
        output = {};
    }

    return output;
};
