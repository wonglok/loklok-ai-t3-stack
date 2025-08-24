import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext, createTRPCRouter } from "@/server/api/trpc";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import mongoose from "mongoose";
import md5 from "md5";
import shortHash from "short-hash";
// import { appRouter } from "@/server/api/root";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    await mongoose.connect(`${process.env.MONGO_DEVELOP}`);

    let appID = req.headers.get("app-id");

    let appHashID = `${shortHash(md5(`${appID}${process.env.NODE_ENV}${process.env.AUTH_SECRET}`))}`;

    let JWT_SECRET = `_${appID}_${md5(appID + "--" + appID + "--" + appHashID)}`;

    let phase = "dev";
    if (process.env.NODE_ENV === "development") {
        phase = "dev";
    }
    if (process.env.NODE_ENV === "production") {
        phase = "prod";
    }
    if (process.env.NODE_ENV === "test") {
        phase = "test";
    }

    console.log(appID);
    console.log(appHashID);

    const dbPlatform = mongoose.connection.useDb(`os_${phase}_${appHashID}`, {
        useCache: true,
    });

    const AppCodeStore = new mongoose.Schema(
        {
            versionID: { type: String, required: false },
            path: { type: String, required: true },
            summary: { type: String, required: true },
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
        .lean()
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
        .lean()
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

    let defineMongooseModelsContent =
        toJSON(defineMongooseModels)?.content || "";
    let defineBackendProceduresContent =
        toJSON(defineBackendProcedures)?.content || "";

    //     if (process.env.NODE_ENV === "development") {
    //         console.log(`
    // /////
    // ${defineMongooseModelsContent}
    // /////
    // ${defineBackendProceduresContent}
    // //// Develop
    // `);
    //     }

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

const jwt = args.jwt;
const bcrypt = args.bcrypt;
const JWT_SECRET = args.JWT_SECRET;

let appRouter;
let models = {}; 
let addons = {};

${defineMongooseModelsContent}

${defineBackendProceduresContent}

try {
    
    if (typeof defineMongooseModels !== 'undefined') {
        models = defineMongooseModels({  dbInstance, Schema, mongoose });
    }

    if (typeof defineBackendProcedures !== 'undefined') {
        addons = defineBackendProcedures({ z, models, otherProcedures: {}, publicProcedure, protectedProcedure, jwt, bcrypt, JWT_SECRET })
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
            `app_${phase}_${appHashID}`,
            {
                useCache: true,
            },
        );

        // // you can reuse this for any procedure
        // const protectedProcedureApp = t.procedure.use(
        //     async function isAuthed(opts) {
        //         let authtoken = opts.ctx.headers.get("authtoken");

        //         console.log("authtoken", authtoken);
        //         console.log("authtoken", authtoken);
        //         console.log("authtoken", authtoken);

        //         if (typeof authtoken === "string" && authtoken !== "") {
        //             //

        //             let userData = (await jwt.verify(
        //                 authtoken,
        //                 JWT_SECRET,
        //             )) as { id: string };

        //             console.log("userData", userData);
        //             console.log("userData", userData);
        //             console.log("userData", userData);

        //             let found = await dbAppInstance
        //                 .model("User")
        //                 .findOne({ _id: `${userData.id}` })
        //                 .lean();

        //             console.log("found", found);
        //             console.log("found", found);
        //             console.log("found", found);

        //             if (found) {
        //                 return opts.next({
        //                     ctx: {
        //                         ...(opts?.ctx || {}),
        //                         session: {
        //                             ...(opts?.ctx?.session || {}),
        //                             appUser: found,
        //                         },
        //                         // ✅ user value is known to be non-null now
        //                         // user: ctx.user,
        //                         // ^?
        //                     },
        //                 });
        //             }
        //             //
        //         }

        //         const { ctx } = opts;
        //         if ((ctx.session as any).appUser) {
        //             throw new TRPCError({
        //                 code: "UNAUTHORIZED",
        //                 message: "no login",
        //             });
        //         }
        //         //

        //         return opts;
        //     },
        // );

        appRouter = await func({
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
            JWT_SECRET: JWT_SECRET,
        });
    } catch (e) {
        console.error(e);
    }

    let platformRouter = createTRPCRouter({
        //publicProcedure
        setFS: protectedProcedure
            .input(
                z.object({
                    path: z.string(),
                    content: z.string(),
                    summary: z.string().optional(),
                }),
            )
            .mutation(async ({ input, ctx }) => {
                // console.log(ctx.session.user);

                let updated = await dbPlatform
                    .model("AppCodeStore")
                    .findOneAndUpdate(
                        {
                            path: input.path,
                        },
                        {
                            path: input.path,
                            content: input.content || "",
                            summary: input.summary || "",
                        },
                        { ["upsert"]: true, ["new"]: true },
                    );
                return {
                    ok: "deployed",
                    path: updated.path,
                    content: updated.content,
                };
            }),
        reset: protectedProcedure
            .input(z.object({}))
            .mutation(async ({ input, ctx }) => {
                // console.log(ctx.session.user);
                await dbPlatform.model("AppCodeStore").deleteMany({});
                return { ok: "reset" };
            }),
        getFiles: protectedProcedure
            .input(z.object({}))
            .mutation(async ({ input, ctx }) => {
                // console.log(ctx.session.user);
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
        createContext: () => createContext(req),
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
