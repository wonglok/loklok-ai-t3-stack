"use client";
import { create } from "zustand";
import { RestURL } from "../../../branding-config/Connections";
import localforage from "localforage";
import { client } from "@passwordless-id/webauthn";
import { useAuthUI } from "../auth-module/useAuthUI";
import { useEffect } from "react";
// import { useLoginUI } from "@/app-module/Common/useLoginUI";
// import { BRAND_NAME } from "../../../Branding";
import { suspend } from "suspend-react";
import { BRAND_NAME } from "../../../branding-config/Branding";

export const authDB = localforage.createInstance({
    name: `app-auth-${BRAND_NAME}`,
});

export type UnifiedScreen =
    | "email"
    | "show-pin-code-screen"
    | "show-passkey-screen"
    | "register-passkey-screen"
    | "successful";

export const HydateLoginData = () => {
    suspend(async () => {
        if (typeof window !== "undefined") {
            await useUnified.getState().hydrate();
        }
        return {};
    }, []);
    return null;
};

export const useUnified = create<{
    ready: boolean;
    email: string;
    jwt: string;
    screen: string;
    checkingEmail: boolean;
    checkPinCode: ({
        pinCode,
    }: {
        pinCode: string;
        onReset: () => void;
    }) => void;
    checkEmail: ({ email }: { email: string }) => void;
    registerPasskey: ({ staySameScreen }: { staySameScreen: boolean }) => void;
    logout: () => void;
    creatingPasskey: boolean;
    hydrate: () => Promise<any>;
    userID: string;
}>((set, get) => {
    //

    return {
        //
        screen: "email",
        userID: "",
        ready: false,

        email: "",
        jwt: "",

        creatingPasskey: false,

        logout: async () => {
            await authDB.removeItem("jwt");
            //
            set({
                jwt: "",
                email: "",
                userID: "",
                screen: "email",
            });
        },

        hydrate: async () => {
            let jwt: string = (await authDB.getItem("jwt")) || "";
            if (jwt) {
                return fetch(`${RestURL}/auth/check-jwt-ok`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        jwt,
                    }),
                }).then(async (r) => {
                    if (r.ok) {
                        return r.json().then((v) => {
                            // console.log("user", v);
                            set({
                                ready: true,
                                jwt: jwt,
                                email: v.email,
                                userID: v.userID,
                                screen: "successful",
                            });

                            return { ok: true };
                        });
                    } else {
                        //
                        await authDB.removeItem("jwt");
                        set({
                            ready: true,
                            jwt: "",
                            email: "",
                            screen: "email",
                        });

                        return { ok: false };
                    }
                });
            } else {
                set({
                    ready: true,
                });

                return { ok: false };
            }
        },
        //ShowPasskeyScreen

        registerPasskey: async ({
            staySameScreen = false,
        }: {
            staySameScreen: boolean;
        }) => {
            //
            set({
                creatingPasskey: true,
            });
            try {
                // Check if platform authenticator is available
                const available =
                    await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

                if (!available) {
                    throw new Error("No platform authenticator available");
                }

                // This is a demo implementation
                // In a real app, you would:
                // 1. Get challenge and user info from your server
                // 2. Call navigator.credentials.create() with proper parameters
                // 3. Send the response back to your server for storage

                //

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

                    return inbound.challenge;
                };
                let email: string = get().email;

                let userID = email;
                let displayName = email;
                let name = email;
                let challenge = await requestChallenge();

                const info = await client.register({
                    user: {
                        id: userID,
                        name: name,
                        displayName: displayName,
                    },
                    domain: location.hostname,
                    userVerification: "required",
                    discoverable: "required",
                    challenge: challenge,
                });

                let addPasskeyToAccount = async ({
                    info,
                    jwt,
                    challenge,
                    origin,
                }: {
                    info: any;
                    jwt: string;
                    challenge: any;
                    origin: string;
                }) => {
                    //
                    //
                    let res = await fetch(
                        `${RestURL}/auth/add-passkey-to-account`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                info,
                                jwt,
                                challenge,
                                origin,
                            }),
                        }
                    );
                    let inbound = await res.json();

                    console.log(inbound);
                    //

                    return inbound;
                };

                let result = await addPasskeyToAccount({
                    info,
                    jwt: (await authDB.getItem("jwt")) || "",
                    challenge,
                    origin: location.origin,
                });

                if (result?.ok) {
                    await authDB.setItem("jwt", result.jwt);

                    if (staySameScreen) {
                        set({
                            screen: "successful",
                            jwt: result.jwt,
                        });
                    } else {
                        set({
                            screen: "successful",
                            jwt: result.jwt,
                        });
                    }
                }
                console.log(result);
            } catch (error) {
                console.error("Passkey creation error:", error);

                // Handle specific error cases
                if (error instanceof Error) {
                    if (error.name === "NotAllowedError") {
                        throw new Error(
                            "Passkey creation was cancelled or timed out"
                        );
                    } else if (error.name === "InvalidStateError") {
                        throw new Error(
                            "A passkey already exists for this account"
                        );
                    } else if (error.name === "NotSupportedError") {
                        throw new Error(
                            "Passkeys are not supported on this device"
                        );
                    }
                }

                throw error;
            } finally {
                set({
                    creatingPasskey: false,
                });
            }
        },
        checkPinCode: async ({
            pinCode = "",
            onReset = () => {},
        }: {
            pinCode: string;
            onReset: () => void;
        }) => {
            //
            let res = await fetch(`${RestURL}/auth/check-pin-code-from-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: get().email,
                    pinCode,
                }),
            });

            if (res.ok) {
                let inbound = await res.json();

                if (inbound) {
                    //
                    // check pin code
                    await authDB.setItem("jwt", inbound.jwt);

                    set({
                        jwt: inbound.jwt,
                        screen: "successful",
                    });

                    setTimeout(() => {
                        useAuthUI.setState({
                            overlay: "",
                        });
                    }, 500);

                    // if (inbound.hasPasskey) {
                    // } else {
                    //     set({
                    //         jwt: inbound.jwt,
                    //         screen: "register-passkey-screen",
                    //     });
                    // }

                    //
                } else {
                    console.error("no inbound");
                }
            } else {
                if (res.status === 400) {
                    console.error("401 error");
                }

                onReset();

                console.error("500 error not ok");
            }

            //
        },

        checkingEmail: false,
        checkEmail: async ({ email = "" }: { email: string }) => {
            //
            set({
                email,
            });

            set({
                checkingEmail: true,
            });
            // console.log(email);

            let res = await fetch(`${RestURL}/auth/check-email-next-step`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                }),
            });

            set({
                checkingEmail: false,
            });

            if (res.ok) {
                let inbound = await res.json();
                console.log(inbound);

                if (inbound) {
                    if (inbound?.screen === "show-pin-code-screen") {
                        set({
                            screen: "show-pin-code-screen",
                        });
                    } else if (inbound?.screen === "show-passkey-screen") {
                        set({ screen: "show-passkey-screen" });
                    } else {
                        // no op
                    }
                } else {
                    console.error("no inbound");
                }
            } else {
                console.error("500 error not ok");
            }

            //
        },
    };
});

useUnified.subscribe((now, before) => {
    if (now.jwt !== before.jwt) {
        if (now.jwt) {
            let jwt: string = now.jwt;
            if (jwt) {
                fetch(`${RestURL}/auth/check-jwt-ok`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        jwt,
                    }),
                }).then(async (r) => {
                    if (r.ok) {
                        r.json().then((v) => {
                            authDB.setItem("jwt", jwt);
                            // console.log("userID", v);
                            useUnified.setState({
                                email: v.email,
                                userID: v.userID,
                            });
                        });
                    } else {
                        //
                        await authDB.removeItem("jwt");
                    }
                });
            } else {
            }
        }
    }
});

//
// if (typeof window !== "undefined") {
//     authDB.getItem("jwt").then((jwt) => {
//         if (jwt && typeof jwt === "string") {
//             useUnified.setState({
//                 jwt: jwt,
//             });
//             useUnified.getState().hydrate();
//         }
//     });
// }
