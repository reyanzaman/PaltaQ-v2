"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';

export default function QuestionBox({ onQuestionSubmitted, topicId, classId }: { onQuestionSubmitted: any, topicId: string, classId: string }) {
    const [question, setQuestion] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('Select Topic' as string);

    useEffect(() => {
    }, [question]);

    const handleDropdown = () => {
        setShowDropdown(!showDropdown);
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Handle validation  
        if (question.length < 10) {
            toast.error('Question too short!');
            return;
        } else if (question.length > 300) {
            toast.error('Question too long!');
            return;
        }

        const response = await fetch(`api/questions?question=${question}&tid=${topicId}&cid=${classId}`, {
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
        <form className="w-3/4 pl-3 pt-4" onSubmit={handleSubmit}>
            <div className="mb-4">
                <h4 className='py-1'>Try asking a question here:</h4>
                <textarea
                    id="questionMain"
                    className="form-control pr-5o5 resize-none py-3 pl-3"
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
                        className="w-[1.5rem] text-[#31344b]"
                    />
                </button>
            </div>

            <div>

                <div className='flex flex-row gap-x-12 items-center'>
                    <label className='inline-flex items-center cursor-pointer'>
                        <input type="checkbox" value={isAnonymous.toString()} className="sr-only peer" onChange={() => setIsAnonymous(!isAnonymous)} />
                        <div className="relative w-16 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-transparent after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-500 after:border-zinc-800 after:border after:rounded-full after:h-5 after:w-7 after:transition-all peer-checked:bg-zinc-500-800"></div>
                        <span className="ms-3 text-lg font-bold">Toggle Anonymity</span>
                    </label>

                    <div className=''>
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

                                <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`} id='dropdown' x-placement="bottom-start" style={{ position: 'absolute', willChange: 'transform', top: '0px', left: '0px', transform: 'translate3d(0px,44px,0px)' }}>
                                    <a className='dropdown-item' href="#" onClick={(e) => { e.preventDefault(); setSelectedTopic('For Loops & While Loops'); setShowDropdown(false); }}>For Loops & While Loops</a>
                                    <a className='dropdown-item' href="#" onClick={(e) => { e.preventDefault(); setSelectedTopic('Conditions'); setShowDropdown(false); }}>Conditions</a>
                                </div>
                            </div>
                        </span>
                    </div>
                </div>
            </div>
        </form>
    );
}
