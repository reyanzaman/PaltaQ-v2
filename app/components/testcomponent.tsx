"use client";

import { useEffect, useState } from 'react';
import { nunito } from "@/app/ui/fonts";
import { toast } from 'react-toastify';

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'

export default function TestComponent() {

    const { data: session, status } = useSession();
    const [textInput, setTextInput] = useState('');
    const [response, setResponse] = useState('');
    const router = useRouter()

    useEffect(() => {
        // Checking Admin Status
        if (status === 'loading') {
            return; // Wait for session to load
        }
        // If session is not available, redirect to login page
        if (!session) {
            router.push('/login');
            return;
        }
        const checkAdminStatus = async () => {
            try {
                const response = await fetch(`/api/getisAdmin?email=${session?.user?.email}`);
                const data = await response.json();

                if (response.ok && data.message === 'true') {
                    // If user is an admin, you can allow access to the page or perform other actions
                    console.log('Access Granted to Admin');
                } else {
                    // If not an admin, redirect to a different page
                    router.push('/');
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                router.push('/'); // Redirect to error page if there’s an issue
            }
        };
        // Check admin status if session is available
        if (session?.user?.email) {
            checkAdminStatus();
        }

        // Fetch user details and check admin status
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${session?.user?.email}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'public, no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    next: {
                        tags: ['users']
                    },
                    cache: 'no-store',
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                if (!data.is_Admin) {
                    router.push('/')
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                router.push('/');
            }
        };

        fetchUser();
        console.log('Session:', session);

    }, [session]);
    
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            // Show loading toast
            const loadingToastId = toast.loading('Submitting your question...');

            const response = await fetch(`/api/huggingface`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: textInput }),
            });

            const data = await response.json();

            if (response.ok) {
                const responseText = data.message;
                setResponse(responseText);
    
                toast.update(loadingToastId, {
                    render: "Response Generated",
                    type: 'success',
                    isLoading: false,
                    autoClose: 5000,
                });
            } else {
                console.error('HuggingFace API Error');
                toast.update(loadingToastId, {
                    render: data.error || 'HuggingFace API Error',
                    type: 'error',
                    isLoading: false,
                    autoClose: 5000,
                });
            }
        }
        catch (error) {
            console.error('Error handling data submission:', error);
        }
    }

    if (status === 'loading') {
        return <div className="pl-[10em] pt-[3em]"><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }

    return (
        <div className={`${nunito.className} antialiased flex flex-col`}>
            <h1 className='mb-4'>Testing Grounds</h1>
            <input className='shadow-inset p-3' type="text" placeholder="Enter text here" />
            <button className='btn btn-primary w-fit my-4' onClick={handleSubmit}>Submit</button>
            <p>{response ? response : "No response yet..."}</p>
        </div>
    );
}