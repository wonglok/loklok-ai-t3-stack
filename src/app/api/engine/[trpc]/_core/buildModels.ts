import mongoose from "mongoose";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import z from "zod";
import { toJSON } from "./toJSON";
import { ObjectId } from "mongodb";
import { transform } from "sucrase";
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
        console.log("transform sucrase:", item.path);
        let es6 = transform(item.content || "", {
            transforms: ["jsx", "typescript"],
            preserveDynamicImport: true,
            production: false,
            jsxPragma: "React.createElement",
            jsxFragmentPragma: "React.Fragment",
        }).code;

        defineMongooseModelsContent +=
            `try {
                ${es6}
            } catch (e) {
                console.log('error at',${JSON.stringify(item.path)})
                console.error(e.message);
            }
        ` + "\n";
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

        console.log(defineMongooseModelsContent);
        console.log(data.map((r) => r.path).join("\n"));

        output = {};
    }

    return output;
};
