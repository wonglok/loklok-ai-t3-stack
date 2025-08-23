import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { createTRPCContext, createTRPCRouter } from "@/server/api/trpc";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import mongoose from "mongoose";
import md5 from "md5";
import shortHash from "short-hash";
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

    let appHashID = `${shortHash(md5(`${appID}${process.env.AUTH_SECRET}${process.env.NODE_ENV}`))}`;
    console.log(appHashID);

    await mongoose.connect(
        `${process.env.MONGO_DEVELOP}${process.env.MONGO_SUFFIX}`,
    );

    const dbPlatform = mongoose.connection.useDb(
        `os_${process.env.NODE_ENV}_${appHashID}`,
        {
            useCache: true,
        },
    );

    const VersionStore = new mongoose.Schema(
        {
            title: { type: String, required: false },
            description: { type: String, required: false },
            date: { type: Date, required: false },
        },
        {
            timestamps: true,
        },
    );

    if (!dbPlatform.models["VersionStore"]) {
        dbPlatform.model("VersionStore", VersionStore);
    }

    const CodeBackupStore = new mongoose.Schema(
        {
            versionID: { type: String, required: true },
            path: { type: String, required: true },
            content: { type: String },
            date: { type: Date, required: false },
        },
        {
            timestamps: true,
        },
    );

    if (!dbPlatform.models["CodeBackupStore"]) {
        dbPlatform.model("CodeBackupStore", CodeBackupStore);
    }

    const AppCodeStore = new mongoose.Schema(
        {
            path: { type: String, required: true },
            content: { type: String },
        },
        {
            timestamps: true,
        },
    );

    if (!dbPlatform.models["AppCodeStore"]) {
        dbPlatform.model("AppCodeStore", AppCodeStore);
    }

    let defineMongooseModels = await dbPlatform
        .model("AppCodeStore")
        .findOne({ path: `/models/defineMongooseModels.js` })
        .catch((r) => {
            console.log(r);
            return {
                path: `/models/defineMongooseModels.js`,
                content: ``,
            };
        });

    let defineBackendProcedures = await dbPlatform
        .model("AppCodeStore")
        .findOne({ path: `/trpc/defineBackendProcedures.js` })
        .catch((r) => {
            console.log(r);
            return {
                path: `/trpc/defineBackendProcedures.js`,
                content: ``,
            };
        });

    let toJSON = (v) => JSON.parse(JSON.stringify(v));

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
const dbInstance = args.dbInstance;
const Schema = args.Schema;

let appRouter
let models = {} 
let addons = {}

${toJSON(defineMongooseModels)?.content || ""}
${toJSON(defineBackendProcedures)?.content || ""}

try {
    
    if (typeof defineMongooseModels !== 'undefined') {
        models = defineMongooseModels({  dbInstance, Schema, mongoose });
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

        // create: protectedProcedure
        //     .input(z.object({ name: z.string().min(1) }))
        //     .mutation(async ({ input }) => {
        //         post = { id: post.id + 1, name: input.name };
        //         return post;
        //     }),

        // getLatest: protectedProcedure.mutation(() => {
        //     return post;
        // }),

        // getSecretMessage: protectedProcedure.mutation(() => {
        //     return "you can now see this secret message!";
        // }),

        

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

return appRouter;
    `,
        );

        //

        const dbAppInstance = mongoose.connection.useDb(
            `app_${process.env.NODE_ENV}_${appHashID}`,
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
            appHashID: appHashID,
            dbPlatform: dbPlatform,
            dbInstance: dbAppInstance,
            Schema: mongoose.Schema,
        });
    } catch (e) {
        console.error(e);
    }

    let platformRouter = createTRPCRouter({
        //publicProcedure
        setKV: protectedProcedure
            .input(
                z.object({
                    path: z.string(),
                    content: z.string(),
                    summary: z.string().optional(),
                }),
            )
            .mutation(async ({ input, ctx }) => {
                console.log(ctx.session.user);

                await dbPlatform.model("AppCodeStore").findOneAndUpdate(
                    {
                        path: input.path,
                    },
                    {
                        path: input.path,
                        content: input.content || "",
                        summary: input.summary || "",
                    },
                    { upsert: true },
                );

                return {
                    ok: "deployed",
                    path: input.path,
                    content: input.content,
                };
            }),
        reset: protectedProcedure
            .input(z.object({}))
            .mutation(async ({ input, ctx }) => {
                console.log(ctx.session.user);
                await dbPlatform.model("AppCodeStore").deleteMany({});
                return { ok: "reset" };
            }),
        getFiles: protectedProcedure
            .input(z.object({}))
            .mutation(async ({ input, ctx }) => {
                console.log(ctx.session.user);
                let files = await dbPlatform.model("AppCodeStore").find();
                return JSON.parse(JSON.stringify(files));
            }),
    });

    let myTRPCRouter = createTRPCRouter({
        app: appRouter,
        public: createTRPCRouter({
            getFiles: publicProcedure
                .input(z.object({}))
                .mutation(async ({ input }) => {
                    let files = await dbPlatform.model("AppCodeStore").find();
                    return JSON.parse(JSON.stringify(files));
                }),
        }),
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
