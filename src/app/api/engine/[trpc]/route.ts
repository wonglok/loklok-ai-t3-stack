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
function defineMongooseModels({ appID, dbInstance, Schema, mongoose }) {
    const db = dbInstance; // useDb can be applied here if needed

    // Example schema – placeholder for future extensions
    {
        const ExampleSchema = new Schema({
            name: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        });

        if (!db.models["Example"]) {
            db.model("Example", ExampleSchema);
        }
    }

    // Task schema – core of the todo list
    {
        const TaskSchema = new Schema({
            title: { type: String, required: true, trim: true },
            description: { type: String, default: "" },
            completed: { type: Boolean, default: false },
            dueDate: { type: Date },
            priority: {
                type: Number,
                enum: [1, 2, 3], // 1 = Low, 2 = Medium, 3 = High
                default: 2
            },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        });

        // Update updatedAt on every save
        TaskSchema.pre("save", function (next) {
            this.updatedAt = new Date();
            next();
        });

        if (!db.models["Task"]) {
            db.model("Task", TaskSchema);
        }
    }

    return {
        ["Example"]: db.model("Example"),
        ["Task"]: db.model("Task")
    };
}
`;

let exampleRouter = `
function defineBackendProcedures({ models, otherProcedures, publicProcedure, protectedProcedure }) {
    const { User, Task } = models;

    return {
        ...otherProcedures,

        // Public greeting endpoint
        hello: publicProcedure
            .input(z.object({ text: z.string() }))
            .mutation(({ input }) => {
                return {
                    greeting: input.text,
                };
            }),

        // Create a new task (protected)
        createTask: protectedProcedure
            .input(
                z.object({
                    title: z.string().min(1),
                    description: z.string().optional(),
                    dueDate: z.date().optional(),
                    priority: z.number().int().min(1).max(3).default(2),
                })
            )
            .mutation(async ({ input, ctx }) => {
                const task = new Task({
                    title: input.title,
                    description: input.description || '',
                    dueDate: input.dueDate,
                    priority: input.priority,
                });
                await task.save();
                return task;
            }),

        // Retrieve all tasks for the authenticated user (protected)
        getTasks: protectedProcedure
            .mutation(async ({ ctx }) => {
                const tasks = await Task.find({}).sort({ dueDate: 1, createdAt: -1 }).lean();
                return tasks;
            }),

        // Update a task by ID (protected)
        updateTask: protectedProcedure
            .input(
                z.object({
                    id: z.string(),
                    title: z.string().optional(),
                    description: z.string().optional(),
                    dueDate: z.date().optional(),
                    priority: z.number().int().min(1).max(3).optional(),
                    completed: z.boolean().optional(),
                })
            )
            .mutation(async ({ input }) => {
                const { id, ...updates } = input;
                if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
                const task = await Task.findByIdAndUpdate(id, updates, { new: true }).lean();
                return task;
            }),

        // Delete a task by ID (protected)
        deleteTask: protectedProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input }) => {
                const result = await Task.findByIdAndDelete(input.id);
                return { success: !!result };
            }),

        // Toggle completion status of a task (protected)
        toggleComplete: protectedProcedure
            .input(z.object({ id: z.string(), completed: z.boolean() }))
            .mutation(async ({ input }) => {
                const task = await Task.findByIdAndUpdate(
                    input.id,
                    { completed: input.completed },
                    { new: true }
                ).lean();
                return task;
            }),

        // Secret message for authenticated users
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

let models = defineMongooseModels({ appID, dbInstance, Schema, mongoose });

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
    await mongoose.connect(`${process.env.MONGO_DEVELOP}`);
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
