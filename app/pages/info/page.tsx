import { nunito } from "@/app/ui/fonts";

export default function Info(props) {
  
    return (
        <div className={`${nunito.className} antialiased flex flex-row`}>
            <div className="w-full py-4 pl-[4em] text-center mx-auto text-3xl">Info</div>
        </div>
    )
}