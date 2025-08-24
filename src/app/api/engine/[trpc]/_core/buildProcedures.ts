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
        defineBackendProceduresContent +=
            `try {
                ${item.content}
            } catch (e) {
                console.log(${JSON.stringify(item.path)})
                console.error(e);
            }
        ` + "\n";
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
const ObjectId = args.ObjectId;

const jwt = args.jwt;
const bcrypt = args.bcrypt;
const JWT_SECRET = args.JWT_SECRET;
const models = args.models;

let allProcedures = {};

${defineBackendProceduresContent}

return allProcedures;
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
        output = {};
    }

    return output;
};
