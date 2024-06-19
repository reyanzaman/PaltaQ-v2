import { nunito } from "@/app/ui/fonts";
import "@/app/ui/neomorphism.css";
import type { Metadata } from "next";

import AdminComponent from "@/app/components/admincomponent";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard of PaltaQ V2",
};

export default function Admin(props) {
  
  return (
    <div className={`${nunito.className} antialiased flex flex-row pt-[2em]`}>

      <div className="w-full max-w-full lg:pl-[8em] mr-[1.5em] overflow-auto">
        <AdminComponent />
      </div>

    </div>
  );
}
