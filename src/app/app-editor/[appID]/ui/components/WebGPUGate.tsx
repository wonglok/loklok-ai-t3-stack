import { ReactElement, useEffect, useState } from "react";
export function WebGPUGate({ children }: { children?: ReactElement }) {
    let [ok, setOK] = useState<null | true | false>(null);

    useEffect(() => {
        // import("three/addons/capabilities/WebGPU.js")
        //     //
        //     .then((WebGPUSupport) => {
        //         if (WebGPUSupport.default.isAvailable()) {
        //             setOK(true);
        //         } else {
        //             setOK(false);
        //         }
        //     });

        let run = async () => {
            if (typeof window !== "undefined") {
                let isAvailable: any =
                    typeof navigator !== "undefined" &&
                    (navigator as any).gpu !== undefined;

                if (isAvailable) {
                    isAvailable = await (navigator as any).gpu.requestAdapter();
                }

                setOK(!!isAvailable);
            } else {
                setOK(false);
            }
        };
        run();
    }, []);

    //
    //
    return (
        <>
            <>{ok === true && children}</>

            <>
                {ok === false && (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center">
                            {`Sorry, WebGPU is not Supported on this browser.`}
                            <br />
                            {`Please Consider using this app on Chrome on Mac / PC
                            / Linux`}
                        </div>
                    </div>
                )}
            </>
            <>
                {ok === null && (
                    <>
                        <div className="flex h-full w-full items-center justify-center">
                            <div>{`Loading...`}</div>
                        </div>
                    </>
                )}
            </>
        </>
    );
}
