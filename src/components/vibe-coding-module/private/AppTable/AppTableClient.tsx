import { useUnified } from "@/components/unified/useUnified";
import { RestURL } from "../../../../../branding-config/Connections";
import { useAppTable } from "./useAppTable";

export const AppTableClient = {
    [`list-my`]: async () => {
        useAppTable.setState({ loading: true });
        try {
            let resp = await fetch(
                new URL(`/app/crud/list-my`, RestURL),
                //
                {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        jwt: useUnified.getState().jwt,
                    },
                    body: JSON.stringify({
                        //
                    }),
                }
            );

            if (resp.ok) {
                let json = await resp.json();

                console.log(json);

                useAppTable.setState({
                    apps: json.data,
                });
            } else {
                let text = await resp.text();

                console.log(text);
            }
        } finally {
            useAppTable.setState({ loading: false });
        }

        //
    },
};
