"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faAngleDown, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';

import { Topic } from '@prisma/client';
import GeneratedResponse from './generatedResponse';

interface ClassEnrollment {
    id: string;
    userId: string;
    classId: string;
    user: User;
    score: number;
    rank: string;
    questionCount: number;
    paltaQCount: number;
    updatedAt: Date;
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
    classes: ClassEnrollment[];
}

interface UserDetails {
    userId: string;
    totalScore: number;
    questionsAsked: number;
    paltaQAsked: number;
    successfulReports: number;
}

export default function QuestionBox({ classId, handleRefreshQs}: { classId: string, handleRefreshQs: Function}) {
    const [question, setQuestion] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState('Select Topic' as string);
    const [selectedTopicId, setSelectedTopicId] = useState('' as string);
    const [topics, setTopics] = useState<Topic[]>();

    const [loading, setLoading] = useState(false);

    const [enrollment, setEnrollment] = useState<ClassEnrollment>();
    const [refresh, setRefresh] = useState(false);

    const [progress, setProgress] = useState(0);
    const [progressNum, setProgressNum] = useState('');

    const [response, setResponse] = useState('');
    const [lastQuestion, setLastQuestion] = useState('');
    const [visibility, setVisibility] = useState(false);

    const toggleVisibility = (state: boolean) => {
        setVisibility(state);
    }

    useEffect(() => {
        setLoading(true);

        const fetchTopics = async () => {
            const response = await fetch(`/api/topics?cid=${classId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Handle successful submission
                setTopics(await response.json())
                setLoading(false);
            } else {
                // Handle error
                console.error('Failed to get topics');
                setLoading(false);
            }
        }

        const fetchProgressData = async () => {
            try {
                const response = await fetch(`/api/progressData?id=${classId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setEnrollment(data);
                    setLoading(false);
                } else {
                    // Handle error
                    console.error('Failed to fetch progress data');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching progress data:', error);
                setLoading(false);
            }
        };

        fetchTopics();
        fetchProgressData();
    }, [refresh]);

    const handleDropdown = () => {
        setShowDropdown(!showDropdown);
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Handle validation  
        if (question.length < 10) {
            toast.error('Question too short!');
            return;
        } else if (question.length >= 350) {
            toast.error('Question too long!');
            return;
        }

        if (selectedTopicId === '') {
            toast.error('Please select a topic!');
            return;
        }

        // Show loading toast
        const loadingToastId = toast.loading('Submitting your question...');

        const response = await fetch(`/api/questions?question=${question}&tid=${selectedTopicId}&tname=${selectedTopic}&cid=${classId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isAnonymous: isAnonymous, category: QuestionCategory.Topic }),
        });

        const responseData = await response.json();

        if (response.ok) {
            // Handle successful submission
            setQuestion('');

            const responseText = responseData.message;
            const updateText = responseText.split('|')[1];
            const mainText = responseText.split('|')[0];

            if (updateText && updateText !== "Rank unchanged") {
                toast.dark(updateText);
            }

            toast.update(loadingToastId, {
                render: mainText,
                type: 'success',
                isLoading: false,
                autoClose: 5000,
            });

            setRefresh(!refresh);
            handleRefreshQs();
        } else {
            // Handle error
            console.error('Failed to submit question (Frontend)');
            toast.update(loadingToastId, {
                render: responseData.message || 'Question submission failed (Frontend)',
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
        }
    };

    useEffect(() => {

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

            if (score == undefined) {
                progressNum = "Loading";
            } else {
                progressNum = `${score}/${maxScore}`;
            }

            if (maxScore === minScore) {
                // Handle the case where maxScore equals minScore (score > 50000)
                return { progress: 100, progressNum }; // Assuming 100% progress as score is greater than 50000
            } else {
                if (score == undefined) {
                    const progress = 0;
                    return { progress, progressNum };
                } else {
                    const progress = ((score - minScore) / (maxScore - minScore)) * 100;
                    return { progress, progressNum };
                }
            }
        }

        const userScore = enrollment?.score || 0;
        const { progress, progressNum } = calculateProgress(userScore);
        setProgress(progress);
        setProgressNum(progressNum);
    }, [enrollment]);

    return (
        <form className="lg:w-3/4 pl-3 pt-2 pr-3" onSubmit={handleSubmit}>

            <h4 className='py-1 pl-2'>Try asking a question here:</h4>
            <p className='mb- pl-2'>Select a topic, decide if you want to stay anonymous and then ask your question</p>

            {/* Topic, Anonymity */}
            <div className='lg:pt-2 pl-2 mb-4'>
                <div className='flex lg:flex-row flex-col lg:gap-x-12 gap-y-3 lg:pt-0 pt-2 items-start'>

                    {/* Anonymity */}
                    <label className='inline-flex items-center cursor-pointer order-last'>
                        <input type="checkbox" value={isAnonymous.toString()} className="sr-only peer" onChange={() => setIsAnonymous(!isAnonymous)} />
                        <div className="relative w-16 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-transparent after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-500 after:border-zinc-800 after:border after:rounded-full after:h-5 after:w-7 after:transition-all peer-checked:bg-zinc-500-800"></div>
                        {isAnonymous ? (
                            <FontAwesomeIcon
                                icon={faEyeSlash}
                                className={`ml-3 lg:hidden text-lg text-[#31344b]`}
                            />
                        ) : (
                            <FontAwesomeIcon
                                icon={faEye}
                                className={`ml-3 lg:hidden text-lg text-[#31344b]`}
                            />
                        )}
                        <span className="ms-2 text-lg font-bold">Toggle Anonymity ({isAnonymous == false ? "Off" : "On"})</span>
                    </label>

                    {/* DropDown */}
                    <div className='-translate-y-2'>
                        <label className='lg:hidden block pb-2 text-base font-bold'>Select your topic</label>

                        <span className='dropdown'>
                            <div className='btn-group mr-2 mb-2'>
                                <button type='button' className='btn btn-primary' onClick={handleDropdown}>{selectedTopic}</button>
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
                                    {topics?.map((topic: Topic, index: any) => (
                                        <a
                                            key={index}
                                            className='dropdown-item'
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedTopic(topic.name);
                                                setSelectedTopicId(topic.id);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            {topic.name}
                                        </a>
                                    ), [])}
                                </div>
                            </div>
                        </span>
                    </div>

                </div>
            </div>

            {/* Question */}
            <div className="mb-4">
                <textarea
                    id="questionMain"
                    className="form-control pr-5o5 resize-none pl-3"
                    style={{ height: '6em' }}
                    placeholder="Throw a question to your peers!"
                    value={question}
                    onChange={(e) => {setQuestion(e.target.value);}}
                />
                <button
                    type="submit"
                    className="float-end lg:-translate-y-[3.2em] -translate-y-[3.3em] -translate-x-5 scale-[1.4]"
                >
                    <FontAwesomeIcon
                        icon={faPaperPlane}
                        className="w-[1.5rem] text-[#31344b] -translate-y-2"
                    />
                </button>
            </div>

            {/* Progress Bar */}
            <div>
                {loading ? (
                    <h1 className="text-2xl font-bold">Loading...</h1>
                ) : (
                    <div>
                        <h5>Your progress for next ranking: {Math.round(progress) ? Math.round(progress) : "Loading"}% &nbsp;({progressNum ? progressNum : ""})</h5>
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
        </form>
    );
}
