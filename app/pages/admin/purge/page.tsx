import { nunito } from "@/app/ui/fonts";
import "@/app/ui/neomorphism.css";
import type { Metadata } from "next";

import PurgeComponent from "@/app/components/purgecomponent";

export const metadata: Metadata = {
  title: "Admin Question Purge",
  description: "Admin Question Purge Dashboard of PaltaQ V2",
};

export default function Admin(props) {
  
  return (
    <div className={`${nunito.className} antialiased flex flex-row pt-[2em]`}>

      <div className="w-full max-w-full lg:pl-[8em] lg:mr-[1.5em] overflow-auto">
        <PurgeComponent />
      </div>

    </div>
  );
}
