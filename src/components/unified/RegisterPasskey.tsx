import { Fingerprint, LockIcon, ScanFaceIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUnified } from "./useUnified";
// import { Input } from "@/components/ui/input";
// import { useUnified } from "./useUnified";
// import {
//     InputOTP,
//     InputOTPGroup,
//     InputOTPSeparator,
//     InputOTPSlot,
// } from "@/components/ui/input-otp";
// import { FacemeshDatas } from "@react-three/drei";

export function RegisterPasskey() {
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
            }}
            className=""
        >
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <span className="flex flex-col items-center gap-2 font-medium">
                        <div className="flex size-8 items-center justify-center rounded-md">
                            <LockIcon className="size-6" />
                        </div>
                    </span>
                </div>
                <div className="flex flex-col gap-6  items-center">
                    <Label htmlFor="pinCode">{`啟用 FaceID / TouchID 登入`}</Label>
                    <Button
                        onClick={() => {
                            //
                            useUnified.getState().registerPasskey({
                                staySameScreen: false,
                            });
                            //
                        }}
                    >
                        {`Enable FaceID / ToucID `}
                        <ScanFaceIcon></ScanFaceIcon>
                        <Fingerprint></Fingerprint>
                    </Button>
                </div>
            </div>
        </form>
    );
}
