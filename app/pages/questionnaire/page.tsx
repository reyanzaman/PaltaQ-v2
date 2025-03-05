"use client";
//@ts-ignore

import { nunito } from "@/app/ui/fonts";
import React, { Suspense, useEffect, useState } from 'react';
import QuestionnaireForm from "@/app/components/questionnaire";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'

interface User {
    id: string;
    name: string;
    image: string;
    email: String;
    is_Admin: boolean;
    is_Faculty: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function Questionnaire(props) {

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

    useEffect(() => {
        document.title = "Questionnaire";
    }, []);

    if (status === 'loading' || loadingUser) {
        return <div className="lg:pl-[8em] pl-[2em] pt-[3em] text-left"><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }

return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={`${nunito.className} antialiased flex flex-col lg:pl-[8em]`}>
                <div className="pl-3 pr-3">
                    <div className="w-full pt-4 text-left mx-auto">
                        <div>
                            <QuestionnaireForm/>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}