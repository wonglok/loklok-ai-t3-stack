import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { ObjectId } from "mongodb";
import { AppIDDB } from "./models";

export const appInstanceRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ input, ctx }) => {
            let data = await AppIDDB.create({
                name: input.name,
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
        .input(z.object({ _id: z.string().min(1) }))
        .mutation(async ({ input, ctx }) => {
            await AppIDDB.deleteOne({
                userID: `${ctx.session.user.id}`,
                _id: ObjectId.createFromHexString(`${input._id}`),
            });

            return { ok: true };
        }),

    updateOne: protectedProcedure
        .input(z.object({ _id: z.string().min(1), name: z.string() }))
        .mutation(async ({ input, ctx }) => {
            await AppIDDB.findOneAndUpdate(
                {
                    userID: `${ctx.session.user.id}`,
                    _id: ObjectId.createFromHexString(`${input._id}`),
                },
                {
                    name: input.name,
                },
            );

            return { ok: true };
        }),

    getOne: protectedProcedure
        .input(z.object({ _id: z.string().min(1) }))
        .mutation(async ({ input, ctx }) => {
            let data = await AppIDDB.findOne({
                _id: ObjectId.createFromHexString(`${input._id}`),
                userID: `${ctx?.session?.user?.id}`,
            });

            return JSON.parse(
                JSON.stringify({
                    ...data,
                    _id: `${data?._id}`,
                }),
            );
        }),

    listMy: protectedProcedure
        //
        .input(z.object({}))
        .mutation(async ({ ctx }) => {
            let list = await AppIDDB.find({
                userID: `${ctx?.session?.user?.id}`,
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
