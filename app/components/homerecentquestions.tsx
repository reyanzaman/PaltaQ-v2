"use client";

import { faPaperPlane, faFlag, faThumbsUp, faThumbsDown, faComment, faEye, faEyeSlash, faWandMagicSparkles, faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/app/ui/neomorphism.css";
import Image from 'next/image';

import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';

import QuestionBox from "@/app/components/homequestionbox";
import PaltaQComponent from "@/app/components/paltaQ";
import { getRankDetails } from '@/app/utils/rankings';
import { uid } from '@/app/api/submitGenQuestion/route'
import GeneratedResponse from '@/app/components/generatedResponse';
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
    paltaQBy: PaltaQ[];
    likedBy: Likes[];
    dislikedBy: Dislikes[];
    questionType: QuestionType;
    createdAt: string;
    updatedAt: string;
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
    is_Faculty: boolean;
}

export default function RecentQuestions() {

    const { data: session, status } = useSession();
    const [userId, setUserId] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingQ, setLoadingQ] = useState(true);
    const [rank, setRank] = useState<{ [key: string]: RankDetails }>({});

    const [paltaQInputs, setPaltaQInputs] = useState<{ [key: string]: any }>({});

    const [visibleTextBoxes, setVisibleTextBoxes] = useState<{ [key: string]: boolean }>({});
    const [textBoxPosition, setTextBoxPosition] = useState('');
    const [userName, setUserName] = useState('');
    const [isAnonymous, setIsAnonymous] = useState<{ [key: string]: boolean }>({});

    const [responseAI, setResponseAI] = useState<{ [key: string]: string }>({});
    const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
    const [lastQuestion, setLastQuestion] = useState<{ [key: string]: string }>({});

    const [refresh, setRefresh] = useState(false);

    const toggleVisibility = (questionId: string, state: boolean) => {
        setVisibility(prev => ({ ...prev, [questionId]: state }));
    }

    const [visibleInputBox, setVisibleInputBox] = useState<{ [key: string]: boolean }>({});

    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(questions.length / itemsPerPage);

    // Sort questions by createdAt in descending order
    const sortedQuestions = questions.slice().sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Pagination indices for sorted questions
    const indexOfLastQuestion = currentPage * itemsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - itemsPerPage;

    // Combine sorted faculty questions with non-faculty questions
    let currentQuestions = [
        ...sortedQuestions,
    ];

    currentQuestions = currentQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

    const handlePageChange = (pageNumber: any, event: any) => {
        event.preventDefault(); // Prevent the default anchor behavior
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        event.currentTarget.blur();
    };

    const toggleAnonymity = (questionId: string, alternate = true) => {
        if (alternate) {
            setIsAnonymous(prev => ({
                ...prev,
                [questionId]: !prev[questionId]
            }));
        } else {
            setIsAnonymous(prev => ({
                ...prev,
                [questionId]: false
            }));
        }
    };

    const toggleInputBox = (questionId: string, alternate = true) => {
        if (alternate) {
            setVisibleInputBox(prevState => ({
                ...prevState,
                [questionId]: !prevState[questionId]
            }));
        } else {
            setVisibleInputBox(prevState => ({
                ...prevState,
                [questionId]: true
            }));
        }
    };

    const toggleRefresh = () => {
        setRefresh(!refresh);
    }

    const handleButtonClick = (questionId: string, position: any, username: string) => {
        try {
            if (visibleTextBoxes[questionId]) {
                setTextBoxPosition('');
                setUserName('');
                setVisibleTextBoxes((prevState) => {
                    const newState = Object.keys(prevState).reduce<{ [key: string]: boolean }>((acc, key) => {
                        acc[key] = false;
                        return acc;
                    }, {});
                    return newState;
                });
                return;
            }
            setTextBoxPosition(position);
            setUserName(username);
            setVisibleTextBoxes((prevState) => {
                // Create a new object with all values set to false
                const newState = Object.keys(prevState).reduce<{ [key: string]: boolean }>((acc, key) => {
                    acc[key] = false;
                    return acc;
                }, {});

                // Set the current questionId to true
                newState[questionId] = true;

                return newState;
            });
            toggleAnonymity(questionId, false);
        } catch (error) {
            console.error('Error in handleButtonClick', error)
        }
    };

    const resetClick = () => {
        setVisibleTextBoxes((prevState) => {
            const newState = Object.keys(prevState).reduce<{ [key: string]: boolean }>((acc, key) => {
                acc[key] = false;
                return acc;
            }, {});
            return newState;
        });
        setTextBoxPosition('');
        setUserName('');
    }

    const handleInputChange = (questionId: string) => (event: any) => {
        const value = event.target.value;
        setPaltaQInputs(prev => ({ ...prev, [questionId]: value }));
    };

    const handleLike = async (questionId: string, userId: string, type: string) => {
        try {
            if (loading) return; // Prevent if already loading
            setLoading(true);

            // Reject if not logged in
            if (!session) {
                toast.info('Please log in to like the question');
                setLoading(false);
                return;
            }

            if (type === 'question') {
                const question = questions.find(q => q.id === questionId);
                if (question?.dislikedBy?.some(dislike => dislike.userId === userId)) {
                    toast.info('You have already disliked this question');
                    setLoading(false);
                    return;
                }
            } else if (type === 'palta') {
                const question = questions.find(q => q.paltaQBy.some(p => p.id === questionId));
                const paltaQ = question?.paltaQBy.find(p => p.id === questionId);
                if (paltaQ?.dislikedBy.some(dislike => dislike.userId === userId)) {
                    toast.info('You have already disliked this comment');
                    setLoading(false);
                    return;
                }
            }

            const response = await fetch(`/api/likeQuestion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId, questionId: questionId, type: type })
            });

            if (!response.ok) {
                throw new Error(`Error: Failed to Like Question`);
            }

            const result = await response.text();

            // Update the local state based on the response
            setQuestions(prevQuestions => {
                return prevQuestions.map(q => {
                    if (type === 'question' && q.id === questionId) {
                        const updatedLikes = result === "+1" ? q.likes + 1 : q.likes - 1;
                        const updatedLikedBy = result === "+1"
                            ? [...q.likedBy, { id: Date.now().toString(), userId, questionId }]
                            : q.likedBy.filter(like => like.userId !== userId);
                        return { ...q, likes: updatedLikes, likedBy: updatedLikedBy };
                    } else if (type === 'palta') {
                        const updatedPaltaQBy = q.paltaQBy.map(p => {
                            if (p.id === questionId) {
                                const updatedLikes = result === "+1" ? p.likes + 1 : p.likes - 1;
                                const updatedLikedBy = result === "+1"
                                    ? [...p.likedBy, { id: Date.now().toString(), userId, questionId }]
                                    : p.likedBy.filter(like => like.userId !== userId);
                                return { ...p, likes: updatedLikes, likedBy: updatedLikedBy };
                            }
                            return p;
                        });
                        return { ...q, paltaQBy: updatedPaltaQBy };
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

    const handleDislike = async (questionId: string, userId: string, type: string) => {
        try {
            if (loading) return; // Prevent if already loading
            setLoading(true);

            // Reject if not logged in
            if (!session) {
                toast.info('Please log in to dislike the question');
                setLoading(false);
                return;
            }

            if (type === 'question') {
                const question = questions.find(q => q.id === questionId);
                if (question?.likedBy.some(like => like.userId === userId)) {
                    toast.info('You have already liked this question');
                    setLoading(false);
                    return;
                }
            } else if (type === 'palta') {
                const question = questions.find(q => q.paltaQBy.some(p => p.id === questionId));
                const paltaQ = question?.paltaQBy.find(p => p.id === questionId);
                if (paltaQ?.likedBy.some(like => like.userId === userId)) {
                    toast.info('You have already liked this comment');
                    setLoading(false);
                    return;
                }
            }

            const response = await fetch(`/api/dislikeQuestion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId, questionId: questionId, type: type })
            });

            if (!response.ok) {
                throw new Error(`Error: Failed to Dislike Question`);
            }

            const result = await response.text();

            // Update the local state based on the response
            setQuestions(prevQuestions => {
                return prevQuestions.map(q => {
                    if (type === 'question' && q.id === questionId) {
                        const updatedDislikes = result === "+1" ? q.dislikes + 1 : q.dislikes - 1;
                        const updatedDislikedBy = result === "+1"
                            ? [...q.dislikedBy, { id: Date.now().toString(), userId, questionId }]
                            : q.dislikedBy.filter(dislike => dislike.userId !== userId);
                        return { ...q, dislikes: updatedDislikes, dislikedBy: updatedDislikedBy };
                    } else if (type === 'palta') {
                        const updatedPaltaQBy = q.paltaQBy.map(p => {
                            if (p.id === questionId) {
                                const updatedDislikes = result === "+1" ? p.dislikes + 1 : p.dislikes - 1;
                                const updatedDislikedBy = result === "+1"
                                    ? [...p.dislikedBy, { id: Date.now().toString(), userId, questionId }]
                                    : p.dislikedBy.filter(dislike => dislike.userId !== userId);
                                return { ...p, dislikes: updatedDislikes, dislikedBy: updatedDislikedBy };
                            }
                            return p;
                        });
                        return { ...q, paltaQBy: updatedPaltaQBy };
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

    const handlePaltaQ = (questionId: string, quesPaltaQId = null, palta = false) => async (e: React.FormEvent<HTMLFormElement>) => {
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
            if (palta == true) {
                if (quesPaltaQId == null) {
                    console.error('quesPaltaQId ID is null');
                    setLoading(false);
                    return;
                } else {
                    response = await fetch('/api/submitGenQuestion', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ question: pQuestion, category: QuestionCategory.PaltaPalta, quesID: questionId, paltaQuesID: quesPaltaQId, anonymity: isAnonymous[questionId] }),
                    });
                }
            } else {
                response = await fetch('/api/submitGenQuestion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: pQuestion, category: QuestionCategory.Palta, quesID: questionId, anonymity: isAnonymous[questionId] }),
                });
            }

            const responseData = await response.json();

            if (response.ok) {
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

            } else {
                // Handle error
                console.error('Failed to submit palta question');
                toast.update(loadingToastId, {
                    render: responseData.message || responseData.error || 'PaltaQ submission failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 6000,
                });
            }

            const response2 = await fetch('/api/getLatestQuestions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response2.ok) {
                throw new Error(`Error: Failed to get latest questions`);
            }

            const data = await response2.json();
            setQuestions(data);
            setRefresh(!refresh);

            resetClick();
            toggleInputBox(questionId, false);
            fetchQuestions();
            setLoading(false);
        } catch (error) {
            console.error('Failed to submit palta question:', error);
            toast.error(String(error));
            setLoading(false);
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
            console.error('Error in handleAIGenerate:', error);
        }
    }

    const fetchQuestions = async () => {
        try {
            const response = await fetch('/api/getLatestQuestions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                next: {
                    tags: ['questions']
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Error: Failed to get latest questions`);
            }
            const data = await response.json();
            // console.log('Questions:', data);
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoadingQ(false);
        }
    };

    useEffect(() => {

        const fetchUserID = async () => {
            if (session?.user?.email) {
                try {
                    const response = await fetch(`/api/getUserId?email=${session.user.email}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Error: Failed to fetch user id`);
                    }

                    const data = await response.json();
                    setUserId(data);
                } catch (error) {
                    console.error('Error fetching user id:', error);
                }
            }
        };

        fetchUserID();
        fetchQuestions();

        const intervalId = setInterval(fetchQuestions, 30000); // Fetch every ten seconds

        return () => clearInterval(intervalId); // Cleanup function to clear interval

    }, [session?.user?.email]);

    useEffect(() => {
        if (currentQuestions.length === 0) return;

        let timeoutId: NodeJS.Timeout | null = null;

        const fetchHighestScores = async () => {
            // Gather user IDs from Questions and associated PaltaQs
            const userIds: string[] = [];

            currentQuestions.forEach(question => {
                // Add Question user ID
                if (!userIds.includes(question.user.id)) {
                    userIds.push(question.user.id);
                }

                // Add PaltaQ user IDs
                question.paltaQBy.forEach(paltaQ => {
                    if (!userIds.includes(paltaQ.userId)) {
                        userIds.push(paltaQ.userId);
                    }
                });
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
            setRank(ranks);
        };

        const debouncedFetch = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                fetchHighestScores();
                timeoutId = null;
            }, 500); // Adjust the debounce time as needed (e.g., 500ms)
        };

        debouncedFetch();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };

    }, [questions]);

    if (status === 'loading') {
        return <div className="mx-auto text-center py-8"><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }

    return (

        <div>

            <QuestionBox onQuestionSubmitted={fetchQuestions} />

            {loadingQ ? (
                <div className='flex items-center justify-center text-center'>
                    <div className='h-[64vh] pt-[15em] w-full text-xl font-bold text-zinc-500 mt-4 lg:block hidden'>Loading Questions . . .</div>
                    <div className='h-[58vh] pt-[10em] w-full text-xl font-bold text-zinc-500 mt-3 mx-3 rounded-lg lg:hidden block'>Loading Questions . . .</div>
                </div>
            ) : (
                <div>
                    {currentQuestions.length === 0 && (
                        <div className='flex items-center justify-center text-center'>
                            <div className='h-[64vh] pt-[15em] w-full text-xl font-bold text-zinc-500 mt-4 lg:block hidden'>No questions asked in the last 7 days</div>
                            <div className='h-[58vh] pt-[10em] w-full text-xl font-bold text-zinc-500 mt-3 mx-3 rounded-lg lg:hidden block'>No questions asked in the last 7 days</div>
                        </div>
                    )}
                </div>
            )}

            <div className='pt-4'>
                {/* Question Card */}
                {currentQuestions
                    .slice()
                    .sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map((question: any) => (
                        <div key={question.id} className="card bg-primary shadow-sm border-light w-[100%] mx-auto mb-4">

                            {/* Question Upper Part */}
                            <div className="px-4 pt-3 pb-2">

                                {/* User Details */}
                                <div className="flex flex-row justify-between mb-2">
                                    <div className="flex w-full items-start sm:items-center gap-1">
                                        {/* Avatar */}
                                        <div className="icon shadow-inset border border-light rounded-full p-1 shrink-0">
                                            {question.isAnonymous ? (
                                                <Image
                                                    src="/default_image.png"
                                                    alt="Anonymous Image"
                                                    width={30}
                                                    height={30}
                                                    className="rounded-full w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]"
                                                />
                                            ) : (
                                                <Image
                                                    src={question.user.image}
                                                    alt="User Image"
                                                    width={30}
                                                    height={30}
                                                    className="rounded-full w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]"
                                                />
                                            )}
                                        </div>

                                        {/* Name / Rank / Date */}
                                        <div className="flex flex-col min-w-0">
                                            {/* Top row: Name + Rank icon + Faculty tag*/}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Name */}
                                                {(() => {
                                                    const isGuestView = question.user.id === uid; 
                                                    const isSelf = question.user.id === userId;
                                                    const isFaculty = !!question.user.is_Faculty;
                                                    const userRank = rank?.[question.user.id];    

                                                    const baseName = question.isAnonymous
                                                        ? `User@${question.user.id.slice(0, 8)}${isSelf ? ' (You)' : ''}`
                                                        : (question.user.name.length > 16
                                                            ? question.user.name.split(' ').slice(0, 2).join(' ')
                                                            : question.user.name);

                                                    // Do NOT color Guest User. Otherwise use rank color.
                                                    const nameStyle = isGuestView
                                                        ? {}
                                                        : { color: `#${userRank?.colorCode || ''}` };

                                                    return (
                                                        <div className="flex items-center gap-1 min-w-0">
                                                            {/* Name */}
                                                            <span
                                                                className="font-bold text-sm sm:text-base lg:text-lg ml-2 truncate"
                                                                style={nameStyle}
                                                                title={isGuestView ? 'Guest User' : baseName}
                                                            >
                                                                {isGuestView ? 'Guest User' : baseName}
                                                            </span>

                                                            {/* Faculty badge (style preserved) */}
                                                            {isFaculty && !isGuestView &&  (
                                                                <span className="font-bold text-sm sm:text-base text-sky-800">
                                                                    (Faculty)
                                                                </span>
                                                            )}

                                                            {/* Rank Icon (hide when viewing as guest per your logic) */}
                                                            {userRank && !isGuestView && (
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
                                            <span className="small ml-2 text-xs sm:text-sm text-neutral-600 pt-0.5">
                                                {new Date(question.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                                {', '}
                                                {new Date(question.createdAt)
                                                    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                                    .replace(/:\\d+ /, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* <button onClick={() => toast.dark('Report feature is not available yet')} className="lg:flex flex-row items-start px-2 mx-3 hover:text-red-800 transition-colors duration-500 translate-x-5">
                                        <FontAwesomeIcon icon={faFlag} className="w-[1rem] mr-2 lg:pt-[1.5px] pt-0 lg:translate-y-[0.15em] -translate-y-1" />
                                        <span className="font-bold lg:block hidden">Report</span>
                                    </button> */}

                                </div>

                                {/* Main Question */}
                                <div className="flex flex-row pt-2 lg:pb-2 pb-0 mb-0 px-1">
                                    <h4 className="lg:text-lg text-base lg:text-justify text-left p-0 m-0">
                                        {question.question}
                                    </h4>
                                </div>

                            </div>

                            {/* Question Bottom Part */}
                            <div className="w-full lg:px-2 px-4 pb-4">

                                {/* Main Question Badges */}
                                <div className="lg:pb-2 pb-5">
                                    <div className="flex flex-wrap items-center gap-2">

                                        {/* Level */}
                                        <div
                                            className={`order-2 sm:order-1 badge ${question.score >= 100
                                                ? 'text-danger'
                                                : question.score >= 50
                                                    ? 'text-secondary'
                                                    : 'text-success'
                                                }`}
                                        >
                                            {question.score >= 100 ? (
                                                <span className="font-bold text-xs sm:text-sm px-1">HIGH LEVEL</span>
                                            ) : question.score >= 50 ? (
                                                <span className="font-bold text-xs sm:text-sm px-1">MID LEVEL</span>
                                            ) : (
                                                <span className="font-bold text-xs sm:text-sm px-1">LOW LEVEL</span>
                                            )}
                                        </div>

                                        {/* Score */}
                                        <div className="order-2 sm:order-1 badge">
                                            <span className="font-bold text-xs sm:text-sm p-1">
                                                SCORE: {question.score}
                                            </span>
                                        </div>

                                        {/* Blooms Badges */}
                                        <div className={`order-1 sm:order-2 flex flex-wrap items-center gap-1 w-full sm:w-auto ${question?.questionType?.[0]?.remembering || question?.questionType?.[0]?.understanding || question?.questionType?.[0]?.applying || question?.questionType?.[0]?.analyzing || question?.questionType?.[0]?.evaluating || question?.questionType?.[0]?.creating ? 'lg:pl-3 pl-0' : ''}`}>
                                            {/* Remembering */}
                                            {question.questionType[0].remembering && (
                                                <div
                                                    className="badge bg-[#393d71] p-1"
                                                    data-tooltip-id="badge-remember"
                                                    data-tooltip-content="Remembering: The foundational level of Bloom's Taxonomy. It involves recalling basic facts, definitions, or concepts from memory."
                                                >
                                                    <span className="font-bold text-white text-xs sm:text-sm">RE</span>
                                                </div>
                                            )}

                                            {/* Understanding */}
                                            {question.questionType[0].understanding && (
                                                <div
                                                    className="badge bg-[#63899f] p-1"
                                                    data-tooltip-id="badge-understand"
                                                    data-tooltip-content="The second level of Bloom's Taxonomy. It involves grasping the meaning of information, such as interpreting instructions, summarizing a text, or explaining a concept."
                                                >
                                                    <span className="font-bold text-white text-xs sm:text-sm">UN</span>
                                                </div>
                                            )}

                                            {/* Applying */}
                                            {question.questionType[0].applying && (
                                                <div
                                                    className="badge bg-[#576042] p-1"
                                                    data-tooltip-id="badge-apply"
                                                    data-tooltip-content="The third level of Bloom's Taxonomy. It involves using knowledge in new situations, such as applying formulas to solve problems or carrying out a procedure in a new context."
                                                >
                                                    <span className="font-bold text-white text-xs sm:text-sm">AP</span>
                                                </div>
                                            )}

                                            {/* Analyzing */}
                                            {question.questionType[0].analyzing && (
                                                <div
                                                    className="badge bg-[#578a72] p-1"
                                                    data-tooltip-id="badge-analyze"
                                                    data-tooltip-content="The fourth level of Bloom's Taxonomy. It involves breaking down information into parts to understand its structure, relationships, or patterns."
                                                >
                                                    <span className="font-bold text-white text-xs sm:text-sm">AN</span>
                                                </div>
                                            )}

                                            {/* Evaluating */}
                                            {question.questionType[0].evaluating && (
                                                <div
                                                    className="badge bg-[#dca146] p-1"
                                                    data-tooltip-id="badge-evaluate"
                                                    data-tooltip-content="The fifth level of Bloom's Taxonomy. It involves making judgments based on criteria, such as critiquing an argument or weighing pros and cons."
                                                >
                                                    <span className="font-bold text-white text-xs sm:text-sm">EV</span>
                                                </div>
                                            )}

                                            {/* Creating */}
                                            {question.questionType[0].creating && (
                                                <div
                                                    className="badge bg-[#cb484f] p-1"
                                                    data-tooltip-id="badge-create"
                                                    data-tooltip-content="The highest level of Bloom's Taxonomy. It involves generating new ideas or products, such as designing a project or proposing a theory."
                                                >
                                                    <span className="font-bold text-white text-xs sm:text-sm">CR</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tooltips */}
                                        <>
                                            <Tooltip
                                                id="badge-remember"
                                                place="top"
                                                openOnClick
                                                clickable
                                                className="max-w-[90vw]"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    zIndex: 100,
                                                    opacity: 1,
                                                    width: 'min(90vw, 350px)',
                                                    textAlign: 'left',
                                                    backgroundColor: '#393d71',
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-understand"
                                                place="top"
                                                openOnClick
                                                clickable
                                                className="max-w-[90vw]"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    zIndex: 100,
                                                    opacity: 1,
                                                    width: 'min(90vw, 350px)',
                                                    textAlign: 'left',
                                                    backgroundColor: '#63899f',
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-apply"
                                                place="top"
                                                openOnClick
                                                clickable
                                                className="max-w-[90vw]"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    zIndex: 100,
                                                    opacity: 1,
                                                    width: 'min(90vw, 350px)',
                                                    textAlign: 'left',
                                                    backgroundColor: '#576042',
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-analyze"
                                                place="top"
                                                openOnClick
                                                clickable
                                                className="max-w-[90vw]"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    zIndex: 100,
                                                    opacity: 1,
                                                    width: 'min(90vw, 350px)',
                                                    textAlign: 'left',
                                                    backgroundColor: '#578a72',
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-evaluate"
                                                place="top"
                                                openOnClick
                                                clickable
                                                className="max-w-[90vw]"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    zIndex: 100,
                                                    opacity: 1,
                                                    width: 'min(90vw, 350px)',
                                                    textAlign: 'left',
                                                    backgroundColor: '#dca146',
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-create"
                                                place="top"
                                                openOnClick
                                                clickable
                                                className="max-w-[90vw]"
                                                style={{
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    zIndex: 100,
                                                    opacity: 1,
                                                    width: 'min(90vw, 350px)',
                                                    textAlign: 'left',
                                                    backgroundColor: '#cb484f',
                                                }}
                                            />
                                        </>
                                    </div>
                                </div>

                                {/* Main Question Actions */}
                                <div className="flex flex-wrap items-center lg:gap-3 gap-[6px] lg:px-4 px-2 sm:px-3 lg:mt-2 w-full lg:-translate-y-0 -translate-y-1">
                                    {/* Like */}
                                    <button onClick={() => handleLike(question.id, userId, 'question')} disabled={loading} className="flex items-center gap-1">
                                        <FontAwesomeIcon
                                            icon={faThumbsUp}
                                            className={`lg:text-base text-sm hover:text-blue-500 active:text-blue-600 duration-300 ${question.likedBy?.some((like: { userId: string }) => like.userId === userId) ? 'text-blue-500' : ''}`}
                                        />
                                        <span className="small lg:text-base text-sm">{question.likes}</span>
                                    </button>

                                    <span className="text-zinc-400" aria-hidden>|</span>

                                    {/* Dislike */}
                                    <button onClick={() => handleDislike(question.id, userId, 'question')} disabled={loading} className="flex items-center gap-1">
                                        <FontAwesomeIcon
                                            icon={faThumbsDown}
                                            className={`lg:text-base text-sm hover:text-red-500 active:text-red-600 duration-300 ${question.dislikedBy?.some((d: { userId: string }) => d.userId === userId) ? 'text-red-500' : ''}`}
                                        />
                                        <span className="small lg:text-base text-sm">{question.dislikes}</span>
                                    </button>

                                    <span className="text-zinc-400" aria-hidden>|</span>

                                    {/* Show PaltaQ */}
                                    <button onClick={() => toggleInputBox(question.id)} className="flex items-center gap-1">
                                        <FontAwesomeIcon
                                            icon={faComment}
                                            className={`text-sm hover:text-indigo-500 active:text-indigo-600 duration-300 ${visibleInputBox[question.id] ? 'text-indigo-500' : ''}`}
                                        />
                                        <span className="small lg:text-base text-sm">{question.paltaQ}</span>
                                    </button>

                                    <span className="text-zinc-400" aria-hidden>|</span>

                                    {/* PaltaQ */}
                                    <button
                                        onClick={() => handleButtonClick(question.id, 'mainQ', question.isAnonymous ? 'Anonymous User' : question.user.name)}
                                        className="flex items-center gap-1"
                                    >
                                        <FontAwesomeIcon
                                            icon={faComments}
                                            className={`lg:text-base text-sm hover:text-indigo-500 active:text-indigo-600 duration-300 ${visibleInputBox[question.id] ? 'text-indigo-500' : ''}`}
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

                                    <span className="text-zinc-400" aria-hidden>|</span>

                                    {/* Improve */}
                                    <button onClick={() => handleAIGenerate(question.question, question.id)} className="flex items-center gap-1 group">
                                        <FontAwesomeIcon icon={faWandMagicSparkles} className="lg:text-base text-sm group-hover:translate-y-[-2px] duration-200" />
                                        <span className="font-bold text-base lg:block hidden -translate-y-[1px] group-hover:text-blue-500 duration-200">AI Improve</span>
                                        <span className="font-bold text-sm lg:hidden block -translate-y-[1px] group-hover:text-blue-500 duration-200">AI</span>
                                    </button>
                                </div>

                                {visibleInputBox[question.id] && <hr className="border-b border-gray-400 mt-2 mb-3" />}

                                {/* Conditional PaltaQ1 Text Area */}
                                {visibleTextBoxes[question.id] && textBoxPosition === 'mainQ' && (
                                    <div className="pb-4">
                                        {/* Responding To / Anonymity */}
                                        <div className="flex items-center justify-between gap-3 px-2 sm:px-3">
                                            <h6 className="text-zinc-400 text-xs sm:text-sm">Depth:1 | Responding to {userName}</h6>

                                            <label className="inline-flex items-center cursor-pointer gap-2">
                                                <input
                                                    type="checkbox"
                                                    value={(isAnonymous[question.id] || false).toString()}
                                                    className="sr-only peer"
                                                    onChange={() => toggleAnonymity(question.id)}
                                                />
                                                <div className="relative w-9 h-5 bg-zinc-800 peer-focus:outline-none peer-focus:ring peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:border-zinc-800 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-600" />
                                                {isAnonymous[question.id] ? (
                                                    <FontAwesomeIcon icon={faEyeSlash} className="w-5 text-red-900 lg:hidden" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faEye} className="w-5 text-[#31344b] lg:hidden" />
                                                )}
                                                <span className="hidden lg:block text-base font-bold">
                                                    Toggle Anonymity ({isAnonymous[question.id] ? 'On' : 'Off'})
                                                </span>
                                            </label>
                                        </div>

                                        <form className="mx-2 sm:mx-3 mt-2" onSubmit={handlePaltaQ(question.id)}>
                                            <textarea
                                                id="paltaQuestion"
                                                className="form-control resize-none py-3 pl-3 w-full"
                                                placeholder="Type a creative palta question here . . ."
                                                onChange={handleInputChange(question.id)}
                                                value={paltaQInputs[question.id] || ''}
                                            />
                                            <button type="submit" className="float-end -translate-y-10 sm:-translate-y-12 -translate-x-4 sm:-translate-x-5 scale-125 sm:scale-150">
                                                <FontAwesomeIcon icon={faPaperPlane} className="w-6 text-[#31344b]" />
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* AI Response */}
                                <div className="lg:mx-2 -translate-y-1 px-2 sm:px-3">
                                    <GeneratedResponse
                                        response={responseAI[question.id]}
                                        visibility={visibility[question.id]}
                                        lastQuestion={lastQuestion[question.id]}
                                        toggleVisibility={toggleVisibility}
                                        type="palta"
                                        questionID={question.id}
                                    />
                                </div>

                                {/* Palta Questions Options */}
                                {visibleInputBox[question.id] && (
                                    <div className="px-2 sm:px-3">
                                        {question.paltaQBy.length === 0 ? (
                                            <h5 className="text-sm text-zinc-400 ml-1 pb-2">No palta questions have been asked yet for this question</h5>
                                        ) : (
                                            <h5 className="text-sm text-zinc-400 ml-1">PaltaQ Depth: 1</h5>
                                        )}

                                        {/* PaltaQ Card(s) */}
                                        <div className="mb-2">
                                            {question.paltaQBy
                                                .slice()
                                                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                                .map((paltaQ: any, idx: any) => (
                                                    <div key={paltaQ.id} className="flex flex-col justify-between pl-3 pr-2 pt-2 pb-0 w-full border-l-2 border-gray-500 rounded-sm">

                                                        {/* PaltaQ User Details */}
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                                {/* Avatar (unified size for anon/non-anon) */}
                                                                <div className="icon shadow-inset border border-light rounded-full p-1 shrink-0">
                                                                    <Image
                                                                        src={paltaQ.isAnonymous ? '/default_image.png' : paltaQ.user.image}
                                                                        alt={paltaQ.isAnonymous ? 'Anonymous Image' : 'User Image'}
                                                                        width={28}
                                                                        height={28}
                                                                        className="rounded-full w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] md:w-[28px] md:h-[28px]"
                                                                    />
                                                                </div>

                                                                {/* Name + Rank + Date */}
                                                                <div className="flex flex-col min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                                        {/* Name (corrected logic) */}
                                                                        {paltaQ.user.id === uid ? (
                                                                            // Guest User: only black text, no rank color
                                                                            <span className="font-bold text-sm sm:text-base ml-1 truncate text-black">
                                                                                Guest User
                                                                            </span>
                                                                        ) : (
                                                                            <>
                                                                                {paltaQ.user.is_Faculty ? (
                                                                                    <>
                                                                                        <span
                                                                                            className="font-bold text-sm sm:text-base ml-1 truncate"
                                                                                            style={{ color: `#${rank[paltaQ.user.id]?.colorCode}` }}
                                                                                            title={
                                                                                                paltaQ.isAnonymous
                                                                                                    ? `User@${paltaQ.user.id.slice(0, 8)}${paltaQ.user.id === userId ? ' (You)' : ''}`
                                                                                                    : paltaQ.user.name
                                                                                            }
                                                                                        >
                                                                                            {paltaQ.isAnonymous
                                                                                                ? `User@${paltaQ.user.id.slice(0, 8)}${paltaQ.user.id === userId ? ' (You)' : ''}`
                                                                                                : (paltaQ.user.name.length > 18
                                                                                                    ? paltaQ.user.name.split(' ').slice(0, 2).join(' ')
                                                                                                    : paltaQ.user.name)}
                                                                                        </span>
                                                                                        <span className="font-bold text-sm text-sky-800">(Faculty)</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <span
                                                                                        className="font-bold text-sm sm:text-base ml-1 truncate"
                                                                                        style={{ color: `#${rank[paltaQ.user.id]?.colorCode}` }}
                                                                                        title={
                                                                                            paltaQ.isAnonymous
                                                                                                ? `User@${paltaQ.user.id.slice(0, 8)}${paltaQ.user.id === userId ? ' (You)' : ''}`
                                                                                                : paltaQ.user.name
                                                                                        }
                                                                                    >
                                                                                        {paltaQ.isAnonymous
                                                                                            ? `User@${paltaQ.user.id.slice(0, 8)}${paltaQ.user.id === userId ? ' (You)' : ''}`
                                                                                            : (paltaQ.user.name.length > 18
                                                                                                ? paltaQ.user.name.split(' ').slice(0, 2).join(' ')
                                                                                                : paltaQ.user.name)}
                                                                                    </span>
                                                                                )}
                                                                            </>
                                                                        )}

                                                                        {/* Rank Icon (uses parent question's rank logic as in your code) */}
                                                                        {rank[question.user.id] && question.user.id !== uid && (
                                                                            <Image
                                                                                src={`/${rank[question.user.id].icon}`}
                                                                                alt="Rank Icon"
                                                                                width={22}
                                                                                height={22}
                                                                                className="min-w-[20px] min-h-[20px] w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]"
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    {/* Date */}
                                                                    <span className="small ml-1 text-xs sm:text-sm text-gray-600">
                                                                        {new Date(paltaQ.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })},{' '}
                                                                        {new Date(paltaQ.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(/:\d+ /, ' ')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* PaltaQ Question */}
                                                        <div className="mt-2 text-sm sm:text-base pr-1 break-words">{paltaQ.paltaQ}</div>

                                                        {/* Bottom Part */}
                                                        <div className="flex flex-col">

                                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                {/* PaltaQ Badge */}
                                                                <div className="flex items-center gap-2">
                                                                    <div className="badge">
                                                                        {paltaQ.score >= 100 ? (
                                                                            <span className="font-bold text-xxs sm:text-xs md:text-sm text-danger">HIGH LEVEL</span>
                                                                        ) : paltaQ.score >= 50 ? (
                                                                            <span className="font-bold text-xxs sm:text-xs md:text-sm text-secondary">MID LEVEL</span>
                                                                        ) : (
                                                                            <span className="font-bold text-xxs sm:text-xs md:text-sm text-success">LOW LEVEL</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="badge">
                                                                        <span className="font-bold text-xxs sm:text-xs md:text-sm">SCORE: {paltaQ.score}</span>
                                                                    </div>
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

                                                            {/* Actions */}
                                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                {/* Like */}
                                                                <button onClick={() => handleLike(paltaQ.id, userId, 'palta')} disabled={loading} className="flex items-center gap-1">
                                                                    <FontAwesomeIcon
                                                                        icon={faThumbsUp}
                                                                        className={`hover:text-blue-500 active:text-blue-600 duration-300 ${paltaQ.likedBy?.some((like: any) => like.userId === userId) ? 'text-blue-500' : ''
                                                                            }`}
                                                                    />
                                                                    <span className="small">{paltaQ.likes}</span>
                                                                </button>

                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                {/* Dislike */}
                                                                <button onClick={() => handleDislike(paltaQ.id, userId, 'palta')} disabled={loading} className="flex items-center gap-1">
                                                                    <FontAwesomeIcon
                                                                        icon={faThumbsDown}
                                                                        className={`hover:text-red-500 active:text-red-600 duration-300 ${paltaQ.dislikedBy?.some((d: any) => d.userId === userId) ? 'text-red-500' : ''
                                                                            }`}
                                                                    />
                                                                    <span className="small">{paltaQ.dislikes}</span>
                                                                </button>

                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                {/* Show PaltaQ */}
                                                                <button onClick={() => toggleInputBox(paltaQ.id)} className="flex items-center gap-1">
                                                                    <FontAwesomeIcon
                                                                        icon={faComment}
                                                                        className={`hover:text-indigo-500 active:text-indigo-600 duration-300 ${visibleInputBox[paltaQ.id] ? 'text-indigo-500' : ''}`}
                                                                    />
                                                                    <span className="small">{paltaQ.repliesLength}</span>
                                                                </button>

                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                {/* PaltaQ */}
                                                                <button
                                                                    onClick={() => handleButtonClick(paltaQ.id, 'paltaQ1', paltaQ.isAnonymous ? 'Anonymous User' : paltaQ.user.name)}
                                                                    className="group"
                                                                >
                                                                    <span
                                                                        className={`font-bold text-base text-zinc-600 group-hover:text-emerald-600 duration-200 ${textBoxPosition === 'paltaQ1' ? 'text-emerald-700' : ''
                                                                            }`}
                                                                    >
                                                                        PaltaQ
                                                                    </span>
                                                                </button>

                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                {/* Improve */}
                                                                <button onClick={() => handleAIGenerate(paltaQ.paltaQ, paltaQ.id)} className="flex items-center gap-1 group">
                                                                    <FontAwesomeIcon icon={faWandMagicSparkles} className="group-hover:translate-y-[-2px] duration-200" />
                                                                    <span className="font-bold text-base -translate-y-[1px] group-hover:text-blue-500 duration-200">Improve</span>
                                                                </button>
                                                            </div>

                                                        </div>

                                                        {/* Conditional PaltaQ2 Text Area */}
                                                        {visibleTextBoxes[paltaQ.id] && textBoxPosition === 'paltaQ1' && (
                                                            <div className="pb-2 pt-2">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <h6 className="text-zinc-400 text-xs sm:text-sm">Depth:2 | Responding to {userName}</h6>

                                                                    <label className="inline-flex items-center cursor-pointer gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            value={(isAnonymous[paltaQ.id] || false).toString()}
                                                                            className="sr-only peer"
                                                                            onChange={() => toggleAnonymity(paltaQ.id)}
                                                                        />
                                                                        <div className="relative w-9 h-5 bg-zinc-800 peer-focus:outline-none peer-focus:ring peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:border-zinc-800 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-600" />
                                                                        {isAnonymous[question.id] ? (
                                                                            <FontAwesomeIcon icon={faEyeSlash} className="w-5 lg:hidden text-red-900" />
                                                                        ) : (
                                                                            <FontAwesomeIcon icon={faEye} className="w-5 lg:hidden text-[#31344b]" />
                                                                        )}
                                                                        <span className="hidden lg:block text-base font-bold">
                                                                            Toggle Anonymity ({isAnonymous[paltaQ.id] ? 'On' : 'Off'})
                                                                        </span>
                                                                    </label>
                                                                </div>

                                                                <form className="mt-2" onSubmit={handlePaltaQ(paltaQ.id, question.id, true)}>
                                                                    <textarea
                                                                        id="paltaQuestion"
                                                                        className="form-control resize-none py-3 pl-3 w-full"
                                                                        placeholder="Type a creative palta question here . . ."
                                                                        onChange={handleInputChange(paltaQ.id)}
                                                                        value={paltaQInputs[paltaQ.id] || ''}
                                                                    />
                                                                    <button type="submit" className="float-end -translate-y-10 sm:-translate-y-12 -translate-x-4 sm:-translate-x-5 scale-125 sm:scale-150">
                                                                        <FontAwesomeIcon icon={faPaperPlane} className="w-6 text-[#31344b]" />
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        )}

                                                        <hr className={`border-b border-gray-400 mr-2 ${idx === sortedQuestions.length - 1 ? 'mb-0 mt-3' : 'my-3'}`} />

                                                        <div className="mb-4 lg:mx-2 pr-1">
                                                            <GeneratedResponse
                                                                response={responseAI[paltaQ.id]}
                                                                visibility={visibility[paltaQ.id]}
                                                                lastQuestion={lastQuestion[paltaQ.id]}
                                                                toggleVisibility={toggleVisibility}
                                                                type="palta"
                                                                questionID={paltaQ.id}
                                                            />
                                                        </div>

                                                        {/* Recursive PaltaQ Component */}
                                                        {visibleInputBox[paltaQ.id] && (
                                                            <PaltaQComponent
                                                                paltaQId={paltaQ.id}
                                                                mainQuestionId={question.id}
                                                                userId={userId}
                                                                index={1}
                                                                visibleInputBox={visibleInputBox}
                                                                toggleInputBox={toggleInputBox}
                                                                visibleTextBoxes={visibleTextBoxes}
                                                                handleButtonClick={handleButtonClick}
                                                                textBoxPosition={textBoxPosition}
                                                                userName={userName}
                                                                resetClick={resetClick}
                                                                from="general"
                                                                classId=""
                                                                topicId=""
                                                                refresh={refresh}
                                                                toggleRefresh={toggleRefresh}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}
            </div>

            <p className='text-zinc-500 -translate-y-2 text-center'>Showing the most recent questions</p>

            {/* Pagination-bottom */}
            <div className='flex justify-center items-center mx-auto pad-x2'>
                {questions.length > 0 && (
                    <div className='py-3'>
                        <nav aria-label="Questions page navigation">
                            <ul className="pagination gap-y-4">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <a className="page-link" href="#" onClick={(e) => handlePageChange(currentPage - 1, e)}>Back</a>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <a className="page-link" href="#" onClick={(e) => handlePageChange(i + 1, e)}>{i + 1}</a>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <a className="page-link" href="#" onClick={(e) => handlePageChange(currentPage + 1, e)}>Next</a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

        </div>

    );
}