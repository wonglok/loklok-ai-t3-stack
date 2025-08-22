import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { createTRPCContext, createTRPCRouter } from "@/server/api/trpc";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import mongoose from "mongoose";
// import { appRouter } from "@/server/api/root";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
    return createTRPCContext({
        headers: req.headers,
    });
};

const handler = async (req: NextRequest) => {
    let appID = req.headers.get("app-id");

    console.log(appID);

    const dbPlatform = mongoose.connection.useDb(`platform_app_meta_${appID}`, {
        useCache: true,
    });

    const CodeKVStore = new mongoose.Schema({
        key: { type: String, required: true },
        value: { type: String },
    });

    if (!dbPlatform.models["CodeKVStore"]) {
        dbPlatform.model("CodeKVStore", CodeKVStore);
    }

    let defineMongooseModels = await dbPlatform
        .model("CodeKVStore")
        .findOne({ key: `/models/defineMongooseModels.js` })
        .catch((r) => {
            console.log(r);
            return {
                key: `/models/defineMongooseModels.js`,
                value: ``,
            };
        });

    let defineBackendProcedures = await dbPlatform
        .model("CodeKVStore")
        .findOne({ key: `/trpc/defineBackendProcedures.js` })
        .catch((r) => {
            console.log(r);
            return {
                key: `/trpc/defineBackendProcedures.js`,
                value: ``,
            };
        });

    console.log(defineBackendProcedures?.value, defineMongooseModels?.value);
    let post = {
        id: 1,
        name: "Hello World",
    };
    let appRouter = createTRPCRouter({
        hello: publicProcedure
            .input(z.object({ text: z.string() }))
            .mutation(({ input }) => {
                return {
                    greeting: input.text,
                };
            }),
    });
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
const appID = args.appID;
const dbInstance = args.dbInstance;
const Schema = args.Schema;

let appRouter
let models = {} 
let addons = {}

${defineMongooseModels?.value || ""}
${defineBackendProcedures?.value || ""}

try {
    
    if (typeof defineMongooseModels !== 'undefined') {
        models = defineMongooseModels({ appID, dbInstance, Schema, mongoose });
    }

    if (typeof defineBackendProcedures !== 'undefined') {
        addons = defineBackendProcedures({ models, otherProcedures: {}, publicProcedure, protectedProcedure })
    }

    appRouter = createTRPCRouter({
        //
        ...addons,
            
        hello: publicProcedure
            .input(z.object({ text: z.string() }))
            .mutation(({ input }) => {
                return {
                    greeting: input.text,
                };
            }),

        create: protectedProcedure
            .input(z.object({ name: z.string().min(1) }))
            .mutation(async ({ input }) => {
                post = { id: post.id + 1, name: input.name };
                return post;
            }),

        getLatest: protectedProcedure.mutation(() => {
            return post;
        }),

        getSecretMessage: protectedProcedure.mutation(() => {
            return "you can now see this secret message!";
        }),

        

    });
} catch (e) {
    console.error(e);
    appRouter = createTRPCRouter({
        hello: publicProcedure
            .input(z.object({ text: z.string() }))
            .mutation(({ input }) => {
                return {
                    greeting: input.text,
                };
            }),
    })
}


return appRouter
    `,
        );

        //

        await mongoose.connect(`${process.env.MONGO_DEVELOP}`);
        const dbAppInstance = mongoose.connection.useDb(
            `development_${appID}`,
            {
                useCache: true,
            },
        );

        appRouter = await func({
            createTRPCRouter,
            protectedProcedure,
            publicProcedure,
            z,
            mongoose,
            appID,
            dbPlatform: dbPlatform,
            dbInstance: dbAppInstance,
            Schema: mongoose.Schema,
        });
    } catch (e) {
        console.error(e);
    }

    let platformRouter = createTRPCRouter({
        setKV: protectedProcedure
            .input(z.object({ key: z.string(), value: z.string() }))
            .mutation(async ({ input }) => {
                await dbPlatform.model("CodeKVStore").updateOne(
                    {
                        key: input.key,
                    },
                    {
                        value: input.value,
                    },
                    { upsert: true },
                );

                return post;
            }),
    });

    let myTRPCRouter = createTRPCRouter({
        app: appRouter,
        platform: platformRouter,
    });

    return fetchRequestHandler({
        endpoint: "/api/engine",
        req,
        router: myTRPCRouter,
        createContext: () => {
            return createContext(req);
        },
        onError:
            env.NODE_ENV === "development"
                ? ({ path, error }) => {
                      console.error(
                          `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
                      );
                  }
                : undefined,
    });
};

export { handler as GET, handler as POST };
