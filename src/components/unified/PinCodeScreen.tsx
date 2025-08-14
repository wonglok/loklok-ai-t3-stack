import { GalleryVerticalEnd, LockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUnified } from "./useUnified";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRef, useState } from "react";
export function PinCodeScreen() {
    let [val, setVal] = useState("");
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
                    <Label htmlFor="pinCode">請輸入一次性密碼</Label>
                    <InputOTP
                        value={val}
                        onChange={(val) => {
                            setVal(val);
                        }}
                        onComplete={(pinCode) => {
                            useUnified.getState().checkPinCode({
                                pinCode: pinCode,
                                onReset: () => {
                                    setVal("");
                                },
                            });
                        }}
                        maxLength={4}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            </div>
        </form>
    );
}

//
