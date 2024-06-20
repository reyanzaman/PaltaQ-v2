/* eslint-disable react/no-unescaped-entities */
"use client";

import { nunito } from "@/app/ui/fonts";
import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion, faComments, faStar, faCrown } from "@fortawesome/free-solid-svg-icons";
import Chart from 'chart.js/auto';

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
}

interface UserDetails {
    userId: string;
    score: number;
    rank: string;
    questionsAsked: number;
    paltaQAsked: number;
    successfulReports: number;
}

interface Question {
    id: string;
    userId: string;
    question: string;
    likes: number;
    dislikes: number;
    isAnonymous: boolean;
    score: number;
    user: User;
    paltaQ: number;
    createdAt: string;
    questionType: QuestionType;
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

export default function StudentDashboard({ user }: { user: User }) {
    const chartContainerQuestions = useRef<HTMLCanvasElement>(null);
    const chartInstanceQuestions = useRef<Chart<"line", number[], string> | null>(null);
    const chartContainerQuestionTypes = useRef<HTMLCanvasElement>(null);
    const chartInstanceQuestionTypes = useRef<Chart<"bar", number[], string> | null>(null);

    useEffect(() => {
        console.log(user.questions)
        if (user && user.questions) {
            // Prepare data for questions asked per day
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const questionData: { [key: string]: number } = {
                'Sunday': 0,
                'Monday': 0,
                'Tuesday': 0,
                'Wednesday': 0,
                'Thursday': 0,
                'Friday': 0,
                'Saturday': 0
            };

            user.questions.forEach(question => {
                const createdAt = new Date(question.createdAt);
                const dayOfWeek = daysOfWeek[createdAt.getDay()];
                questionData[dayOfWeek] += 1;
            });

            const labelsQuestions = Object.keys(questionData);
            const dataQuestions = Object.values(questionData);

            // Prepare data for types of questions per day
            const questionTypesData: { [key: string]: number[] } = {
                'Sunday': [0, 0, 0, 0, 0, 0],
                'Monday': [0, 0, 0, 0, 0, 0],
                'Tuesday': [0, 0, 0, 0, 0, 0],
                'Wednesday': [0, 0, 0, 0, 0, 0],
                'Thursday': [0, 0, 0, 0, 0, 0],
                'Friday': [0, 0, 0, 0, 0, 0],
                'Saturday': [0, 0, 0, 0, 0, 0]
            };

            user.questions.forEach(question => {
                const createdAt = new Date(question.createdAt);
                const dayOfWeek = daysOfWeek[createdAt.getDay()];
                const { questionType } = question;

                if (questionType && Array.isArray(questionType)) {
                    // Increment counts for each type in questionType
                    questionType.forEach(type => {
                        if (type.remembering) questionTypesData[dayOfWeek][0] += 1;
                        if (type.understanding) questionTypesData[dayOfWeek][1] += 1;
                        if (type.applying) questionTypesData[dayOfWeek][2] += 1;
                        if (type.analyzing) questionTypesData[dayOfWeek][3] += 1;
                        if (type.evaluating) questionTypesData[dayOfWeek][4] += 1;
                        if (type.creating) questionTypesData[dayOfWeek][5] += 1;
                    });
                }
            });

            const labelsQuestionTypes = Object.keys(questionTypesData);

            // Check if chartInstanceQuestions.current exists and destroy it
            if (chartInstanceQuestions.current) {
                chartInstanceQuestions.current.destroy();
            }

            // Create new Chart instance for questions asked per day (Line Chart)
            const ctxQuestions = chartContainerQuestions.current?.getContext('2d');
            if (ctxQuestions) {
                chartInstanceQuestions.current = new Chart(ctxQuestions, {
                    type: 'line',
                    data: {
                        labels: labelsQuestions,
                        datasets: [{
                            label: 'Questions Asked',
                            data: dataQuestions,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1,
                            fill: false,
                            pointBackgroundColor: 'rgb(75, 192, 192)',
                            pointRadius: 5,
                            pointHoverRadius: 8,
                            pointHoverBackgroundColor: 'rgb(75, 192, 192)',
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Day of Week'
                                }
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Number of Questions'
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Check if chartInstanceQuestionTypes.current exists and destroy it
            if (chartInstanceQuestionTypes.current) {
                chartInstanceQuestionTypes.current.destroy();
            }

            // Create new Chart instance for types of questions per day (Bar Chart)
            const ctxQuestionTypes = chartContainerQuestionTypes.current?.getContext('2d');
            if (ctxQuestionTypes) {
                chartInstanceQuestionTypes.current = new Chart(ctxQuestionTypes, {
                    type: 'bar',
                    data: {
                        labels: labelsQuestionTypes,
                        datasets: [
                            {
                                label: 'Remembering',
                                data: labelsQuestionTypes.map(day => questionTypesData[day][0]),
                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                borderColor: 'rgb(255, 99, 132)',
                                barPercentage: 0.5,
                                borderWidth: 1,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Understanding',
                                data: labelsQuestionTypes.map(day => questionTypesData[day][1]),
                                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                borderColor: 'rgb(54, 162, 235)',
                                borderWidth: 1,
                                barPercentage: 0.5,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Applying',
                                data: labelsQuestionTypes.map(day => questionTypesData[day][2]),
                                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                                borderColor: 'rgb(255, 206, 86)',
                                borderWidth: 1,
                                barPercentage: 0.5,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Analyzing',
                                data: labelsQuestionTypes.map(day => questionTypesData[day][3]),
                                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                borderColor: 'rgb(75, 192, 192)',
                                borderWidth: 1,
                                barPercentage: 0.5,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Evaluating',
                                data: labelsQuestionTypes.map(day => questionTypesData[day][4]),
                                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                                borderColor: 'rgb(153, 102, 255)',
                                borderWidth: 1,
                                barPercentage: 0.5,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Creating',
                                data: labelsQuestionTypes.map(day => questionTypesData[day][5]),
                                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                                borderColor: 'rgb(255, 159, 64)',
                                borderWidth: 1,
                                barPercentage: 0.5,
                                barThickness: 6,
                                maxBarThickness: 8,
                            }
                        ]
                    },
                    options: {
                        scales: {
                            x: {
                                stacked: false,
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Day of Week'
                                }
                            },
                            y: {
                                stacked: false,
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Number of Questions'
                                },
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
    }, [user]);

    function calculateProgress(score: number) {
        let minScore = 0, maxScore = 0;

        if (score >= 551 && score <= 1500) {
            minScore = 551;
            maxScore = 1500;
        } else if (score > 1500 && score <= 3000) {
            minScore = 1501;
            maxScore = 3000;
        } else if (score > 3000 && score <= 5000) {
            minScore = 3001;
            maxScore = 5000;
        } else if (score > 5000 && score <= 7000) {
            minScore = 5001;
            maxScore = 7000;
        } else if (score > 7000 && score <= 15000) {
            minScore = 7001;
            maxScore = 15000;
        } else if (score > 15000 && score <= 25000) {
            minScore = 15001;
            maxScore = 25000;
        } else if (score > 25000 && score <= 35000) {
            minScore = 25001;
            maxScore = 35000;
        } else if (score > 35000 && score <= 50000) {
            minScore = 35001;
            maxScore = 50000;
        } else if (score > 50000) {
            minScore = 50001;
            maxScore = 50001;
        }

        const progress = ((score - minScore) / (maxScore - minScore)) * 100;
        return progress;
    }

    // Assuming you have the user's score and rank
    const userScore = user.userDetails.score;
    const progress = calculateProgress(userScore);


    return (
        <div className={`${nunito.className} antialiased flex flex-col`}>
            <h6 className="text-base">{user.name}</h6>

            {/* Info */}
            <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-20 gap-6 border-light border w-fit lg:px-5 px-4 py-4 my-4">

                <div className="w-full">
                    <div className="card shadow-md border-light p-4 flex flex-col items-center lg:mt-4 lg:h-[8em] h-[9em]">
                        <FontAwesomeIcon icon={faCrown} size="2x" />
                        <h5 className="text-center pt-3">{user.userDetails.rank}</h5>
                    </div>
                    <h6 className="text-center pt-2 font-bold">Your Ranking</h6>
                </div>

                <div className="w-full">
                    <div className="card shadow-md border-light p-4 flex flex-col items-center lg:mt-4 lg:h-[8em] h-[9em]">
                        <FontAwesomeIcon icon={faStar} size="2x" />
                        <h5 className="text-center pt-3 lg:block hidden">{user.userDetails.score}</h5>
                        <h5 className="text-center pt-3 lg:hidden block">{user.userDetails.score} Points</h5>
                    </div>
                    <h6 className="text-center pt-2 font-bold">Your Score</h6>
                </div>

                <div className="w-full">
                    <div className="card shadow-md border-light p-4 flex flex-col items-center lg:mt-4 lg:h-[8em] h-[7.5em]">
                        <FontAwesomeIcon icon={faCircleQuestion} size="2x" />
                        <h5 className="text-center pt-3 text-2xl">{user.userDetails.questionsAsked}</h5>
                    </div>
                    <h6 className="text-center pt-2 font-bold">Questions Asked</h6>
                </div>

                <div className="w-full">
                    <div className="card shadow-md border-light p-4 flex flex-col items-center lg:mt-4 lg:h-[8em] h-[7.5em]">
                        <FontAwesomeIcon icon={faComments} size="2x" />
                        <h5 className="text-center pt-3 text-2xl">{user.userDetails.paltaQAsked}</h5>
                    </div>
                    <h6 className="text-center pt-2 font-bold">Palta Questions Asked</h6>
                </div>
            </div>

            {/* Progress Bar */}
            <h5>Your progress for next ranking: {Math.round(progress)}%</h5>
            <div className="progress progress-xl lg:w-[96%]" style={{ height: '1.5em' }}>
                <div
                    className="progress-bar progress-bar-striped bg-info"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{
                        width: `${progress}%`,
                        animation: "3s ease 0s 1 normal none running animate-positive",
                        opacity: 1
                    }}
                >
                </div>
            </div>

            <hr className="lg:hidden mt-4"></hr>

            {/* Chart */}
            <div className="flex lg:flex-row flex-col my-4 mx-auto lg:space-x-4 w-[96%] space-y-4">
                <div className="w-full">
                    <h6 className="lg:ml-9 py-4">Questions Asked by Day of Week</h6>
                    <canvas ref={chartContainerQuestions} width="300" height="200"></canvas>
                </div>
                <hr className="lg:hidden mt-4"></hr>
                <div className="w-full">
                    <h6 className="lg:ml-9 py-4">Types of Questions Asked by Day of Week</h6>
                    <canvas ref={chartContainerQuestionTypes} width="300" height="200"></canvas>
                </div>
            </div>

        </div>
    )
}