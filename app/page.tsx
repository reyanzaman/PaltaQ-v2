import { nunito, dancing_script } from "@/app/ui/fonts";
import "@/app/ui/neomorphism.css";
import type { Metadata } from "next";

import UserImage from "@/app/components/userimage";
import RecentQuestions from "@/app/components/homerecentquestions";
import Image from "next/image";

export const metadata: Metadata = {
  title: "PaltaQ",
  description: "PaltaQ V2",
};

export default function Home() {
  
  return (
    <div className={`${nunito.className} antialiased flex flex-row`}>

      <UserImage />

      <div className="w-full h-screen lg:ml-[7em]">
        <div className="mb-2 lg:mt-[4em] mt-[5.5em] lg:w-[75vw] mx-auto">
          <div className="flex flex-col">
            <h1
              className={`${dancing_script.className} antialiased text-6xl text-center mt-4`}
            >
              Palta Question
            </h1>
            <span className="flex flex-row items-center justify-center mb-4">
              <h6 className="text-sm pr-1">Powered By</h6>
              <Image src="/meta.png" width={80} height={80} alt="Meta AI" className="-translate-y-[0.25em]"></Image>
            </span>
          </div>

          <RecentQuestions />

          <div className="relative mx-auto w-fit bottom-0 pb-1">
            <p className="text-sm text-center my-1 text-zinc-500">PaltaQ Version 2.1e</p>
            <p className="text-sm text-center text-zinc-500">Based on Meta AI Llama-3 8B Model</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
