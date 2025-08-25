import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import { ObjectId } from "mongodb";
import { AppCodeDB, AppIDDB } from "./models";

export const appCodeRouter = createTRPCRouter({
    //
    //
    create: protectedProcedure
        .input(
            z.object({
                //
                appID: z.string(),
                path: z.string(),
                summary: z.string(),
                content: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            let app = await AppIDDB.findOne({
                _id: ObjectId.createFromHexString(`${input.appID}`),
                userID: `${ctx?.session?.user?.id}`,
            });
            if (!app) {
                throw new Error("no app found");
            }

            let data = await AppCodeDB.create({
                appID: input.appID,
                path: input.path,
                summary: input.summary,
                content: input.content,
                userID: `${ctx?.session?.user?.id}`,
            });

            return JSON.parse(
                JSON.stringify({
                    ...data,
                    _id: `${data?._id}`,
                    userID: `${ctx?.session?.user?.id}`,
                }),
            );
        }),

    deleteOne: protectedProcedure
        .input(
            z.object({
                appID: z.string(),
                path: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            let app = await AppIDDB.findOne({
                _id: ObjectId.createFromHexString(`${input.appID}`),
                userID: `${ctx?.session?.user?.id}`,
            });
            if (!app) {
                throw new Error("no app found");
            }

            await AppCodeDB.deleteOne({
                userID: `${ctx?.session?.user?.id}`,
                appID: input.appID,
                path: input.path,
            });

            return { ok: true };
        }),

    resetAll: protectedProcedure
        .input(
            z.object({
                appID: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            let app = await AppIDDB.findOne({
                _id: ObjectId.createFromHexString(`${input.appID}`),
                userID: `${ctx?.session?.user?.id}`,
            });
            if (!app) {
                throw new Error("no app found");
            }

            await AppCodeDB.deleteOne({
                userID: `${ctx?.session?.user?.id}`,
                appID: input.appID,
            });

            return { ok: true };
        }),

    updateOne: protectedProcedure
        .input(
            z.object({
                //
                appID: z.string(),
                path: z.string(),
                summary: z.string(),
                content: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            let app = await AppIDDB.findOne({
                _id: ObjectId.createFromHexString(`${input.appID}`),
                userID: `${ctx?.session?.user?.id}`,
            });
            if (!app) {
                throw new Error("no app found");
            }

            await AppCodeDB.findOneAndUpdate(
                {
                    userID: `${ctx?.session?.user?.id}`,
                    appID: input.appID,
                    path: input.path,
                },
                {
                    summary: input.summary,
                    content: input.content,
                },
                {
                    upsert: true,
                    new: true,
                },
            );

            return { ok: true };
        }),

    getOne: protectedProcedure
        .input(
            z.object({
                //
                appID: z.string(),
                path: z.string(),
                summary: z.string(),
                content: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            let app = await AppIDDB.findOne({
                _id: ObjectId.createFromHexString(`${input.appID}`),
                userID: `${ctx?.session?.user?.id}`,
            });
            if (!app) {
                throw new Error("no app found");
            }

            let code = await AppCodeDB.findOne({
                userID: `${ctx?.session?.user?.id}`,
                appID: input.appID,
                path: input.path,
            });

            return JSON.parse(
                JSON.stringify({ ...code._doc, _id: `${code?._id}` }),
            );
            //
        }),

    listMy: protectedProcedure
        //
        .input(
            z.object({
                appID: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            let list = await AppCodeDB.find({
                userID: `${ctx?.session?.user?.id}`,
                appID: input.appID,
            });

            return JSON.parse(
                JSON.stringify(
                    list.map((r) => {
                        return { ...r._doc, _id: `${r._id}` };
                    }),
                ),
            );
        }),
});
