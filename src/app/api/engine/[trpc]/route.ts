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

let post = {
    id: 1,
    name: "Hello World",
};

let appManifest = {
    databaseCollections: [
        {
            CollectionName: "tasks",
            slug: "tasks",
        },
        {
            CollectionName: "users",
            slug: "users",
        },
    ],
    tRPCBackEnd: [
        {
            procedureName: "auth.login",
            slug: "auth-login",
        },
        {
            procedureName: "auth.register",
            slug: "auth-register",
        },
        {
            procedureName: "task.create",
            slug: "task-create",
        },
        {
            procedureName: "task.getAll",
            slug: "task-getAll",
        },
        {
            procedureName: "task.update",
            slug: "task-update",
        },
        {
            procedureName: "task.delete",
            slug: "task-delete",
        },
    ],
    tRPCFrontEnd: [
        {
            procedureName: "auth.login",
            slug: "auth-login",
        },
        {
            procedureName: "auth.register",
            slug: "auth-register",
        },
        {
            procedureName: "task.create",
            slug: "task-create",
        },
        {
            procedureName: "task.getAll",
            slug: "task-getAll",
        },
        {
            procedureName: "task.update",
            slug: "task-update",
        },
        {
            procedureName: "task.delete",
            slug: "task-delete",
        },
    ],
    zustandFrontEnd: [
        {
            name: "authState",
            defaultRawJSON: "false",
        },
        {
            name: "taskState",
            defaultRawJSON: "[]",
        },
    ],
};

let exampleCollectionDB = `
function addModel ({ Schema, appID, dbInstance, mongoose }) {
    const db = dbInstance // use your connection instance

    /* ---------- User Schema ----------
       Fields:
         - email: unique string, required
         - name: string
         - createdAt: date, default now
    */
    {
        const UserSchema = new Schema({
            email: { type: String, required: true, unique: true },
            name:  { type: String, required: false },
            createdAt: { type: Date, default: Date.now }
        });

        if (!db.models["User"]) {
            db.model("User", UserSchema);
        }
    }

    /* ---------- Category Schema ----------
       Fields:
         - title: string, required
         - description: string
         - color: hex string, default "#000000"
         - user: ObjectId reference to User
    */
    {
        const CategorySchema = new Schema({
            title: { type: String, required: true },
            description: { type: String, default: "" },
            color: { type: String, default: "#000000" },
            user: { type: Schema.Types.ObjectId, ref: "User", required: true }
        });

        if (!db.models["Category"]) {
            db.model("Category", CategorySchema);
        }
    }

    /* ---------- Expense Schema ----------
       Fields:
            - amount: number, required
            - date: Date, default now
            - description: string
            - category: ObjectId reference to Category
            - user: ObjectId reference to User
    */
    {
        const ExpenseSchema = new Schema({
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now },
            description: { type: String, default: "" },
            category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
            user: { type: Schema.Types.ObjectId, ref: "User", required: true }
        });

        if (!db.models["Expense"]) {
            db.model("Expense", ExpenseSchema);
        }
    }

    return {
        ["User"]: db.model("User"),
        ["Category"]: db.model("Category"),
        ["Expense"]: db.model("Expense")
    };
}

`;

let exampleRouter = `
function defineBackendProcedures({ models, otherProcedures, publicProcedure, protectedProcedure }) {
    const { User, Category, Expense } = models;

    return {
        ...otherProcedures,

        hello: publicProcedure
            .input(z.object({ text: z.string() }))
            .mutation(({ input }) => {
                return {
                    greeting: input.text,
                };
            }),

        createUser: protectedProcedure
            .input(z.object({ email: z.string().email(), name: z.string().optional() }))
            .mutation(async ({ input, ctx }) => {
                const user = new User({
                    email: input.email,
                    name: input.name || '',
                });
                await user.save();
                return { id: user._id.toString(), email: user.email, name: user.name };
            }),

        getUsers: protectedProcedure.query(async ({ ctx }) => {
            const users = await User.find({});
            return users.map(u => ({ id: u._id.toString(), email: u.email, name: u.name }));
        }),

        createCategory: protectedProcedure
            .input(z.object({ title: z.string().min(1), description: z.string().optional(), color: z.string().default('#000000') }))
            .mutation(async ({ input, ctx }) => {
                const category = new Category({
                    title: input.title,
                    description: input.description || '',
                    color: input.color,
                    user: ctx.user.id,
                });
                await category.save();
                return { id: category._id.toString(), title: category.title, description: category.description, color: category.color };
            }),

        getCategories: protectedProcedure.query(async ({ ctx }) => {
            const categories = await Category.find({ user: ctx.user.id });
            return categories.map(c => ({
                id: c._id.toString(),
                title: c.title,
                description: c.description,
                color: c.color,
            }));
        }),

        addExpense: protectedProcedure
            .input(z.object({
                amount: z.number().positive(),
                date: z.string().optional(),
                description: z.string().optional(),
                categoryId: z.string().min(1),
            }))
            .mutation(async ({ input, ctx }) => {
                const expense = new Expense({
                    amount: input.amount,
                    date: input.date ? new Date(input.date) : new Date(),
                    description: input.description || '',
                    category: input.categoryId,
                    user: ctx.user.id,
                });
                await expense.save();
                return { id: expense._id.toString(), amount: expense.amount, date: expense.date, description: expense.description };
            }),

        getExpenses: protectedProcedure
            .input(z.object({ limit: z.number().optional(), skip: z.number().optional() }))
            .query(async ({ input, ctx }) => {
                const limit = input.limit ?? 50;
                const skip = input.skip ?? 0;
                const expenses = await Expense.find({ user: ctx.user.id })
                    .sort({ date: -1 })
                    .skip(skip)
                    .limit(limit);
                return expenses.map(e => ({
                    id: e._id.toString(),
                    amount: e.amount,
                    date: e.date,
                    description: e.description,
                    categoryId: e.category.toString(),
                }));
            }),

        getSecretMessage: protectedProcedure.mutation(() => {
            return "you can now see this secret message!";
        }),
    };
}
`;

const handler = async (req: NextRequest) => {
    let appID = req.headers.get("app-id");

    console.log(appID);

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
const Schema = args.Schema

${exampleCollectionDB}
${exampleRouter}

let models = addModel({ appID, dbInstance, Schema, mongoose });

let addons = defineBackendProcedures({ models, otherProcedures: {}, publicProcedure, protectedProcedure })

const appRouter = createTRPCRouter({
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


    //
});

return appRouter
    `,
    );

    //
    const dbInstance = mongoose.connection.useDb(`development_${appID}`, {
        useCache: true,
    });

    let appRouter = await func({
        createTRPCRouter,
        protectedProcedure,
        publicProcedure,
        z,
        post,
        mongoose,
        appID,
        dbInstance,
        Schema: mongoose.Schema,
    });

    let myTRPCRouter = createTRPCRouter({
        app: appRouter,
    });

    return fetchRequestHandler({
        endpoint: "/api/engine",
        req,
        router: appRouter,
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
