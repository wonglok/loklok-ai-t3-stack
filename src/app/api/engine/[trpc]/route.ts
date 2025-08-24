import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { createTRPCContext, createTRPCRouter } from "@/server/api/trpc";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import mongoose from "mongoose";
import md5 from "md5";
import shortHash from "short-hash";
import { toJSON } from "./_func/toJSON";
import { buildModels } from "./_func/buildModels";
import { buildProcedures } from "./_func/buildProcedures";
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

const buildAppRouter = async ({ appHashID, dbPlatform, phase }) => {
    try {
        let buildAppRouter = new Function(
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
const procedures = args.procedures;

let appRouter;
try {
    appRouter = createTRPCRouter({
        ...procedures,
            
        hello: publicProcedure
            .input(z.object({ text: z.string() }))
            .mutation(({ input }) => {
                return {
                    greeting: input.text,
                };
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

        let models = await buildModels({
            phase,
            dbPlatform,
            appHashID,
            dbAppInstance,
        });

        let procedures = await buildProcedures({
            phase,
            dbPlatform,
            appHashID,
            models,
        });

        return await buildAppRouter({
            createTRPCRouter,
            protectedProcedure,
            publicProcedure,
            z,
            mongoose,
            appHashID: appHashID,
            dbPlatform: dbPlatform,
            dbInstance: dbAppInstance,
            Schema: mongoose.Schema,
            procedures: procedures,
        });
    } catch (e) {
        console.error(e);

        return createTRPCRouter({
            hello: publicProcedure
                .input(z.object({ text: z.string() }))
                .mutation(({ input }) => {
                    return {
                        greeting: input.text,
                    };
                }),
        });
    }
};

const handler = async (req: NextRequest) => {
    await mongoose.connect(`${process.env.MONGO_DEVELOP}`);

    let appID = req.headers.get("app-id");

    let appHashID = `${shortHash(md5(`${appID}${process.env.NODE_ENV}${process.env.AUTH_SECRET}`))}`;

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

    console.log("appID", appID);
    console.log("appHashID", appHashID);
    console.log("phase", phase);

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

    let platformRouter = createTRPCRouter({
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
                let queryResult = await dbPlatform.model("AppCodeStore").find();

                let data = queryResult.map((r) => {
                    r = { ...r };
                    delete r.__v;
                    return { ...r, _id: `${r._id}` };
                });

                return data;
            }),
    });

    let rootRouter = createTRPCRouter({
        app: await buildAppRouter({ phase, dbPlatform, appHashID }).catch(
            (e) => {
                //

                // console.log(e);

                return createTRPCRouter({
                    hello: publicProcedure
                        .input(z.object({ text: z.string() }))
                        .mutation(({ input }) => {
                            return {
                                greeting: input.text,
                            };
                        }),
                });
            },
        ),
        public: createTRPCRouter({
            getFiles: publicProcedure
                .input(z.object({}))
                .mutation(async ({ input }) => {
                    let queryResult = await dbPlatform
                        .model("AppCodeStore")
                        .find();

                    let data = queryResult.map((r) => {
                        r = { ...r };
                        delete r.__v;
                        return { ...r, _id: `${r._id}` };
                    });

                    return data;
                }),
        }),
        platform: platformRouter,
    });

    return fetchRequestHandler({
        endpoint: "/api/engine",
        req,
        router: rootRouter,
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
