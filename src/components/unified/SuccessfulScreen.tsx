import { useEffect } from "react";
import { useUnified } from "./useUnified";
import { BotIcon } from "lucide-react";
import { useAuthUI } from "../auth-module/useAuthUI";

export function SuccessfulScreen() {
    // let rotuer = useRouter();

    useEffect(() => {
        setTimeout(() => {
            // rotuer.push("/me");
            useAuthUI.setState({
                overlay: "",
            });

            setTimeout(() => {
                useUnified.setState({
                    screen: "email",
                });
            }, 250);
        }, 500);
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col">
                <div>成功登入！</div>
                <BotIcon className="mx-3 size-32"></BotIcon>
            </div>
        </div>
    );
}
