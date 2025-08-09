/* eslint-disable react/no-unescaped-entities */
"use client";

import { nunito } from "@/app/ui/fonts";
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { toast } from 'react-toastify';

import { Question, ClassFaculty, Topic, PreQuestionnaire, PostQuestionnaire, } from '@prisma/client';
import QuestionBox from "@/app/components/questionbox";
import QuestionsList from "@/app/components/questionslist";

interface ClassEnrollment {
    id: string;
    userId: string;
    classId: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    class: Class;
    preQuestionnaire: PreQuestionnaire;
    postQuestionnaire: PostQuestionnaire;
}

interface Class {
    id: string;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
    endsAt: string;
    enrollments: ClassEnrollment[]
    faculties: ClassFaculty[]
    topics: Topic[]
    questions: Question[]
    questionnaire: boolean
}

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
    preQuestionnaire: PreQuestionnaire;
    postQuestionnaire: PostQuestionnaire;
}

interface UserDetails {
    userId: string;
    score: number;
    rank: string;
    questionsAsked: number;
    paltaQAsked: number;
    successfulReports: number;
}

export default function QuestionComponent({ user }: { user: User }) {

    const [classes, setClasses] = useState<ClassEnrollment[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class>();
    const [classCode, setClassCode] = useState('' as string);
    const [loading, setLoading] = useState(false);

    const [refresh, setRefresh] = useState(false);
    const [refreshQuestions, setRefreshQuestions] = useState(false);

    const topRef = useRef<HTMLDivElement | null>(null);

    const handleRefreshQuestions = () => {
        setRefreshQuestions(!refreshQuestions);
    }

    const createDefaultQuestionnaire = async (userId: string, classEnrId: string, type: string) => {
        try {
            const response = await fetch(`/api/questionnaire/default?uid=${userId}&ceid=${classEnrId}&type=${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('Default questionnaire created:');
            } else {
                // Handle error
                console.error('Failed to create default questionnaire');
            }

        } catch (error: any) {
            console.error('Error fetching questions:', error);
        }
    }

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/classes/student?id=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setClasses(data);
                } else {
                    // Handle error
                    console.error('Failed to fetch classes');
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                setLoading(false);
            }
            setLoading(false);
        };

        fetchClasses();
    }, [refresh]);

    useEffect(() => {
        const callQuestionnaire = async () => {
            try {
                if (selectedClass) {
                    if (selectedClass.code === 'FBA6B9') {
                        return;
                    }

                    if (selectedClass.questionnaire == false) {
                        return;
                    }

                    const init_response = await fetch(`/api/classes/enrollment?code=${selectedClass.code}&uid=${user.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    const init_data = await init_response.json() as ClassEnrollment;

                    if (!init_data.preQuestionnaire) {
                        createDefaultQuestionnaire(user.id, init_data.id, 'pre').then(
                            () => callQuestionnaire()
                        );
                    } else if (!init_data.postQuestionnaire) {
                        createDefaultQuestionnaire(user.id, init_data.id, 'post').then(
                            () => callQuestionnaire()
                        );
                    }

                    const today = new Date();
                    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

                    const endsAt = new Date(selectedClass.endsAt);
                    const endsAtDateOnly = new Date(endsAt.getFullYear(), endsAt.getMonth(), endsAt.getDate(), 0, 0, 0, 0);

                    if (todayDateOnly >= endsAtDateOnly) {
                        if (init_data.postQuestionnaire?.isCompleted == false) {
                            if (!user.is_Faculty && !user.is_Admin) {
                                // Show loading indicator
                                toast.loading('Redirecting to post questionnaire page...');

                                setTimeout(function () {
                                    window.location.href = `/pages/questionnaire?id=${user.id}&ceid=${init_data.id}&cname=${init_data.class.name}&type=post`;
                                }, 1000);  // Redirect after 1 second
                            }
                        }
                    } else {
                        if (init_data.preQuestionnaire?.isCompleted == false) {
                            if (!user.is_Faculty && !user.is_Admin) {
                                // Show loading indicator
                                toast.loading('Redirecting to pre questionnaire page...');

                                setTimeout(function () {
                                    window.location.href = `/pages/questionnaire?id=${user.id}&ceid=${init_data.id}&cname=${init_data.class.name}&type=pre`;
                                }, 1000);  // Redirect after 1 second
                            }
                        }
                    }
                }
            } catch (error: any) {
                console.error('Error fetching questions:', error);
            }
        }

        callQuestionnaire();

    }, [selectedClass]);

    useLayoutEffect(() => {
    // Run after DOM mutations but before paint, then again on next frame.
    // This avoids Safari/iOS jumping when layout expands after fetch/render.
    let raf1 = 0, raf2 = 0;

    const scrollToTop = () => {
        // Anchor-first
        topRef.current?.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
        // Hard fallback for various mobile browsers
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
    };

    raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(scrollToTop);
    });

    return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
    };
}, [selectedClass]);

    const joinClass = async (e: any) => {
        e.preventDefault()
        setLoading(true);

        try {
            const response = await fetch(`/api/classes?code=${classCode}&uid=${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const responseText = await response.json();

            if (response.ok) {
                setClassCode('');
                setRefresh(!refresh);
                toast.success(responseText.message);
            } else {
                // Handle error
                console.error('Failed to submit class details');
                toast.error(responseText.message);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            setLoading(false);
        }
        setLoading(false);
    };

    const selectClass = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
        e.preventDefault();
        setLoading(true);
        setSelectedClass(classes[index].class);
        if (selectedClass === classes[index].class) {
            setSelectedClass(undefined);
        }
        // setRefresh(!refresh);
        setLoading(false);
    };

    const displayQuestions = () => {
        return (
            <div className="min-h-[27em]">

                <hr className="border-b border-gray-400 mb-3"></hr>

                <div className="">
                    <QuestionBox classId={selectedClass?.id || ''} classCode={selectedClass?.code || ''} handleRefreshQs={handleRefreshQuestions} />
                </div>

                <hr className="border-b border-gray-400 mt-5 mb-5"></hr>

                <QuestionsList classId={selectedClass?.id || ''} refresh={refreshQuestions} handleRefresh={handleRefreshQuestions} />
            </div>
        );
    };

    if (loading) {
        return <div className="pl-2"><h1 className="ml-2 text-2xl font-bold lg:translate-x-0 translate-x-[0.68em] lg:-translate-y-4 -translate-y-[1.3em]">Loading...</h1></div>;
    }

    return (
        <div className={`${nunito.className} antialiased flex flex-col`}>
            <div ref={topRef} />

            {/* Select Another Class Header */}
            <div className="flex lg:flex-row flex-col justify-between lg:items-end">
                <div className="lg:mt-4">
                    <h1 className="ml-4">Questions</h1>
                    <p className="font-bold text-lg ml-4 pl-1 mb-0">{selectedClass ? `${selectedClass.name} Classroom` : 'Please select a class'}</p>
                </div>

                {selectedClass && (
                    <div className="lg:-translate-y-2 lg:mr-4 mt-4">
                        <button
                            className="pl-3 btn btn-primary text-success ml-4 mb-0 w-fit"
                            type="button"
                            onClick={() => setSelectedClass(undefined)}>
                            Select Another Class
                        </button>
                    </div>
                )}
            </div>

            {/* Top Part - Join/Select Class */}
            {selectedClass == null ? (
                <div className="flex lg:flex-row flex-col my-4 lg:w-75 w-full ">

                    {/* Select Class */}
                    <div className="border border-gray-400 rounded-lg px-2 py-4 lg:mr-4 w-full lg:h-[75vh] h-[28em] overflow-y-auto scrollbar-thin scrollbar-webkit lg:order-first order-last">
                        <h3 className="pl-3">Enrolled classes</h3>
                        <p className="pl-3">Select a class to access questions and palta questions</p>

                        {classes.length !== 0 && (
                            <div>
                                {/* <p className="pl-3">Classes Enrolled: {classes.length}</p> */}
                                <table className="table table-hover table-responsive-sm">
                                    <thead>
                                        <tr>
                                            <th className="border-0" scope="col" id="className">Class Name</th>
                                            <th className="border-0" scope="col" id="classCode">Faculty</th>
                                            <th className="border-0" scope="col" id="classCode">Class Code</th>
                                            <th className="border-0" scope="col" id="classCode">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {classes.map((classItem: any, index: any) => (
                                            <tr key={index}>
                                                <td>
                                                    {classItem.class.name}

                                                </td>
                                                <td>
                                                    {classItem.class.faculties[0].user.name}

                                                </td>
                                                <td>
                                                    {classItem.class.code}
                                                </td>
                                                <td className="flex lg:flex-row flex-col items-center">

                                                    <button
                                                        className="hover:text-blue-800 transition-colors duration-500 lg:block hidden"
                                                        onClick={(e) => selectClass(e, index)}
                                                        type="button"
                                                    >
                                                        Select
                                                    </button>
                                                    <button
                                                        className="hover:text-blue-800 transition-colors duration-500 lg:hidden block mb-2"
                                                        onClick={(e) => selectClass(e, index)}
                                                        type="button"
                                                    >
                                                        Select
                                                    </button>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        )}

                        {classes.length === 0 && <p className="lg:pl-4 pl-3">No classes joined yet.</p>}
                    </div>

                    {/* Join Class */}
                    <div className="lg:w-50 w-full">
                        <hr className="lg:hidden block mt-0 pt-0 pb-2"></hr>
                        <h5 className="text-neutral-700 ml-4">Join a class to get started</h5>
                        <form onSubmit={joinClass} className="flex flex-col lg:pr-20 px-3 py-4 mb-5 gap-4">
                            <input
                                id="classCode"
                                className="form-control pr-5o5 resize-none py-3 pl-3"
                                placeholder="Enter a class code"
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value)}
                            />
                            <p className="px-2 py-0 my-0 text-sm text-justify text-zinc-500">If you want to join a demo class and try it out, please use this code: <b>FBA6B9</b></p>
                            <button className="btn animate-down-2 text-info" type="submit">Join Class</button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="py-2 mb-8 w-full">
                    {/* Display/Post Questions */}
                    {displayQuestions()}
                </div>
            )}
        </div>
    )
}