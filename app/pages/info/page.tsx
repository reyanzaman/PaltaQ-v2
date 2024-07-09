"use client"

import { nunito } from "@/app/ui/fonts";
import { useEffect } from 'react';

//@ts-ignore
export default function Info(props) {

    useEffect(() => {
        document.title = "Information";
    }, []);
  
    return (
        <div className={`${nunito.className} antialiased flex flex-row`}>
            <div className="w-full py-4 pl-[4em] text-center mx-auto text-3xl">Info</div>
        </div>
    )
}