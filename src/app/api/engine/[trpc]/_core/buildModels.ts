import mongoose from "mongoose";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import z from "zod";
import { toJSON } from "./toJSON";
import { ObjectId } from "mongodb";

export const buildModels = async ({
    dbAppInstance,
    appHashID,
    dbPlatform,
    phase,
    appID,
}) => {
    //
    let defineMongooseModelsContent = "";

    let queryResult = await dbPlatform
        .model("AppCodeStore")
        .find({ path: { $regex: "^" + "/models" } })
        .lean();

    let data = queryResult.map((r) => {
        r = { ...r };
        delete r.__v;
        return { ...r, _id: `${r._id}` };
    });

    for await (let item of data) {
        defineMongooseModelsContent +=
            `try {
                ${item.content}
            } catch (e) {
                console.log(${JSON.stringify(item.path)})
                console.error(e);
            }
        ` + "\n";
    }

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
const ObjectId = args.ObjectId;

let appRouter;
let allModels = {};

${defineMongooseModelsContent}

return allModels;
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
            ObjectId: ObjectId,
        });
    } catch (e) {
        console.log(e);

        output = {};
    }

    return output;
};
