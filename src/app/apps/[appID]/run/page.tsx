"use client";

import { useEffect, useState } from "react";
import { LokLokSDK } from "@/components/_TreeAI/web/LokLokSDK";
import { useParams } from "next/navigation";
import { rollupCode } from "@/components/_TreeAI/web/rollupCode";
// import { RuntimeCore } from "@/app/test/_TreeAI/web/RuntimeCore";
// import { LokRuntimeCore } from "./_run/LokRuntimeCore";
import * as React19 from "react";
import { NPMCacheTasks } from "@/components/_TreeAI/web/npm-globals";

export default function AppRun() {
    let { appID } = useParams();

    useEffect(() => {
        if (!appID) {
            return;
        }
        let sdk = new LokLokSDK({ appID: appID });
        window.trpcSDK = sdk;

        sdk.publicRPC({
            procedure: "getFiles",
            input: {},
        }).then((files) => {
            console.log("appID", appID);
            console.log("got files", files);

            rollupCode({
                files: [
                    ...files,

                    {
                        path: `/src/MyApp.js`,
                        content: `
import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { Sphere, MeshTransmissionMaterial, Environment, OrbitControls } from '@react-three/drei'
// import { useSDK } from '@/ui/useSDK.js'
import { useState } from 'react'

export function MyApp () {  

    let [output, setOutput] = useState('')

    let [outlet, setAppOutlet] = React.useState(null)

    React.useEffect(() => {
        import('/components/App.tsx').then((myModule) =>{
                console.log('module', myModule)
                if (myModule?.App) {
                    try {
                        setAppOutlet(<myModule.App></myModule.App>)
                    } catch (e) {
                        console.log(e)
                    }
                } else {
                    try {
                        setAppOutlet(<div className="w-full h-full rounded-lg from-gray-100 to-gray-500 bg-gradient-to-br flex items-center justify-center text-white">Preparing for Preview Content...</div>)
                    } catch (e) {
                        console.log(e)
                    }
                }
            }).catch((e) => {
                console.log(e)
            })
    }, [])

    return <div className="w-full h-full relative">
        {outlet}
    </div>
}
`,

                        //  <Canvas className="w-full h-full">
                        //             <Sphere>
                        //                 <MeshTransmissionMaterial color="white" thickness={1.1}></MeshTransmissionMaterial>
                        //             </Sphere>
                        //             <Environment preset="lobby" background></Environment>
                        //             <OrbitControls></OrbitControls>
                        //         </Canvas>
                    },
                    {
                        path: `/src/main.js`,
                        content: /* typescript */ `
import { MyApp } from '../src/MyApp.js'
import * as ReactDOM from 'react-dom'
import * as React from 'react'


let ttt = setInterval(() => {
    
    let domElement = document.querySelector('#run_code_div')

    if (domElement) {
        clearInterval(ttt)
        if (!domElement?.root) {
            domElement.root = ReactDOM.createRoot(domElement)
        }
        domElement.root.render(<MyApp></MyApp>)
    }
}, 0);
`,
                    },
                ],
            })
                .then(async (fileList) => {
                    window.React = React19;

                    // @ts-ignore
                    window.NPM_CACHE = window.NPM_CACHE || {};

                    // @ts-ignore
                    const NPM_CACHE = window.NPM_CACHE;

                    // NPM_CACHE["npm-react-dom"] = ReactDOM19;
                    // NPM_CACHE["npm-react"] = React19;
                    // NPM_CACHE["npm-@react-three/drei"] = ReactThreeDrei;
                    // NPM_CACHE["npm-@react-three/fiber"] = ReactThreeFiber;
                    // NPM_CACHE["npm-zustand"] = Zustand;
                    // NPM_CACHE["npm-wouter"] = WouterBase;
                    // NPM_CACHE["npm-wouter/use-hash-location"] = WouterHash;

                    NPMCacheTasks.forEach((cacheNpm) => {
                        NPM_CACHE[cacheNpm.name] = cacheNpm.importVaraible;
                    });

                    // @ts-ignore
                    window.esmsInitOptions = {
                        shimMode: true,
                        enforceIntegrity: false,
                        resolve: (id, parentUrl, resolve) => {
                            let removeTSJS = (pathname = "") => {
                                // if (pathname.endsWith(".ts")) {
                                //     return pathname.replace(".ts", "");
                                // }
                                // if (pathname.endsWith(".tsx")) {
                                //     return pathname.replace(".tsx", "");
                                // }
                                // if (pathname.endsWith(".jsx")) {
                                //     return pathname.replace(".jsx", "");
                                // }
                                // if (pathname.endsWith(".js")) {
                                //     return pathname.replace(".js", "");
                                // }
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

                    let importHTTP = await new Promise((resolve) => {
                        let ttt = setInterval(() => {
                            if (window.importHttpModuleCore) {
                                clearInterval(ttt);
                                resolve(window.importHttpModuleCore);
                            }
                        });
                    });
                    setTimeout(async () => {
                        // @ts-ignore
                        await importHTTP(`/es-module-shims/es-module-shims.js`);
                        // @ts-ignore
                        window.importShim("/src/main.js");
                    }, 10);
                })
                .catch((e) => {
                    console.log("front end build failed...");
                    console.error(e);
                });
        });
    }, [appID]);

    return (
        <>
            <div className="h-full w-full">
                <div
                    className="hidden"
                    dangerouslySetInnerHTML={{
                        __html: `
        <script>
            window.importHttpModuleCore = async (value) => {
                return await import(value);
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
        </>
    );
}

declare global {
    interface Window {
        importHttpModuleCore?: () => Promise<any>;
    }
}
