import { nunito, dancing_script } from "@/app/ui/fonts";
import "@/app/ui/neomorphism.css";
import "@/app/ui/style.css";
import type { Metadata } from "next";

import SideNav from "@/app/components/sidebar";
import UserImage from "@/app/components/userimage";
import RecentQuestions from "./components/homerecentquestions";

export const metadata: Metadata = {
  title: "PaltaQ",
  description: "PaltaQ V2",
};

export default function Home() {
  
  return (
    <div className={`${nunito.className} antialiased flex flex-row`}>

      <UserImage />

      <div className="w-full h-screen lg:ml-[7em]">
        <div className="mb-2 lg:mt-[4em] mt-[5.5em] lg:w-[65em] mx-auto">
          <h1
            className={`${dancing_script.className} antialiased text-6xl text-center m-4`}
          >
            Palta Question
          </h1>

          <RecentQuestions />

          <div className="relative mx-auto w-fit bottom-0 pb-1">
            <p className="text-sm">PaltaQ Version 2.00</p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <SideNav />
    </div>
  );
}
