import mongoose from "mongoose";
import {
    createTRPCRouter,
    protectedAppProcedure,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import z from "zod";

import { ObjectId } from "mongodb";
import { transform } from "sucrase";
import { AppCodeDB } from "@/server/api/apps/models";
export const buildModels = async ({
    dbAppInstance,
    appHashID,
    phase,
    appID,
}) => {
    //
    let defineMongooseModelsContent = "";

    let queryResult = await AppCodeDB.find({
        appID: appID,
        path: { $regex: "^" + "/models" },
    });

    let data = queryResult.map((r) => {
        r = { ...r };
        delete r.__v;
        return { ...r._doc, _id: `${r._id}` };
    });

    for await (let item of data) {
        try {
            console.log("transform sucrase:", item.path);
            let es6 = transform(item.content || "", {
                transforms: ["jsx", "typescript"],
                preserveDynamicImport: true,
                production: false,
                jsxPragma: "React.createElement",
                jsxFragmentPragma: "React.Fragment",
            }).code;

            defineMongooseModelsContent +=
                `
            try {
                ${es6}
            } catch (e) {
                console.log('error at',${JSON.stringify(item.path)})
                console.error(e.message);
            }
` + "\n";
        } catch (e) {
            console.log("error", item.path);
        }
    }

    //

    let output;
    try {
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

        output = func({
            createTRPCRouter,
            protectedProcedure: protectedAppProcedure,
            publicProcedure,
            z,
            mongoose,
            appHashID: appHashID,
            dbInstance: dbAppInstance,
            Schema: mongoose.Schema,
            ObjectId: ObjectId,
        });
    } catch (e) {
        console.log(e);

        console.log(defineMongooseModelsContent);
        console.log(data.map((r) => r.path).join("\n"));

        output = {};
    }

    return output;
};
