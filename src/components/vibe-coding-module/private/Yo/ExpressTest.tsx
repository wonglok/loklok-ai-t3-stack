import { useEffect } from "react";
import { RestURL } from "../../../../../branding-config/Connections";
import { useUnified } from "@/components/unified/useUnified";

export function ExpressTest() {
    let jwt = useUnified((r) => r.jwt);
    let run = async () => {
        //

        let endpointBaseURL = await fetch(`${RestURL}`, {
            mode: "cors",
        })
            .then((r) => r.json())
            .then((r) => r.express);

        console.log(endpointBaseURL);

        let res = await fetch(`${new URL("/test", endpointBaseURL)}`, {
            mode: "cors",
            method: "POST",
            headers: new Headers({
                jwt: jwt || "not-login",
                appid: "myappid",
            }),
            body: JSON.stringify({
                hi: 123,
            }),
        });

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
            >
                run express
            </button>
        </>
    );
}
