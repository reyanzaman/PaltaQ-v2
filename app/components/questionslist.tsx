import {
    faPaperPlane,
    faFlag, faThumbsUp,
    faThumbsDown,
    faComment,
    faAngleDown,
    faAngleUp,
    faArrowsRotate,
    faEye,
    faEyeSlash,
    faWandMagicSparkles,
    faCalendar,
    faComments
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/app/ui/neomorphism.css";
import Image from 'next/image';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/questionCategory';
import PaltaQComponent from "@/app/components/paltaQ";
import { getRankDetails } from '@/app/utils/rankings';
import GeneratedResponse from './generatedResponse';
// Use a minimal Topic type to avoid bundling @prisma/client into client-side code
interface Topic {
    id: string;
    name: string;
    classId: string;
}
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
    questionType: QuestionType[];
}

interface User {
    id: string;
    email: string;
    name: string;
    image: string;
    is_Faculty: boolean;
}

interface Question {
    id: string;
    userId: string;
    question: string;
    topicId: string;
    likes: number;
    dislikes: number;
    isAnonymous: boolean;
    score: number;
    user: User;
    paltaQ: number;
    paltaQBy: PaltaQ[];
    likedBy: Likes[];
    dislikedBy: Dislikes[];
    questionType: QuestionType[];
    createdAt: string;
    topic: Topic;
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

export default function QuestionsList({ classId, refresh, handleRefresh, toggleRefresh }: { classId: string, refresh: boolean, handleRefresh: any, toggleRefresh: any }) {

    const { data: session, status } = useSession();
    const [userId, setUserId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingQ, setLoadingQ] = useState(false);

    const [paltaQInputs, setPaltaQInputs] = useState<{ [key: string]: any }>({});
    const [visibleInputBox, setVisibleInputBox] = useState<{ [key: string]: boolean }>({});

    const [visibleTextBoxes, setVisibleTextBoxes] = useState<{ [key: string]: boolean }>({});
    const [textBoxPosition, setTextBoxPosition] = useState('');
    const [userName, setUserName] = useState('');

    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('All Topics' as string);
    const [selectedTopicId, setSelectedTopicId] = useState('' as string);
    const [topics, setTopics] = useState<Topic[]>();
    const [viewQuestions, setViewQuestions] = useState(true);
    const [viewFacultyQs, setViewFacultyQs] = useState(true);

    const [isAnonymous, setIsAnonymous] = useState<{ [key: string]: boolean }>({});

    const [responseAI, setResponseAI] = useState<{ [key: string]: string }>({});
    const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({});
    const [lastQuestion, setLastQuestion] = useState<{ [key: string]: string }>({});

    const questionsRef = useRef<HTMLDivElement>(null);
    const [rank, setRank] = useState<{ [key: string]: RankDetails }>({});
    const [facultyQuestions, setFacultyQuestions] = useState<Question[]>([]);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [fromDate, setFromDate] = useState<string | undefined>(undefined);
    const [toDate, setToDate] = useState<string | undefined>(undefined);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const fromInputRef = useRef<HTMLInputElement>(null);
    const toInputRef = useRef<HTMLInputElement>(null);

    // Update date filter
    useEffect(() => {
        // Helper: inclusive date bounds
        const getStartOfDay = (d: Date) => {
            const x = new Date(d);
            x.setHours(0, 0, 0, 0);
            return x;
        };
        const getEndOfDay = (d: Date) => {
            const x = new Date(d);
            x.setHours(23, 59, 59, 999);
            return x;
        };

        // If user hasn't chosen any filters yet, default to "today" only ONCE if there are today's questions.
        if (!fromDate && !toDate) {
            const now = new Date();
            const startToday = getStartOfDay(now);
            const endToday = getEndOfDay(now);

            const hasToday = questions.some(q => {
                const d = new Date(q.createdAt);
                return d >= startToday && d <= endToday;
            });

            if (hasToday) {
                // Build YYYY-MM-DD in local time
                const yyyy = now.getFullYear();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const dd = String(now.getDate()).padStart(2, '0');
                const todayStr = `${yyyy}-${mm}-${dd}`;

                // Set once, then let the same effect re-run and apply the unified filter below
                setFromDate(todayStr);
                return;
            }
            // Fall through to unified filter with no bounds if no today items
        }

        // Unified filter path (applies whether user picked dates or default was set)
        let result = questions;

        if (fromDate) {
            const from = getStartOfDay(new Date(fromDate));
            result = result.filter(q => new Date(q.createdAt) >= from);
        }
        if (toDate) {
            const to = getEndOfDay(new Date(toDate));
            result = result.filter(q => new Date(q.createdAt) <= to);
        }

        // Separate and sort
        const facultyQs = result
            .filter(q => q.user.is_Faculty)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const nonFacultyQs = result
            .filter(q => !q.user.is_Faculty)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setFacultyQuestions(facultyQs);
        setFilteredQuestions([...facultyQs, ...nonFacultyQs]);
    }, [questions, fromDate, toDate]);

    const openDatePicker = (el: HTMLInputElement | null) => {
        if (!el) return;
        // Prefer native showPicker if supported
        // @ts-ignore
        if (typeof el.showPicker === 'function') {
            // @ts-ignore
            el.showPicker();
        } else {
            // Fallback for Safari/Firefox/iOS: user-gesture click after focus
            el.focus({ preventScroll: true });
            setTimeout(() => el.click(), 0);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
    const indexOfLastQuestion = currentPage * itemsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - itemsPerPage;
    const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

    // Update date filter (sets state, validates, then refreshes list)
    const updateFilteredQuestions = (fDate?: string, tDate?: string) => {
        const from = fDate ?? '';
        const to = tDate ?? '';

        // quick guard for invalid range (optional toast)
        if (from && to && new Date(from) > new Date(to)) {
            toast.error('From date cannot be after To date');
            // still set the states so the user sees what they picked
            setFromDate(from);
            setToDate(to);
            return;
        }

        setFromDate(from);
        setToDate(to);

        // trigger your existing reload/filter path
        // (same idea you use after topic change)
        handleRefresh();
    };

    const formatDate = (date: string | number | Date) => {
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const toggleVisibility = (questionId: string, state: boolean) => {
        setVisibility(prev => ({ ...prev, [questionId]: state }));
    }

    const handlePageChange = (pageNumber: any, event: any) => {
        event.preventDefault(); // Prevent the default anchor behavior
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
        event.currentTarget.blur();
    };

    const handleInputChange = (questionId: string) => (event: any) => {
        const value = event.target.value;
        setPaltaQInputs(prev => ({ ...prev, [questionId]: value }));
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
                throw new Error(`Error: Failed to like question`);
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
                throw new Error(`Error: Failed to dislike question`);
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

    const handlePaltaQ = (questionId: string, topicId: string, tname: string, quesPaltaQId = '', palta = false) => async (e: React.FormEvent<HTMLFormElement>) => {
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
                if (quesPaltaQId == '') {
                    console.error('quesPaltaQId ID is null');
                    setLoading(false);
                    toast.update(loadingToastId, {
                        render: 'Error: quesPaltaId is null',
                        type: 'error',
                        isLoading: false,
                        autoClose: 4000,
                    });
                    return;
                } else {
                    response = await fetch(`/api/questions?question=${pQuestion}&qid=${questionId}&cid=${classId}&tid=${topicId}&Mqid=${quesPaltaQId}&tname=${tname}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ isAnonymous: isAnonymous[questionId], category: QuestionCategory.PaltaPalta }),
                    });
                }
            } else {
                response = await fetch(`/api/questions?question=${pQuestion}&qid=${questionId}&cid=${classId}&tid=${topicId}&tname=${tname}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isAnonymous: isAnonymous[questionId], category: QuestionCategory.Palta }),
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
                    autoClose: 4000,
                });
            }

            resetClick();
            toggleInputBox(questionId, false);
            handleRefresh();
            toggleAnonymity(questionId);
        } catch (error) {
            console.error('Failed to submit palta question:', error);
            toast.error('Failed to submit palta question');
        } finally {
            setLoading(false);
        }
    };

    const handleDropdown = () => {
        setShowDropdown(!showDropdown);
    }

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

    useEffect(() => {

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
            } else {
                // Handle error
                console.error('Failed to get topics');
            }
        }

        const fetchQuestions = async () => {
            try {
                setLoadingQ(true);
                const response = await fetch(`/api/questions?cid=${classId}&tid=${selectedTopicId}`);
                if (response.ok) {
                    const data = await response.json();
                    setQuestions(data);
                } else {
                    // Handle error
                    console.error('Failed to fetch classes');
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };

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
                        throw new Error(`Error: Failed to get user ID`);
                    }

                    const data = await response.json();
                    setUserId(data);
                } catch (error) {
                    console.error('Error fetching user id:', error);
                }
            }
        };

        fetchUserID();
        fetchTopics();
        fetchQuestions().then(() => setLoadingQ(false));

    }, [refresh]);

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
            setRank(ranks);
        };

        const debouncedFetch = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                fetchHighestScores();
                timeoutId = null;
            }, 800);
        };

        debouncedFetch();

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };

    }, [questions]);

    useEffect(() => {
        if (questionsRef.current) {
            questionsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]);

    if (status === 'loading') {
        return <div className="mx-auto text-center py-8"><h1 className="text-2xl font-bold">Loading Questions...</h1></div>;
    }

    // Track if student questions have started
    let studentQuestionsStarted = false;
    let facultyQuestionsStarted = false;

    return (
        <div ref={questionsRef} className='lg:px-3'>
            <div onClick={() => setViewQuestions(!viewQuestions)} className='flex flex-row mb-5 ml-3 w-fit pb-1 pt-2 active:-translate-y-3 active:duration-500'>
                <h5 className='text-gray-800 font-bold lg:text-2xl text-lg'>Classroom Questions</h5>
                {viewQuestions ? <FontAwesomeIcon icon={faAngleUp} className="w-[2em] text-gray-800 lg:translate-y-2 translate-y-1 pl-1" /> : <FontAwesomeIcon icon={faAngleDown} className="w-[2em] translate-y-2 text-gray-800" />}
            </div>

            {viewQuestions && (
                <div>
                    <div className='flex flex-col items-start'>
                        {/* Pagination-bottom */}
                        <div className='order-last mx-auto'>
                            {questions.length > 0 && (
                                <div className='pl-3 py-4 max-w-[90vw]'>
                                    <nav aria-label="Questions page navigation">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <a className="page-link mb-3" href="#" onClick={(e) => handlePageChange(currentPage - 1, e)}>Back</a>
                                            </li>
                                            {[...Array(totalPages)].map((_, i) => (
                                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                    <a className="page-link mb-3" href="#" onClick={(e) => handlePageChange(i + 1, e)}>{i + 1}</a>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <a className="page-link mb-3" href="#" onClick={(e) => handlePageChange(currentPage + 1, e)}>Next</a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>

                        {/* Questions List */}
                        <div className='order-3 w-full'>
                            {currentQuestions.map((question: Question, index: number) => (
                                <div key={question.id}>

                                    {/* Check if current question is non-faculty and student questions haven't started */}
                                    <div className='mb-2'>
                                        {!question.user.is_Faculty && !studentQuestionsStarted && (
                                            <h4 className="text-lg font-bold text-gray-800 pt-4 mb-3 ml-3 border-b-2 border-gray-600 w-fit pr-2">
                                                Student Questions
                                            </h4>
                                        )}
                                        {question.user.is_Faculty && !facultyQuestionsStarted && (
                                            <span className='flex flex-row items-center' onClick={() => setViewFacultyQs(!viewFacultyQs)}>
                                                <h4 className="text-lg font-bold text-gray-800 pt-2 mb-3 ml-3 border-b-2 border-gray-600 w-fit pr-2">
                                                    Faculty Questions
                                                </h4>
                                                {viewFacultyQs ? <FontAwesomeIcon icon={faAngleUp} className="w-[1.5rem] text-gray-800 -translate-y-1" /> : <FontAwesomeIcon icon={faAngleDown} className="w-[1.5rem] -translate-y-1 text-gray-800" />}
                                            </span>
                                        )}
                                    </div>

                                    {/* Update the flag once student questions have started */}
                                    {!question.user.is_Faculty && (studentQuestionsStarted = true)}
                                    {/* Update the flag once student questions have started */}
                                    {question.user.is_Faculty && (facultyQuestionsStarted = true)}

                                    {question.user.is_Faculty && viewFacultyQs ? (
                                        // Faculty Question Component
                                        <div
                                            className={`card bg-primary ${question.user.is_Faculty ? 'border-secondary border-gray-500 shadow-lg' : 'border-light shadow-sm'} lg:w-fit w-full lg:ml-2 mb-4 lg:pr-4 lg:pl-2 lg:pb-1 pb-0 lg:pt-1 pt-1`}
                                        >
                                            {/* Question card top part */}
                                            <div className="px-4 pt-3 pb-2 min-w-[40vw]">

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
                                                                    className='rounded-full w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]'
                                                                ></Image>
                                                            ) : (
                                                                <Image
                                                                    src={question.user.image}
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
                                                                    const isSelf = question.user.id === userId;
                                                                    const isFaculty = !!question.user.is_Faculty;
                                                                    const userRank = rank?.[question.user.id];

                                                                    const baseName = question.isAnonymous
                                                                        ? `User@${question.user.id.slice(0, 8)}${isSelf ? ' (You)' : ''}`
                                                                        : (question.user.name.length > 16
                                                                            ? question.user.name.split(' ').slice(0, 2).join(' ')
                                                                            : question.user.name);

                                                                    // Do NOT color Guest User. Otherwise use rank color.
                                                                    const nameStyle = { color: `#${userRank?.colorCode || ''}` };

                                                                    return (
                                                                        <div className="flex items-center gap-1 min-w-0">
                                                                            {/* Name */}
                                                                            <span
                                                                                className="font-bold text-sm sm:text-base lg:text-lg ml-2 truncate"
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
                                                </div>

                                                {/* Main Question */}
                                                <div className="flex flex-row pt-2 lg:pb-2 pb-0 mb-0 px-1">
                                                    <h4 className="lg:text-lg text-base lg:text-justify text-left p-0 m-0">
                                                        {question.question}
                                                    </h4>
                                                </div>

                                            </div>

                                            {/* Question card bottom part */}
                                            <div>

                                                {/* Main Question Badges */}
                                                <div className="lg:pb-2 pb-5 lg:pl-2 pl-4 lg:pt-0 pt-1">
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
                                                <div className="flex flex-wrap items-center lg:gap-3 gap-[6px] lg:px-4 px-2 sm:px-3 lg:mt-2 w-full lg:-translate-y-0 -translate-y-1 lg:ml-3 ml-4">
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

                                                {visibleInputBox[question.id] && (<hr className='border-b border-gray-400 my-3'></hr>)}

                                                {/* Conditional PaltaQ1 Text Area */}
                                                <div>
                                                    {visibleTextBoxes[question.id] && textBoxPosition === 'mainQ' && (
                                                        <div className="lg:pb-0 pb-2">

                                                            {/* Depth */}
                                                            <div className="flex items-center justify-between gap-3 lg:px-2 px-3 pt-4">
                                                                <h6 className="text-zinc-400 text-xs sm:text-sm">Depth:1 | Responding to {userName}</h6>
                                                            </div>

                                                            {/* TextBox */}
                                                            <form
                                                                className="lg:w-[99%] w-[95%] mx-auto relative"
                                                                onSubmit={handlePaltaQ(question.id, question.topicId, question.topic.name)}
                                                            >
                                                                <div className="my-2">
                                                                    <div className="relative">
                                                                        <textarea
                                                                            id="paltaQuestion"
                                                                            className="w-full resize-none rounded-2xl px-5 py-4 lg:text-base text-sm text-zinc-700 placeholder-zinc-400 bg-[#e6e7ee] shadow-[inset_4px_4px_6px_#c5c6cb,inset_-4px_-4px_6px_#ffffff] focus:outline-none focus:shadow-[inset_2px_2px_4px_#c5c6cb,inset_-2px_-2px_4px_#ffffff] lg:pr-[7rem] lg:pb-[3.75rem] overflow-y-auto break-words max-h-[50vh]"
                                                                            style={{ height: '6.5em' }}
                                                                            placeholder="Type a creative palta question here..."
                                                                            onChange={handleInputChange(question.id)}
                                                                            value={paltaQInputs[question.id]}
                                                                        />

                                                                        {/* Desktop: floating icon buttons inside textarea */}
                                                                        <div className="absolute bottom-[2.5em] right-[2.5em] scale-[1.5] hidden lg:flex items-center gap-1 z-10">
                                                                            {session?.user?.email && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => toggleAnonymity(question.id)}
                                                                                    aria-label={isAnonymous[question.id] ? 'Disable anonymity' : 'Enable anonymity'}
                                                                                    className="p-2 rounded-full"
                                                                                >
                                                                                    <FontAwesomeIcon
                                                                                        icon={isAnonymous[question.id] ? faEyeSlash : faEye}
                                                                                        className={`w-4 h-4 ${isAnonymous[question.id] ? 'text-rose-700' : 'text-zinc-600'}`}
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
                                                                                onClick={() => toggleAnonymity(question.id)}
                                                                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
                                                                                                                      ${isAnonymous[question.id]
                                                                                        ? 'bg-[#e6e7ee] shadow-[inset_3px_3px_5px_#c5c6cb,inset_-3px_-3px_5px_#ffffff] text-rose-700'
                                                                                        : 'bg-[#e6e7ee] shadow-[3px_3px_5px_#c5c6cb,-3px_-3px_5px_#ffffff] text-zinc-600'
                                                                                    }`}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={isAnonymous[question.id] ? faEyeSlash : faEye}
                                                                                    className={`w-4 ${isAnonymous[question.id] ? 'text-rose-700' : 'text-zinc-600'}`}
                                                                                />
                                                                                <span>{isAnonymous[question.id] ? 'Anonymous' : 'Anonymous'}</span>
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

                                                {/* AI Response */}
                                                <div className='mb-4 mt-6 lg:mx-2 -translate-y-1'>
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

                                                        {/* PaltaQ Level */}
                                                        <div>
                                                            {question.paltaQBy
                                                                .slice() // Create a copy of the array to avoid mutating the original
                                                                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                                                .map((paltaQ: any) => (
                                                                    // PaltaQ Card Component
                                                                    <div key={paltaQ.id} className="flex flex-col justify-between ml-2 px-3 py-2 w-full border-l-2 border-gray-500">
                                                                        <div>
                                                                            {/* Top Part */}
                                                                            <div className="">
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
                                                                                                                className="font-bold text-sm sm:text-base lg:text-lg ml-2 truncate"
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
                                                                                    <h4 className="lg:text-lg text-base lg:text-justify text-left p-0 m-0 text-neutral-600">
                                                                                        {paltaQ.paltaQ}
                                                                                    </h4>
                                                                                </div>
                                                                            </div>

                                                                            {/* Bottom Part */}
                                                                            <div className="flex flex-wrap items-center gap-2 lg:px-0 px-1 lg:pt-1 pt-3 pb-1">
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
                                                                                <div className={`order-1 sm:order-2 flex flex-wrap items-center gap-1 w-full sm:w-auto ${paltaQ?.questionType?.[0]?.remembering || paltaQ?.questionType?.[0]?.understanding || paltaQ?.questionType?.[0]?.applying || paltaQ?.questionType?.[0]?.analyzing || paltaQ?.questionType?.[0]?.evaluating || paltaQ?.questionType?.[0]?.creating ? 'lg:pl-3 pl-0' : ''}`}>
                                                                                    {/* Remembering */}
                                                                                    {paltaQ.questionType[0].remembering && (
                                                                                        <div
                                                                                            className="badge bg-[#393d71] p-1"
                                                                                            data-tooltip-content="Remembering: The foundational level of Bloom's Taxonomy. It involves recalling basic facts, definitions, or concepts from memory, such as remembering dates, names, or key terms without needing to understand or analyze them."
                                                                                            data-tooltip-id="PQ-badge-remember"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>RE</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Understanding */}
                                                                                    {paltaQ.questionType[0].understanding && (
                                                                                        <div
                                                                                            className="badge bg-[#63899f] p-1"
                                                                                            data-tooltip-content="The second level of Bloom's Taxonomy. It involves grasping the meaning of information, such as interpreting instructions, summarizing a text, or explaining a concept in your own words. This level goes beyond mere recall by requiring comprehension of the material."
                                                                                            data-tooltip-id="PQ-badge-understand"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>UN</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Applying */}
                                                                                    {paltaQ.questionType[0].applying && (
                                                                                        <div
                                                                                            className="badge bg-[#576042] p-1"
                                                                                            data-tooltip-content="The third level of Bloom's Taxonomy. It involves using knowledge in new situations, such as applying formulas to solve problems, using concepts in practice, or carrying out a procedure in a different context. This level focuses on the ability to implement learned material."
                                                                                            data-tooltip-id="PQ-badge-apply"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>AP</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Analying */}
                                                                                    {paltaQ.questionType[0].analyzing && (
                                                                                        <div
                                                                                            className="badge bg-[#578a72] p-1"
                                                                                            data-tooltip-content="The fourth level of Bloom's Taxonomy. It involves breaking down information into components to understand its structure, such as comparing and contrasting ideas, identifying relationships, or recognizing patterns. This level requires critical thinking to dissect information."
                                                                                            data-tooltip-id="PQ-badge-analyze"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>AN</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Evaluate */}
                                                                                    {paltaQ.questionType[0].evaluating && (
                                                                                        <div
                                                                                            className="badge bg-[#dca146] p-1"
                                                                                            data-tooltip-content="The fifth level of Bloom's Taxonomy. It involves making judgments based on criteria and standards, such as critiquing an argument, assessing the validity of a source, or weighing the pros and cons of a decision. This level requires both analysis and justification."
                                                                                            data-tooltip-id="PQ-badge-evaluate"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>EV</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Create */}
                                                                                    {paltaQ.questionType[0].creating && (
                                                                                        <div
                                                                                            className="badge bg-[#cb484f] p-1"
                                                                                            data-tooltip-content="The highest level of Bloom's Taxonomy. It involves generating new ideas, products, or ways of viewing things, such as designing a project, composing a story, or proposing a theory. This level emphasizes innovation and the ability to put elements together in a novel way."
                                                                                            data-tooltip-id="PQ-badge-create"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>CR</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Tooltips */}
                                                                                    <>
                                                                                        <Tooltip
                                                                                            id="PQ-badge-remember"
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
                                                                                            id="PQ-badge-understand"
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
                                                                                            id="PQ-badge-apply"
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
                                                                                            id="PQ-badge-analyze"
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
                                                                                            id="PQ-badge-evaluate"
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
                                                                                            id="PQ-badge-create"
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

                                                                            {/* Palta Question Actions */}
                                                                            <div className="flex flex-wrap items-center lg:gap-3 gap-[6px] lg:px-4 px-2 sm:px-3 mt-3 w-full lg:ml-0 ml-1">
                                                                                {/* Like */}
                                                                                <button onClick={() => handleLike(paltaQ.id, userId, 'palta')} disabled={loading} className="flex items-center gap-1">
                                                                                    <FontAwesomeIcon
                                                                                        icon={faThumbsUp}
                                                                                        className={`hover:text-blue-500 active:text-blue-600 duration-500 pb-1 ${paltaQ.likedBy && paltaQ.likedBy.some((like: { userId: string; }) => like.userId === userId) ? 'text-blue-500' : ''}`}
                                                                                    />
                                                                                    <span className="small lg:text-base text-sm">{paltaQ.likes}</span>
                                                                                </button>

                                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                                {/* Dislike */}
                                                                                <button onClick={() => handleDislike(paltaQ.id, userId, 'palta')} disabled={loading} className="flex items-center gap-1">
                                                                                    <FontAwesomeIcon
                                                                                        icon={faThumbsDown}
                                                                                        className={`hover:text-red-500 active:text-red-600 duration-500 pb-1 ${paltaQ.dislikedBy && paltaQ.dislikedBy.some((dislike: { userId: string; }) => dislike.userId === userId) ? 'text-red-500' : ''}`}
                                                                                    />
                                                                                    <span className="small lg:text-base text-sm">{paltaQ.dislikes}</span>
                                                                                </button>

                                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                                {/* Show PaltaQ */}
                                                                                <button onClick={() => toggleInputBox(paltaQ.id)} className="flex items-center gap-1">
                                                                                    <FontAwesomeIcon
                                                                                        icon={faComment}
                                                                                        className={`hover:text-indigo-500 active:text-indigo-600 duration-500 pb-1 ${visibleInputBox[paltaQ.id] ? 'text-indigo-500' : ''}`}
                                                                                    />
                                                                                    <span className="small lg:text-base text-sm">{paltaQ.repliesLength}</span>
                                                                                </button>

                                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                                {/* PaltaQ */}
                                                                                <button onClick={() => handleButtonClick(paltaQ.id, 'paltaQ1', paltaQ.isAnonymous ? 'Anonymous User' : paltaQ.user.name)} className="flex items-center gap-1">
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
                                                                                {visibleTextBoxes[paltaQ.id] && textBoxPosition === 'paltaQ1' && (
                                                                                    <div className="lg:pb-0 pb-2">
                                                                                        {/* Depth */}
                                                                                        <div className="flex items-center justify-between gap-3 px-1">
                                                                                            <h6 className="text-zinc-400 text-xs sm:text-sm pt-4">Depth:2 | Responding to {userName}</h6>
                                                                                        </div>

                                                                                        <form
                                                                                            className="lg:w-[100%] w-full mx-auto relative"
                                                                                            onSubmit={handlePaltaQ(paltaQ.id, question.topicId, question.topic.name, question.id, true)}
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

                                                                            <hr className=' border-b border-gray-400 my-3 mr-4'></hr>

                                                                            {/* AI Response */}
                                                                            <div className='mb-4 mt-6 lg:mx-2 pr-3'>
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
                                                                                    from="topic"
                                                                                    classId={classId}
                                                                                    topicId={question.topicId}
                                                                                    refresh={refresh}
                                                                                    toggleRefresh={toggleRefresh}
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

                                    ) : (

                                        <div className=''>
                                            {index == 0 && currentPage == 1 && (
                                                <div>
                                                    {facultyQuestions.length >= 1 && (
                                                        <h1 className='text-base ml-3 text-gray-800 pb-4'>Note: Faculty questions are hidden. There are <b>{facultyQuestions.length ? facultyQuestions.length : 0}</b> faculty questions. Click the arrow above to show the hidden faculty questions.</h1>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!question.user.is_Faculty && (
                                        // Student Question Component
                                        <div
                                            className={`card bg-primary ${question.user.is_Faculty ? 'border-secondary border-gray-500 shadow-lg' : 'border-light shadow-sm'} lg:w-fit w-full lg:ml-2 mb-4 lg:pr-4 lg:pl-2 lg:pb-1 pb-0 lg:pt-1 pt-1`}
                                        >
                                            {/* Question card top part */}
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
                                                                    className='rounded-full w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] md:w-[32px] md:h-[32px]'
                                                                ></Image>
                                                            ) : (
                                                                <Image
                                                                    src={question.user.image}
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
                                                                {/* Name */}
                                                                {(() => {
                                                                    const isSelf = question.user.id === userId;             // append (You) if needed
                                                                    const isFaculty = !!question.user.is_Faculty;
                                                                    const userRank = rank?.[question.user.id];              // { colorCode, icon }

                                                                    const baseName = question.isAnonymous
                                                                        ? `User@${question.user.id.slice(0, 8)}${isSelf ? ' (You)' : ''}`
                                                                        : (question.user.name.length > 16
                                                                            ? question.user.name.split(' ').slice(0, 2).join(' ')
                                                                            : question.user.name);

                                                                    // Do NOT color Guest User. Otherwise use rank color.
                                                                    const nameStyle = { color: `#${userRank?.colorCode || ''}` };

                                                                    return (
                                                                        <div className="flex items-center gap-1 min-w-0">
                                                                            {/* Name */}
                                                                            <span
                                                                                className="font-bold text-sm sm:text-base lg:text-lg ml-2 truncate"
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
                                                </div>

                                                {/* Main Question */}
                                                <div className="flex flex-row pt-2 lg:pb-2 pb-0 mb-0 px-1">
                                                    <h4 className="lg:text-lg text-base lg:text-justify text-left p-0 m-0">
                                                        {question.question}
                                                    </h4>
                                                </div>

                                            </div>

                                            {/* Question card bottom part */}
                                            <div>

                                                {/* Main Question Badges */}
                                                <div className="lg:pb-2 pb-5 lg:pl-2 pl-4 lg:pt-0 pt-1">
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
                                                <div className="flex flex-wrap items-center lg:gap-3 gap-[6px] lg:px-4 px-2 sm:px-3 lg:mt-2 w-full lg:-translate-y-0 -translate-y-1 lg:ml-3 ml-4">
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

                                                {visibleInputBox[question.id] && (<hr className='border-b border-gray-400 my-3'></hr>)}

                                                {/* Conditional PaltaQ1 Text Area */}
                                                <div>
                                                    {visibleTextBoxes[question.id] && textBoxPosition === 'mainQ' && (
                                                        <div>
                                                            {visibleTextBoxes[question.id] && textBoxPosition === 'mainQ' && (
                                                                <div className="lg:pb-0 pb-2">

                                                                    {/* Depth */}
                                                                    <div className="flex items-center justify-between gap-3 lg:px-2 px-3 pt-4">
                                                                        <h6 className="text-zinc-400 text-xs lg:text-sm pb-0 mb-0">Depth:1 | Responding to {userName}</h6>
                                                                    </div>

                                                                    {/* TextBox */}
                                                                    <form
                                                                        className="lg:w-[99%] w-[95%] mx-auto relative"
                                                                        onSubmit={handlePaltaQ(question.id, question.topicId, question.topic.name)}
                                                                    >
                                                                        <div className="my-2">
                                                                            <div className="relative">
                                                                                <textarea
                                                                                    id="paltaQuestion"
                                                                                    className="w-full resize-none rounded-2xl px-5 py-4 lg:text-base text-sm text-zinc-700 placeholder-zinc-400 bg-[#e6e7ee] shadow-[inset_4px_4px_6px_#c5c6cb,inset_-4px_-4px_6px_#ffffff] focus:outline-none focus:shadow-[inset_2px_2px_4px_#c5c6cb,inset_-2px_-2px_4px_#ffffff] lg:pr-[7rem] lg:pb-[3.75rem] overflow-y-auto break-words max-h-[50vh]"
                                                                                    style={{ height: '6.5em' }}
                                                                                    placeholder="Type a creative palta question here..."
                                                                                    onChange={handleInputChange(question.id)}
                                                                                    value={paltaQInputs[question.id]}
                                                                                />

                                                                                {/* Desktop: floating icon buttons inside textarea */}
                                                                                <div className="absolute bottom-[2.5em] right-[2.5em] scale-[1.5] hidden lg:flex items-center gap-1 z-10">
                                                                                    {session?.user?.email && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => toggleAnonymity(question.id)}
                                                                                            aria-label={isAnonymous[question.id] ? 'Disable anonymity' : 'Enable anonymity'}
                                                                                            className="p-2 rounded-full"
                                                                                        >
                                                                                            <FontAwesomeIcon
                                                                                                icon={isAnonymous[question.id] ? faEyeSlash : faEye}
                                                                                                className={`w-4 h-4 ${isAnonymous[question.id] ? 'text-rose-700' : 'text-zinc-600'}`}
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
                                                                                        onClick={() => toggleAnonymity(question.id)}
                                                                                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
                                                                                                                      ${isAnonymous[question.id]
                                                                                                ? 'bg-[#e6e7ee] shadow-[inset_3px_3px_5px_#c5c6cb,inset_-3px_-3px_5px_#ffffff] text-rose-700'
                                                                                                : 'bg-[#e6e7ee] shadow-[3px_3px_5px_#c5c6cb,-3px_-3px_5px_#ffffff] text-zinc-600'
                                                                                            }`}
                                                                                    >
                                                                                        <FontAwesomeIcon
                                                                                            icon={isAnonymous[question.id] ? faEyeSlash : faEye}
                                                                                            className={`w-4 ${isAnonymous[question.id] ? 'text-rose-700' : 'text-zinc-600'}`}
                                                                                        />
                                                                                        <span>{isAnonymous[question.id] ? 'Anonymous' : 'Anonymous'}</span>
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
                                                    )}
                                                </div>

                                                {/* AI Response */}
                                                <div className='mb-4 mt-6 lg:mx-2 -translate-y-1'>
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

                                                        {/* PaltaQ Level */}
                                                        <div>
                                                            {question.paltaQBy
                                                                .slice() // Create a copy of the array to avoid mutating the original
                                                                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                                                .map((paltaQ: any) => (
                                                                    // PaltaQ Card Component
                                                                    <div key={paltaQ.id} className="flex flex-col justify-between ml-2 px-3 py-2 w-full border-l-2 border-gray-500">
                                                                        <div>
                                                                            {/* Top Part */}
                                                                            <div className="">
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
                                                                                                                className="font-bold text-sm sm:text-base lg:text-lg ml-2 truncate"
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
                                                                                    <h4 className="lg:text-lg text-base lg:text-justify text-left p-0 m-0 text-neutral-600">
                                                                                        {paltaQ.paltaQ}
                                                                                    </h4>
                                                                                </div>
                                                                            </div>

                                                                            {/* Bottom Part */}
                                                                            {/* Badges */}
                                                                            <div className="flex flex-wrap items-center gap-2 lg:px-0 px-1 lg:pt-1 pt-3 pb-1">
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
                                                                                <div className={`order-1 sm:order-2 flex flex-wrap items-center gap-1 w-full sm:w-auto ${paltaQ?.questionType?.[0]?.remembering || paltaQ?.questionType?.[0]?.understanding || paltaQ?.questionType?.[0]?.applying || paltaQ?.questionType?.[0]?.analyzing || paltaQ?.questionType?.[0]?.evaluating || paltaQ?.questionType?.[0]?.creating ? 'lg:pl-3 pl-0' : ''}`}>
                                                                                    {/* Remembering */}
                                                                                    {paltaQ.questionType[0].remembering && (
                                                                                        <div
                                                                                            className="badge bg-[#393d71] p-1"
                                                                                            data-tooltip-content="Remembering: The foundational level of Bloom's Taxonomy. It involves recalling basic facts, definitions, or concepts from memory, such as remembering dates, names, or key terms without needing to understand or analyze them."
                                                                                            data-tooltip-id="PQ-badge-remember"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>RE</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Understanding */}
                                                                                    {paltaQ.questionType[0].understanding && (
                                                                                        <div
                                                                                            className="badge bg-[#63899f] p-1"
                                                                                            data-tooltip-content="The second level of Bloom's Taxonomy. It involves grasping the meaning of information, such as interpreting instructions, summarizing a text, or explaining a concept in your own words. This level goes beyond mere recall by requiring comprehension of the material."
                                                                                            data-tooltip-id="PQ-badge-understand"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>UN</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Applying */}
                                                                                    {paltaQ.questionType[0].applying && (
                                                                                        <div
                                                                                            className="badge bg-[#576042] p-1"
                                                                                            data-tooltip-content="The third level of Bloom's Taxonomy. It involves using knowledge in new situations, such as applying formulas to solve problems, using concepts in practice, or carrying out a procedure in a different context. This level focuses on the ability to implement learned material."
                                                                                            data-tooltip-id="PQ-badge-apply"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>AP</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Analying */}
                                                                                    {paltaQ.questionType[0].analyzing && (
                                                                                        <div
                                                                                            className="badge bg-[#578a72] p-1"
                                                                                            data-tooltip-content="The fourth level of Bloom's Taxonomy. It involves breaking down information into components to understand its structure, such as comparing and contrasting ideas, identifying relationships, or recognizing patterns. This level requires critical thinking to dissect information."
                                                                                            data-tooltip-id="PQ-badge-analyze"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>AN</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Evaluate */}
                                                                                    {paltaQ.questionType[0].evaluating && (
                                                                                        <div
                                                                                            className="badge bg-[#dca146] p-1"
                                                                                            data-tooltip-content="The fifth level of Bloom's Taxonomy. It involves making judgments based on criteria and standards, such as critiquing an argument, assessing the validity of a source, or weighing the pros and cons of a decision. This level requires both analysis and justification."
                                                                                            data-tooltip-id="PQ-badge-evaluate"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>EV</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Create */}
                                                                                    {paltaQ.questionType[0].creating && (
                                                                                        <div
                                                                                            className="badge bg-[#cb484f] p-1"
                                                                                            data-tooltip-content="The highest level of Bloom's Taxonomy. It involves generating new ideas, products, or ways of viewing things, such as designing a project, composing a story, or proposing a theory. This level emphasizes innovation and the ability to put elements together in a novel way."
                                                                                            data-tooltip-id="PQ-badge-create"
                                                                                        >
                                                                                            <span className='font-bold text-white lg:text-xs text-[10px]'>CR</span>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Tooltips */}
                                                                                    <>
                                                                                        <Tooltip
                                                                                            id="PQ-badge-remember"
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
                                                                                            id="PQ-badge-understand"
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
                                                                                            id="PQ-badge-apply"
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
                                                                                            id="PQ-badge-analyze"
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
                                                                                            id="PQ-badge-evaluate"
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
                                                                                            id="PQ-badge-create"
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

                                                                            {/* Palta Question Actions */}
                                                                            <div className="flex flex-wrap items-center lg:gap-3 gap-[6px] lg:px-4 px-2 sm:px-3 mt-3 w-full lg:ml-0 ml-1">
                                                                                {/* Like */}
                                                                                <button onClick={() => handleLike(paltaQ.id, userId, 'palta')} disabled={loading} className="flex items-center gap-1">
                                                                                    <FontAwesomeIcon
                                                                                        icon={faThumbsUp}
                                                                                        className={`hover:text-blue-500 active:text-blue-600 duration-500 pb-1 ${paltaQ.likedBy && paltaQ.likedBy.some((like: { userId: string; }) => like.userId === userId) ? 'text-blue-500' : ''}`}
                                                                                    />
                                                                                    <span className="small lg:text-base text-sm">{paltaQ.likes}</span>
                                                                                </button>

                                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                                {/* Dislike */}
                                                                                <button onClick={() => handleDislike(paltaQ.id, userId, 'palta')} disabled={loading} className="flex items-center gap-1">
                                                                                    <FontAwesomeIcon
                                                                                        icon={faThumbsDown}
                                                                                        className={`hover:text-red-500 active:text-red-600 duration-500 pb-1 ${paltaQ.dislikedBy && paltaQ.dislikedBy.some((dislike: { userId: string; }) => dislike.userId === userId) ? 'text-red-500' : ''}`}
                                                                                    />
                                                                                    <span className="small lg:text-base text-sm">{paltaQ.dislikes}</span>
                                                                                </button>

                                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                                {/* Show PaltaQ */}
                                                                                <button onClick={() => toggleInputBox(paltaQ.id)} className="flex items-center gap-1">
                                                                                    <FontAwesomeIcon
                                                                                        icon={faComment}
                                                                                        className={`hover:text-indigo-500 active:text-indigo-600 duration-500 pb-1 ${visibleInputBox[paltaQ.id] ? 'text-indigo-500' : ''}`}
                                                                                    />
                                                                                    <span className="small lg:text-base text-sm">{paltaQ.repliesLength}</span>
                                                                                </button>

                                                                                <span className="text-zinc-400" aria-hidden>|</span>

                                                                                {/* PaltaQ */}
                                                                                <button onClick={() => handleButtonClick(paltaQ.id, 'paltaQ1', paltaQ.isAnonymous ? 'Anonymous User' : paltaQ.user.name)} className="flex items-center gap-1">
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
                                                                                {visibleTextBoxes[paltaQ.id] && textBoxPosition === 'paltaQ1' && (
                                                                                    <div className="lg:pb-0 pb-2">
                                                                                        {/* Depth */}
                                                                                        <div className="flex items-center justify-between gap-3 px-1">
                                                                                            <h6 className="text-zinc-400 text-xs sm:text-sm pt-4">Depth:2 | Responding to {userName}</h6>
                                                                                        </div>

                                                                                        <form
                                                                                            className="lg:w-[100%] w-full mx-auto relative"
                                                                                            onSubmit={handlePaltaQ(paltaQ.id, question.topicId, question.topic.name, question.id, true)}
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

                                                                            <hr className=' border-b border-gray-400 my-3 mr-4'></hr>

                                                                            {/* AI Response */}
                                                                            <div className='mb-4 mt-6 lg:mx-2 pr-3'>
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
                                                                                    from="topic"
                                                                                    classId={classId}
                                                                                    topicId={question.topicId}
                                                                                    refresh={refresh}
                                                                                    toggleRefresh={toggleRefresh}
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
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Header */}
                        <div className="flex lg:flex-row flex-col items-start justify-start order-1 w-full lg:mb-3 lg:gap-0 gap-3">

                            {/* Topic + Refresh */}
                            <div className="flex flex-row items-center w-fit gap-2 lg:gap-1 z-50">
                                {/* Topic Filter (grows) */}
                                <div className="flex flex-row order-first">
                                    {/* DropDown */}
                                    <div className="ml-3 -translate-y-1 w-full">
                                        <span className="dropdown block w-full">
                                            <div className="btn-group mr-2 mb-2 flex flex-1 min-w-0">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary flex-1 min-w-0 text-left truncate"
                                                    onClick={handleDropdown}
                                                    title={selectedTopic}
                                                >
                                                    {selectedTopic}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary dropdown-toggle dropdown-toggle-split flex-none"
                                                    data-toggle="dropdown"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                    onClick={handleDropdown}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faAngleDown}
                                                        className="w-[1.5rem] text-[#31344b]"
                                                    />
                                                </button>

                                                <div
                                                    className={`dropdown-menu ${showDropdown ? 'show' : ''}`}
                                                    id="dropdown"
                                                    x-placement="bottom-start"
                                                    style={{
                                                        position: 'absolute',
                                                        willChange: 'transform',
                                                        top: '0px',
                                                        left: '0px',
                                                        transform: 'translate3d(0px,40px,0px)',
                                                    }}
                                                >
                                                    {/* All Topic */}
                                                    <a
                                                        className="dropdown-item"
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedTopic('All Topics');
                                                            setSelectedTopicId('');
                                                            handlePageChange(1, e);
                                                            handleRefresh();
                                                            setShowDropdown(false);
                                                        }}
                                                    >
                                                        {'All Topics'}
                                                    </a>

                                                    {topics?.map((topic: Topic, index: any) => (
                                                        <a
                                                            key={index}
                                                            className="dropdown-item"
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setSelectedTopic(topic.name);
                                                                setSelectedTopicId(topic.id);
                                                                handlePageChange(1, e);
                                                                handleRefresh();
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

                                {/* Single Refresh */}
                                <div className="mr-4 ml-1 lg:ml-3 lg:-translate-y-[0.4em] translate-y-[0.3em] lg:mb-0 mb-6 shrink-0">
                                    <button onClick={() => handleRefresh()} className="btn btn-primary flex items-center space-x-2">
                                        <FontAwesomeIcon icon={faArrowsRotate} className="w-[1.5rem] text-[#31344b]" />
                                    </button>
                                </div>
                            </div>

                            {/* Date Filter */}
                            <div className="lg:-translate-y-1 flex lg:flex-row flex-col lg:gap-4 lg:mb-0 mb-4 w-full lg:px-0 px-4">

                                {/* From */}
                                <div
                                    className="flex flex-row w-full items-center justify-start gap-3 select-none cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                    onMouseDown={(e) => {
                                        // Prevent text selection when clicking the row (but allow it on the input itself)
                                        const t = e.target as HTMLElement;
                                        if (!t.closest('input[type="date"]')) e.preventDefault();
                                    }}
                                    onClick={() => openDatePicker(fromInputRef.current)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openDatePicker(fromInputRef.current);
                                        }
                                    }}
                                >
                                    <label className="h6 pb-2" htmlFor="startDate">From</label>
                                    <div className="form-group w-full">
                                        <div className="input-group input-group-border w-full">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon={faCalendar} />
                                                </span>
                                            </div>
                                            <input
                                                ref={fromInputRef}
                                                className="form-control datepicker w-full select-text cursor-text"
                                                id="startDate"
                                                type="date"
                                                value={fromDate as string | number | readonly string[] | undefined}
                                                onChange={(e) => updateFilteredQuestions(e.target.value as string, toDate as string)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* To */}
                                <div
                                    className="flex flex-row w-full items-center justify-start gap-3 select-none cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                    onMouseDown={(e) => {
                                        const t = e.target as HTMLElement;
                                        if (!t.closest('input[type="date"]')) e.preventDefault();
                                    }}
                                    onClick={() => openDatePicker(toInputRef.current)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openDatePicker(toInputRef.current);
                                        }
                                    }}
                                >
                                    <label className="h6 lg:mr-0 mr-5 pb-2" htmlFor="endDate">To</label>
                                    <div className="form-group w-full">
                                        <div className="input-group input-group-border w-full">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <FontAwesomeIcon icon={faCalendar} />
                                                </span>
                                            </div>
                                            <input
                                                ref={toInputRef}
                                                className="form-control datepicker w-full select-text cursor-text"
                                                id="endDate"
                                                type="date"
                                                value={toDate as string | number | readonly string[] | undefined}
                                                onChange={(e) => updateFilteredQuestions(fromDate as string, e.target.value as string)}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Info */}
                        <div className='order-2 pl-3 z-20 lg:mb-0 mb-4'>
                            <p className='mb-0 pb-1 lg:text-xl text-lg font-bold'>Showing Questions: ({loadingQ ? "Loading" : currentQuestions.length} / {loadingQ ? "Loading" : questions.length})</p>
                            <p className='text-sm pb-3 mb-0 text-zinc-500'>
                                {fromDate && toDate
                                    ? `Displaying questions from ${formatDate(fromDate)} to ${formatDate(toDate)}`
                                    : fromDate
                                        ? `Displaying questions from ${formatDate(fromDate)}`
                                        : toDate
                                            ? `Displaying questions until ${formatDate(toDate)}`
                                            : 'Displaying all questions'
                                }
                            </p>
                            {/* <p className='text-sm pb-3 text-sky-800'>Faculty questions will be show first</p> */}
                            {loadingQ ? (
                                <p className='mb-5'>Loading questions...</p>

                            ) : (
                                <div>
                                    {questions.length === 0 && (
                                        <p className='mb-5'>No quesions have been registered yet for this classroom</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}