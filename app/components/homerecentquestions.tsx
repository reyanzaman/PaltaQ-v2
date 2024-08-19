"use client";

import { faPaperPlane, faFlag, faThumbsUp, faThumbsDown, faComment, faEye, faEyeSlash, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
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
                    render: responseData.message || responseData.error ||'PaltaQ submission failed',
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
            console.log('Error in handleAIGenerate:', error);
        }
    }

    const fetchQuestions = async () => {
        try {
            const response = await fetch('/api/getLatestQuestions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
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
            console.log('Questions:', data);
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

        const intervalId = setInterval(fetchQuestions, 10000); // Fetch every ten seconds

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

                            {/* Main Question Top Part */}
                            <div className="px-4 pt-3 pb-2">

                                {/* Main Question User Details */}
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

                                        <div className='flex flex-col ml-1'>
                                            <div>
                                                <div className='flex flex-row gap-x-2'>
                                                    {question.user.id == uid ? (
                                                        <div>
                                                            <span className="font-bold text-lg ml-2">Guest User</span>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            {question.user.is_Faculty ? (
                                                                <div>
                                                                    {question.user.id == userId ? (
                                                                        <div>
                                                                            <span className="font-bold text-lg ml-2" style={{ color: `#${rank[question.user.id]?.colorCode}` }}>{question.isAnonymous ? `User@${question.user.id.slice(0, 8)} (You)` : question.user.name}</span>
                                                                            <span className='font-bold text-lg ml-1 text-sky-800'>(Faculty)</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <span className="font-bold text-lg ml-2" style={{ color: `#${rank[question.user.id]?.colorCode}` }}>{question.isAnonymous ? `User@${question.user.id.slice(0, 8)}` : question.user.name}</span>
                                                                            <span className='font-bold text-lg ml-1 text-sky-800'>(Faculty)</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    {question.user.id == userId ? (
                                                                        <span className="font-bold text-lg ml-2" style={{ color: `#${rank[question.user.id]?.colorCode}` }}>{question.isAnonymous ? `User@${question.user.id.slice(0, 8)} (You)` : question.user.name}</span>
                                                                    ) : (
                                                                        <span className="font-bold text-lg ml-2" style={{ color: `#${rank[question.user.id]?.colorCode}` }}>{question.isAnonymous ? `User@${question.user.id.slice(0, 8)}` : question.user.name}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {rank[question.user.id] && (
                                                        <div>
                                                            {question.user.id !== uid && (
                                                                <Image src={`/${rank[question.user.id].icon}`} alt="Rank Icon" width={25} height={25} />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="small ml-2">
                                                {new Date(question.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date(question.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(/:\\d+ /, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <button onClick={() => toast.dark('Report feature is not available yet')} className="lg:flex flex-row items-start px-2 mx-3 hover:text-red-800 transition-colors duration-500 translate-x-5">
                                        <FontAwesomeIcon icon={faFlag} className="w-[1rem] mr-2 lg:pt-[1.5px] pt-0 lg:translate-y-[0.15em] -translate-y-1" />
                                        <span className="font-bold lg:block hidden">Report</span>
                                    </button>

                                </div>

                                {/* Main Question */}
                                <div className="flex flex-row pt-2 pb-1">
                                    <h4 className="lg:text-lg text-base text-justify">
                                        {question.question}
                                    </h4>
                                </div>

                            </div>

                            <div className=''>
                                {/* Main Question Badges */}
                                <div className='pb-2 -translate-x-1'>
                                    {/* Level */}
                                    <div className={`ml-4 badge  ${question.score >= 100
                                        ? "text-danger"
                                        : question.score >= 50
                                            ? "text-secondary"
                                            : "text-success"
                                        }`}>
                                        {question.score >= 100
                                            ? <span className='font-bold text-sm px-1'>HIGH LEVEL QUESTION</span>
                                            : question.score >= 50
                                                ? <span className='font-bold text-sm px-1'>MID LEVEL QUESTION</span>
                                                : <span className='font-bold text-sm px-1'>LOW LEVEL QUESTION</span>}
                                    </div>
                                    {/* Score */}
                                    <div className='badge ml-2 px-2'>
                                        <span className="font-bold text-sm items-end p-1">
                                            SCORE: {question.score}
                                        </span>
                                    </div>

                                    {/* Blooms Badge */}
                                    <span className='ml-1.5'>
                                        {/* Remembering */}
                                        {question.questionType[0].remembering && (
                                            <div
                                                className='badge bg-[#393d71] ml-0.5 px-2'
                                                data-tooltip-content="Remembering: The foundational level of Bloom's Taxonomy. It involves recalling basic facts, definitions, or concepts from memory, such as remembering dates, names, or key terms without needing to understand or analyze them."
                                                data-tooltip-id="badge-remember"
                                            >
                                                <span className='font-bold text-white text-sm'>
                                                    RE
                                                </span>
                                            </div>
                                        )}

                                        {/* Understanding */}
                                        {question.questionType[0].understanding && (
                                            <div
                                                className='badge bg-[#63899f] ml-0.5 px-1.5 py-1'
                                                data-tooltip-content="The second level of Bloom's Taxonomy. It involves grasping the meaning of information, such as interpreting instructions, summarizing a text, or explaining a concept in your own words. This level goes beyond mere recall by requiring comprehension of the material."
                                                data-tooltip-id="badge-understand"
                                            >
                                                <span className='font-bold text-white text-sm'>
                                                    UN
                                                </span>
                                            </div>
                                        )}

                                        {/* Applying */}
                                        {question.questionType[0].applying && (
                                            <div
                                                className='badge bg-[#576042] ml-0.5 px-1.5 py-1'
                                                data-tooltip-content="The third level of Bloom's Taxonomy. It involves using knowledge in new situations, such as applying formulas to solve problems, using concepts in practice, or carrying out a procedure in a different context. This level focuses on the ability to implement learned material."
                                                data-tooltip-id="badge-apply"
                                            >
                                                <span className='font-bold text-white text-sm'>
                                                    AP
                                                </span>
                                            </div>
                                        )}

                                        {/* Analying */}
                                        {question.questionType[0].analyzing && (
                                            <div
                                                className='badge bg-[#578a72] ml-0.5 px-1.5 py-1'
                                                data-tooltip-content="The fourth level of Bloom's Taxonomy. It involves breaking down information into components to understand its structure, such as comparing and contrasting ideas, identifying relationships, or recognizing patterns. This level requires critical thinking to dissect information."
                                                data-tooltip-id="badge-analyze"
                                            >
                                                <span className='font-bold text-white text-sm'>
                                                    AN
                                                </span>
                                            </div>
                                        )}

                                        {/* Evaluate */}
                                        {question.questionType[0].evaluating && (
                                            <div
                                                className='badge bg-[#dca146] ml-0.5 px-1.5 py-1'
                                                data-tooltip-content="The fifth level of Bloom's Taxonomy. It involves making judgments based on criteria and standards, such as critiquing an argument, assessing the validity of a source, or weighing the pros and cons of a decision. This level requires both analysis and justification."
                                                data-tooltip-id="badge-evaluate"
                                            >
                                                <span className='font-bold text-white text-sm'>
                                                    EV
                                                </span>
                                            </div>
                                        )}

                                        {/* Create */}
                                        {question.questionType[0].creating && (
                                            <div
                                                className='badge bg-[#cb484f] ml-0.5 px-1.5 py-1'
                                                data-tooltip-content="The highest level of Bloom's Taxonomy. It involves generating new ideas, products, or ways of viewing things, such as designing a project, composing a story, or proposing a theory. This level emphasizes innovation and the ability to put elements together in a novel way."
                                                data-tooltip-id="badge-create"
                                            >
                                                <span className='font-bold text-white text-sm'>
                                                    CR
                                                </span>
                                            </div>
                                        )}

                                        {/* Tooltips */}
                                        <div>
                                            <Tooltip
                                                id="badge-remember"
                                                place="top"
                                                style={{
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                    zIndex: "100",
                                                    opacity: "1",
                                                    width: "350px",
                                                    textAlign: "left",
                                                    backgroundColor: "#393d71"
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-understand"
                                                place="top"
                                                style={{
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                    zIndex: "100",
                                                    opacity: "1",
                                                    width: "350px",
                                                    textAlign: "left",
                                                    backgroundColor: "#63899f"
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-apply"
                                                place="top"
                                                style={{
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                    zIndex: "100",
                                                    opacity: "1",
                                                    width: "350px",
                                                    textAlign: "left",
                                                    backgroundColor: "#576042"
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-analyze"
                                                place="top"
                                                style={{
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                    zIndex: "100",
                                                    opacity: "1",
                                                    width: "350px",
                                                    textAlign: "left",
                                                    backgroundColor: "#578a72"
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-evaluate"
                                                place="top"
                                                style={{
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                    zIndex: "100",
                                                    opacity: "1",
                                                    width: "350px",
                                                    textAlign: "left",
                                                    backgroundColor: "#dca146"
                                                }}
                                            />
                                            <Tooltip
                                                id="badge-create"
                                                place="top"
                                                style={{
                                                    borderRadius: "8px",
                                                    padding: "10px",
                                                    zIndex: "100",
                                                    opacity: "1",
                                                    width: "350px",
                                                    textAlign: "left",
                                                    backgroundColor: "#cb484f"
                                                }}
                                            />
                                        </div>
                                    </span>
                                </div>

                                {/* Main Question Like/Dislike/PaltaQ/Improve */}
                                <div className="flex flex-row items-start mt-2 ml-3 pl-2 pt-1 pb-2 translate-x-[0.1em]">
                                    {/* Like */}
                                    <button onClick={() => handleLike(question.id, userId, 'question')} disabled={loading}>
                                        <FontAwesomeIcon
                                            icon={faThumbsUp}
                                            className={`hover:text-blue-500 active:text-blue-600 duration-500 pb-1 ${question.likedBy && question.likedBy.some((like: { userId: string; }) => like.userId === userId) ? 'text-blue-500' : ''}`}
                                        />
                                    </button>
                                    <span className="small ml-1 mr-2">{question.likes}</span>
                                    <span className="small mr-2">|</span>
                                    {/* Dislike */}
                                    <button onClick={() => handleDislike(question.id, userId, 'question')} disabled={loading}>
                                        <FontAwesomeIcon
                                            icon={faThumbsDown}
                                            className={`hover:text-red-500 active:text-red-600 duration-500 pb-1 ${question.dislikedBy && question.dislikedBy.some((dislike: { userId: string; }) => dislike.userId === userId) ? 'text-red-500' : ''}`}
                                        />
                                    </button>
                                    <span className="small ml-1 mr-2">{question.dislikes}</span>
                                    <span className="small mr-2">|</span>
                                    {/* Show PaltaQ */}
                                    <button onClick={() => toggleInputBox(question.id)}>
                                        <FontAwesomeIcon icon={faComment} className={`hover:text-indigo-500 active:text-indigo-600 duration-500 pb-1 ${visibleInputBox[question.id] ? 'text-indigo-500' : ''}`} />
                                    </button>
                                    <span className="small ml-1 mr-2">{question.paltaQ}</span>
                                    <span className="small mr-2">|</span>
                                    {/* PaltaQ */}
                                    <button onClick={() => handleButtonClick(question.id, 'mainQ', question.isAnonymous ? 'Anonymous User' : question.user.name)}>
                                        <h5
                                            className={`font-bold text-zinc-600 hover:text-emerald-600 duration-200 text-base -translate-y-0.5 hover:-translate-y-[4px] ${textBoxPosition == 'mainQ' ? 'text-emerald-700' : ''}`}>
                                            PaltaQ
                                        </h5>
                                    </button>
                                    <span className="small mx-2">|</span>
                                    {/* Improve */}
                                    <button onClick={() => handleAIGenerate(question.question, question.id)}>
                                        <div className='flex flex-row hover:text-blue-500 hover:-translate-y-[4px] duration-200'>
                                            <FontAwesomeIcon
                                                icon={faWandMagicSparkles}
                                                className={`translate-y-0.5`}
                                            />
                                            <span
                                                className={`font-bold text-base pl-1 -translate-y-[2px]`}>
                                                Improve
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                {visibleInputBox[question.id] && (<hr className='border-b border-gray-400 mt-0 mb-4'></hr>)}

                                {/* Conditional PaltaQ1 Text Area */}
                                <div>
                                    {visibleTextBoxes[question.id] && textBoxPosition === 'mainQ' && (
                                        <div className='pb-4'>

                                            {/* Responding To/ Anonymity */}
                                            <div className='flex flex-row items-end justify-between mr-3'>
                                                <h6 className='text-zinc-400 text-sm pl-3'>Depth:1 | Responding to {userName}</h6>

                                                <label className='inline-flex items-center cursor-pointer'>
                                                    <input
                                                        type="checkbox"
                                                        value={(isAnonymous[question.id] || false).toString()}
                                                        className="sr-only peer"
                                                        onChange={() => toggleAnonymity(question.id)}
                                                    />
                                                    <div className="relative w-6 h-3 bg-zinc-800 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-transparent after:content-[''] after:absolute after:top-[0px] after:start-[0px] after:bg-zinc-500 after:border-zinc-800 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-500-800"></div>
                                                    {isAnonymous[question.id] ? (
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
                                                    <span className="ms-2 lg:block hidden text-base font-bold">Toggle Anonymity ({isAnonymous[question.id] ? "On" : "Off"})</span>
                                                </label>
                                            </div>

                                            <form className="lg:mx-4 mx-2" onSubmit={handlePaltaQ(question.id)}>
                                                <textarea
                                                    id="paltaQuestion"
                                                    className="form-control pr-5o5 resize-none py-3 pl-3"
                                                    placeholder='Type a creative palta question here . . .'
                                                    onChange={handleInputChange(question.id)}
                                                    value={paltaQInputs[question.id] || ''}
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

                                <div className='lg:mx-2 -translate-y-1'>
                                    <GeneratedResponse response={responseAI[question.id]} visibility={visibility[question.id]} lastQuestion={lastQuestion[question.id]} toggleVisibility={toggleVisibility} type={'palta'} questionID={question.id} />
                                </div>

                                {/* Palta Questions Options */}
                                {visibleInputBox[question.id] && (
                                    <div className="">
                                        {question.paltaQBy.length == 0 ? (
                                            <h5 className='text-sm text-zinc-400 ml-2 pb-2'>No palta questions have been asked yet for this question</h5>
                                        ) : (
                                            <h5 className='text-sm text-zinc-400 ml-2'>PaltaQ Depth: 1</h5>
                                        )}

                                        {/* PaltaQ Card */}
                                        <div className='mb-2'>
                                            {question.paltaQBy
                                                .slice() // Create a copy of the array to avoid mutating the original
                                                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                                .map((paltaQ: any, idx: number) => (

                                                    <div key={paltaQ.id} className="flex flex-col justify-between ml-2 px-3 pt-2 pb-0 w-full border-l-2 border-gray-500">

                                                        <div id={`ID-${idx}`}>
                                                            {/* PaltaQ User Details */}
                                                            <div className='flex justify-between'>
                                                                <div className="flex items-center">
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
                                                                                    {paltaQ.user.id == uid ? (
                                                                                        <div>
                                                                                            <span className="font-bold text-lg ml-2">Guest User</span>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div>
                                                                                            {paltaQ.userid && paltaQ.user.id == userId ? (
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
                                                                                    {paltaQ.user.id !== uid && (
                                                                                        <div>
                                                                                            <Image src={`/${rank[paltaQ.user.id].icon}`} alt="Rank Icon" width={25} height={25} />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {/* Date */}
                                                                        <span className="small ml-2">
                                                                            {new Date(paltaQ.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date(paltaQ.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(/:\\d+ /, ' ')}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <button onClick={() => toast.dark('Report feature is not available yet')} className="lg:flex flex-row items-start px-2 mx-3 hover:text-red-800 transition-colors duration-500">
                                                                        <FontAwesomeIcon icon={faFlag} className="w-[1rem] mr-2 lg:pt-[1.5px] pt-0 lg:translate-y-[0.15em] -translate-y-1" />
                                                                        <span className="font-bold lg:block hidden">Report</span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* PaltaQ Question */}
                                                            <div className='mt-2'>{paltaQ.paltaQ}</div>

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

                                                                    {/* Blooms Badge */}
                                                                    <span className='ml-1.5'>
                                                                        {/* Remembering */}
                                                                        {paltaQ.questionType[0].remembering && (
                                                                            <div
                                                                                className='badge bg-[#393d71] ml-0.5 px-2'
                                                                                data-tooltip-content="Remembering: The foundational level of Bloom's Taxonomy. It involves recalling basic facts, definitions, or concepts from memory, such as remembering dates, names, or key terms without needing to understand or analyze them."
                                                                                data-tooltip-id="PQ-badge-remember"
                                                                            >
                                                                                <span className='font-bold text-white text-sm'>
                                                                                    RE
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* Understanding */}
                                                                        {paltaQ.questionType[0].understanding && (
                                                                            <div
                                                                                className='badge bg-[#63899f] ml-0.5 px-1.5 py-1'
                                                                                data-tooltip-content="The second level of Bloom's Taxonomy. It involves grasping the meaning of information, such as interpreting instructions, summarizing a text, or explaining a concept in your own words. This level goes beyond mere recall by requiring comprehension of the material."
                                                                                data-tooltip-id="PQ-badge-understand"
                                                                            >
                                                                                <span className='font-bold text-white text-sm'>
                                                                                    UN
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* Applying */}
                                                                        {paltaQ.questionType[0].applying && (
                                                                            <div
                                                                                className='badge bg-[#576042] ml-0.5 px-1.5 py-1'
                                                                                data-tooltip-content="The third level of Bloom's Taxonomy. It involves using knowledge in new situations, such as applying formulas to solve problems, using concepts in practice, or carrying out a procedure in a different context. This level focuses on the ability to implement learned material."
                                                                                data-tooltip-id="PQ-badge-apply"
                                                                            >
                                                                                <span className='font-bold text-white text-sm'>
                                                                                    AP
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* Analying */}
                                                                        {paltaQ.questionType[0].analyzing && (
                                                                            <div
                                                                                className='badge bg-[#578a72] ml-0.5 px-1.5 py-1'
                                                                                data-tooltip-content="The fourth level of Bloom's Taxonomy. It involves breaking down information into components to understand its structure, such as comparing and contrasting ideas, identifying relationships, or recognizing patterns. This level requires critical thinking to dissect information."
                                                                                data-tooltip-id="PQ-badge-analyze"
                                                                            >
                                                                                <span className='font-bold text-white text-sm'>
                                                                                    AN
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* Evaluate */}
                                                                        {paltaQ.questionType[0].evaluating && (
                                                                            <div
                                                                                className='badge bg-[#dca146] ml-0.5 px-1.5 py-1'
                                                                                data-tooltip-content="The fifth level of Bloom's Taxonomy. It involves making judgments based on criteria and standards, such as critiquing an argument, assessing the validity of a source, or weighing the pros and cons of a decision. This level requires both analysis and justification."
                                                                                data-tooltip-id="PQ-badge-evaluate"
                                                                            >
                                                                                <span className='font-bold text-white text-sm'>
                                                                                    EV
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* Create */}
                                                                        {paltaQ.questionType[0].creating && (
                                                                            <div
                                                                                className='badge bg-[#cb484f] ml-0.5 px-1.5 py-1'
                                                                                data-tooltip-content="The highest level of Bloom's Taxonomy. It involves generating new ideas, products, or ways of viewing things, such as designing a project, composing a story, or proposing a theory. This level emphasizes innovation and the ability to put elements together in a novel way."
                                                                                data-tooltip-id="PQ-badge-create"
                                                                            >
                                                                                <span className='font-bold text-white text-sm'>
                                                                                    CR
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* Tooltips */}
                                                                        <div>
                                                                            <Tooltip
                                                                                id="PQ-badge-remember"
                                                                                place="top"
                                                                                style={{
                                                                                    borderRadius: "8px",
                                                                                    padding: "10px",
                                                                                    zIndex: "100",
                                                                                    opacity: "1",
                                                                                    width: "350px",
                                                                                    textAlign: "left",
                                                                                    backgroundColor: "#393d71"
                                                                                }}
                                                                            />
                                                                            <Tooltip
                                                                                id="PQ-badge-understand"
                                                                                place="top"
                                                                                style={{
                                                                                    borderRadius: "8px",
                                                                                    padding: "10px",
                                                                                    zIndex: "100",
                                                                                    opacity: "1",
                                                                                    width: "350px",
                                                                                    textAlign: "left",
                                                                                    backgroundColor: "#63899f"
                                                                                }}
                                                                            />
                                                                            <Tooltip
                                                                                id="PQ-badge-apply"
                                                                                place="top"
                                                                                style={{
                                                                                    borderRadius: "8px",
                                                                                    padding: "10px",
                                                                                    zIndex: "100",
                                                                                    opacity: "1",
                                                                                    width: "350px",
                                                                                    textAlign: "left",
                                                                                    backgroundColor: "#576042"
                                                                                }}
                                                                            />
                                                                            <Tooltip
                                                                                id="PQ-badge-analyze"
                                                                                place="top"
                                                                                style={{
                                                                                    borderRadius: "8px",
                                                                                    padding: "10px",
                                                                                    zIndex: "100",
                                                                                    opacity: "1",
                                                                                    width: "350px",
                                                                                    textAlign: "left",
                                                                                    backgroundColor: "#578a72"
                                                                                }}
                                                                            />
                                                                            <Tooltip
                                                                                id="PQ-badge-evaluate"
                                                                                place="top"
                                                                                style={{
                                                                                    borderRadius: "8px",
                                                                                    padding: "10px",
                                                                                    zIndex: "100",
                                                                                    opacity: "1",
                                                                                    width: "350px",
                                                                                    textAlign: "left",
                                                                                    backgroundColor: "#dca146"
                                                                                }}
                                                                            />
                                                                            <Tooltip
                                                                                id="PQ-badge-create"
                                                                                place="top"
                                                                                style={{
                                                                                    borderRadius: "8px",
                                                                                    padding: "10px",
                                                                                    zIndex: "100",
                                                                                    opacity: "1",
                                                                                    width: "350px",
                                                                                    textAlign: "left",
                                                                                    backgroundColor: "#cb484f"
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </span>
                                                                </div>

                                                                {/* PaltaQ Like/Dislike/PaltaQ/Improve */}
                                                                <div className="flex flex-row items-start mt-2 pt-1">
                                                                    {/* Like */}
                                                                    <button onClick={() => handleLike(paltaQ.id, userId, 'palta')} disabled={loading}>
                                                                        <FontAwesomeIcon
                                                                            icon={faThumbsUp}
                                                                            className={`hover:text-blue-500 active:text-blue-600 duration-500 pb-1 ${paltaQ.likedBy && paltaQ.likedBy.some((like: { userId: string; }) => like.userId === userId) ? 'text-blue-500' : ''}`}
                                                                        />
                                                                    </button>
                                                                    <span className="small ml-1 mr-2">{paltaQ.likes}</span>
                                                                    <span className="small mr-2">|</span>
                                                                    {/* Dislike */}
                                                                    <button onClick={() => handleDislike(paltaQ.id, userId, 'palta')} disabled={loading}>
                                                                        <FontAwesomeIcon
                                                                            icon={faThumbsDown}
                                                                            className={`hover:text-red-500 active:text-red-600 duration-500 pb-1 ${paltaQ.dislikedBy && paltaQ.dislikedBy.some((dislike: { userId: string; }) => dislike.userId === userId) ? 'text-red-500' : ''}`}
                                                                        />
                                                                    </button>
                                                                    <span className="small ml-1 mr-2">{paltaQ.dislikes}</span>
                                                                    <span className="small mr-2">|</span>
                                                                    {/* Show PaltaQ */}
                                                                    <button onClick={() => toggleInputBox(paltaQ.id)}>
                                                                        <FontAwesomeIcon icon={faComment} className={`hover:text-indigo-500 active:text-indigo-600 duration-500 pb-1 ${visibleInputBox[paltaQ.id] ? 'text-indigo-500' : ''}`} />
                                                                    </button>
                                                                    <span className="small ml-1 mr-2">{paltaQ.repliesLength}</span>
                                                                    <span className="small mr-2">|</span>
                                                                    {/* PaltaQ */}
                                                                    <button onClick={() => handleButtonClick(paltaQ.id, 'paltaQ1', paltaQ.isAnonymous ? 'Anonymous User' : paltaQ.user.name)}>
                                                                        <h5
                                                                            className={`font-bold text-zinc-600 hover:text-emerald-600 duration-200 text-base -translate-y-0.5 hover:-translate-y-[4px] ${textBoxPosition == 'paltaQ1' ? 'text-emerald-700' : ''}`}>
                                                                            PaltaQ
                                                                        </h5>
                                                                    </button>
                                                                    <span className="small mx-2">|</span>
                                                                    {/* Improve */}
                                                                    <button onClick={() => handleAIGenerate(paltaQ.paltaQ, paltaQ.id)}>
                                                                        <div className='flex flex-row hover:text-blue-500 hover:-translate-y-[4px] duration-200'>
                                                                            <FontAwesomeIcon
                                                                                icon={faWandMagicSparkles}
                                                                                className={`translate-y-0.5`}
                                                                            />
                                                                            <span
                                                                                className={`font-bold text-base pl-1 -translate-y-[2px]`}>
                                                                                Improve
                                                                            </span>
                                                                        </div>
                                                                    </button>
                                                                </div>

                                                            </div>

                                                            {/* Conditional PaltaQ2 Text Area */}
                                                            <div>
                                                                {visibleTextBoxes[paltaQ.id] && textBoxPosition === 'paltaQ1' && (
                                                                    <div className='pb-2 pt-1'>

                                                                        {/* Responding To / Anonymity */}
                                                                        <div className='flex flex-row items-end justify-between'>
                                                                            <h6 className='text-zinc-400 text-sm pl-1'>Depth:2 | Responding to {userName}</h6>

                                                                            <label className='inline-flex items-center cursor-pointer'>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    value={(isAnonymous[paltaQ.id] || false).toString()}
                                                                                    className="sr-only peer"
                                                                                    onChange={() => toggleAnonymity(paltaQ.id)}
                                                                                />
                                                                                <div className="relative w-6 h-3 bg-zinc-800 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-transparent after:content-[''] after:absolute after:top-[0px] after:start-[0px] after:bg-zinc-500 after:border-zinc-800 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-500-800"></div>
                                                                                {isAnonymous[question.id] ? (
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

                                                                        <form className="mr-1" onSubmit={handlePaltaQ(paltaQ.id, question.id, true)}>
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

                                                            <hr className={`border-b border-gray-400 mr-4 ${idx === sortedQuestions.length - 1 ? 'mb-0 mt-3' : 'my-3'}`}></hr>

                                                            <div className='mb-4 lg:mx-2 pr-3'>
                                                                <GeneratedResponse response={responseAI[paltaQ.id]} visibility={visibility[paltaQ.id]} lastQuestion={lastQuestion[paltaQ.id]} toggleVisibility={toggleVisibility} type={'palta'} questionID={paltaQ.id} />
                                                            </div>

                                                        </div>

                                                        {/* Recursive PaltaQ Component */}
                                                        {visibleInputBox[paltaQ.id] && (
                                                            <div>
                                                                {/* Replies */}
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
                                                                    classId=''
                                                                    topicId=''
                                                                />
                                                            </div>
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

            <p className='text-zinc-500 -translate-y-2 text-center'>Showing the questions asked in last 7 days</p>

            {/* Pagination-bottom */}
            <div className='flex justify-center items-center mx-auto pad-x2'>
                {questions.length > 0 && (
                    <div className='py-3'>
                        <nav aria-label="Questions page navigation">
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <a className="page-link" href="#" onClick={(e) => handlePageChange(currentPage - 1, e)}>Previous</a>
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