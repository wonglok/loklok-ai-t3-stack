import { useEffect } from "react";
import { RestURL } from "../../../../../branding-config/Connections";
import { authDB, useUnified } from "@/components/unified/useUnified";

export function GatewayExpressTest() {
    let jwt = useUnified((r) => r.jwt);
    let run = async () => {
        //

        // let endpointBaseURL = await fetch(`${RestURL}`, {
        //     mode: "cors",
        // })
        //     .then((r) => r.json())
        //     .then((r) => r.express);

        // console.log(endpointBaseURL);

        let res = await fetch(
            `${new URL("/app/myAppID/express/test", RestURL)}`,
            {
                mode: "cors",
                method: "POST",
                headers: new Headers({
                    jwt: jwt || "not-login",
                    appid: "myappid",
                }),
                body: JSON.stringify({
                    hi: 123456,
                }),
            }
        );

        if (res.ok) {
            let inbound = await res.json();
            console.log(inbound);
        } else {
            let inbound = await res.text();
            console.log(inbound);
        }
    };
    useEffect(() => {
        run();
    }, [jwt]);

    return (
        <>
            <button
                onClick={() => {
                    run();
                }}
                className="bg-gray-200 p-2 px-5 rounded-xl cursor-pointer"
            >
                run express
            </button>
        </>
    );
}
