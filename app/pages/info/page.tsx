import SideNav from "@/app/components/sidebar";
import { nunito } from "@/app/ui/fonts";

export default function Info() {
  
    return (
        <body className={`${nunito.className} antialiased flex flex-row`}>
            {/* Sidebar */}
            <SideNav />

            <div className="w-full pl-2">Info</div>
        </body>
    )
}