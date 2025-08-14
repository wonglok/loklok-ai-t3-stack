import { RestURL } from "../../../../../branding-config/Connections";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

const cacheURL = {
    url: "",
};

export const getClient = async ({
    appID = "",
    jwt = "",
}: {
    appID: string;
    jwt: string;
}) => {
    //
    cacheURL.url =
        cacheURL.url ||
        (await fetch(`${RestURL}`, {
            mode: "cors",
        })
            .then((r) => r.json())
            .then((r) => r.trpc));

    const client = createTRPCClient({
        links: [
            httpBatchLink({
                url: cacheURL.url,
                async headers() {
                    return {
                        [`appid`]: `${appID}`,
                        [`jwt`]: `${jwt}`,
                    };
                },
            }),
        ],
    });

    return client as any;
};
