import { useEffect, useRef, useState } from "react";

export function Scroller({ children }: any) {
    let ref = useRef<HTMLDivElement>(document.createElement("div"));
    let [isAtBottom, setBottom] = useState(true);
    useEffect(() => {
        let myDiv = ref.current;
        if (myDiv) {
            let hh = () => {
                let checkBottom = false;
                const scrollTop = myDiv.scrollTop; // Amount of content scrolled vertically
                const clientHeight = myDiv.clientHeight; // Height of the visible content area
                const scrollHeight = myDiv.scrollHeight; // Total height of the content, including hidden parts

                // Check if the sum of scrollTop and clientHeight equals or exceeds scrollHeight
                if (scrollTop + clientHeight + 50 >= scrollHeight) {
                    // console.log("Scrolled to the bottom of the div!");

                    checkBottom = true;
                    // Perform actions when bottom is reached (e.g., load more content)
                }
                setBottom(checkBottom);
            };
            myDiv.addEventListener("scroll", hh);
            return () => {
                myDiv.removeEventListener("scroll", hh);
            };
        }
    }, []);

    useEffect(() => {
        if (ref.current) {
            if (isAtBottom) {
                ref.current.scrollTop = 9999999;
            }
            return () => {};
        }
    }, [isAtBottom, children]);

    return (
        <div ref={ref} className="w-full h-full overflow-y-scroll">
            {children}
        </div>
    );
}
