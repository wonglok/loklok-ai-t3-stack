"use client";
import { useUnified } from "@/components/unified/useUnified";
import { O3D, Overlay } from "@/game/GameCanvas";
// import { BRAND_NAME } from "../../../branding-config/Branding";
import { Avatar } from "../avatar-module/Avatar";
// import { CreateAgent } from "./private/CreateAgent";
import { WhatFeatrue } from "./public/WhatFeatrue";
import { useMemo } from "react";
import { create } from "zustand";
import { VibeCodingLab } from "./private/VibeCodingLab";

export function VibeCodingModule({}: {}) {
    let avatarURL1 = `/game-asset/rpm/fixed/office-guy.glb?introheader`;
    let avatarURL2 = `/game-asset/rpm/fixed/avatar-white-beard-meta.glb`;
    let jwt = useUnified((r) => r.jwt);

    let useBackendModule = useMemo(() => {
        return create(() => {
            return {
                showingOverlay: "" as string,
            };
        });
    }, []);

    let showingOverlay = useBackendModule((r) => r.showingOverlay);

    let introduceHeader = (
        <>
            <div
                key={"k1" + avatarURL1}
                onClick={() => {
                    //
                    useBackendModule.setState({
                        showingOverlay: "menu",
                    });
                }}
                className="flex flex-col justify-center items-center bg-[rgba(255,255,255,0.75)] p-3 px-6 rounded-2xl cursor-pointer"
            >
                <div>{`咩系 Vibe Coding ?`}</div>
                <div className="text-xs text-gray-700">{`😊 簡單介紹`}</div>
            </div>
        </>
    );

    let createAgent = (
        <>
            <div
                key={"k2" + avatarURL2}
                onClick={() => {
                    useBackendModule.setState({
                        showingOverlay: "lab",
                    });
                }}
                className="flex flex-col justify-center items-center bg-[rgba(255,255,255,0.75)] p-3 px-6 rounded-2xl cursor-pointer"
            >
                <div>{`Vibe Coding Lab`}</div>
                <div className="text-xs text-gray-700">{`試下先 🤭`}</div>
            </div>
        </>
    );

    //
    //
    //

    //
    //

    return (
        <>
            {jwt && (
                <>
                    <O3D position={[5, 0, -1]}>
                        <group rotation={[0, -0.5, 0]}>
                            <Avatar
                                key={avatarURL1 + introduceHeader.key}
                                title={introduceHeader}
                                motionURL={`/game-asset/motion-files/rpm-avatar-motion/masculine/fbx/expression/M_Standing_Expressions_005.fbx`}
                                avatarURL={`${avatarURL1}`}
                            ></Avatar>
                        </group>
                    </O3D>

                    <O3D position={[-5, 0, -1]}>
                        <group rotation={[0, 0.5, 0]}>
                            <Avatar
                                key={avatarURL2 + createAgent.key}
                                title={createAgent}
                                motionURL={`/game-asset/motion-files/rpm-avatar-motion/masculine/fbx/expression/M_Standing_Expressions_006.fbx`}
                                avatarURL={`${avatarURL2}`}
                            ></Avatar>
                        </group>
                    </O3D>

                    {showingOverlay === "menu" && (
                        <Overlay
                            onClose={() => {
                                useBackendModule.setState({
                                    showingOverlay: "",
                                });
                            }}
                        >
                            <div className="w-full h-[100%] lg:h-[100%] flex items-center justify-center bg-white rounded-xl overflow-hidden">
                                <WhatFeatrue></WhatFeatrue>
                            </div>
                        </Overlay>
                    )}

                    {showingOverlay === "lab" && (
                        <Overlay
                            fullscreen
                            onClose={() => {
                                useBackendModule.setState({
                                    showingOverlay: "",
                                });
                            }}
                        >
                            <div className="w-full h-[100%] lg:h-[100%] flex items-center justify-center bg-white rounded-xl overflow-hidden">
                                <VibeCodingLab></VibeCodingLab>
                            </div>
                        </Overlay>
                    )}

                    {/*  */}
                    {/*  */}
                    {/*  */}
                </>
            )}
        </>
    );
}

//

//

//
