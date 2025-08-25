import mongoose from "mongoose";
import { toJSON } from "./toJSON";
import {
    createTRPCRouter,
    getInfoByAppID,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import z from "zod";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { transform } from "sucrase";

export const buildProcedures = async ({
    appHashID,
    dbPlatform,
    phase,
    models,
    appID,
}) => {
    let info = getInfoByAppID(appID);
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

    // console.log("trpcProcedures", data);

    for await (let item of data) {
        console.log("transform sucrase:", item.path);
        let es6 = transform(item.content || "", {
            transforms: ["jsx", "typescript"],
            preserveDynamicImport: true,
            production: false,
            jsxPragma: "React.createElement",
            jsxFragmentPragma: "React.Fragment",
        }).code;

        defineBackendProceduresContent +=
            `try {
                ${es6}
            } catch (e) {
                console.log(${JSON.stringify(item.path)})
                console.error(e.message);
            }
        ` + "\n";
    }

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

const jwt = args.jwt;
const bcrypt = args.bcrypt;
const JWT_SECRET = args.JWT_SECRET;
const models = args.models;

let rootRouter = {};

${defineBackendProceduresContent}

return rootRouter;
    `,
        );

        const dbAppInstance = mongoose.connection.useDb(
            `app_${phase}_${appHashID}`,
            {
                useCache: true,
            },
        );

        output = func({
            createTRPCRouter: createTRPCRouter,
            protectedProcedure: protectedProcedure,
            publicProcedure: publicProcedure,
            z,
            mongoose,
            appHashID: appHashID,
            dbPlatform: dbPlatform,
            dbInstance: dbAppInstance,
            Schema: mongoose.Schema,
            jwt: jwt,
            bcrypt: bcrypt,
            JWT_SECRET: info.JWT_SECRET,
            ObjectId: ObjectId,
            models: models,
        });
    } catch (e) {
        console.log(defineBackendProceduresContent);
        output = {};
    }

    return output;
};
