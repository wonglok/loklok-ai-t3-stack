// import { useLoginUI } from "@/app-module/Common/useLoginUI";
// import { Button } from "../ui/button";
import { useUnified } from "../unified/useUnified";
import { useRouter } from "next/navigation";
// import { LogOutIcon } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
// import { SettingsDialog } from "../settings-dialog";
// import { SideMenu } from "./SideMenu";
import { AddPasskeyToAccountButton } from "../unified/AddPasskeyToAccountButton";
import { Canvas } from "@react-three/fiber";
import { Avatar } from "../avatar-module/Avatar";
import { PerspectiveCamera } from "@react-three/drei";
import BGLight from "@/game/BGLight";

export function Home() {
    let email = useUnified((r) => r.email);
    return (
        <>
            <div className="w-full h-full lg:flex overflow-y-scroll lg:overflow-visible">
                <div className="h-[400px] lg:h-full lg:shrink-0 lg:w-1/3">
                    <Canvas>
                        <group rotation={[0, 0.25, 0]}>
                            <Avatar
                                lookAtCamera={true}
                                motionURL={`/game-asset/motion-files/rpm-avatar-motion/masculine/fbx/expression/M_Standing_Expressions_001.fbx`}
                                avatarURL={`/game-asset/rpm/fixed/game-builder.glb?WhatFeature`}
                            ></Avatar>
                        </group>

                        <PerspectiveCamera
                            makeDefault
                            position={[0, 1.5, 2.5]}
                            rotation={[-0.175, 0, 0]}
                        ></PerspectiveCamera>
                        <BGLight></BGLight>
                    </Canvas>
                </div>
                {/*  */}
                <div className="lg:shrink-0 lg:w-2/3">
                    <div className="w-full h-full flex flex-col items-center p-[30px] lg:overflow-y-auto">
                        <div className="w-full h-full">
                            <div>
                                <div className="font-bold text-3xl">{`歡迎翻黎！`}</div>
                                <div className="mb-3 text-gray-600">
                                    {email}
                                </div>
                                <div className="h-[1px] bg-gray-300 w-[100%] lg:w-[70%] my-3"></div>
                                <div className="mb-3">
                                    <AddPasskeyToAccountButton></AddPasskeyToAccountButton>
                                </div>
                                {/* <div className="h-[1px] bg-gray-300 w-[100%] lg:w-[70%] my-3"></div>
                                <div>
                                    <AvatarButton></AvatarButton>
                                </div> */}
                                <div className="h-[1px] bg-gray-300 w-[100%] lg:w-[70%] my-3"></div>
                                <div>
                                    <LogoutButton></LogoutButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
