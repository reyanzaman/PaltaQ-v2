"use client";

import { faPaperPlane, faFlag, faThumbsUp, faThumbsDown, faComment, faEye, faEyeSlash, faWandMagicSparkles, faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/app/ui/neomorphism.css";
import Image from 'next/image';

import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';
import { getRankDetails } from '../utils/rankings';
import { uid } from '../api/submitGenQuestion/route';
import GeneratedResponse from './generatedResponse';
import { Tooltip } from "react-tooltip";

interface RankDetails {
    colorCode: string;
    icon: string;
}

interface Likes {
    id: string;
    userId: string;
    questionId: string;
}

interface Dislikes {
    id: string;
    userId: string;
    questionId: string;
}

interface PaltaQ {
    id: string;
    userId: string;
    questionId: string;
    parentId: string;
    paltaQ: String;
    likes: number;
    dislikes: number;
    isAnonymous: boolean;
    score: number;
    user: User;
    likedBy: Likes[];
    dislikedBy: Dislikes[];
    createdAt: string;
    parent: PaltaQ;
    repliesLength: number;
    questionType: QuestionType;
}

interface QuestionType {
    id: string;
    questionId: string;
    paltaQId: string;
    remembering: boolean;
    understanding: boolean;
    applying: boolean;
    analyzing: boolean;
    evaluating: boolean;
    creating: boolean;
}

interface User {
    id: string;
    name: string;
    image: string;
}

interface PaltaQProps {
    paltaQId: string;
    mainQuestionId: string;
    userId: string;
    index: number;
    visibleInputBox: { [key: string]: boolean };
    toggleInputBox: (questionId: string, alternate?: boolean) => void;
    visibleTextBoxes: { [key: string]: boolean };
    handleButtonClick: (questionId: string, position: any, userName: string) => void;
    textBoxPosition: string;
    userName: string;
    resetClick: () => void;
    from: string;
    classId: string;
    topicId: string;
    refresh: boolean;
    toggleRefresh: () => void;
}

const PaltaQComponent: React.FC<PaltaQProps> = ({
    paltaQId,
    mainQuestionId,
    userId,
    index,
    visibleInputBox,
    toggleInputBox,
    visibleTextBoxes,
    handleButtonClick,
    textBoxPosition,
    userName,
    resetClick,
    from,
    classId,
    topicId,
    refresh,
    toggleRefresh
}) => {

    const { data: session, status } = useSession();
    const [questions, setQuestions] = useState<PaltaQ[]>([]);
    const [isAnonymous, setIsAnonymous] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState(false);

    const [paltaQInputs, setPaltaQInputs] = useState<{ [key: string]: any }>({});
    const [rank, setRank] = useState<{ [key: string]: RankDetails }>({});

    const [responseAI, setResponseAI] = useState<{ [key: string]: string }>({});
    const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
    const [lastQuestion, setLastQuestion] = useState<{ [key: string]: string }>({});

    const toggleVisibility = (questionId: string, state: boolean) => {
        setVisibility(prev => ({ ...prev, [questionId]: state }));
    }

    const handleInputChange = (questionId: string) => (event: any) => {
        const value = event.target.value;
        setPaltaQInputs(prev => ({ ...prev, [questionId]: value }));
    };

    const handleLike = async (questionId: string, userId: string) => {
        try {
            if (loading) return; // Prevent if already loading
            setLoading(true);

            // Reject if not logged in
            if (!session) {
                toast.info('Please log in to like the question');
                setLoading(false);
                return;
            }
            const paltaQ = questions.find(p => p.id === questionId);
            if (paltaQ?.dislikedBy.some(dislike => dislike.userId === userId)) {
                toast.info('You have already disliked this comment');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/likeQuestion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId, questionId: questionId, type: 'palta' })
            });

            if (!response.ok) {
                throw new Error(`Error: Failed to Like Question`);
            }

            const result = await response.text();

            // Update the local state based on the response
            setQuestions(prevQuestions => {
                return prevQuestions.map(q => {
                    if (q.id === questionId) {
                        const updatedLikes = result === "+1" ? q.likes + 1 : q.likes - 1;
                        const updatedLikedBy = result === "+1"
                            ? [...q.likedBy, { id: Date.now().toString(), userId, questionId }]
                            : q.likedBy.filter(like => like.userId !== userId);
                        return { ...q, likes: updatedLikes, likedBy: updatedLikedBy };
                    }
                    return q;
                });
            });
        } catch (error) {
            console.error('Error liking question:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDislike = async (questionId: string, userId: string) => {
        try {
            if (loading) return; // Prevent if already loading
            setLoading(true);

            // Reject if not logged in
            if (!session) {
                toast.info('Please log in to dislike the question');
                setLoading(false);
                return;
            }

            const paltaQ = questions.find(p => p.id === questionId);
            if (paltaQ?.likedBy.some(like => like.userId === userId)) {
                toast.info('You have already liked this comment');
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/dislikeQuestion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId, questionId: questionId, type: 'palta' })
            });

            if (!response.ok) {
                throw new Error(`Error: Failed to Dislike Question`);
            }

            const result = await response.text();

            // Update the local state based on the response
            setQuestions(prevQuestions => {
                return prevQuestions.map(q => {
                    if (q.id === questionId) {
                        const updatedDislikes = result === "+1" ? q.dislikes + 1 : q.dislikes - 1;
                        const updatedDislikedBy = result === "+1"
                            ? [...q.dislikedBy, { id: Date.now().toString(), userId, questionId }]
                            : q.dislikedBy.filter(dislike => dislike.userId !== userId);
                        return { ...q, dislikes: updatedDislikes, dislikedBy: updatedDislikedBy };
                    }
                    return q;
                });
            });
        } catch (error) {
            console.error('Error disliking question:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handlePaltaQ = (questionId: string, quesPaltaQId: string) => async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return; // Prevent if already loading
        setLoading(true);

        const pQuestion = paltaQInputs[questionId] || '';

        // Handle validation 
        if (pQuestion.length < 10) {
            toast.error('Question too short!');
            setLoading(false);
            return;
        } else if (pQuestion.length > 300) {
            toast.error('Question too long!');
            setLoading(false);
            return;
        }

        // Show loading toast
        const loadingToastId = toast.loading('Submitting your question...');

        try {
            let response;
            if (from == "topic") {
                response = await fetch(`/api/questions?question=${pQuestion}&qid=${questionId}&cid=${classId}&tid=${topicId}&Mqid=${mainQuestionId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isAnonymous: isAnonymous[questionId], category: QuestionCategory.PaltaPalta }),
                });
            } else if (from == "general") {
                response = await fetch('/api/submitGenQuestion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: pQuestion, category: QuestionCategory.PaltaPalta, quesID: questionId, paltaQuesID: quesPaltaQId, mainQuesID: mainQuestionId, anonymity: isAnonymous[questionId] }),
                });
            } else {
                toast.update(loadingToastId, {
                    render: 'Invalid request!',
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000,
                });
            }

            const responseData = await response?.json();

            if (response && response.ok) {
                // Handle successful submission
                setPaltaQInputs(prev => ({ ...prev, [questionId]: '' }));

                const responseText = responseData.message;
                const [mainText, updateText] = responseText.split('|');

                if (updateText && updateText !== "Rank unchanged") {
                    toast.dark(updateText);
                }

                toast.update(loadingToastId, {
                    render: mainText || responseData.error || 'PaltaQ submission failed',
                    type: 'success',
                    isLoading: false,
                    autoClose: 6000,
                });

                // Fetching the latest paltaQ
                const response = await fetch(`/api/getPaltaQ?pqid=${paltaQId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'public, no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    next: {
                        tags: ['paltaQ']
                    },
                    cache: 'no-store'
                });

                if (!response.ok) throw new Error('Failed to get latest paltaQ');
                const data = await response.json();
                setQuestions(data);
                setLoading(false);
                toggleRefresh();
            } else {
                // Handle error
                console.error('Failed to submit palta question');
                toast.update(loadingToastId, {
                    render: responseData.message || responseData.error || 'PaltaQ submission failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000,
                });
                setLoading(false);
            }

            resetClick();
            toggleInputBox(questionId, false);
            toggleAnonymity(questionId, true);
        } catch (error) {
            console.error('Failed to submit palta question:', error);
            toast.error('Failed to submit PaltaQ');
        }
    };

    const toggleAnonymity = (questionId: string, alternate = false) => {
        if (alternate) {
            setIsAnonymous(prev => ({
                ...prev,
                [questionId]: false
            }));
        } else {
            setIsAnonymous(prev => ({
                ...prev,
                [questionId]: !prev[questionId]
            }));
        }
    };

    const fetchPaltaQ = async () => {
        try {
            const response = await fetch(`/api/getPaltaQ?pqid=${paltaQId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                next: {
                    tags: ['paltaQ']
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Error: Failed to get latest paltaQ`);
            }

            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching paltaQ:', error);
        }
    };

    const handleAIGenerate = async (question: string, questionId: string) => {
        try {
            const response = await fetch('/api/improve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                throw new Error(`Error: Failed to generate AI response`);
            }

            const responseData = await response.json();

            setResponseAI(prevState => ({
                ...prevState,
                [questionId]: responseData.improvement_suggestion
            }));
            setLastQuestion(prevState => ({
                ...prevState,
                [questionId]: question
            }));
            setVisibility(prev => ({ ...prev, [questionId]: true }));

        } catch (error) {
            toast.error('Failed to generate AI response');
            console.log('Error in handleAIGenerate:', error);
        }
    }

    useEffect(() => {
        fetchPaltaQ();

        const intervalId = setInterval(fetchPaltaQ, 15000); // Fetch every 15 seconds
        return () => clearInterval(intervalId); // Cleanup function to clear interval

    }, [userId, refresh]);

    useEffect(() => {
        if (questions.length === 0) return;

        let timeoutId: NodeJS.Timeout | null = null;

        const fetchHighestScores = async () => {
            // Gather user IDs from Questions and associated PaltaQs
            const userIds: string[] = [];

            questions.forEach(question => {
                // Add Question user ID
                if (!userIds.includes(question.user.id)) {
                    userIds.push(question.user.id);
                }
            });
            const response = await fetch(`/api/highestScore?uids=${userIds.join(',')}`);
            const data = await response.json();

            // Now set the rank details for each question based on highestScores
            const ranks: { [key: string]: RankDetails } = {};

            for (const userId in data) {
                const userScore = data[userId];

                // Assuming 'ranks' is where you store results
                if (userScore !== undefined || userScore !== null) {
                    ranks[userId] = getRankDetails(userScore);  // Using userId as key
                } else {
                    ranks[userId] = { colorCode: '', icon: '' };  // Default values if score is undefined
                }
            }
            console.log(ranks);
            setRank(ranks);
        };

        const debouncedFetchHS = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                fetchHighestScores();
                timeoutId = null;
            }, 500); // Adjust the debounce time as needed (e.g., 500ms)
        };

        const fetchHighestClassScores = async () => {
            // Gather user IDs from Questions and associated PaltaQs
            const userIds: string[] = [];

            questions.forEach((question: { user: { id: string; }; }) => {
                // Add Question user ID
                if (!userIds.includes(question.user.id)) {
                    userIds.push(question.user.id);
                }
            });
            const response = await fetch(`/api/highestScore/classwise?cid=${classId}&uids=${userIds.join(',')}`);
            const data = await response.json();

            // Now set the rank details for each question based on highestScores
            const ranks: { [key: string]: RankDetails } = {};

            for (const userId in data) {
                const userScore = data[userId];

                // Assuming 'ranks' is where you store results
                if (userScore !== undefined || userScore !== null) {
                    ranks[userId] = getRankDetails(userScore);  // Using userId as key
                } else {
                    ranks[userId] = { colorCode: '', icon: '' };  // Default values if score is undefined
                }
            }
            console.log(ranks);
            setRank(ranks);
        };

        const debouncedFetchHCS = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                fetchHighestClassScores();
                timeoutId = null;
            }, 800);
        };

        if (from == "general") {
            debouncedFetchHS();
        } else {
            debouncedFetchHCS();
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };

    }, [questions]);

    const sortedQuestions = questions.slice().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return (
        <div className="mt-2">
            {questions.length > 0 && (
                <h6 className='text-zinc-400 text-sm'>PaltaQ Depth: {index + 1}</h6>
            )}
            <div>
                {sortedQuestions
                    .map((paltaQ: any, idx: number) => (

                        // PaltaQ Card
                        <div key={paltaQ.id}>
                            <div className={`flex flex-col justify-between pt-2 px-3 w-full border-l-2 border-gray-500 ${idx === sortedQuestions.length - 1 ? 'mb-3' : ''}`}>

                                {/* PaltaQ User Details */}
                                <div className="flex flex-row justify-between mb-2">
                                    <div className="flex w-full items-start sm:items-center gap-1">

                                        {/* Avatar */}
                                        <div className="icon shadow-inset border border-light rounded-full p-1 shrink-0">
                                            {paltaQ.isAnonymous ? (
                                                <Image
                                                    src="/default_image.png"
                                                    alt="Anonymous Image"
                                                    width={30}
                                                    height={30}
                                                    className='rounded-full w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]'
                                                ></Image>
                                            ) : (
                                                <Image
                                                    src={paltaQ.user.image}
                                                    alt="User Image"
                                                    width={30}
                                                    height={30}
                                                    className='rounded-full w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]'
                                                ></Image>
                                            )}
                                        </div>

                                        {/* Name / Rank / Date */}
                                        <div className="flex flex-col min-w-0">
                                            {/* Top row: Name + Rank icon + Faculty tag*/}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {(() => {
                                                    const isSelf = paltaQ.user.id === userId;
                                                    const isFaculty = !!paltaQ.user.is_Faculty;
                                                    const userRank = rank?.[paltaQ.user.id];

                                                    const baseName = paltaQ.isAnonymous
                                                        ? `User@${paltaQ.user.id.slice(0, 8)}${isSelf ? ' (You)' : ''}`
                                                        : (paltaQ.user.name.length > 16
                                                            ? paltaQ.user.name.split(' ').slice(0, 2).join(' ')
                                                            : paltaQ.user.name);

                                                    // Do NOT color Guest User. Otherwise use rank color.
                                                    const nameStyle = { color: `#${userRank?.colorCode || ''}` };

                                                    return (
                                                        <div className="flex items-center gap-1 min-w-0">
                                                            {/* Name */}
                                                            <span
                                                                className="font-bold text-sm lg:text-base ml-2 truncate"
                                                                style={nameStyle}
                                                                title={baseName}
                                                            >
                                                                {baseName}
                                                            </span>

                                                            {/* Faculty badge (style preserved) */}
                                                            {isFaculty && (
                                                                <span className="font-bold text-sm sm:text-base text-sky-800">
                                                                    (Faculty)
                                                                </span>
                                                            )}

                                                            {/* Rank Icon (hide when viewing as guest per your logic) */}
                                                            {userRank && (
                                                                <Image
                                                                    src={`/${userRank.icon}`}
                                                                    alt="Rank Icon"
                                                                    width={25}
                                                                    height={25}
                                                                    className="min-w-[20px] min-h-[20px] w-[20px] h-[20px] sm:w-[25px] sm:h-[25px]"
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            {/* Date (kept your exact formatting, just aligned and smaller on mobile) */}
                                            <span className="small ml-2 text-xs sm:text-sm text-neutral-600">
                                                {new Date(paltaQ.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                                {', '}
                                                {new Date(paltaQ.createdAt)
                                                    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                                    .replace(/:\\d+ /, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* PaltaQ Question */}
                                <div className="flex flex-row pt-2 lg:pb-2 pb-0 mb-0 px-1">
                                    <h4 className="lg:text-base text-sm lg:text-justify text-left p-0 m-0 text-neutral-700">
                                        {paltaQ.paltaQ}
                                    </h4>
                                </div>

                                {/* Bottom Part */}

                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {/* Level */}
                                    <div
                                        className={`order-2 sm:order-1 badge ${paltaQ.score >= 100
                                            ? 'text-danger'
                                            : paltaQ.score >= 50
                                                ? 'text-secondary'
                                                : 'text-success'
                                            }`}
                                    >
                                        {paltaQ.score >= 100 ? (
                                            <span className="font-bold text-xs sm:text-sm px-1">HIGH LEVEL</span>
                                        ) : paltaQ.score >= 50 ? (
                                            <span className="font-bold text-xs sm:text-sm px-1">MID LEVEL</span>
                                        ) : (
                                            <span className="font-bold text-xs sm:text-sm px-1">LOW LEVEL</span>
                                        )}
                                    </div>

                                    {/* Score */}
                                    <div className="order-2 sm:order-1 badge">
                                        <span className="font-bold text-xs sm:text-sm p-1">
                                            SCORE: {paltaQ.score}
                                        </span>
                                    </div>

                                    {/* Blooms Badge */}
                                    <div className="flex flex-wrap items-center gap-1">
                                        {paltaQ.questionType[0].remembering && (
                                            <div className="badge bg-[#393d71] px-2" data-tooltip-content="Remembering..." data-tooltip-id="PQ-badge-remember">
                                                <span className="font-bold text-white text-[10px] sm:text-xs">RE</span>
                                            </div>
                                        )}
                                        {paltaQ.questionType[0].understanding && (
                                            <div className="badge bg-[#63899f] px-1.5 py-1" data-tooltip-content="Understanding..." data-tooltip-id="PQ-badge-understand">
                                                <span className="font-bold text-white text-[10px] sm:text-xs">UN</span>
                                            </div>
                                        )}
                                        {paltaQ.questionType[0].applying && (
                                            <div className="badge bg-[#576042] px-1.5 py-1" data-tooltip-content="Applying..." data-tooltip-id="PQ-badge-apply">
                                                <span className="font-bold text-white text-[10px] sm:text-xs">AP</span>
                                            </div>
                                        )}
                                        {paltaQ.questionType[0].analyzing && (
                                            <div className="badge bg-[#578a72] px-1.5 py-1" data-tooltip-content="Analyzing..." data-tooltip-id="PQ-badge-analyze">
                                                <span className="font-bold text-white text-[10px] sm:text-xs">AN</span>
                                            </div>
                                        )}
                                        {paltaQ.questionType[0].evaluating && (
                                            <div className="badge bg-[#dca146] px-1.5 py-1" data-tooltip-content="Evaluating..." data-tooltip-id="PQ-badge-evaluate">
                                                <span className="font-bold text-white text-[10px] sm:text-xs">EV</span>
                                            </div>
                                        )}
                                        {paltaQ.questionType[0].creating && (
                                            <div className="badge bg-[#cb484f] px-1.5 py-1" data-tooltip-content="Creating..." data-tooltip-id="PQ-badge-create">
                                                <span className="font-bold text-white text-[10px] sm:text-xs">CR</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Palta Question Actions */}
                                <div className="flex flex-wrap items-center lg:gap-3 gap-[6px] lg:px-1 px-0 sm:px-3 lg:mt-4 mt-3 w-full lg:ml-0 ml-1">
                                    {/* Like */}
                                    <button onClick={() => handleLike(paltaQ.id, userId)} disabled={loading} className="flex items-center gap-1">
                                        <FontAwesomeIcon
                                            icon={faThumbsUp}
                                            className={`hover:text-blue-500 active:text-blue-600 duration-500 pb-1 ${paltaQ.likedBy && paltaQ.likedBy.some((like: { userId: string; }) => like.userId === userId) ? 'text-blue-500' : ''}`}
                                        />
                                        <span className="small lg:text-base text-sm">{paltaQ.likes}</span>
                                    </button>

                                    <span className="text-zinc-400" aria-hidden>|</span>

                                    {/* Dislike */}
                                    <button onClick={() => handleDislike(paltaQ.id, userId)} disabled={loading} className="flex items-center gap-1">
                                        <FontAwesomeIcon
                                            icon={faThumbsDown}
                                            className={`hover:text-red-500 active:text-red-600 duration-500 pb-1 ${paltaQ.dislikedBy && paltaQ.dislikedBy.some((dislike: { userId: string; }) => dislike.userId === userId) ? 'text-red-500' : ''}`}
                                        />
                                        <span className="small lg:text-base text-sm">{paltaQ.dislikes}</span>
                                    </button>

                                    {index < 4 && (<span className="small mr-2">|</span>)}

                                    {/* Show PaltaQ */}
                                    {index < 4 && (
                                        <div className='flex flex-row'>
                                            <div className='flex flex-row'>
                                                <button onClick={() => toggleInputBox(paltaQ.id)} className="flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faComment} className={`hover:text-indigo-500 active:text-indigo-600 duration-500 pb-1 ${visibleInputBox[paltaQ.id] ? 'text-indigo-500' : ''}`} />
                                                    <span className="small lg:text-base text-sm">{paltaQ.repliesLength}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {index < 4 && (<span className="small mr-2">|</span>)}

                                    {/* PaltaQ */}
                                    {index < 4 && (
                                        <div className='flex flex-row'>
                                            <button onClick={() => {
                                                handleButtonClick(paltaQ.id, `paltaQ${index + 1}`, paltaQ.isAnonymous ? 'Anonymous User' : paltaQ.user.name);
                                                toggleAnonymity(paltaQ.id, true);
                                            }}
                                                className="flex items-center gap-1"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faComments}
                                                    className={`lg:text-base text-sm hover:text-indigo-500 active:text-indigo-600 duration-300 ${visibleInputBox[paltaQ.id] ? 'text-indigo-500' : ''}`}
                                                />
                                                <span
                                                    className={`lg:block hidden font-bold lg:text-base text-sm text-zinc-600 group-hover:text-emerald-600 duration-200 ${textBoxPosition === 'mainQ' ? 'text-emerald-700' : ''}`}
                                                >
                                                    PaltaQ
                                                </span>
                                                <span
                                                    className={`lg:hidden block font-bold lg:text-base text-sm text-zinc-600 group-hover:text-emerald-600 duration-200 ${textBoxPosition === 'mainQ' ? 'text-emerald-700' : ''}`}
                                                >
                                                    PQ
                                                </span>
                                            </button>
                                        </div>
                                    )}

                                    <span className="text-zinc-400" aria-hidden>|</span>

                                    {/* Improve */}
                                    <button onClick={() => handleAIGenerate(paltaQ.paltaQ, paltaQ.id)} className="flex items-center gap-1 group">
                                        <FontAwesomeIcon
                                            icon={faWandMagicSparkles}
                                            className={`lg:text-base text-sm group-hover:translate-y-[-1px] duration-200`}
                                        />
                                        <span className="font-bold text-base lg:block hidden -translate-y-[1px] group-hover:text-blue-500 duration-200">AI Improve</span>
                                        <span className="font-bold text-sm lg:hidden block -translate-y-[1px] group-hover:text-blue-500 duration-200">AI</span>
                                    </button>
                                </div>

                                {/* Conditional PaltaQ2 Text Area */}
                                <div>
                                    {visibleTextBoxes[paltaQ.id] && textBoxPosition === `paltaQ${index + 1}` && (
                                        <div className='lg:pb-0 pb-2'>
                                            {/* Depth */}
                                            <div className="flex items-center justify-between gap-3 px-1 lg:pt-6 pt-4">
                                                <h6 className="text-zinc-400 text-xs sm:text-sm">Depth:{index + 2} | Responding to {userName}</h6>
                                            </div>
                                            {/* TextBox */}
                                            <form
                                                className="lg:w-[100%] w-full mx-auto relative"
                                                onSubmit={handlePaltaQ(paltaQ.id, mainQuestionId)}
                                            >
                                                <div className="my-2">
                                                    <div className="relative">
                                                        <textarea
                                                            id="paltaQuestion"
                                                            className="w-full resize-none rounded-2xl px-5 py-4 lg:text-base text-sm text-zinc-700 placeholder-zinc-400 bg-[#e6e7ee] shadow-[inset_4px_4px_6px_#c5c6cb,inset_-4px_-4px_6px_#ffffff] focus:outline-none focus:shadow-[inset_2px_2px_4px_#c5c6cb,inset_-2px_-2px_4px_#ffffff] lg:pr-[7rem] lg:pb-[3.75rem] overflow-y-auto break-words max-h-[50vh]"
                                                            style={{ height: '6.5em' }}
                                                            placeholder="Type a creative palta question here..."
                                                            onChange={handleInputChange(paltaQ.id)}
                                                            value={paltaQInputs[paltaQ.id] || ''}
                                                        />

                                                        {/* Desktop: floating icon buttons inside textarea */}
                                                        <div className="absolute bottom-[2.5em] right-[2.5em] scale-[1.5] hidden lg:flex items-center gap-1 z-10">
                                                            {session?.user?.email && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleAnonymity(paltaQ.id)}
                                                                    aria-label={isAnonymous[paltaQ.id] ? 'Disable anonymity' : 'Enable anonymity'}
                                                                    className="p-2 rounded-full"
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={isAnonymous[paltaQ.id] ? faEyeSlash : faEye}
                                                                        className={`w-4 h-4 ${isAnonymous[paltaQ.id] ? 'text-rose-700' : 'text-zinc-600'}`}
                                                                    />
                                                                </button>
                                                            )}

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
                                                        {session?.user?.email && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleAnonymity(paltaQ.id)}
                                                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
                                                                                                                                        ${isAnonymous[paltaQ.id]
                                                                        ? 'bg-[#e6e7ee] shadow-[inset_3px_3px_5px_#c5c6cb,inset_-3px_-3px_5px_#ffffff] text-rose-700'
                                                                        : 'bg-[#e6e7ee] shadow-[3px_3px_5px_#c5c6cb,-3px_-3px_5px_#ffffff] text-zinc-600'
                                                                    }`}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={isAnonymous[paltaQ.id] ? faEyeSlash : faEye}
                                                                    className={`w-4 ${isAnonymous[paltaQ.id] ? 'text-rose-700' : 'text-zinc-600'}`}
                                                                />
                                                                <span>{isAnonymous[paltaQ.id] ? 'Anonymous' : 'Anonymous'}</span>
                                                            </button>
                                                        )}

                                                        <button
                                                            type="submit"
                                                            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#31344b] bg-[#e6e7ee] shadow-[3px_3px_5px_#c5c6cb,-3px_-3px_5px_#ffffff] active:shadow-[inset_3px_3px_5px_#c5c6cb,inset_-3px_-3px_5px_#ffffff] transition"
                                                        >
                                                            <FontAwesomeIcon icon={faPaperPlane} className="w-4" />
                                                            <span>Submit</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>

                                <hr className={`border-b border-gray-400 mr-4 ${idx === sortedQuestions.length - 1 ? 'my-0 mt-3' : 'my-3'}`}></hr>

                                <div className='mb-4 lg:mx-2 pr-3'>
                                    <GeneratedResponse response={responseAI[paltaQ.id]} visibility={visibility[paltaQ.id]} lastQuestion={lastQuestion[paltaQ.id]} toggleVisibility={toggleVisibility} type={'palta'} questionID={paltaQ.id} />
                                </div>

                            </div>

                            {/* Nested PaltaQ */}
                            <div className='ml-3'>
                                {visibleInputBox[paltaQ.id] && (
                                    paltaQ.repliesLength !== 0 ? (
                                        <PaltaQComponent
                                            paltaQId={paltaQ.id}
                                            mainQuestionId={mainQuestionId}
                                            userId={userId}
                                            index={index + 1}
                                            visibleInputBox={visibleInputBox}
                                            toggleInputBox={toggleInputBox}
                                            visibleTextBoxes={visibleTextBoxes}
                                            handleButtonClick={handleButtonClick}
                                            textBoxPosition={textBoxPosition}
                                            userName={userName}
                                            resetClick={resetClick}
                                            from={from}
                                            classId={classId}
                                            topicId={topicId}
                                            refresh={refresh}
                                            toggleRefresh={toggleRefresh}
                                        />
                                    ) : null
                                )}
                            </div>
                        </div>
                    )
                    )}
            </div>

        </div>
    )
}

export default PaltaQComponent;