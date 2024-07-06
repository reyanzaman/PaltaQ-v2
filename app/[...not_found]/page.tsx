import { nunito, dancing_script } from "@/app/ui/fonts";
import "@/app/ui/neomorphism.css";
import type { Metadata } from "next";

import NotFound from "@/app/components/not-found";

export const metadata: Metadata = {
  title: "ERROR :(",
};

export default function Home() {
  
  return (
    <div className={`${nunito.className} antialiased flex flex-row`}>

      <NotFound />
      
    </div>
  );
}
