```typescript

const client = await createTRPCClient({
    links: [
        // loggerLink({
        //     enabled: (op) =>
        //         process.env.NODE_ENV === "development" ||
        //         (op.direction === "down" &&
        //             op.result instanceof Error),
        // }),
        httpBatchStreamLink({
            transformer: SuperJSON as any,
            url: getBaseUrl() + "/api/engine",
            headers: () => {
                const headers = new Headers();
                headers.set(
                    "x-trpc-source",
                    "nextjs-react",
                );
                return headers;
            },
        }),
    ],
});

function getBaseUrl() {
    if (typeof window !== "undefined")
        return window.location.origin;
    if (process.env.VERCEL_URL)
        return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:${process.env.PORT ?? 3000}`;
}

client.hello.mutate({ text: "from app" }).then((data) => {
    console.log(data);
});

```