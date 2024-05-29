import SideNav from "@/app/components/sidebar";
import { nunito } from "@/app/ui/fonts";

export default function Dashboard() {
  
    return (
        <body className={`${nunito.className} antialiased flex flex-row`}>
            {/* Sidebar */}
            <SideNav />

            <div className="w-full pl-2">Dashboard</div>
        </body>
    )
}