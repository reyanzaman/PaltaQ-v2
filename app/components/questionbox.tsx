"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';

import { Topic, Question } from '@prisma/client';

export default function QuestionBox({ onQuestionSubmitted, classId }: { onQuestionSubmitted: any, classId: string }) {
    const [question, setQuestion] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState('Select Topic' as string);
    const [selectedTopicId, setSelectedTopicId] = useState('' as string);
    const [topics, setTopics] = useState<Topic[]>();

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

        fetchTopics();
        
    }, []);

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

        const response = await fetch(`/api/questions?question=${question}&tid=${selectedTopicId}&cid=${classId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isAnonymous: isAnonymous, category: QuestionCategory.Topic }),
        });

        if (response.ok) {
            // Handle successful submission
            setQuestion('');
            toast.success(response.statusText);
            // Call the parent component's callback
            if (onQuestionSubmitted) {
                onQuestionSubmitted();
            }
        } else {
            // Handle error
            console.error('Failed to submit question');
            toast.error(response.statusText);
        }
    };

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
                        <span className="ms-3 text-lg font-bold">Toggle Anonymity ({isAnonymous==false ? "Off" : "On"})</span>
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
                    onChange={(e) => setQuestion(e.target.value)}
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
        </form>
    );
}
