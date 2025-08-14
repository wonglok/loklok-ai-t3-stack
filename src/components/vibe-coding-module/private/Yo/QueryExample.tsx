"use client";

import { TRPCClient } from "@trpc/client";
import { getClient } from "./trpcclient";
import { AnyTRPCRouter } from "@trpc/server";

export function QueryExample() {
    return (
        <>
            {
                <>
                    <button
                        className="bg-gray-200 p-2 px-6 cursor-pointer"
                        onClick={() => {
                            getClient({ appID: `appID123`, jwt: "12313" }).then(
                                (client: TRPCClient<any>) => {
                                    let method = "greet";
                                    let actions = client[method] as any;

                                    actions
                                        .query({ name: `lok123` })
                                        .then(
                                            (
                                                resultData: Record<string, any>
                                            ) => {
                                                console.log(resultData);
                                            }
                                        );
                                }
                            );
                        }}
                    >
                        trigger
                    </button>
                </>
            }
        </>
    );
}

//

//

//
