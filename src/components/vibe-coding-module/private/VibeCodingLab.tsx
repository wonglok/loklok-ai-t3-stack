"use client";
// import { useLoginUI } from "@/app-module/Common/useLoginUI";
// import { Button } from "../ui/button";
// import { LogOutIcon } from "lucide-react";
// import { SettingsDialog } from "../settings-dialog";
// import { SideMenu } from "./SideMenu";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import BGLight from "@/game/BGLight";
import { Avatar } from "@/components/avatar-module/Avatar";
import { QueryExample } from "./Yo/QueryExample";
import { ExpressTest } from "./Yo/ExpressTest";
import { OllamaTest } from "./Yo/OllamaTest";
import { GatewayExpressTest } from "./Yo/GatewayExpressTest";
import { AppTable } from "./AppTable/AppTable";

//
// import { QueryExample } from "./Yo/QueryExample";
//

export function VibeCodingLab() {
    // let email = useUnified((r) => r.email);

    // console.log(email);
    return (
        <>
            <div className="w-full h-full lg:flex overflow-y-scroll lg:overflow-visible">
                <div className="h-[400px] lg:h-full lg:shrink-0 lg:w-1/3">
                    <Canvas>
                        <group rotation={[0, 0.25, 0]}>
                            <Avatar
                                lookAtCamera={false}
                                motionURL={`/game-asset/motion-files/rpm-avatar-motion/masculine/fbx/idle/M_Standing_Idle_Variations_007.fbx`}
                                avatarURL={`/game-asset/rpm/fixed/lab-guy.glb?VibeCodingLab`}
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

                <div className="lg:shrink-0 lg:w-2/3">
                    <div className="w-full h-full flex flex-col items-center lg:overflow-y-auto">
                        <div className="w-full h-full px-[30px] py-[30px]">
                            <div className="text-3xl mb-3 ">{`🌟 Vibe Coding Lab 🌟  `}</div>
                            <div className="text-gray-700 max-w-[500px] mb-12  ">
                                {`你可以直接描述你的應用 ✨，然後人工智能會幫你寫軟件！🤖`.trim()}
                            </div>
                            <div className="text-3xl mb-3 bg-white ">
                                <AppTable></AppTable>
                                {/* <ExpressTest></ExpressTest> */}
                                {/* <QueryExample></QueryExample> */}
                                {/* <OllamaTest></OllamaTest> */}
                                {/* <GatewayExpressTest></GatewayExpressTest> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

//
//
//
