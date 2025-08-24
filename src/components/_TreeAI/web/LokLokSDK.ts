import {
    createTRPCClient,
    httpBatchStreamLink,
    TRPCClient,
} from "@trpc/client";
import { AnyRouter } from "@trpc/server";
import SuperJSON from "superjson";

export class LokLokSDK {
    public client: TRPCClient<AnyRouter>;
    private appID: string;
    constructor({ appID }) {
        this.appID = appID;
        function getBaseUrl() {
            if (typeof window !== "undefined") return window.location.origin;
            if (process.env.VERCEL_URL)
                return "https://" + process.env.VERCEL_URL;
            return "http://localhost:" + (process.env.PORT || 3000);
        }

        const client = createTRPCClient<AnyRouter>({
            links: [
                httpBatchStreamLink({
                    transformer: SuperJSON as any,
                    url: `${getBaseUrl()}/api/engine`,
                    headers: () => {
                        const headers = new Headers();
                        headers.set("x-trpc-source", "nextjs-react");
                        headers.set("app-id", appID);
                        headers.set(
                            "authtoken",
                            localStorage.getItem("jwt_" + appID) || "",
                        );

                        return headers;
                    },
                }),
            ],
        });

        this.client = client;
    }
    async setAuthToken(token) {
        localStorage.setItem("jwt_" + this.appID, `${token}`);
    }

    async runTRPC({ procedure = "hello", input }) {
        return (this.client["app"][procedure] as any)
            .mutate(input)
            .then((data) => {
                // console.log("data", data);
                return data;
            });
    }

    async setupPlatform({ procedure = "setFS", input }) {
        return (this.client["platform"][procedure] as any)
            .mutate(input)
            .then((data) => {
                console.log("setup-platform-call", data);
                return data;
            });
    }

    async publicRPC({ procedure = "getFiles", input }) {
        return (this.client["public"][procedure] as any)
            .mutate(input)
            .then((data) => {
                return data;
            });
    }
}

declare global {
    interface Window {
        trpcSDK?: LokLokSDK;
    }
}
