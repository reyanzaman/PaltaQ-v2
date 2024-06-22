/* eslint-disable react/no-unescaped-entities */
"use client";

import { nunito } from "@/app/ui/fonts";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronUp } from "@fortawesome/free-solid-svg-icons";


import { Topic } from "@prisma/client";

interface User {
    id: string;
    name: string;
    image: string;
    email: String;
    is_Admin: boolean;
    is_Faculty: boolean;
    createdAt: string;
    updatedAt: string;
    classes: ClassEnrollment[];
}

interface Class {
    id: string;
    name: string;
    code: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
    enrollments: ClassEnrollment[]
}

interface ClassFaculty {
    id: string;
    userId: string;
    classId: string;
    user: User;
    class: Class;
}

interface ClassEnrollment {
    id: string;
    userId: string;
    classId: string;
    user: User;
    score: number;
    rank: string;
    questionCount: number;
    paltaQCount: number;
}

export default function FacultyClass({ user }: { user: User }) {

    const [classes, setClasses] = useState<ClassFaculty[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class>();
    const [topics, setTopics] = useState<Topic[]>([]);

    const [className, setClassName] = useState('' as string);
    const [classCode, setClassCode] = useState('' as string);
    const [classTopic, setClassTopic] = useState('' as string);
    const [topicName, setTopicName] = useState('' as string);

    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const [toggleDelete, setToggleDelete] = useState(null as any);
    const [toggleTopicDelete, setToggleTopicDelete] = useState(null as any);
    const [toggleRemove, setToggleRemove] = useState(null as any);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/classes?id=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setClasses(data);
                } else {
                    // Handle error
                    console.error('Failed to fetch classes');
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                setLoading(false);
            }
            setLoading(false);
        };

        const fetchTopics = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/topics?cid=${selectedClass?.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTopics(data);
                } else {
                    // Handle error
                    console.error('Failed to fetch classes');
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                setLoading(false);
            }
            setLoading(false);
        }

        fetchClasses();
        fetchTopics();
    }, [refresh]);

    const createClass = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ className: className, facultyId: user.id }),
            });

            if (response.ok) {
                setClassName('');
                setRefresh(!refresh);
                toast.success(response.statusText);
            } else {
                // Handle error
                console.error('Failed to submit class details');
                toast.error(response.statusText);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error creating class:', error);
            setLoading(false);
        }
        setLoading(false);
    };

    const joinClass = async (e: any) => {
        e.preventDefault()
        setLoading(true);

        try {
            const response = await fetch(`/api/classes?code=${classCode}&uid=${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setClassCode('');
                setRefresh(!refresh);
                toast.success(response.statusText);
            } else {
                // Handle error
                console.error('Failed to submit class details');
                toast.error(response.statusText);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            setLoading(false);
        }
        setLoading(false);
    };

    const selectClass = (index: any) => {
        setSelectedClass(classes[index].class);
        if (selectedClass === classes[index].class) {
            setSelectedClass(undefined);
        }
    };

    const deleteClass = async (index: any) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/classes?id=${classes[index].class.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setRefresh(!refresh);
                toast.success('Class deleted');
            } else {
                // Handle error
                console.error('Failed to delete class');
                toast.error(response.statusText);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error deleting class:', error);
            setLoading(false);
        }
        setLoading(false);
        setToggleDelete(null);
    };

    const createTopic = async (e: any) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ classId: selectedClass?.id, topicName: classTopic }),
            });

            if (response.ok) {
                setClassTopic('');
                setRefresh(!refresh);
                toast.success(response.statusText);
            } else {
                // Handle error
                console.error('Failed to submit class topic');
                toast.error(response.statusText);
            }
        } catch (error) {
            console.error('Error submitting topic:', error);
        }
    };

    const deleteTopic = async (index: any) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/topics?id=${topics[index].id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setRefresh(!refresh);
                toast.success('Topic deleted');
            } else {
                // Handle error
                console.error('Failed to delete topic');
                toast.error(response.statusText);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error deleting topic:', error);
            setLoading(false);
        }
        setLoading(false);
        setToggleTopicDelete(null);
    };

    const updateTopic = async (index: any) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/topics?tid=${topics[index].id}&name=${topicName}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setRefresh(!refresh);
                toast.success('Topic updated');
            } else {
                // Handle error
                console.error('Failed to update topic');
                toast.error(response.statusText);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error updating topic:', error);
            setLoading(false);
        }
        setLoading(false);
        setTopicName('');
        setEditIndex(null);
    }

    const removeStudent = async (index: any) => {
        setLoading(true);
        const chosenclass = selectedClass;
        try {
            const response = await fetch(`/api/classes/student?uid=${chosenclass?.enrollments[index].userId}&cid=${chosenclass?.enrollments[index].classId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setRefresh(!refresh);
                handleCollapse();
                toast.success('User removed');
            } else {
                // Handle error
                console.error('Failed to removed user');
                toast.error(response.statusText);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error removing user:', error);
            setLoading(false);
        }
        setLoading(false);
        setToggleRemove(null);
    };

    const unenroll = async (index: any) => {
        setLoading(true);
        const chosenClassEnrollment = classes[index];
        try {
            const response = await fetch(`/api/classes/student?uid=${chosenClassEnrollment.userId}&cid=${chosenClassEnrollment.classId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setRefresh(!refresh);
                handleCollapse();
                toast.success('You have been unenrolled');
            } else {
                // Handle error
                console.error('Failed to unenroll user');
                toast.error(response.statusText);
                setLoading(false);
            }
        } catch (error) {
            console.error('Failed to unenroll user:', error);
            setLoading(false);
        }
        setLoading(false);
        setToggleRemove(null);
    };

    const handleCollapse = () => {
        setSelectedClass(undefined);
    };

    const displayStudents = () => {
        if (selectedClass) {
            if (selectedClass.enrollments.length <= 1) {
                return (
                    <div>
                        <div>
                            <h5 className="pl-3">Student list of {selectedClass.name}</h5>
                            <p className="lg:pb-3 pb-1 pl-3">Users Enrolled: {selectedClass.enrollments.length}</p>
                        </div>
                        <p className="lg:ml-4 ml-3">No students or faculties except you have enrolled to this classroom yet.</p>
                    </div>
                )
            } else {
                return (
                    <div className="lg:w-full w-[85vw] overflow-x-auto scrollbar-thin scrollbar-webkit">
                        <div>
                            <h5 className="pl-3">Enrollment List of {selectedClass.name}</h5>
                            <div className="flex flex-row">
                                <p className="lg:pb-3 pb-1 pl-3">Student Count: {selectedClass.enrollments.filter(enrollment => !enrollment.user.is_Faculty).length}</p>
                                <p className="mx-2">|</p>
                                <p>Faculty Count: {selectedClass.enrollments.filter(enrollment => enrollment.user.is_Faculty).length}</p>
                            </div>
                        </div>

                        <table className="table table-responsive-sm lg:mr-0 pr-4">
                            <thead>
                                <tr>
                                    <th className="border-0" scope="col" id="className">Name</th>
                                    <th className="border-0" scope="col" id="className">Status</th>
                                    <th className="border-0" scope="col" id="classCode">Score</th>
                                    <th className="border-0" scope="col" id="classCode">Questions</th>
                                    <th className="border-0" scope="col" id="classCode">PaltaQ Asked</th>
                                    <th className="border-0" scope="col" id="classCode">Rank</th>
                                    <th className="border-0" scope="col" id="classCode">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedClass.enrollments.map((student, index) => (
                                    student.user.id !== user.id && (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <td>{student.user.name}</td>
                                                <td>
                                                    {student.user.is_Faculty
                                                        ? (student.user.id == selectedClass.creatorId ? "Admin" : "Faculty")
                                                        : "Student"
                                                    }
                                                </td>
                                                <td>{student ? student.score : -1}</td>
                                                <td>{student ? student.questionCount : -1}</td>
                                                <td>{student ? student.paltaQCount : -1}</td>
                                                <td>{student ? student.rank : 'Unknown'}</td>
                                                <td>
                                                    {student.user.id !== selectedClass.creatorId && (
                                                        <div className="hover:text-red-800 transition-colors duration-500" onClick={() => setToggleRemove(index)}>Remove</div>
                                                    )}
                                                </td>
                                            </tr>

                                            {toggleRemove === index && (
                                                <tr key={`${index}-confirm`}>
                                                    <td colSpan={7} className="w-full">
                                                        <div className="flex justify-end gap-x-4">
                                                            <button
                                                                className="hover:text-red-800 transition-colors duration-500"
                                                                onClick={() => removeStudent(index)}
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                className="hover:text-red-800 transition-colors duration-500"
                                                                onClick={() => setToggleRemove(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
        } else {
            return (
                <div>
                    <h5 className="lg:pl-4 pl-2">Manage students enrolled in your classroom</h5>
                    <p className="lg:pl-4 pl-2">Select a class to view enrolled students.</p>
                </div>
            )
        }
    };

    const displayTopics = () => {
        if (selectedClass) {
            return (
                <div className="flex lg:flex-row flex-col mt-4 mb-4 lg:w-75 w-full ">

                    <div className="border border-gray-400 rounded-lg px-2 py-4 w-full lg:h-[23.8em] h-[24em] overflow-y-auto scrollbar-thin scrollbar-webkit lg:order-first order-last">
                        <h5 className="pl-3">Topics of {selectedClass?.name}</h5>


                        {topics.length !== 0 && (
                            <div>
                                <p className="pl-3">Number of topics: {topics.length}</p>
                                <table className="table table-hover table-responsive-sm">
                                    <tr>
                                        <th className="border-0" scope="col" id="className">Topic Name</th>
                                        <th className="border-0" scope="col" id="classCode">Associated Questions</th>
                                        <th className="border-0" scope="col" id="classCode">Actions</th>
                                    </tr>

                                    {topics.map((topic: any, index: any) => (
                                        <tr key={index}>

                                            <td>
                                                {editIndex === index ? (
                                                    <textarea
                                                        value={topicName}
                                                        className="bg-gray-300 border border-gray-500 rounded-lg px-2 py-1 w-full resize-none"
                                                        onChange={(e) => setTopicName(e.target.value)}
                                                    />
                                                ) : (
                                                    topic.name
                                                )}
                                            </td>
                                            <td>
                                                {topic.questions}
                                            </td>

                                            <td className="flex lg:flex-row flex-col items-center">
                                                {editIndex === index ? (
                                                    <>
                                                        <button
                                                            className="hover:text-lime-700 transition-colors duration-500 py-1"
                                                            onClick={() => updateTopic(index)}
                                                            disabled={loading}
                                                        >
                                                            Save
                                                        </button>
                                                        <p className="lg:block hidden mx-3 translate-y-2">|</p>
                                                        <button
                                                            className="hover:text-red-800 transition-colors duration-500 py-1"
                                                            onClick={() => {
                                                                setEditIndex(null);
                                                                setTopicName('');
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="hover:text-blue-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                                            onClick={() => {
                                                                setEditIndex(index);
                                                                setTopicName(topic.name);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="hover:text-blue-800 transition-colors duration-500 lg:hidden block mb-2"
                                                            onClick={() => {
                                                                setEditIndex(index);
                                                                setTopicName(topic.name);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>

                                                        {user.id === selectedClass.creatorId && (
                                                            <p className="lg:block hidden mx-3">|</p>
                                                        )}

                                                        {user.id === selectedClass.creatorId && (
                                                            <div>
                                                                <div
                                                                    className="hover:text-red-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                                                    onClick={() => setToggleTopicDelete(index)}
                                                                >
                                                                    Delete
                                                                </div>
                                                                <button
                                                                    className="hover:text-red-800 transition-colors duration-500 lg:hidden block"
                                                                    onClick={() => setToggleTopicDelete(index)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </td>

                                            {toggleTopicDelete === index && (
                                                <td className="w-full flex gap-x-4">
                                                    <button
                                                        className="hover:text-red-800 transition-colors duration-500"
                                                        onClick={() => deleteTopic(index)}>
                                                        Confirm
                                                    </button>
                                                    <button
                                                        className="hover:text-red-800 transition-colors duration-500"
                                                        onClick={() => deleteTopic(null)}>
                                                        Cancel
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </table>
                            </div>
                        )}

                        {topics.length === 0 && <p className="lg:pl-4 pl-3">No topics set yet.</p>}

                    </div>

                    <div className="lg:w-50 w-full lg:mb-0 mb-5">

                        <h5 className="text-neutral-700 lg:pl-1">Set the topics in your classroom</h5>
                        <p className="lg:pl-1">Students will only be able to ask questions on the topics you set</p>
                        <form onSubmit={createTopic} className="flex flex-col lg:pr-20 gap-6 py-2 mb-2">
                            <div>
                                <label>Topic Name</label>
                                <input
                                    id="classTopic"
                                    className="form-control pr-5o5 resize-none py-3 pl-3"
                                    placeholder="Create a class topic here"
                                    value={classTopic}
                                    onChange={(e) => setClassTopic(e.target.value)}
                                />
                            </div>

                            <button className="btn animate-down-2" type="submit">Create Topic</button>
                        </form>

                    </div>
                </div>
            )
        } else {
            return (
                <div>
                    <h5 className="lg:pl-4 pl-2">Set topics for your students to ask question on</h5>
                    <p className="lg:pl-4 pl-2">Select a class to set topics.</p>
                </div>
            )
        }
    }

    if (loading) {
        return <div className=""><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }

    return (
        <div className={`${nunito.className} antialiased flex flex-col`}>
            <h5 className="font-bold">Welcome {user.name}</h5>

            {/* Create/Join/View Classrooms */}
            <div className="flex lg:flex-row flex-col my-4 lg:w-75 w-full ">

                <div className="border border-gray-400 rounded-lg px-2 py-4 w-full lg:h-[23.8em] h-[24em] overflow-y-auto scrollbar-thin scrollbar-webkit lg:order-first order-last">
                    <h5 className="pl-3">Classes taught by you</h5>


                    {classes.length !== 0 && (
                        <div>
                            <p className="pl-3">Number of classes: {classes.length}</p>
                            <table className="table table-hover table-responsive-sm">
                                <tr>
                                    <th className="border-0" scope="col" id="className">Class Name</th>
                                    <th className="border-0" scope="col" id="classCode">Class Code</th>
                                    <th className="border-0" scope="col" id="classCode">Actions</th>
                                </tr>

                                {classes.map((classItem: any, index: any) => (
                                    <tr key={index}>
                                        <td>
                                            {classItem.class.name}
                                        </td>
                                        <td>
                                            {classItem.class.code}
                                        </td>
                                        <td className="flex lg:flex-row flex-col items-center">

                                            <button
                                                className="hover:text-blue-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                                onClick={() => { selectClass(index); setRefresh(!refresh); }}>
                                                View
                                            </button>
                                            <button
                                                className="hover:text-blue-800 transition-colors duration-500 lg:hidden block mb-2"
                                                onClick={() => { selectClass(index); setRefresh(!refresh); }}>
                                                View
                                            </button>

                                            <p className="lg:block hidden mx-2">|</p>

                                            {user.id === classItem.class.creatorId ? (
                                                <div>
                                                    <div
                                                        className="hover:text-red-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                                        onClick={() => setToggleDelete(index)}>
                                                        Delete
                                                    </div>

                                                    <button
                                                        className="hover:text-red-800 transition-colors duration-500 lg:hidden block"
                                                        onClick={() => setToggleDelete(index)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div
                                                        className="hover:text-red-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                                        onClick={() => setToggleDelete(index)}>
                                                        Unenroll
                                                    </div>

                                                    <button
                                                        className="hover:text-red-800 transition-colors duration-500 lg:hidden block"
                                                        onClick={() => setToggleDelete(index)}>
                                                        Unenroll
                                                    </button>
                                                </div>
                                            )}

                                        </td>
                                        {user.id !== classItem.class.creatorId ? (
                                            <div>
                                                {toggleDelete === index && (
                                                    <td className="w-full flex gap-x-4">
                                                        <button
                                                            className="hover:text-red-800 transition-colors duration-500"
                                                            onClick={() => {unenroll(index); setToggleDelete(null)}}>
                                                            Confirm
                                                        </button>
                                                        <button
                                                            className="hover:text-red-800 transition-colors duration-500"
                                                            onClick={() => setToggleDelete(null)}>
                                                            Cancel
                                                        </button>
                                                    </td>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                {toggleDelete === index && (
                                                    <td className="w-full flex gap-x-4">
                                                        <button
                                                            className="hover:text-red-800 transition-colors duration-500"
                                                            onClick={() => {deleteClass(index); setToggleDelete(null)}}>
                                                            Confirm
                                                        </button>
                                                        <button
                                                            className="hover:text-red-800 transition-colors duration-500"
                                                            onClick={() => setToggleDelete(null)}>
                                                            Cancel
                                                        </button>
                                                    </td>
                                                )}
                                            </div>
                                        )}
                                    </tr>
                                ))}
                            </table>
                        </div>
                    )}

                    {classes.length === 0 && <p className="lg:pl-4 pl-3">No classes created yet.</p>}
                </div>

                <div className="lg:w-50 w-full">
                    <hr className="lg:hidden block"></hr>
                    <h5 className="text-neutral-700 lg:pl-1">Get started by creating your own class</h5>
                    <form onSubmit={createClass} className="flex flex-col lg:pr-20 px py-4 gap-4 mb-2">
                        <input
                            id="className"
                            className="form-control pr-5o5 resize-none py-3 pl-3"
                            placeholder="Enter your class name"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        />
                        <button className="btn animate-down-2" type="submit">Create Class</button>
                    </form>

                    <h5 className="text-neutral-700 lg:pl-1">Or you can join someone else's class</h5>
                    <form onSubmit={joinClass} className="flex flex-col lg:pr-20 px py-4 gap-4">
                        <input
                            id="classCode"
                            className="form-control pr-5o5 resize-none py-3 pl-3"
                            placeholder="Enter a class code"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value)}
                        />
                        <button className="btn animate-down-2 text-info" type="submit">Join Class</button>
                    </form>
                    <hr className="lg:hidden block"></hr>
                </div>
            </div>

            {/* Classroom Title */}
            <div>
                <hr className="border-b border-gray-400"></hr>

                <div className="flex flex-row justify-between">
                    <div><h4 className="lg:pl-2 text-sky-800">{selectedClass?.name} Classroom</h4></div>
                    {selectedClass && (
                        <div>
                            <button onClick={handleCollapse} className="animate-down-2 font-bold mt-2 mr-4 h-fit lg:block hidden">
                                Close
                                <FontAwesomeIcon className="px-2" icon={faCircleChevronUp} />
                            </button>
                            <button onClick={handleCollapse} className="lg:hidden block text-xl mr-[0.5em]">
                                <FontAwesomeIcon icon={faCircleChevronUp} />
                            </button>
                        </div>
                    )}
                </div>
                <hr className="border-b border-gray-400"></hr>
            </div>

            {/* Display Topics */}
            <div className="mb-4 w-full">
                {displayTopics()}
            </div>

            {/* Display Students */}
            <div className="border border-gray-400 rounded-lg px-2 py-4 mb-8 w-full">
                {displayStudents()}
            </div>

        </div>
    );
}