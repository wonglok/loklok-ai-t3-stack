import mongoose from "mongoose";
import { toJSON } from "./toJSON";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import z from "zod";

export const buildModels = async ({
    dbAppInstance,
    appHashID,
    dbPlatform,
    phase,
}) => {
    //
    let defineMongooseModels = await dbPlatform
        .model("AppCodeStore")
        .findOne({ path: `/models/defineMongooseModels.js` })
        .lean()
        .catch((r) => {
            return {
                path: `/models/defineMongooseModels.js`,
                content: ``,
            };
        });

    let defineMongooseModelsContent =
        toJSON(defineMongooseModels)?.content || "";

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

let appRouter;
let models = {};

${defineMongooseModelsContent}

try {
    if (typeof defineMongooseModels !== 'undefined') {
        models = defineMongooseModels({  dbInstance, Schema, mongoose });
    }
} catch (e) {
    console.error(e);
}

return models;
    `,
    );

    //

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
        });
    } catch (e) {
        console.log(e);

        output = {};
    }

    return output;
};
