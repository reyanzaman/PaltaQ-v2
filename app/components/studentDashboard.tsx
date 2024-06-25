/* eslint-disable react/no-unescaped-entities */
"use client";

import { nunito } from "@/app/ui/fonts";
import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion, faComments, faStar, faCrown, faAngleDown, faTrophy } from "@fortawesome/free-solid-svg-icons";
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

interface ClassEnrollment {
    id: string;
    userId: string;
    classId: string;
    user: User;
    score: number;
    rank: string;
    questionCount: number;
    paltaQCount: number;
    class: Class;
    updatedAt: Date;
}

interface Class {
    id: string;
    name: string;
    code: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
    enrollments: ClassEnrollment[]
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

export default function StudentDashboard({ user }: { user: User }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('' as string);
    const [selectedClassIdx, setSelectedClassIdx] = useState(0 as number);
    const [classEnrollment, setClassEnrollment] = useState<ClassEnrollment[]>([]);
    const [enrolledStudents, setEnrolledStudents] = useState<ClassEnrollment[]>([]);
    const [selectedClass, setSelectedClass] = useState('');

    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const chartContainerQuestions = useRef<HTMLCanvasElement>(null);
    const chartInstanceQuestions = useRef<Chart<"line", number[], string> | null>(null);
    const chartContainerQuestionTypes = useRef<HTMLCanvasElement>(null);
    const chartInstanceQuestionTypes = useRef<Chart<"bar", number[], string> | null>(null);

    function getLast7DaysWithDayNames() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                date: date.toISOString().split('T')[0], // Get the date in YYYY-MM-DD format
                dayName: date.toLocaleDateString('en-US', { weekday: 'long' }) // Get the day name
            });
        }
        return days;
    }  

    // Chart
    useEffect(() => {
        if (selectedClass !== '' && selectedClassId !== '' && user && user.questions) {
            setLoading(true);

            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            const last7DaysWithDayNames = getLast7DaysWithDayNames();

            const questionData: { [key: string]: number } = last7DaysWithDayNames.reduce((acc, item) => {
                acc[item.date] = 0;
                return acc;
            }, {} as { [key: string]: number });
            
            const paltaQData: { [key: string]: number } = last7DaysWithDayNames.reduce((acc, item) => {
                acc[item.date] = 0;
                return acc;
            }, {} as { [key: string]: number });

            user.questions.forEach(question => {
                if (question.classId === selectedClassId) {
                    const createdAt = new Date(question.createdAt).toISOString().split('T')[0];
                    if (questionData[createdAt] !== undefined) {
                        questionData[createdAt] += 1;
                    }
                }
            });
            
            user.paltaQuestions.forEach(paltaQ => {
                if (paltaQ.question.classId === selectedClassId) {
                    const createdAt = new Date(paltaQ.createdAt).toISOString().split('T')[0];
                    if (paltaQData[createdAt] !== undefined) {
                        paltaQData[createdAt] += 1;
                    }
                }
            });

            const labels = last7DaysWithDayNames.map(item => item.dayName);
            const dataQuestions = last7DaysWithDayNames.map(item => questionData[item.date]);
            const dataPaltaQ = last7DaysWithDayNames.map(item => paltaQData[item.date]);

            type QuestionTypesData = {
                [key: string]: number[];
            };

            // Prepare data for types of questions per day
            const questionTypesData: QuestionTypesData = last7DaysWithDayNames.reduce((acc, item) => {
                acc[item.date] = [0, 0, 0, 0, 0, 0];
                return acc;
            }, {} as QuestionTypesData);

            // Bar Chart Data
            user.questions.forEach(question => {
                if (question.classId === selectedClassId) {
                    const createdAt = new Date(question.createdAt).toISOString().split('T')[0];
                    const { questionType } = question;
            
                    if (questionType && Array.isArray(questionType)) {
                        if (questionTypesData[createdAt] !== undefined) {
                            // Increment counts for each type in questionType
                            questionType.forEach(type => {
                                if (type.remembering) questionTypesData[createdAt][0] += 1;
                                if (type.understanding) questionTypesData[createdAt][1] += 1;
                                if (type.applying) questionTypesData[createdAt][2] += 1;
                                if (type.analyzing) questionTypesData[createdAt][3] += 1;
                                if (type.evaluating) questionTypesData[createdAt][4] += 1;
                                if (type.creating) questionTypesData[createdAt][5] += 1;
                            });
                        }
                    }
                }
            });
            
            user.paltaQuestions.forEach(paltaQ => {
                if (paltaQ.question.classId === selectedClassId) {
                    const createdAt = new Date(paltaQ.createdAt).toISOString().split('T')[0];
                    const { questionType } = paltaQ;
            
                    if (questionType && Array.isArray(questionType)) {
                        if (questionTypesData[createdAt] !== undefined) {
                            // Increment counts for each type in questionType
                            questionType.forEach(type => {
                                if (type.remembering) questionTypesData[createdAt][0] += 1;
                                if (type.understanding) questionTypesData[createdAt][1] += 1;
                                if (type.applying) questionTypesData[createdAt][2] += 1;
                                if (type.analyzing) questionTypesData[createdAt][3] += 1;
                                if (type.evaluating) questionTypesData[createdAt][4] += 1;
                                if (type.creating) questionTypesData[createdAt][5] += 1;
                            });
                        }
                    }
                }
            });
            
            const labelsQuestionTypes = last7DaysWithDayNames.map(item => item.dayName);
            const dataRemembering = last7DaysWithDayNames.map(item => questionTypesData[item.date][0]);
            const dataUnderstanding = last7DaysWithDayNames.map(item => questionTypesData[item.date][1]);
            const dataApplying = last7DaysWithDayNames.map(item => questionTypesData[item.date][2]);
            const dataAnalyzing = last7DaysWithDayNames.map(item => questionTypesData[item.date][3]);
            const dataEvaluating = last7DaysWithDayNames.map(item => questionTypesData[item.date][4]);
            const dataCreating = last7DaysWithDayNames.map(item => questionTypesData[item.date][5]);


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
                        labels: labels,
                        datasets: [
                            {
                                label: 'Questions',
                                data: dataQuestions,
                                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                                fill: false,
                                tension: 0
                            },
                            {
                                label: 'PaltaQ',
                                data: dataPaltaQ,
                                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                                borderColor: 'rgba(153, 102, 255, 1)',
                                borderWidth: 1,
                                fill: false,
                                tension: 0
                            }
                        ]
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
                                    text: 'Number of Entries'
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
                                data: dataRemembering,
                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                borderColor: 'rgb(255, 99, 132)',
                                barPercentage: 0.5,
                                borderWidth: 1,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Understanding',
                                data: dataUnderstanding,
                                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                borderColor: 'rgb(54, 162, 235)',
                                borderWidth: 1,
                                barPercentage: 0.5,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Applying',
                                data: dataApplying,
                                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                                borderColor: 'rgb(255, 206, 86)',
                                borderWidth: 1,
                                barPercentage: 0.5,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Analyzing',
                                data: dataAnalyzing,
                                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                borderColor: 'rgb(75, 192, 192)',
                                borderWidth: 1,
                                barPercentage: 0.5,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Evaluating',
                                data: dataEvaluating,
                                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                                borderColor: 'rgb(153, 102, 255)',
                                borderWidth: 1,
                                barPercentage: 0.5,
                                barThickness: 6,
                                maxBarThickness: 8,
                            },
                            {
                                label: 'Creating',
                                data: dataCreating,
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
        setLoading(false);
    }, [user, selectedClass]);

    // For fetching class enrollments
    useEffect(() => {

        const fetchEnrollments = async () => {
            setLoadingUsers(true);
            try {
                const response = await fetch(`/api/enrollment?id=${user.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    const sortedData = data.sort((a: ClassEnrollment, b: ClassEnrollment) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                    setClassEnrollment(sortedData);
                    if (sortedData.length > 0) {
                        setSelectedClass(sortedData[0].class.name);
                        setSelectedClassId(sortedData[0].class.id);
                    }
                } else {
                    // Handle error
                    console.error('Failed to fetch classes');
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                setLoadingUsers(false);
            }
            setLoadingUsers(false);
        };

        fetchEnrollments();
    }, []);

    // For fetching all enrolled students
    useEffect(() => {
        const fetchAllEnrollments = async () => {
            setLoadingUsers(true);
            try {
                const response = await fetch(`/api/scoreboard?id=${selectedClassId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setEnrolledStudents(data);
                } else {
                    // Handle error
                    console.error('Failed to fetch classes');
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                setLoadingUsers(false);
            }
            setLoadingUsers(false);
        };

        if (selectedClassId !== '') {
            if (classEnrollment.length > 0) {
                fetchAllEnrollments();
            }
        }
    }, [selectedClass]);

    if (loading) {
        return <div className=""><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }

    const handleDropdown = () => {
        setShowDropdown(!showDropdown);
    }

    function calculateProgress(score: number) {
        let minScore = 0, maxScore = 0;

        if (score >= 0 && score <= 550) {
            minScore = 0;
            maxScore = 550;
        } else if (score >= 551 && score <= 1500) {
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

        let progressNum

        if(score == undefined){
            progressNum = "Loading";
        } else {
            progressNum = `${score}/${maxScore}`;
        }

        if (maxScore === minScore) {
            // Handle the case where maxScore equals minScore (score > 50000)
            return { progress: 100, progressNum }; // Assuming 100% progress as score is greater than 50000
        } else {
            if (score == undefined){
                const progress = 0;
                return { progress, progressNum };
            } else {
                const progress = ((score - minScore) / (maxScore - minScore)) * 100;
                return { progress, progressNum };
            }
        }
    }

    // Assuming you have the user's score and rank
    const userScore = classEnrollment[selectedClassIdx]?.score;
    const { progress, progressNum } = calculateProgress(userScore);


    return (
        <div className={`${nunito.className} antialiased flex flex-col`}>
            <h6 className="text-base">{user.name}</h6>

            {/* DropDown */}
            <div className='lg:mt-4'>
                <label className='lg:hidden block pb-2 text-base font-bold'>Select your topic</label>

                <span className='dropdown'>
                    <div className='btn-group mr-2 mb-2'>
                        <button type='button' className='btn btn-primary' onClick={handleDropdown}>{selectedClass}</button>
                        <button
                            type='button'
                            className='btn btn-primary dropdown-toggle dropdown-toggle-split'
                            data-toggle='dropdown'
                            aria-haspopup='true'
                            aria-expanded='false'
                            onClick={handleDropdown}
                        >
                            <FontAwesomeIcon
                                icon={faAngleDown}
                                className="w-[1.5rem] text-[#31344b]"
                            />
                        </button>

                        <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`} id='dropdown' x-placement="bottom-start" style={{ position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(0px,40px,0px)' }}>
                            {classEnrollment?.map((enrollment: ClassEnrollment, index: number) => (
                                <a
                                    key={index}
                                    className='dropdown-item'
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedClass(enrollment.class.name);
                                        setSelectedClassIdx(index);
                                        setSelectedClassId(enrollment.class.id);
                                        setShowDropdown(false);
                                    }}
                                >
                                    {enrollment.class.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </span>
            </div>

            {/* Info */}
            <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-20 gap-8 w-fit lg:pr-5 py-4 my-4">

                <div className="w-full">
                    <div className="card shadow-soft border-light p-4 flex flex-col items-center lg:mt-4 lg:h-[8em] h-[9em]">
                        <FontAwesomeIcon icon={faCrown} size="2x" />
                        <h5 className="text-center pt-3 text-gray-800">{classEnrollment[selectedClassIdx]?.rank}</h5>
                    </div>
                    <h6 className="text-center pt-3 font-bold text-gray-800">Your Ranking</h6>
                </div>

                <div className="w-full">
                    <div className="card shadow-soft border-light p-4 flex flex-col items-center lg:mt-4 lg:h-[8em] h-[9em]">
                        <FontAwesomeIcon icon={faStar} size="2x" />
                        <h5 className="text-center pt-3 text-2xl text-gray-800">{classEnrollment[selectedClassIdx]?.score}</h5>
                    </div>
                    <h6 className="text-center pt-3 font-bold text-gray-800">Your Score</h6>
                </div>

                <div className="w-full">
                    <div className="card shadow-soft border-light p-4 flex flex-col items-center lg:mt-4 lg:h-[8em] h-[7.5em]">
                        <FontAwesomeIcon icon={faCircleQuestion} size="2x" />
                        <h5 className="text-center pt-3 text-2xl text-gray-800">{classEnrollment[selectedClassIdx]?.questionCount}</h5>
                    </div>
                    <h6 className="text-center pt-3 font-bold text-gray-800">Questions Asked</h6>
                </div>

                <div className="w-full">
                    <div className="card shadow-soft border-light p-4 flex flex-col items-center lg:mt-4 lg:h-[8em] h-[7.5em]">
                        <FontAwesomeIcon icon={faComments} size="2x" />
                        <h5 className="text-center pt-3 text-2xl text-gray-800">{classEnrollment[selectedClassIdx]?.paltaQCount}</h5>
                    </div>
                    <h6 className="text-center pt-3 font-bold text-gray-800">Palta Questions Asked</h6>
                </div>
            </div>

            {/* Progress Bar */}
            <div>
                {loading ? (
                    <h1 className="text-2xl font-bold">Loading...</h1>
                ) : (
                <div>
                    <h5>Your progress for next ranking: {Math.round(progress) ? Math.round(progress): "Loading"}% &nbsp;({progressNum ? progressNum : ""})</h5>
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
                </div>
                )}
            </div>

            <hr className="lg:hidden mt-4"></hr>

            {/* Charts */}
            <div>
                {loading ? (
                    <h1 className="text-2xl font-bold">Loading...</h1>
                ) : (
                    <div className="flex lg:flex-row flex-col my-4 mx-auto lg:space-x-4 w-[96%] space-y-4">
                        <div className="w-full">
                            <h6 className="lg:ml-9 py-4">Questions Asked by Day of Week in Selected Class</h6>
                            <canvas ref={chartContainerQuestions} width="300" height="200"></canvas>
                        </div>
                        <hr className="lg:hidden mt-4"></hr>
                        <div className="w-full">
                            <h6 className="lg:ml-9 py-4">Levels of Questions Asked by Day of Week in Selected Class</h6>
                            <canvas ref={chartContainerQuestionTypes} width="300" height="200"></canvas>
                        </div>
                    </div>
                )}
            </div>

            {/* Leaderboard */}
            <div className="mb-8">
                <h4 className="py-4 font-bold">Leaderboard</h4>

                {/* Rankings */}
                <div>
                    {loadingUsers ? (
                        <h1 className="text-2xl font-bold">Loading...</h1>
                    ) : (
                        <div className="my-3">
                            {selectedClassId !== undefined && (
                                <div>
                                    <table className="table table-striped table-responsive-sm shadow-soft rounded">
                                        <thead>
                                            <tr>
                                                <th className="border-0" scope="col">Rank Position</th>
                                                <th className="border-0" scope="col">Name</th>
                                                <th className="border-0" scope="col">Score</th>
                                                <th className="border-0" scope="col">Rank Title</th>
                                                <th className="border-0" scope="col">Questions Asked</th>
                                                <th className="border-0" scope="col">PaltaQ Asked</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrolledStudents
                                                .sort((a: any, b: any) => b.score - a.score)
                                                .map((student: any, index: any) => {
                                                    var crownIcon;

                                                    if (index === 0) {
                                                        crownIcon = <FontAwesomeIcon icon={faTrophy} className="text-amber-500 pr-1" />
                                                    } else if (index === 1) {
                                                        crownIcon = <FontAwesomeIcon icon={faTrophy} className="text-zinc-500 pr-1" />
                                                    } else if (index === 2) {
                                                        crownIcon = <FontAwesomeIcon icon={faTrophy} className="text-amber-800 pr-1" />
                                                    }
                                                    return (
                                                        <tr key={student.user.id}>
                                                            <td>{crownIcon} {index + 1}</td>
                                                            <td>{student.user.name}</td>
                                                            <td>{student.score}</td>
                                                            <td>{student.rank}</td>
                                                            <td>{student.questionCount}</td>
                                                            <td>{student.paltaQCount}</td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}