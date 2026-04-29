"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faAngleDown, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/questionCategory';

interface Topic { id: string; name: string; classId: string }

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

export default function QuestionBox({ classId, classCode, handleRefreshQs }: { classId: string, classCode: string, handleRefreshQs: Function }) {
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
                // Parse topics and set them; default to first topic if none selected
                const topicsData = await response.json();
                setTopics(topicsData);

                // If we don't have a topic selected yet, pick the first one
                if (Array.isArray(topicsData) && topicsData.length > 0 && !selectedTopicId) {
                    setSelectedTopic(topicsData[0].name);
                    setSelectedTopicId(topicsData[0].id);
                }

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

        const response = await fetch(`/api/questions?question=${encodeURIComponent(question)}&tid=${encodeURIComponent(selectedTopicId)}&tname=${encodeURIComponent(selectedTopic)}&cid=${encodeURIComponent(classId)}&cCode=${encodeURIComponent(classCode)}`, {
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

    const toggleAnonymity: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        setIsAnonymous(!isAnonymous);
    };

    return (
        <form className="lg:w-[90%] lg:px-3 pt-2" onSubmit={handleSubmit}>

            {/* Topic Dropdown*/}
            <div className='px-2 my-4'>
                <div className='lg:pt-0 pt-2 items-start'>
                    {/* DropDown */}
                    <div className='flex flex-row gap-4'>
                        <h4 className='py-1 pl-2 mb-4'>Topic:</h4>
                        <div className='relative z-20 lg:-translate-y-0 -translate-y-1'>
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
            </div>

            {/* Question Box */}
            <div
                className="lg:w-[100%] w-[93%] mx-auto relative lg:pl-3"
            >
                <div className="mb-6">
                    <div className="relative">
                        <textarea
                            id="questionMain"
                            className="w-full resize-none rounded-2xl px-5 py-4 lg:text-base text-sm text-zinc-700 placeholder-zinc-400 bg-[#e6e7ee] shadow-[inset_4px_4px_6px_#c5c6cb,inset_-4px_-4px_6px_#ffffff] focus:outline-none focus:shadow-[inset_2px_2px_4px_#c5c6cb,inset_-2px_-2px_4px_#ffffff] lg:pr-[7rem] lg:pb-[3.75rem] overflow-y-auto break-words max-h-[50vh]"
                            style={{ height: '6.5em' }}
                            placeholder="Throw a question to your peers!"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />

                        {/* Desktop: floating icon buttons inside textarea */}
                        <div className="absolute bottom-[2.5em] right-[2.5em] scale-[1.5] hidden lg:flex items-center gap-1 z-10">
                            <button
                                type="button"
                                onClick={toggleAnonymity}
                                aria-label={isAnonymous ? 'Disable anonymity' : 'Enable anonymity'}
                                className="p-2 rounded-full"
                            >
                                <FontAwesomeIcon
                                    icon={isAnonymous ? faEyeSlash : faEye}
                                    className={`w-4 h-4 ${isAnonymous ? 'text-rose-700' : 'text-zinc-600'}`}
                                />
                            </button>

                            <button
                                type="submit"
                                aria-label="Submit question"
                                className="p-2 rounded-full"
                            >
                                <FontAwesomeIcon
                                    icon={faPaperPlane}
                                    className="w-4 h-4 text-[#31344b]"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Mobile buttons below textarea */}
                    <div className="mt-4 flex gap-3 lg:hidden px-1">
                        <button
                            type="button"
                            onClick={toggleAnonymity}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
                         ${isAnonymous
                                    ? 'bg-[#e6e7ee] shadow-[inset_3px_3px_5px_#c5c6cb,inset_-3px_-3px_5px_#ffffff] text-rose-700'
                                    : 'bg-[#e6e7ee] shadow-[3px_3px_5px_#c5c6cb,-3px_-3px_5px_#ffffff] text-zinc-600'
                                }`}
                        >
                            <FontAwesomeIcon
                                icon={isAnonymous ? faEyeSlash : faEye}
                                className={`w-4 ${isAnonymous ? 'text-rose-700' : 'text-zinc-600'}`}
                            />
                            <span>{isAnonymous ? 'Anonymous' : 'Anonymous'}</span>
                        </button>

                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#31344b] bg-[#e6e7ee] shadow-[3px_3px_5px_#c5c6cb,-3px_-3px_5px_#ffffff] active:shadow-[inset_3px_3px_5px_#c5c6cb,inset_-3px_-3px_5px_#ffffff] transition"
                        >
                            <FontAwesomeIcon icon={faPaperPlane} className="w-4" />
                            <span>Submit</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className='lg:pb-3 pb-1'>
                {loading ? (
                    <h1 className="text-2xl font-bold px-2">Loading...</h1>
                ) : (
                    <div>
                        <h5 className='lg:px-3 px-2 lg:text-lg text-base'>Progress to next ranking: {Math.round(progress) ? `${Math.round(progress)}%` : "Loading"} ({progressNum ? progressNum : ""})</h5>
                        <div className="progress progress-xl lg:w-[96%] lg:mx-3 mx-2" style={{ height: '1.5em' }}>
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
