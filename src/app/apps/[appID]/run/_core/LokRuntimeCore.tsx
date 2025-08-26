"use client";
import { LokLokSDK } from "@/components/_TreeAI/web/LokLokSDK";
import { NPMCacheTasks } from "@/components/_TreeAI/web/npm-globals";
import * as React19 from "react";

export function LokRuntimeCore({ files = [], appID = "" }) {
    React19.useEffect(() => {
        if (!appID) {
            return;
        }

        let sdk = new LokLokSDK({
            appID: appID,
        });

        window.trpcSDK = sdk;
    }, [appID]);

    React19.useEffect(() => {
        let run = async () => {
            let fileList = files;

            window.React = React19;
            // @ts-ignore
            window.NPM_CACHE = window.NPM_CACHE || {};

            // @ts-ignore
            const NPM_CACHE = window.NPM_CACHE;

            NPMCacheTasks.forEach((cacheNpm) => {
                NPM_CACHE[cacheNpm.name] = cacheNpm.importVaraible;
            });

            // @ts-ignore
            window.esmsInitOptions = {
                shimMode: true,
                enforceIntegrity: false,
                resolve: (id, parentUrl, resolve) => {
                    let removeTSJS = (pathname = "") => {
                        if (pathname.endsWith(".ts")) {
                            return pathname.replace(".ts", "");
                        }
                        if (pathname.endsWith(".tsx")) {
                            return pathname.replace(".tsx", "");
                        }
                        if (pathname.endsWith(".jsx")) {
                            return pathname.replace(".jsx", "");
                        }
                        if (pathname.endsWith(".js")) {
                            return pathname.replace(".js", "");
                        }
                        return pathname;
                    };

                    console.log(id);

                    let fileEntry = fileList.find((it) => {
                        return removeTSJS(it.path) === removeTSJS(id);
                    });
                    return URL.createObjectURL(
                        new Blob([fileEntry?.code || ""], {
                            type: "application/javascript",
                        }),
                    );
                },
            };

            let yolo = setInterval(() => {
                // @ts-ignore
                let importer = window.importHttpModule2;
                if (importer) {
                    clearInterval(yolo);

                    // @ts-ignore
                    console.log(window.importHttpModule2);
                    // @ts-ignore

                    window.importShim("/src/main.js");
                }
            });
        };
        run();
    }, [files]);

    return (
        <div className="h-full w-full">
            <div
                className="hidden"
                dangerouslySetInnerHTML={{
                    __html: `
        <script>
            window.importHttpModule2 = async (value) => {
                return import(value);
            };
        </script>
`,
                }}
            ></div>

            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind-experimental.min.css"
                integrity="sha512-wnea99uKIC3TJF7v4eKk4Y+lMz2Mklv18+r4na2Gn1abDRPPOeef95xTzdwGD9e6zXJBteMIhZ1+68QC5byJZw=="
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
            />
            <div className="h-full w-full" id="run_code_div"></div>
        </div>
    );
}
