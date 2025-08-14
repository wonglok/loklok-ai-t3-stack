"use client";
import { useUnified } from "@/components/unified/useUnified";
// import { LogoutModule } from "../LogoutModule/LogoutModule";
// import { LoginModule } from "../LoginModule/LoginModule";
import { useAuthUI } from "./useAuthUI";
// import { useRouter } from "next/navigation";
import { UnifiedScreen } from "@/components/uniform-form-email-screen";
import { O3D, Overlay } from "@/game/GameCanvas";
import { Home } from "@/components/home/Home";
import { BRAND_NAME } from "../../../branding-config/Branding";
import { Avatar } from "../avatar-module/Avatar";

export function AuthModule({ avatarURL }: { avatarURL: string }) {
    let jwt = useUnified((r) => r.jwt);
    let overlay = useAuthUI((r) => r.overlay);

    let title = (
        <>
            {jwt ? (
                <div
                    key={"k1"}
                    onClick={() => {
                        //
                        useAuthUI.setState({
                            overlay: "home",
                        });
                    }}
                    className="flex flex-col justify-center items-center bg-[rgba(255,255,255,0.75)] p-3 px-6 rounded-2xl cursor-pointer"
                >
                    <div className="">{`✨ 歡迎翻黎 🥰`}</div>
                    <div className="text-xs text-gray-700">{`🏡 主頁`}</div>
                </div>
            ) : (
                <div
                    key={"k2"}
                    onClick={() => {
                        useAuthUI.setState({
                            overlay: "home",
                        });
                    }}
                    className="flex flex-col items-center gap-2 bg-[rgba(255,255,255,0.75)] p-3 px-6 rounded-2xl cursor-pointer"
                >
                    <div className=" text-xs text-gray-700">{`歡迎光臨`}</div>
                    <div className="">{`${BRAND_NAME}`}</div>
                    <div className="text-xs text-gray-700">{`🔐 按此登入 🔑`}</div>
                </div>
            )}
        </>
    );

    return (
        <>
            {
                <>
                    {overlay === "home" && (
                        <Overlay
                            onClose={() => {
                                //
                                useAuthUI.setState({
                                    overlay: "",
                                });
                            }}
                        >
                            <div
                                onKeyDownCapture={(ev) => {
                                    ev.stopPropagation();
                                }}
                                className="w-full h-[100%] lg:h-[100%] flex items-center justify-center bg-white rounded-xl overflow-hidden"
                            >
                                {jwt ? (
                                    <Home></Home>
                                ) : (
                                    <UnifiedScreen></UnifiedScreen>
                                )}
                            </div>
                        </Overlay>
                    )}

                    <O3D position={[0, 0, -3]}>
                        <Avatar
                            title={title}
                            motionURL={`/game-asset/motion-files/rpm-avatar-motion/masculine/fbx/idle/M_Standing_Idle_002.fbx`}
                            avatarURL={avatarURL}
                        ></Avatar>
                    </O3D>
                </>
            }
        </>
    );
}

//

//

//
