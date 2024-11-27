"use client";

import { useEffect, useState } from 'react';
import { nunito } from "@/app/ui/fonts";

import { useSession } from "next-auth/react";
import UserImage from "@/app/components/userimage";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleDown, faEraser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Classes, Topic } from '@prisma/client';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { SingleValue } from 'react-select';

export default function PurgeComponent() {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [classes, setClasses] = useState<Classes[]>([]);
    const [topic, setTopic] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [selectedTopicId, setSelectedTopicId] = useState<string>('');

    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {

        const fetchClasses = async () => {
            try {
                const response = await fetch(`/api/admin/class/all`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setClasses(data);
                } else {
                    toast.error('Failed to get classes');
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                toast.error('An error occurred while fetching classes');
            }
        };

        fetchClasses();
    }, [session]);

    useEffect(() => {
        if (selectedClassId) {

            const fetchTopic = async () => {
                try {
                    const response = await fetch(`/api/admin/topic/selected/?id=${selectedClassId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setTopic(data);
                    } else {
                        console.error('Failed to get topics');
                        toast.error('Failed to get topics');
                    }
                } catch (error) {
                    console.error('Error fetching topics:', error);
                    toast.error('An error occurred while fetching topics');
                }
            };

            fetchTopic();
        }
    }, [selectedClassId]);

    if (status === 'loading') {
        return (
            <div className="pl-[5em] pt-[3em]">
                <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
        );
    }

    const options1 = classes?.map(cls => ({ label: cls.name, value: cls.id }));
    const options2 = topic?.map(tpc => ({ label: tpc.name, value: tpc.id }));

    const handleClassChange = (newValue: SingleValue<{ label: string; value: string }>) => {
        if (newValue) {
            setSelectedClass(newValue.label);
            setSelectedClassId(newValue.value);

            // Reset the selected topic when class changes
            setSelectedTopic(""); // Reset the topic
            setSelectedTopicId(""); // Optionally reset the topic ID as well
        }
    };

    const handleTopicChange = (newValue: SingleValue<{ label: string; value: string }>) => {
        if (newValue) {
            setSelectedTopic(newValue.label);
            setSelectedTopicId(newValue.value);
        }
    };

    const handleClear = () => {
        setSelectedClass('');
        setSelectedClassId('');
        setSelectedTopic('');
        setSelectedTopicId('');
    }

    const handlePurge = async () => {
        if (!selectedClass || !selectedTopic) {
            toast.error('Please select a class and topic to purge');
            return;
        }

        // Show loading toast
        const loadingToastId = toast.loading('Purging questions...');

        try {
            const response = await fetch(
                `/api/admin/question/delete/selected/?classId=${selectedClassId}&topicId=${selectedTopicId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                toast.update(loadingToastId, {
                    render: data,
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000,
                });
            } else {
                console.error('Failed to purge questions');
                toast.update(loadingToastId, {
                    render: 'Failed to purge questions',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error purging questions:', error);
            toast.update(loadingToastId, {
                render: 'An error occurred while purging questions',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    return (
        <div className={`${nunito.className} antialiased flex flex-col h-screen pt-4`}>
            <UserImage />

            {/* Header */}
            <div className="w-full px-4">
                <h1>Admin Panel</h1>
                <h5 className='text-lg font-bold'>Question Purge Management</h5>
                <hr />
                <Link href="/pages/admin">
                    <div className="">
                        <div className="flex flex-row items-start">
                            <FontAwesomeIcon
                                icon={faAngleRight}
                                className="w-[1.5rem] text-blue-800 pt-2 lg:-translate-y-0.5 -translate-y-1"
                            />
                            <h2 className="lg:text-xl text-base font-bold text-right text-blue-800 mb-0">
                                Go To Users Access Management
                            </h2>
                        </div>
                    </div>
                </Link>
                <hr></hr>
            </div>

            <div className='w-full px-4'><h5 className='font-bold text-lg mb-4 pb-2'>Selected Class Topic-Based Questions Delete</h5></div>

            <div className='w-full px-4'>
                <div className='flex lg:flex-row flex-col gap-6 items-center'>

                    {/* Dropdown Class */}
                    <div className='lg:w-1/4 w-full'>
                        <Select
                            options={options1}
                            onChange={handleClassChange}
                            value={selectedClass ? { label: selectedClass, value: selectedClassId } : null} // Reset value here
                            placeholder="Select Class"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: "0.5rem", // Rounded corners for neomorphism
                                    backgroundColor: "#e6e7ee", // Ice Gray background
                                    boxShadow:
                                        "4px 4px 10px rgba(0, 0, 0, 0.1), -4px -4px 10px rgba(255, 255, 255, 0.8)", // Neomorphic shadows
                                    padding: "0.25rem",
                                    border: "none", // No visible border
                                }),
                                menu: (base) => ({
                                    ...base,
                                    borderRadius: "0.5rem",
                                    boxShadow:
                                        "4px 4px 10px rgba(0, 0, 0, 0.1), -4px -4px 10px rgba(255, 255, 255, 0.8)", // Neomorphic shadows
                                    overflow: "hidden",
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused
                                        ? "rgba(0, 0, 0, 0.05)"
                                        : "#ffffff", // Light hover effect
                                    color: "#31344b", // Dark text color
                                    padding: "0.5rem 1rem",
                                }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: "#000", // Customize placeholder color
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#31344b", // Ensure selected value uses dark text color
                                }),
                            }}
                        />
                    </div>

                    {/* Dropdown Topic */}
                    <div className='lg:w-1/4 w-full'>
                        <Select
                            options={options2}
                            onChange={handleTopicChange}
                            value={selectedTopic ? { label: selectedTopic, value: selectedTopicId } : null} // Reset value here
                            placeholder="Select Topic"
                            isDisabled={!selectedClass} // Disable if no class is selected
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: "0.5rem", // Rounded corners for neomorphism
                                    backgroundColor: "#e6e7ee", // Ice Gray background
                                    boxShadow:
                                        "4px 4px 10px rgba(0, 0, 0, 0.1), -4px -4px 10px rgba(255, 255, 255, 0.8)", // Neomorphic shadows
                                    padding: "0.25rem",
                                    border: "none", // No visible border
                                }),
                                menu: (base) => ({
                                    ...base,
                                    borderRadius: "0.5rem",
                                    boxShadow:
                                        "4px 4px 10px rgba(0, 0, 0, 0.1), -4px -4px 10px rgba(255, 255, 255, 0.8)", // Neomorphic shadows
                                    overflow: "hidden",
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused
                                        ? "rgba(0, 0, 0, 0.05)"
                                        : "#ffffff", // Light hover effect
                                    color: "#31344b", // Dark text color
                                    padding: "0.5rem 1rem",
                                }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: selectedClass ? "#000" : "#7a7a7a", // Black if class is selected, gray if not
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "#31344b", // Ensure selected value uses dark text color
                                }),
                            }}
                        />
                    </div>

                    {/* Clear Button */}
                    <div className=''>
                        <button onClick={handleClear}>
                            <p className='my-0 btn btn-primary text-lg'>Clear</p>
                        </button>
                    </div>


                </div>

                <div className='mt-4'>
                    <p className='text-danger pt-2 lg:text-left text-center'>
                        <b>WARNING:</b> This will delete all questions in that class belonging to the selected topic.
                    </p>
                    <div className="w-full flex lg:justify-start justify-center">
                        <button className="btn btn-danger shadow animate-down-2 lg:mar-x1" onClick={handlePurge}>
                            <div className='flex flex-row gap-2 w-full py-1 px-2'>
                                <FontAwesomeIcon
                                    icon={faEraser}
                                    className="w-[1.5rem] text-white translate-y-1"
                                />
                                Purge All Questions
                            </div>
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}