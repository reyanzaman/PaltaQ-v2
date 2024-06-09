"use client";

import { faFlag, faThumbsUp, faThumbsDown, faComment } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/app/ui/neomorphism.css";
import "@/app/ui/style.css";
import Image from 'next/image';

import React, { useEffect, useState } from 'react';

interface Question {
    id: string;
    userId: string;
    question: string;
    createdAt: string;
    likes: number;
    dislikes: number;
    isAnonymous: boolean;
    score: number;
    user: User;
    paltaQ: number;
}

interface User {
    id: string;
    name: string;
    image: string;
}

export default function RecentQuestions() {

    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/api/getLatestQuestions', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setQuestions(data);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        // Initial fetch
        fetchQuestions();

        const intervalId = setInterval(fetchQuestions, 5000); // Fetch every 5 seconds

        return () => clearInterval(intervalId); // Cleanup function to clear interval

    }, []); // Empty dependency array ensures the effect runs only once

    return (
        <div>
            {/* Question Card */}
            {questions.map((question: any) => (
                <div key={question.id} className="card bg-primary shadow-inset border-light w-[90%] mx-auto mb-4">
                    <div className="px-4 pt-4 pb-2">
                        <div className="flex flex-row justify-between mb-2">
                            <div className="flex items-center">
                                <div className='icon shadow-inset border border-light rounded-circle p-1'>
                                    {question.isAnonymous ? (
                                        <Image
                                            src="/default_image.png"
                                            alt="Anonymous Image"
                                            width={30}
                                            height={30}
                                            className='rounded-full'
                                        ></Image>
                                    ) : (
                                        <Image
                                            src={question.user.image}
                                            alt="User Image"
                                            width={30}
                                            height={30}
                                            className='rounded-full'
                                        ></Image>
                                    )}
                                </div>

                                <span className="font-bold text-lg ml-2">{question.isAnonymous ? "Anonymous User" : question.user.name}</span>
                            </div>
                            <button className="lg:flex flex-row items-start px-2 mx-3 hover:text-red-800 transition-colors duration-500 translate-x-5">

                                <FontAwesomeIcon icon={faFlag} className="w-[1rem] mr-2 lg:pt-[1.5px] pt-0 lg:translate-y-[0.15em] -translate-y-1" />
                                <span className="font-bold lg:block hidden">Report</span>

                            </button>
                        </div>

                        <div className="flex flex-row pt-2 pb-1">
                            <h4 className="lg:text-lg text-base text-justify">
                                {question.question}
                            </h4>
                        </div>

                    </div>

                    <div className='badge-inline'>
                        <div className={`p-3  ${question.score >= 100
                                ? "badge-success"
                                : question.score >= 50
                                    ? "badge-secondary"
                                    : "badge-danger"
                            }`}>
                            {question.score >= 100
                                ? <span className='font-bold text-sm pl-2'>HIGH LEVEL QUESTION</span>
                                : question.score >= 50
                                    ? <span className='font-bold text-sm pl-2'>MEDIUM LEVEL QUESTION</span>
                                    : <span className='font-bold text-sm pl-2'>LOW LEVEL QUESTION</span>}
                            <span className='ml-2'> | </span>
                            <span className="font-bold text-sm items-end ml-2">
                                SCORE: {question.score}
                            </span>
                        </div>
    
                        <div className="flex mt-2 ml-4 pt-2 pb-3">
                            <button><FontAwesomeIcon icon={faThumbsUp} className="hover:text-blue-500 active:text-blue-600 duration-500 pb-1" /></button>
                            <span className="small ml-1 mr-2">{question.likes}</span>
                            <span className="small mr-2">|</span>
                            <button><FontAwesomeIcon icon={faThumbsDown} className="hover:text-red-500 active:text-red-600 duration-500 pb-1" /></button>
                            <span className="small ml-1 mr-2">{question.dislikes}</span>
                            <span className="small mr-2">|</span>
                            <button><FontAwesomeIcon icon={faComment} className="hover:text-indigo-500 active:text-indigo-600 duration-500 pb-1" /></button>
                            <span className="small ml-1">{question.paltaQ}</span>
                            <span className="small ml-3">
                                {new Date(question.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date(question.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(/:\\d+ /, ' ')}
                            </span>
                        </div>
                        
                    </div>

                </div>
            ))}
        </div>
    );
}