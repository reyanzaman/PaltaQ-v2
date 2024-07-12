"use client"

import { nunito } from "@/app/ui/fonts";
import { useEffect, useState } from 'react';

//@ts-ignore
export default function Info(props) {

    const [value, setValue] = useState("")

    const llama3 = async () => {
        try {
            const response = await fetch(`/api/groq`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching response from GROQ API: ${response.status}`);
            }

            const data = await response.json();
            setValue(data);
        } catch (error) {
            console.error('Error fetching response from GROQ:', error);
        }
    }

    useEffect(() => {
        document.title = "Testing";
    }, []);
  
    return (
        <div className={`${nunito.className} antialiased flex flex-col pl-[8em]`}>
            <div className="w-full py-4 text-center mx-auto text-3xl">Testing Model</div>
            <button onClick={llama3} className="btn btn-primary btn-lg w-fit mx-auto my-4">Test</button>
            <h1 className="text-zinc-800 text-left my-2">Result: {value}</h1>
        </div>
    )
}