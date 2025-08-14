import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authDB, useUnified } from "./useUnified";
import { RestURL } from "../../../branding-config/Connections";
import { client } from "@passwordless-id/webauthn";
import {
    EyeClosedIcon,
    FingerprintIcon,
    LockIcon,
    ScanFace,
    ShieldAlertIcon,
} from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";

let passkeyScanner = async ({ email }: { email: string }) => {
    //
    let res = await fetch(`${RestURL}/auth/get-cred-ids`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
        }),
    });
    let inbound = await res.json();
    //

    // console.log(inbound);

    if (inbound.credIDs.length === 0) {
        // request email todo
        useUnified.setState({
            screen: "show-pin-code-screen",
        });

        return inbound;
    } else {
        return inbound;
    }
};

export function ShowPasskeyScreen() {
    let email = useUnified((r) => r.email);
    let [credIDs, setCreds] = useState<string[] | any>(false);

    useEffect(() => {
        //

        passkeyScanner({ email }).then((inbound) => {
            setCreds(inbound.credIDs);
        });
        //
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center">
            {!credIDs && <>{`加載中。。。`}</>}
            {credIDs && (
                <LoginPasskey
                    tryAgain={() => {
                        passkeyScanner({ email }).then((inbound) => {
                            setCreds(inbound.credIDs);
                        });
                    }}
                    credIDs={credIDs}
                    email={email}
                ></LoginPasskey>
            )}
        </div>
    );
}

function LoginPasskey({
    credIDs = [],
    email = "",
    tryAgain = () => {},
}: {
    credIDs: string[];
    email: string;
    tryAgain: () => void;
}) {
    let router = useRouter();

    //
    useEffect(() => {
        let run = async () => {
            const requestChallenge = async (): Promise<any> => {
                //
                let res = await fetch(
                    `${RestURL}/auth/provide-passkey-challenge`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            //
                        }),
                    }
                );
                let inbound = await res.json();

                // console.log(inbound.challenge);

                return inbound.challenge;
            };

            let challenge = await requestChallenge();
            let pubKeyCred = await client.authenticate({
                challenge: `${challenge}`,
                allowCredentials: credIDs,
                customProperties: {
                    uvm: true,
                },
            });

            let verifyLoginPasskey = async ({
                email,
                challenge,
                pubKeyCred,
                origin,
            }: any) => {
                let res = await fetch(`${RestURL}/auth/verify-login-passkey`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        //
                        email,
                        challenge,
                        pubKeyCred,
                        origin,
                    }),
                });
                let inbound = await res.json();
                console.log(inbound);
                return inbound;
            };

            let result = await verifyLoginPasskey({
                email,
                challenge,
                pubKeyCred,
                origin: location.origin,
            });

            if (result.ok === true) {
                await authDB.setItem("jwt", result.jwt);
                useUnified.setState({
                    jwt: result.jwt,
                    screen: "successful",
                });
            }
        };

        run().catch((r) => {
            console.log(r);
        });
    }, [credIDs]);

    return (
        <>
            <form
                onSubmit={(ev) => {
                    ev.preventDefault();
                }}
                className=""
            >
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <span className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex flex-col w-32 items-center justify-center rounded-md">
                                <div className="flex mb-4">
                                    <ScanFace className="size-16 mx-2" />
                                    <FingerprintIcon className="size-16 mx-2" />
                                </div>
                                <div>{`掃描進行中...`}</div>
                            </div>
                        </span>
                    </div>
                    <div className="flex flex-col gap-6  items-center">
                        <Button
                            onClick={() => {
                                tryAgain();
                            }}
                        >
                            {`再試下，掃描多一次`}
                            <ScanFace></ScanFace>
                        </Button>
                        <Button
                            onClick={(ev) => {
                                if (ev.target) {
                                    (ev.target as HTMLButtonElement).innerText =
                                        "請求中...";
                                }
                                fetch(`${RestURL}/auth/request-email`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    mode: "cors",
                                    body: JSON.stringify({
                                        email,
                                    }),
                                }).then(async (r) => {
                                    if (r.ok) {
                                        let json = await r.json();
                                        if (json?.ok) {
                                            useUnified.setState({
                                                screen: "show-pin-code-screen",
                                            });
                                        }
                                    }
                                });
                            }}
                        >
                            {`改用一次性密碼登入`}
                            <ShieldAlertIcon></ShieldAlertIcon>
                        </Button>
                    </div>
                </div>
            </form>
        </>
    );
}
