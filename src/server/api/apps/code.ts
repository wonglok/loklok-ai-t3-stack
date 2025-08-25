import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";

const AppCodeSchema = new Schema(
    {
        name: String,
        userID: String,
    },
    { timestamps: true, versionKey: false },
);

if (mongoose.models["AppCodeSchema"]) {
    mongoose.deleteModel("AppCodeSchema");
}
if (!mongoose.models["AppCodeSchema"]) {
    mongoose.model("AppCodeSchema", AppCodeSchema);
}

const AppCodeDB = mongoose.model("AppCodeSchema");

export const appInstanceRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ input, ctx }) => {
            let data = await AppCodeDB.create({
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
            await AppCodeDB.deleteOne({
                userID: `${ctx.session.user.id}`,
                _id: ObjectId.createFromHexString(`${input._id}`),
            });

            return { ok: true };
        }),

    updateOne: protectedProcedure
        .input(z.object({ _id: z.string().min(1), name: z.string() }))
        .mutation(async ({ input, ctx }) => {
            await AppCodeDB.findOneAndUpdate(
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
            let data = await AppCodeDB.findOne({
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
            let list = await AppCodeDB.find({
                userID: `${ctx?.session?.user?.id}`,
            });

            // console.log(list);

            return JSON.parse(
                JSON.stringify(
                    list.map((r) => {
                        return { ...r._doc, _id: `${r._id}` };
                    }),
                ),
            );
        }),
});
