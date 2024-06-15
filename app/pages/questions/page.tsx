import SideNav from "@/app/components/sidebar";
import { nunito } from "@/app/ui/fonts";

export default function Questions(props) {
  
    return (
        <div className={`${nunito.className} antialiased flex flex-row`}>
            {/* Sidebar */}
            <SideNav />

            <div className="w-full py-4 pl-[4em] text-center mx-auto text-3xl">Questions</div>
        </div>
    )
}