"use client"

import { nunito } from "@/app/ui/fonts";

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

import UserImage from "@/app/components/userimage";
import FacultyClass from "@/app/components/facultyclass";

interface User {
    id: string;
    name: string;
    image: string;
    email: String;
    is_Admin: boolean;
    is_Faculty: boolean;
    createdAt: string;
    updatedAt: string;
    userDetails: UserDetails;
}

interface UserDetails {
    userId: string;
    score: number;
    rank: string;
    questionsAsked: number;
    paltaQAsked: number;
    successfulReports: number;
}

export default function Dashboard(props) {

    const { data: session, status } = useSession();
    const router = useRouter()

    const [user, setUser] = useState<User>();
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${session?.user?.email}?include=UD`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                setUser(data);
                setLoadingUser(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                router.push('/');
            }
        };

        if (status === 'loading') {
            // Do nothing while session is loading
            return;
        }

        if (!session) {
            router.push('/');
        } else {
            fetchUser();
        }
    }, [session, status]);

    if (status === 'loading' || loadingUser) {
        return <div className="pl-[10em] pt-[3em]"><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }

    return (
        <div className={`${nunito.className} antialiased flex flex-row`}>
            <UserImage />

            {user?.is_Faculty ? (
                <div className="lg:ml-[7em] pl-4 pr-4 lg:mt-[4em] mt-[5em] lg:w-[80em] w-full">
                    <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
                    <FacultyClass user={user} />
                </div>
            ) : (
                <div className="lg:ml-[7em] pl-4 pr-4 lg:mt-[4em] mt-[5em] lg:w-[80em] w-full">
                    <h1 className="text-2xl font-bold">Student Dashboard</h1>
                </div>
            )}
        </div>
    )
}