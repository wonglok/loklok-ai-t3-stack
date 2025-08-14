import { DoorOpenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUnified } from "./useUnified";
import { BRAND_NAME } from "../../../branding-config/Branding";
import { useState } from "react";

export function EmailScreen() {
    let [email, setEmail] = useState("");
    return (
        <form
            onSubmit={(ev) => {
                ev.preventDefault();
                //

                if (!email) {
                    console.log("email", email);
                } else {
                    useUnified.getState().checkEmail({ email: email });
                }

                // console.log(useUnified.getState().email);

                //
            }}
            className="w-full h-full"
        >
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <span className="flex flex-col items-center gap-2 font-medium">
                        <div className="flex size-18 mb-2 items-center justify-center rounded-md">
                            <DoorOpenIcon className="size-full " />
                        </div>
                        <span className="sr-only">{`${BRAND_NAME}`}</span>
                    </span>
                    <h1 className="text-xl font-bold">{`${BRAND_NAME}`}</h1>
                    <h1 className="text-gray-700">註冊 / 登入</h1>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="email">電郵</Label>
                        <Input
                            id="emailenter"
                            type="email"
                            autoComplete="home email webauthn"
                            value={email}
                            onChange={(ev) => {
                                setEmail(ev.target.value);
                            }}
                            placeholder="youremail@gmail.com"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full cursor-pointer">
                        下一步
                    </Button>
                </div>
            </div>
        </form>
    );
}
