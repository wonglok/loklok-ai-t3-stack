import { AppRouter } from "@/server/api/root";
import {
    createTRPCClient,
    httpBatchStreamLink,
    TRPCClient,
} from "@trpc/client";
import { AnyRouter } from "@trpc/server";
import SuperJSON from "superjson";

export class LokLokSDK {
    public client: TRPCClient<AnyRouter>;
    public platform: TRPCClient<AppRouter>;
    private appID: string;
    constructor({ appID }) {
        this.appID = appID;

        function getBaseUrl() {
            if (typeof window !== "undefined") return window.location.origin;
            if (process.env.VERCEL_URL)
                return "https://" + process.env.VERCEL_URL;
            return "http://localhost:" + (process.env.PORT || 3000);
        }

        this.client = createTRPCClient<AnyRouter>({
            links: [
                httpBatchStreamLink({
                    transformer: SuperJSON as any,
                    url: `${getBaseUrl()}/api/engine`,
                    headers: () => {
                        const headers = new Headers();

                        let auth = localStorage.getItem("jwt_" + appID) || "";
                        headers.set("authtoken", auth);

                        headers.set("x-trpc-source", "nextjs-react-app");
                        headers.set("app-id", appID);

                        return headers;
                    },
                }),
            ],
        });

        this.platform = createTRPCClient<AppRouter>({
            links: [
                httpBatchStreamLink({
                    transformer: SuperJSON as any,
                    url: `${getBaseUrl()}/api/trpc`,
                    headers: () => {
                        const headers = new Headers();
                        headers.set("x-trpc-source", "nextjs-react-app");
                        headers.set("app-id", appID);

                        return headers;
                    },
                }),
            ],
        });
    }

    async setAuthToken(token) {
        localStorage.setItem("jwt_" + this.appID, `${token}`);
    }
    async getAuthToken() {
        return localStorage.getItem("jwt_" + this.appID);
    }

    async runTRPC({ procedure = "hello", input }) {
        let app = this.client["app"];
        let caller = app;
        let list = procedure.split(".");

        for (let each of list) {
            if (caller[each]) {
                caller = caller[each];
            }
        }

        return (caller as any).mutate(input).then((data) => {
            return data;
        });
    }

    async setupPlatform({ procedure = "setFS", input }) {
        //
        if (procedure === "setFS") {
            return this.platform.code.updateOne
                .mutate({
                    appID: this.appID,
                    path: input.path,
                    content: input.content,
                    summary: input.summary,
                })
                .then((data) => {
                    console.log("setup-code", input.path);

                    return data;
                });
        } else if (procedure === "reset") {
            return this.platform.code.resetAll
                .mutate({
                    appID: this.appID,
                })
                .then((data) => {
                    console.log("reset-all", data);

                    return data;
                });
        }
    }
    async publicRPC({ procedure = "getFiles", input }) {
        return this.platform.code.listMy
            .mutate({
                appID: this.appID,
            })
            .then((data) => {
                console.log("get-my-all", data);

                return data;
            });
    }

    // async setupPlatform({ procedure = "setFS", input }) {
    //     return (this.client["platform"][procedure] as any)
    //         .mutate(input)
    //         .then((data) => {
    //             console.log("setup-platform-call", data);
    //             return data;
    //         });
    // }

    // async publicRPC({ procedure = "getFiles", input }) {
    //     return (this.client["public"][procedure] as any)
    //         .mutate(input)
    //         .then((data) => {
    //             return data;
    //         });
    // }
}

declare global {
    interface Window {
        trpcSDK?: LokLokSDK;
    }
}
