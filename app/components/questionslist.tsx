import { faPaperPlane, faFlag, faThumbsUp, faThumbsDown, faComment, faAngleDown, faAngleUp, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/app/ui/neomorphism.css";
import Image from 'next/image';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';

import { Topic } from '@prisma/client';

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
    paltaQ: String;
    likes: number;
    dislikes: number;
    isAnonymous: boolean;
    score: number;
    user: User;
    likedBy: Likes[];
    dislikedBy: Dislikes[];
    createdAt: string;
}

interface User {
    id: string;
    name: string;
    image: string;
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
    createdAt: string;
}

export default function QuestionsList({ classId }: { classId: string }) {
    const { data: session, status } = useSession();
    const [userId, setUserId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const [pQuestion, setPQuestion] = useState('');
    const [visibleInputBox, setVisibleInputBox] = useState<{ [key: string]: boolean }>({});

    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('All Topics' as string);
    const [selectedTopicId, setSelectedTopicId] = useState('' as string);
    const [topics, setTopics] = useState<Topic[]>();
    const [viewQuestions, setViewQuestions] = useState(true);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(false);

    const [refresh, setRefresh] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const questionsRef = useRef<HTMLDivElement>(null);

    const sortedQuestions = questions.slice().sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const indexOfLastQuestion = currentPage * itemsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - itemsPerPage;
    const currentQuestions = sortedQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

    const totalPages = Math.ceil(questions.length / itemsPerPage);

    const handlePageChange = (pageNumber: any, event: any) => {
        event.preventDefault(); // Prevent the default anchor behavior
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const toggleInputBox = (questionId: string) => {
        setVisibleInputBox(prevState => ({
            ...prevState,
            [questionId]: !prevState[questionId]
        }));
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
                throw new Error(`Error: ${response.statusText}`);
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
                throw new Error(`Error: ${response.statusText}`);
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

    const handlePaltaQ = (questionId: string) => async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return; // Prevent if already loading
        setLoading(true);

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

        try {
            // Example of sending the question to your API
            const response = await fetch(`/api/questions?question=${pQuestion}&qid=${questionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isAnonymous: isAnonymous, category: QuestionCategory.Palta }),
            });

            if (response.ok) {
                // Handle successful submission
                setPQuestion('');

                let responseText = response.statusText
                const updateText = responseText.split('|')[1];
                responseText = responseText.split('|')[0];

                if (updateText !== "Rank unchanged") {
                    toast.dark(updateText);
                }

                toast.success(responseText);
            } else {
                // Handle error
                console.error('Failed to submit palta question');
                toast.error(response.statusText);
            }
            setRefresh(!refresh);
            setLoading(false);
        } catch (error) {
            console.error('Failed to submit palta question:', error);
            toast.error('Failed to submit palta question');
            setLoading(false);
        }
    };

    const handleDropdown = () => {
        setShowDropdown(!showDropdown);
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
                        throw new Error(`Error: ${response.statusText}`);
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
        fetchQuestions();

    }, [refresh]);

    useEffect(() => {
        if (questionsRef.current) {
            questionsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]);

    if (status === 'loading') {
        return <div className="mx-auto text-center py-8"><h1 className="text-2xl font-bold">Loading Questions...</h1></div>;
    }

    return (
        <div ref={questionsRef}>
            <div onClick={() => setViewQuestions(!viewQuestions)} className='flex flex-row mb-5 ml-3 w-fit pb-1 pt-2 active:-translate-y-3 active:duration-500'>
                <h5 className='text-gray-900'>View Questions</h5>
                {viewQuestions ? <FontAwesomeIcon icon={faAngleUp} className="w-[1.5rem] text-[#31344b] text-indigo-700 translate-y-1" /> : <FontAwesomeIcon icon={faAngleDown} className="w-[1.5rem] text-[#31344b] translate-y-1 text-indigo-700" />}
            </div>

            {viewQuestions && (
                <div>
                    <div className='flex flex-col'>

                        {/* Questions List */}
                        <div className='order-last'>
                            {currentQuestions.map((question: any) => (
                                <div key={question.id} className="card bg-primary shadow-sm border-light lg:w-fit w-full lg:mx-4 mb-4" style={{ minWidth: '50vw', border: '2px solid rgba(54, 176, 233, 0.5)' }}>
                                    <div className="px-4 pt-4 pb-2">

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
                                                    <span className="font-bold text-lg ml-2">{question.isAnonymous ? "Anonymous User" : question.user.name}</span>
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
                                        <div className='pb-2'>
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
                                            <div className='badge ml-2 px-2'>
                                                <span className="font-bold text-sm items-end p-1">
                                                    SCORE: {question.score}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Main Question Like/Dislike/PaltaQ */}
                                        <div className="flex mt-2 ml-4 pl-2 pt-2 pb-3">
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
                                            {/* PaltaQ */}
                                            <button onClick={() => toggleInputBox(question.id)}>
                                                <FontAwesomeIcon icon={faComment} className={`hover:text-indigo-500 active:text-indigo-600 duration-500 pb-1 ${visibleInputBox[question.id] ? 'text-indigo-500' : ''}`} />
                                            </button>
                                            <span className="small ml-1">{question.paltaQ}</span>
                                        </div>

                                        {/* Palta Questions Options */}
                                        {visibleInputBox[question.id] && (
                                            <div className="mt-2 ml-3 mr-2">

                                                <div>
                                                    {question.paltaQBy
                                                        .slice() // Create a copy of the array to avoid mutating the original
                                                        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                                                        .map((paltaQ: any) => (
                                                            <div key={paltaQ.id} className="flex flex-col justify-between mt-2 px-4 pt-3 lg:ml-4 w-fit lg:mx-2 mb-4 mt-1 card border border-gray-400 rounded-xl">

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
                                                                            <span className="font-bold text-base ml-2">{paltaQ.isAnonymous ? "Anonymous User" : paltaQ.user.name}</span>
                                                                            {/* Date */}
                                                                            <span className="small ml-2">
                                                                                {new Date(paltaQ.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}, {new Date(question.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(/:\\d+ /, ' ')}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <button onClick={() => toast.dark('Report feature is not available yet')} className="lg:flex flex-row items-start px-2 mx-3 hover:text-red-800 transition-colors duration-500 translate-x-5">
                                                                            <FontAwesomeIcon icon={faFlag} className="w-[1rem] mr-2 lg:pt-[1.5px] pt-0 lg:translate-y-[0.15em] -translate-y-1" />
                                                                            <span className="font-bold lg:block hidden">Report</span>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* PaltaQ Question */}
                                                                <div className='lg:mt-0 mt-2'>{paltaQ.paltaQ}</div>


                                                                <div className='flex flex-row'>

                                                                    {/* PaltaQ Like/Dislike */}
                                                                    <div className="flex mt-2 lg:ml-5 ml-0 pt-2 pb-3">
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
                                                                    </div>

                                                                    {/* PaltaQ Badge */}
                                                                    <div className="flex items-center lg:translate-y-[0.8em] translate-y-[1em] lg:ml-2 ml-1 h-fit">
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

                                                                </div>

                                                            </div>
                                                        ))}
                                                </div>

                                                {/* PaltaQ Text Area */}
                                                <div>
                                                    <form className="" onSubmit={handlePaltaQ(question.id)}>
                                                        {/* Anonymity */}
                                                        <label className='inline-flex items-center cursor-pointer mt-3'>
                                                            <input type="checkbox" value={isAnonymous.toString()} className="sr-only peer" onChange={() => setIsAnonymous(!isAnonymous)} />
                                                            <div className="relative w-8 h-4 bg-zinc-800 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-transparent after:content-[''] after:absolute after:top-[0px] after:start-[0px] after:bg-zinc-500 after:border-zinc-800 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-500-800"></div>
                                                            <span className="ms-2 text-base font-bold">Toggle Anonymity ({isAnonymous == false ? "Off" : "On"})</span>
                                                        </label>

                                                        <textarea
                                                            id="paltaQuestion"
                                                            className="form-control pr-5o5 resize-none py-3 pl-3"
                                                            placeholder="Type a creative palta question here . . ."
                                                            onChange={(e) => setPQuestion(e.target.value)}
                                                            value={pQuestion}
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

                                            </div>
                                        )}

                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Header */}
                        <div className='flex flex-row justify-between mb-4 pb-2 order-first'>
                            <div className='flex flex-row order-first'>
                                <h3 className='pl-3 lg:block hidden'>Topic: </h3>

                                {/* DropDown */}
                                <div className='ml-3 -translate-y-1'>
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
                                                {/* All Topic */}
                                                <a
                                                    className='dropdown-item'
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedTopic('All Topics');
                                                        setSelectedTopicId('');
                                                        setRefresh(!refresh);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    {'All Topics'}
                                                </a>
                                                {topics?.map((topic: Topic, index: any) => (
                                                    <a
                                                        key={index}
                                                        className='dropdown-item'
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSelectedTopic(topic.name);
                                                            setSelectedTopicId(topic.id);
                                                            setRefresh(!refresh);
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

                            <div className='mr-4 ml-3 lg:block hidden'>
                                <button onClick={() => setRefresh(!refresh)} className="btn btn-primary">Refresh</button>
                            </div>
                            <div className='mr-4 ml-3 -translate-y-[0.2em] lg:hidden block'>
                                <button onClick={() => setRefresh(!refresh)} className="btn btn-primary">
                                    <FontAwesomeIcon icon={faArrowsRotate} className="w-[1.5rem] text-[#31344b]" />
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className='order-second pl-3'>
                            <p className='text-xl pb-3'>Questions Registered: {questions.length}</p>
                            {questions.length === 0 && (
                                <p className='mb-5'>No quesions have been registered yet for this classroom</p>
                            )}
                        </div>

                    </div>

                    {/* Pagination */}
                    {questions.length > 0 && (
                        <div className='pl-4 py-4'>
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
            )}

        </div>
    );
}