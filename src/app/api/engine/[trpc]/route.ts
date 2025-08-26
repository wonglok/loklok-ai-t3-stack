import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import {
    createAppTRPCContext,
    // createAppTRPCContext,
    createTRPCContext,
    createTRPCRouter,
} from "@/server/api/trpc";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "@/server/api/trpc";
import mongoose from "mongoose";
import md5 from "md5";
import shortHash from "short-hash";
// import { toJSON } from "./_core/toJSON";
import { buildModels } from "./_core/buildModels";
import { buildProcedures } from "./_core/buildProcedures";
import { trackGlobal } from "../../_track/trackGlobal";
import { AppCodeDB } from "@/server/api/apps/models";
// import { appRouter } from "@/server/api/root";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
    return createAppTRPCContext({
        headers: req.headers,
    });
};

const buildAppRouter = async ({ appID, appHashID, phase }) => {
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
            appID,
            phase,
            appHashID,
            dbAppInstance,
        });

        let procedures = await buildProcedures({
            appID,
            phase,
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

trackGlobal[process.env.MONGO_DEVELOP] =
    trackGlobal[process.env.MONGO_DEVELOP] ||
    mongoose.connect(`${process.env.MONGO_DEVELOP}`);
let promise = trackGlobal[process.env.MONGO_DEVELOP];

const handler = async (req: NextRequest) => {
    await promise;

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

    let myTRPCRouter = createTRPCRouter({
        app: await buildAppRouter({
            phase,
            appHashID,
            appID,
        }).catch((e) => {
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
        }),
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
