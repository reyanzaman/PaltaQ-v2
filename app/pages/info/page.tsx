"use client"

import { nunito } from "@/app/ui/fonts";
import { useEffect } from 'react';
import Image from "next/image";

//@ts-ignore
export default function Info(props) {

    useEffect(() => {
        document.title = "Information";
    }, []);
  
    return (
        <div className={`${nunito.className} antialiased flex flex-col pl-[8em]`}>
            <div className="w-full pt-4 text-left mx-auto"><h1>Information</h1></div>
            <p className="pb-3 text-xl">Guides to using the PaltaQ application</p>
            <div className="flex flex-col items-start justify-center">
                <p className="text-rose-800 font-bold pb-2">This guide is under development and will be updated soon.</p>
                <h4 className="border-b-2 border-gray-800 mb-5 font-bold">PaltaQ Rankings</h4>
                <Image src="/rankings.png" width={800} height={300} alt="rankings"/>
            </div>
        </div>
    )
}