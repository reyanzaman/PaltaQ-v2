"use client"

import { nunito } from "@/app/ui/fonts";

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

import UserImage from "@/app/components/userimage";
import FacultyClass from "@/app/components/facultyclass";
import StudentDashboard from "@/app/components/studentDashboard";

import { faGraduationCap, faChalkboardUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
    questions: Question[];
    classes: ClassEnrollment[];
    paltaQuestions: PaltaQ[];
}

interface UserDetails {
    userId: string;
    totalScore: number;
    questionsAsked: number;
    paltaQAsked: number;
    successfulReports: number;
}

interface Question {
    id: string;
    userId: string;
    topicId: string;
    classId: string;
    question: string;
    likes: number;
    dislikes: number;
    isAnonymous: boolean;
    score: number;
    user: User;
    paltaQ: number;
    createdAt: string;
    questionType: QuestionType;
    paltaQBy: PaltaQ[];
}

interface QuestionType {
    id: String
    questionId: String
    paltaQId: String
    remembering: Boolean
    understanding: Boolean
    applying: Boolean
    analyzing: Boolean
    evaluating: Boolean
    creating: Boolean
}

interface PaltaQ {
    id: string;
    userId: string;
    questionId: string;
    paltaQ: string;
    score: number;
    likes: number;
    dislikes: number;
    isAnonymous: boolean;
    isArchived: boolean;
    user: User;
    question: Question;
    questionType: QuestionType;
    createdAt: string;
    updatedAt: string;
}

interface ClassEnrollment {
    id: string;
    userId: string;
    classId: string;
    user: User;
    score: number;
    rank: string;
    questionCount: number;
    paltaQCount: number;
}

// @ts-ignore
export default function Dashboard(props) {

    const { data: session, status } = useSession();
    const router = useRouter()

    const [user, setUser] = useState<User>();
    const [loadingUser, setLoadingUser] = useState(true);
    const [userStatus, setUserStatus] = useState('student');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${session?.user?.email}?include=Details`, {
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
        document.title = "Dashboard";
    }, []);

    useEffect(() => {
        setUserStatus(user?.is_Faculty ? 'faculty' : 'student');
    }, [user]);

    if (status === 'loading' || loadingUser) {
        return <div className="pl-[10em] pt-[3em]"><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }

    return (
        <div className={`${nunito.className} antialiased flex flex-row`}>
            <UserImage />

            {userStatus==="faculty" ? (
                <div className="lg:ml-[7em] lg:pl-4 lg:pr-4 lg:mt-[4em] mt-[5em] w-full">
                    <div className="flex flex-row gap-x-4">
                        <h1 className="text-2xl font-bold pad-l1">Faculty Dashboard</h1>
                        <div className="lg:block hidden">
                            <button
                                type="button" 
                                className="btn btn-sm btn-primary px-3"
                                onClick={() => setUserStatus('student')}
                            >
                                Switch to Student
                            </button>
                        </div>
                        <div className="block lg:hidden">
                            <button
                                type="button" 
                                className="btn btn-sm btn-primary px-3"
                                onClick={() => setUserStatus('student')}
                            >
                                <FontAwesomeIcon icon={faGraduationCap} />
                            </button>
                        </div>
                    </div>
                    {/* @ts-ignore */}
                    <FacultyClass user={user} />
                </div>
            ) : (
                <div className="lg:ml-[7em] lg:mt-[4em] mt-[5em] w-full">
                    <div className="flex flex-row gap-x-4">
                        <h1 className="text-2xl font-bold pl-3">Student Dashboard</h1>
                        {user?.is_Faculty && (
                            <div>
                                <div className="hidden lg:block">
                                    <button
                                        type="button" 
                                        className="btn btn-sm btn-primary px-3"
                                        onClick={() => setUserStatus('faculty')}
                                    >
                                        Switch to Faculty
                                    </button>
                                </div>
                                <div className="block lg:hidden">
                                    <button
                                        type="button" 
                                        className="btn btn-sm btn-primary px-3"
                                        onClick={() => setUserStatus('faculty')}
                                    >
                                        <FontAwesomeIcon icon={faChalkboardUser} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {user && (
                        // @ts-ignore
                        <StudentDashboard user={user} />
                    )}
                </div>
            )}
        </div>
    )
}