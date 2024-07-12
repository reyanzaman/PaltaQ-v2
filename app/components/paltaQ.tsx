"use client";

import { faPaperPlane, faFlag, faThumbsUp, faThumbsDown, faComment, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/app/ui/neomorphism.css";
import Image from 'next/image';

import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';
import { getRankDetails } from '../utils/rankings';

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
    topicId
}) => {

    const { data: session, status } = useSession();
    const [questions, setQuestions] = useState<PaltaQ[]>([]);
    const [isAnonymous, setIsAnonymous] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState(false);

    const [paltaQInputs, setPaltaQInputs] = useState<{ [key: string]: any }>({});
    const [rank, setRank] = useState<{ [key: string]: RankDetails }>({});

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
                    render: mainText,
                    type: 'success',
                    isLoading: false,
                    autoClose: 4000,
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
            } else {
                // Handle error
                console.error('Failed to submit palta question');
                toast.update(loadingToastId, {
                    render: responseData.message || 'PaltaQ submission failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000,
                });
            }

            resetClick();
            toggleInputBox(questionId, false);
            toggleAnonymity(questionId, true);
            fetchPaltaQ();
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

    useEffect(() => {
        fetchPaltaQ();

        const intervalId = setInterval(fetchPaltaQ, 30000); // Fetch every minute
        return () => clearInterval(intervalId); // Cleanup function to clear interval

    }, [userId]);

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

                        <div
                            key={paltaQ.id}
                            className="flex flex-col">

                            {/* PaltaQ Card */}
                            <div className={`flex flex-col justify-between pt-2 px-3 w-full border-l-2 border-gray-500 ${idx === sortedQuestions.length - 1 ? 'mb-3' : ''}`}>
                                {/* PaltaQ User Details */}
                                <div className='flex justify-between'>

                                    {/* Image/Name/Date */}
                                    <div className="flex items-center">
                                        {/* Image */}
                                        <div className='icon shadow-inset border border-light rounded-circle p-1'>
                                            {paltaQ.isAnonymous ? (
                                                <Image
                                                    src="/default_image.png"
                                                    alt="Anonymous Image"
                                                    width={30}
                                                    height={30}
                                                    className='rounded-full'
                                                ></Image>
                                            ) : (
                                                <Image
                                                    src={paltaQ.user.image}
                                                    alt="User Image"
                                                    width={30}
                                                    height={30}
                                                    className='rounded-full'
                                                ></Image>
                                            )}
                                        </div>

                                        <div className='flex flex-col'>
                                            <div className='flex flex-row gap-x-2'>
                                                {paltaQ.user.is_Faculty ? (
                                                    <div>
                                                        {paltaQ.user.id == userId ? (
                                                            <div>
                                                                <span className="font-bold text-lg ml-2" style={{ color: `#${rank[paltaQ.user.id]?.colorCode}` }}>{paltaQ.isAnonymous ? `User@${paltaQ.user.id.slice(0, 8)} (You)` : paltaQ.user.name}</span>
                                                                <span className='font-bold text-lg ml-1 text-sky-800'>(Faculty)</span>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <span className="font-bold text-lg ml-2" style={{ color: `#${rank[paltaQ.user.id]?.colorCode}` }}>{paltaQ.isAnonymous ? `User@${paltaQ.user.id.slice(0, 8)}` : paltaQ.user.name}</span>
                                                                <span className='font-bold text-lg ml-1 text-sky-800'>(Faculty)</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {paltaQ.user.id == userId ? (
                                                            <span className="font-bold text-lg ml-2" style={{ color: `#${rank[paltaQ.user.id]?.colorCode}` }}>{paltaQ.isAnonymous ? `User@${paltaQ.user.id.slice(0, 8)} (You)` : paltaQ.user.name}</span>
                                                        ) : (
                                                            <span className="font-bold text-lg ml-2" style={{ color: `#${rank[paltaQ.user.id]?.colorCode}` }}>{paltaQ.isAnonymous ? `User@${paltaQ.user.id.slice(0, 8)}` : paltaQ.user.name}</span>
                                                        )}
                                                    </div>
                                                )}
                                                {rank[paltaQ.user.id] && (
                                                    <div>
                                                        <Image src={`/${rank[paltaQ.user.id].icon}`} alt="Rank Icon" width={25} height={25} />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Date */}
                                            <span className="small ml-2">
                                                {new Date(paltaQ.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date(paltaQ.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(/:\\d+ /, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Report Button */}
                                    <div>
                                        <button onClick={() => toast.dark('Report feature is not available yet')} className="lg:flex flex-row items-start px-2 mx-3 hover:text-red-800 transition-colors duration-500 translate-x-4">
                                            <FontAwesomeIcon icon={faFlag} className="w-[1rem] mr-2 lg:pt-[1.5px] pt-0 lg:translate-y-[0.15em] -translate-y-1" />
                                            <span className="font-bold lg:block hidden">Report</span>
                                        </button>
                                    </div>
                                </div>

                                {/* PaltaQ Question */}
                                <div className='lg:mt-0 mt-2'>{paltaQ.paltaQ}</div>

                                {/* Bottom Part */}
                                <div className='flex flex-col'>

                                    {/* PaltaQ Badge */}
                                    <div className="flex items-center mt-2 mb-1 -translate-x-2">
                                        <div className='badge mx-1'>
                                            {paltaQ.score >= 100
                                                ? <span className='font-bold lg:text-sm text-xxs lg:pl-2 pl-0 text-danger'>HIGH LEVEL</span>
                                                : paltaQ.score >= 50
                                                    ? <span className='font-bold lg:text-sm text-xxs lg:pl-2 pl-0 text-secondary'>MID LEVEL </span>
                                                    : <span className='font-bold lg:text-sm text-xxs lg:pl-2 pl-0 text-success'>LOW LEVEL</span>}
                                        </div>
                                        <div className='badge mx-1'>
                                            <span className="font-bold lg:text-sm text-xxs items-end lg:ml-2 ml-0">
                                                SCORE: {paltaQ.score}
                                            </span>
                                        </div>
                                    </div>

                                    {/* PaltaQ Like/Dislike/PaltaQ */}
                                    <div className="flex flex-row items-start mt-2 pt-1">
                                        {/* Like */}
                                        <button onClick={() => handleLike(paltaQ.id, userId)} disabled={loading}>
                                            <FontAwesomeIcon
                                                icon={faThumbsUp}
                                                className={`hover:text-blue-500 active:text-blue-600 duration-500 pb-1 ${paltaQ.likedBy && paltaQ.likedBy.some((like: { userId: string; }) => like.userId === userId) ? 'text-blue-500' : ''}`}
                                            />
                                        </button>
                                        <span className="small ml-1 mr-2">{paltaQ.likes}</span>
                                        <span className="small mr-2">|</span>
                                        {/* Dislike */}
                                        <button onClick={() => handleDislike(paltaQ.id, userId)} disabled={loading}>
                                            <FontAwesomeIcon
                                                icon={faThumbsDown}
                                                className={`hover:text-red-500 active:text-red-600 duration-500 pb-1 ${paltaQ.dislikedBy && paltaQ.dislikedBy.some((dislike: { userId: string; }) => dislike.userId === userId) ? 'text-red-500' : ''}`}
                                            />
                                        </button>
                                        <span className="small ml-1 mr-2">{paltaQ.dislikes}</span>
                                        {/* Show PaltaQ */}
                                        {index < 3 && (
                                            <div className='flex flex-row'>
                                                <span className="small mr-2">|</span>
                                                <div className='flex flex-row'>
                                                    <button onClick={() => toggleInputBox(paltaQ.id)}>
                                                        <FontAwesomeIcon icon={faComment} className={`hover:text-indigo-500 active:text-indigo-600 duration-500 pb-1 ${visibleInputBox[paltaQ.id] ? 'text-indigo-500' : ''}`} />
                                                    </button>
                                                    <span className="small ml-1 mr-2">{paltaQ.repliesLength}</span>
                                                </div>
                                            </div>
                                        )}
                                        {/* PaltaQ */}
                                        {index < 3 && (
                                            <div className='flex flex-row'>
                                                <span className="small mr-2">|</span>
                                                <button onClick={() => handleButtonClick(paltaQ.id, `paltaQ${index + 1}`, paltaQ.isAnonymous ? 'Anonymous User' : paltaQ.user.name)}>
                                                    <h5
                                                        className={`font-bold text-zinc-600 hover:text-emerald-600 duration-200 text-base -translate-y-0.5 hover:-translate-y-[4px] ${textBoxPosition == 'paltaQ1' ? 'text-emerald-700' : ''}`}>
                                                        PaltaQ
                                                    </h5>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {/* Conditional PaltaQ2 Text Area */}
                                <div>
                                    {visibleTextBoxes[paltaQ.id] && textBoxPosition === `paltaQ${index + 1}` && (
                                        <div className=''>
                                            {/* Anonymity */}
                                            <div className='flex flex-row items-end justify-between'>
                                                <h6 className='text-zinc-400 lg:text-sm text-xs'>Depth:2 | Responding to {userName}</h6>
                                                <label className='inline-flex items-center cursor-pointer'>
                                                    <input
                                                        type="checkbox"
                                                        value={(isAnonymous[paltaQ.id] || false).toString()}
                                                        className="sr-only peer"
                                                        onChange={() => toggleAnonymity(paltaQ.id)}
                                                    />
                                                    <div className="relative w-6 h-3 bg-zinc-800 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-transparent after:content-[''] after:absolute after:top-[0px] after:start-[0px] after:bg-zinc-500 after:border-zinc-800 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-500-800"></div>
                                                    {isAnonymous[paltaQ.id] ? (
                                                        <FontAwesomeIcon
                                                            icon={faEyeSlash}
                                                            className={`w-[1.5rem] lg:hidden text-red-900`}
                                                        />
                                                    ) : (
                                                        <FontAwesomeIcon
                                                            icon={faEye}
                                                            className={`w-[1.5rem] lg:hidden text-[#31344b]`}
                                                        />
                                                    )}
                                                    <span className="ms-2 lg:block hidden text-base font-bold">Toggle Anonymity ({isAnonymous[paltaQ.id] ? "On" : "Off"})</span>
                                                </label>
                                            </div>

                                            <form className="" onSubmit={handlePaltaQ(paltaQ.id, mainQuestionId)}>
                                                <textarea
                                                    id="paltaQuestion"
                                                    className="form-control pr-5o5 resize-none py-3 pl-3"
                                                    placeholder='Type a creative palta question here . . .'
                                                    onChange={handleInputChange(paltaQ.id)}
                                                    value={paltaQInputs[paltaQ.id] || ''}
                                                />
                                                <button
                                                    type="submit"
                                                    className="float-end lg:-translate-y-[3.2em] -translate-y-[3.3em] -translate-x-5 scale-[1.4]"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faPaperPlane}
                                                        className="w-[1.5rem] text-[#31344b]"
                                                    />
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>

                                <hr className={`border-b border-gray-400 mr-4 ${idx === sortedQuestions.length - 1 ? 'my-0 mt-3' : 'my-3'}`}></hr>

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