"use client"

import { useSession } from "next-auth/react";
import Image from "next/image";

const UserImage = () => {

    const { data: session } = useSession();
    const isLoggedIn = !!session;

    const image = session?.user?.image ?? '';

    return (
        <div className="lg:block hidden absolute right-4 top-4">
            {isLoggedIn ?
            <div>
                <Image src={image} alt="User Icon" width={45} height={45} className="rounded-full"></Image>
            </div>
            : null}
        </div>
    );
}

export default UserImage;