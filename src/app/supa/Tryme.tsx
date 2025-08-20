"use client";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import md5 from "md5";
import { v4 } from "uuid";

// // Create a single supabase client for interacting with your database
/*
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = createClient(supabaseUrl!, supabaseKey!);

export function Tryme() {
    return (
        <>
            <Button
                onClick={async () => {
                    //
                    // studio //
                    // http://127.0.0.1:54323

                    const { error, data } = await supabase
                        .from("todos")
                        .insert({ id: `${md5(v4())}`, task: "yooo" });
                    //
                    console.log(error, data);
                }}
            >
                Supa insert
            </Button>
            <Button
                onClick={async () => {
                    //
                    // studio //
                    // http://127.0.0.1:54323

                    console.log(supabase);

                    supabase
                        .from("todos")
                        .select()
                        .then((r) => {
                            console.log(r);
                        });
                    //
                }}
            >
                Supa query
            </Button>
        </>
    );
}
