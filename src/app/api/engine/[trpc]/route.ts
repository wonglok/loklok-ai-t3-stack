import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { createTRPCContext, createTRPCRouter } from "@/server/api/trpc";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "@/server/api/trpc";

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

const appRouter = createTRPCRouter({
    //

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

    let appRouter = await func({
        createTRPCRouter,
        protectedProcedure,
        publicProcedure,
        z,
        post,
    });

    console.log(appRouter);

    // let myTRPCRouter = createTRPCRouter({
    //     app: appRouter,
    // });

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
