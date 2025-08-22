"use client";
import ReactDOM19 from "react-dom/client";
import * as React19 from "react";
import * as ReactThreeDrei from "@react-three/drei";
import * as ReactThreeFiber from "@react-three/fiber";
import * as Zustand from "zustand";
import * as WouterBase from "wouter";
import * as WouterHash from "wouter/use-hash-location";

export function RuntimeCore() {
    React19.useEffect(() => {
        let run = async () => {
            let urlSelf = new URL(window.location.href);
            let blobURL = urlSelf.searchParams.get("blob");

            let fileList = (await fetch(blobURL).then((r) => r.json())) || [];

            // @ts-ignore
            window.NPM_CACHE = window.NPM_CACHE || {};

            // @ts-ignore
            const NPM_CACHE = window.NPM_CACHE;
            NPM_CACHE["npm-react-dom19"] = ReactDOM19;
            NPM_CACHE["npm-react19"] = React19;
            NPM_CACHE["npm-@react-three/drei"] = ReactThreeDrei;
            NPM_CACHE["npm-@react-three/fiber"] = ReactThreeFiber;
            NPM_CACHE["npm-zustand"] = Zustand;
            NPM_CACHE["npm-wouter"] = WouterBase;
            NPM_CACHE["npm-wouter/use-hash-location"] = WouterHash;

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

            // @ts-ignore
            window.importHttpModule = window.importHttpModule || (() => {});
            // @ts-ignore
            window
                // @ts-ignore
                .importHttpModule(`/es-module-shims/es-module-shims.js`)
                .then(() => {
                    // @ts-ignore
                    window.importShim("/src/main.js");
                });
        };
        run();
    }, []);

    return (
        <div className="h-full w-full">
            <div
                className="hidden"
                dangerouslySetInnerHTML={{
                    __html: `
        <script>
        window.importHttpModule = (v) => import(v);
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
