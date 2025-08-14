import { EmailScreen } from "./unified/EmailScreen";
import { cn } from "@/lib/utils";
import { useUnified } from "./unified/useUnified";
import { PinCodeScreen } from "./unified/PinCodeScreen";
import { RegisterPasskey } from "./unified/RegisterPasskey";
import { SuccessfulScreen } from "./unified/SuccessfulScreen";
import { ShowPasskeyScreen } from "./unified/ShowPasskeyScreen";

export function UnifiedScreen({
    className,
    ...props
}: React.ComponentProps<"div">) {
    let screen = useUnified((r) => r.screen);
    return (
        <div className={cn("w-full h-full p-8", className)} {...props}>
            {/*  */}

            {screen === "email" && (
                //
                <EmailScreen></EmailScreen>
            )}
            {screen === "show-pin-code-screen" && (
                //
                <PinCodeScreen></PinCodeScreen>
            )}
            {screen === "register-passkey-screen" && (
                //
                <RegisterPasskey></RegisterPasskey>
            )}

            {screen === "show-passkey-screen" && (
                //
                <ShowPasskeyScreen></ShowPasskeyScreen>
            )}

            {screen === "successful" && (
                //
                <SuccessfulScreen></SuccessfulScreen>
            )}

            {/*  */}
        </div>
    );
}
