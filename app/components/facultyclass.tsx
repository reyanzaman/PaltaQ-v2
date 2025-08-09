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
    endsAt: string;
    enrollments: ClassEnrollment[]
    questionnaire: boolean;
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
    preQuestionnaire?: { isCompleted: boolean };
    postQuestionnaire?: { isCompleted: boolean };
}

export default function FacultyClass({ user }: { user: User }) {

    const [classes, setClasses] = useState<ClassFaculty[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class>();
    const [topics, setTopics] = useState<Topic[]>([]);

    const [className, setClassName] = useState('' as string);
    const [classTopic, setClassTopic] = useState('' as string);
    const [topicName, setTopicName] = useState('' as string);

    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const [toggleDelete, setToggleDelete] = useState(null as any);
    const [toggleTopicDelete, setToggleTopicDelete] = useState(null as any);
    const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
    const [toggleRemove, setToggleRemove] = useState(null as any);
    const [editIndex, setEditIndex] = useState(null);

    const [newClassName, setNewClassName] = useState('' as string);
    const [newClassDate, setNewClassDate] = useState('' as string);
    const [newClassQuestionnaire, setNewClassQuestionnaire] = useState(false as boolean);
    const [toggleUpdate, setToggleUpdate] = useState(null as any);

    const handleSort = (key: string) => {
        setSortConfig((prevConfig) => {
            if (prevConfig.key === key) {
                return {
                    key,
                    direction: prevConfig.direction === "asc" ? "desc" : "asc"
                };
            }
            return { key, direction: "asc" };
        });
    };

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const createClass = async (e: any) => {
        e.preventDefault();
        if (className == '') {
            toast.error('Please enter a class name');
            return;
        }

        try {
            const response = await fetch('/api/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ className: className, facultyId: user.id }),
            });

            const responseText = await response.json();

            if (response.ok) {
                setClassName('');
                setRefresh(!refresh);
                toast.success(responseText.message);
            } else {
                // Handle error
                console.error('Failed to submit class details');
                toast.error(responseText.message);
            }
        } catch (error) {
            console.error('Error creating class:', error);
        }
    };

    const selectClass = (index: any) => {
        setSelectedClass(classes[index].class);
        if (selectedClass === classes[index].class) {
            setSelectedClass(undefined);
        }
    };

    const deleteClass = async (index: any) => {
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
                toast.error('Failed to delete class');
            }
        } catch (error) {
            console.error('Error deleting class:', error);
        }
        setToggleDelete(null);
    };

    const updateClass = async (index: any) => {
        if (newClassName == '') {
            toast.error('Class name cannot be blank');
            return;
        }

        if (newClassDate == '') {
            toast.error('Date cannot be blank');
            return;
        }

        if (newClassQuestionnaire == null) {
            toast.error('Questionnaire status cannot be blank');
            return;
        }

        try {
            const response = await fetch(`/api/classes?cid=${classes[index].class.id}&cname=${newClassName}&cdate=${newClassDate}&qstatus=${newClassQuestionnaire}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                setRefresh(!refresh);
                toast.success('Class details updated');
            } else {
                // Handle error
                console.error('Failed to update class');
                toast.error(data.error ? data.error : 'Failed to update class');
            }
        } catch (error) {
            console.error('Error updating class:', error);
        }
        setToggleDelete(null);
    }

    const createTopic = async (e: any) => {
        e.preventDefault();

        if (classTopic == '') {
            toast.error('Please enter a topic name');
            return;
        }

        try {
            const response = await fetch('/api/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ classId: selectedClass?.id, topicName: classTopic }),
            });

            const responseText = await response.json();

            if (response.ok) {
                setClassTopic('');
                setRefresh(!refresh);
                toast.success(responseText.message);
            } else {
                // Handle error
                console.error('Failed to submit class topic');
                toast.error(responseText.message);
            }
        } catch (error) {
            console.error('Error submitting topic:', error);
        }
    };

    const deleteTopic = async (index: any) => {
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
                toast.error('Failed to delete topic');
            }
        } catch (error) {
            console.error('Error deleting topic:', error);
        }
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
                toast.error('Failed to update topic');
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
                toast.error('Failed to remove user');
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
                toast.error('Failed to unenroll user');
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

        const sortedEnrollments = [...(selectedClass?.enrollments || [])].sort((a, b) => {
            const { key, direction } = sortConfig;
            let valueA = key === "status" 
                ? (a.user.is_Faculty ? (a.user.id === selectedClass?.creatorId ? "Admin" : "Faculty") : "Student") 
                : (key in a ? (a as any)[key] : undefined);
            let valueB = key === "status" 
                ? (b.user.is_Faculty ? (b.user.id === selectedClass?.creatorId ? "Admin" : "Faculty") : "Student") 
                : (key in b ? (b as any)[key] : undefined);

            if (typeof valueA === "string") valueA = valueA.toLowerCase();
            if (typeof valueB === "string") valueB = valueB.toLowerCase();

            if (valueA < valueB) return direction === "asc" ? -1 : 1;
            if (valueA > valueB) return direction === "asc" ? 1 : -1;
            return 0;
        });

        const handleSort = (key: any) => {
            setSortConfig(prevConfig => ({
                key,
                direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc"
            }));
        };

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
                    <div className="lg:w-full w-full overflow-x-auto scrollbar-thin scrollbar-webkit px-2">
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
                                    <th className="border-0 cursor-pointer" onClick={() => handleSort("name")}>Name</th>
                                    <th className="border-0 cursor-pointer" onClick={() => handleSort("status")}>Status</th>
                                    <th className="border-0 cursor-pointer" onClick={() => handleSort("score")}>Score</th>
                                    <th className="border-0 cursor-pointer" onClick={() => handleSort("questionCount")}>Questions</th>
                                    <th className="border-0 cursor-pointer" onClick={() => handleSort("paltaQCount")}>PaltaQ</th>
                                    <th className="border-0 cursor-pointer" onClick={() => handleSort("rank")}>Rank</th>
                                    <th className="border-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedEnrollments.map((student, index) => (
                                    student.user.id !== user.id && (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <td>{student.user.name}</td>
                                                <td>
                                                    {student.user.is_Faculty
                                                        ? (student.user.id === selectedClass.creatorId ? "Admin" : "Faculty")
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

    const questionnaireStatus = () => {
        if (selectedClass) {
            const enrollments = selectedClass.enrollments as ClassEnrollment[];

            if (enrollments.length <= 1) {
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
                        <div className="px-2">
                            <h5 className="pl-3">Questionnaire Status List of {selectedClass.name}</h5>
                            <div className="flex flex-row flex-wrap gap-x-6 pl-3 pb-3">
                                <p>
                                    Pre-Completed: {enrollments.filter(e => !e.user.is_Faculty && e.preQuestionnaire?.isCompleted).length}
                                </p>
                                <p>
                                    Pre-Incomplete: {enrollments.filter(e => !e.user.is_Faculty && !e.preQuestionnaire?.isCompleted).length}
                                </p>
                                <p>
                                    Post-Completed: {enrollments.filter(e => !e.user.is_Faculty && e.postQuestionnaire?.isCompleted).length}
                                </p>
                                <p>
                                    Post-Incomplete: {enrollments.filter(e => !e.user.is_Faculty && !e.postQuestionnaire?.isCompleted).length}
                                </p>
                            </div>
                        </div>

                        <table className="table table-responsive-sm lg:mr-0 px-2">
                            <thead>
                                <tr>
                                    <th className="border-0 cursor-pointer" onClick={() => handleSort("name")}>Name</th>
                                    <th className="border-0 cursor-pointer" onClick={() => handleSort("prestatus")}>Pre-Questionnaire</th>
                                    <th className="border-0 cursor-pointer" onClick={() => handleSort("poststatus")}>Post-Questionnaire</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments
                                    .filter(e => !e.user.is_Faculty && e.user.id !== user.id)
                                    .sort((a, b) => {
                                        const direction = sortConfig.direction === "asc" ? 1 : -1;
                                        const key = sortConfig.key;

                                        if (key === "name") {
                                            return a.user.name.localeCompare(b.user.name) * direction;
                                        } else if (key === "prestatus") {
                                            return (
                                                ((a.preQuestionnaire?.isCompleted ? 1 : 0) -
                                                    (b.preQuestionnaire?.isCompleted ? 1 : 0)) * direction
                                            );
                                        } else if (key === "poststatus") {
                                            return (
                                                ((a.postQuestionnaire?.isCompleted ? 1 : 0) -
                                                    (b.postQuestionnaire?.isCompleted ? 1 : 0)) * direction
                                            );
                                        }
                                        return 0;
                                    })
                                    .map((student, index) => (
                                        <tr key={index}>
                                            <td>{student.user.name || "Unnamed"}</td>
                                            <td>
                                                {student.preQuestionnaire?.isCompleted ? (
                                                    <span className="text-green-600">Completed</span>
                                                ) : (
                                                    <span className="text-red-600">Incomplete</span>
                                                )}
                                            </td>
                                            <td>
                                                {student.postQuestionnaire?.isCompleted ? (
                                                    <span className="text-green-600">Completed</span>
                                                ) : (
                                                    <span className="text-red-600">Incomplete</span>
                                                )}
                                            </td>
                                        </tr>
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
                <div className="flex lg:flex-row flex-col mt-4 mb-4 lg:w-75 w-full px-2">
                    {/* Topic Create */}
                    <div className="lg:w-50 w-full lg:mb-0 mb-2 lg:mt-0 mt-4">

                        <h5 className="text-neutral-700 pad-l1">Set the topics in your classroom</h5>
                        <p className="pad-l1">Students will only be able to ask questions on the topics you set</p>
                        <form onSubmit={createTopic} className="flex flex-col lg:pr-20 gap-6 py-2 mb-2">
                            <div>
                                <label className="pad-l1">Topic Name</label>
                                <div className="mar-x1">
                                    <input
                                        id="classTopic"
                                        className="form-control pr-5o5 resize-none py-3 pl-3"
                                        placeholder="Create a class topic here"
                                        value={classTopic}
                                        onChange={(e) => setClassTopic(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button className="btn animate-down-2 mar-x1" type="submit">Create Topic</button>
                        </form>

                    </div>
                    {/* Topic List */}
                    <div className="border border-gray-400 rounded-lg px-2 py-4 w-full lg:h-[23.8em] h-[24em] overflow-y-auto scrollbar-thin scrollbar-webkit lg:order-last">
                        <h5 className="pad-l1">Topics of {selectedClass?.name}</h5>


                        {topics.length !== 0 && (
                            <div>
                                <p className="pad-l1">Number of topics: {topics.length}</p>
                                <table className="table table-hover table-responsive-sm">
                                    <tr>
                                        <th className="border-0" scope="col" id="className">Topic Name</th>
                                        <th className="border-0" scope="col" id="classCode">Questions</th>
                                        <th className="border-0" scope="col" id="classCode">PaltaQ</th>
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

                                            <td>
                                                {topic.paltaQBy}
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

                        {topics.length === 0 && <p className="pad-l1">No topics set yet.</p>}

                    </div>
                </div>
            )
        } else {
            return (
                <div className="">
                    <h5 className="pad-l1">Set topics for your students to ask question on</h5>
                    <p className="pad-l1">Select a class to set topics.</p>
                </div>
            )
        }
    }

    if (loading) {
        return <div className=""><h1 className="text-2xl font-bold px-2">Loading...</h1></div>;
    }

    return (
        <div className={`${nunito.className} antialiased flex flex-col`}>
            <h5 className="font-bold pad-l1">Welcome {user.name}</h5>

            {/* Create/Join/View Classrooms */}
            <div className="w-full ">
                <hr></hr>

                {/* Left Part */}
                <div className="w-full my-4">
                    <hr className="lg:hidden block"></hr>
                    <h5 className="text-neutral-700 pad-l1">Get started by creating your own class</h5>
                    <form onSubmit={createClass} className="flex flex-col lg:pr-20 px py-4 gap-4 mb-2 pad-x1">
                        <input
                            id="className"
                            className="form-control pr-5o5 resize-none py-3 pl-3"
                            placeholder="Enter your class name"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        />
                        <button className="btn animate-down-2" type="submit">Create Class</button>
                    </form>
                    <hr className="lg:hidden block"></hr>
                </div>

                {/* Right Part */}
                <div className="border border-gray-400 rounded-lg px-2 py-4 lg:w-full w-[95%] mx-auto lg:h-[28em] h-[23.5em] overflow-y-auto scrollbar-thin scrollbar-webkit">
                    <h5 className="pl-3">Classes taught by you</h5>


                    {classes.length !== 0 && (
                        <div>
                            <p className="pl-3">Number of classes: {classes.length}</p>
                            <table className="table table-hover table-responsive-sm">
                                <tr>
                                    <th className="border-0" scope="col" id="className">Class Name</th>
                                    <th className="border-0" scope="col" id="classCode">Class Code</th>
                                    <th className="border-0" scope="col" id="classCode">Semester End</th>
                                    <th className="border-0" scope="col" id="classCode">Questionnaire</th>
                                    <th className="border-0" scope="col" id="classCode">Actions</th>
                                </tr>

                                {classes.map((classItem: any, index: any) => (
                                    <tr key={index}>
                                        <td>
                                            {toggleUpdate === index ? (
                                                <input
                                                    type="text"
                                                    value={newClassName}
                                                    onChange={(e) => setNewClassName(e.target.value)}
                                                    className="form-control"
                                                />
                                            ) : (
                                                classItem.class.name
                                            )}
                                        </td>
                                        <td>
                                            {classItem.class.code}
                                        </td>
                                        <td>
                                            {toggleUpdate === index ? (
                                                <input
                                                    type="date"
                                                    value={newClassDate}
                                                    onChange={(e) => setNewClassDate(e.target.value)}
                                                    className="form-control"
                                                />
                                            ) : (
                                                classItem.class.endsAt ? (
                                                    new Date(classItem.class.endsAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                ) : (
                                                    <div className="text-rose-800">N/A</div>
                                                )
                                            )}
                                        </td>
                                        <td>
                                            {toggleUpdate === index ? (
                                                <select
                                                    value={newClassQuestionnaire.toString()}
                                                    onChange={(e) => setNewClassQuestionnaire(e.target.value === "true")}
                                                    className="form-control"
                                                >
                                                    <option value="true">Active</option>
                                                    <option value="false">Inactive</option>
                                                </select>
                                            ) : (
                                                classItem.class.questionnaire ? (
                                                    <div className="text-green-800">Active</div>
                                                ) : (
                                                    <div className="text-rose-800">Inactive</div>
                                                )
                                            )}
                                        </td>
                                        {/* Actions Tab */}
                                        <td className="">
                                            <div className="flex-col">
                                                <div className="flex lg:flex-row flex-col items-center">
                                                    <button
                                                        className="hover:text-blue-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                                        onClick={() => { selectClass(index); setRefresh(!refresh); }}>
                                                        Select
                                                    </button>
                                                    <button
                                                        className="hover:text-blue-800 transition-colors duration-500 lg:hidden block mb-2"
                                                        onClick={() => { selectClass(index); setRefresh(!refresh); }}>
                                                        Select
                                                    </button>

                                                    <p className="lg:block hidden mx-2">|</p>

                                                    {user.id === classItem.class.creatorId && (
                                                        <div>
                                                            {classItem.class.endsAt && (
                                                                <div className="flex flex-row items-center">
                                                                    <button
                                                                        className="hover:text-lime-800 transition-colors duration-500 lg:-translate-y-2 -translate-y-1"
                                                                        onClick={() => {
                                                                            setNewClassName(classItem.class.name);
                                                                            setNewClassDate(formatDate(classItem.class.endsAt));
                                                                            setNewClassQuestionnaire(classItem.class.questionnaire);
                                                                            setToggleUpdate(index);
                                                                            setToggleDelete(null);
                                                                        }}>
                                                                        Edit
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {classItem.class.code !== "0E8E5F" && (<p className="lg:block hidden mx-2">|</p>)}

                                                    {user.id === classItem.class.creatorId ? (
                                                        <div>
                                                            <div
                                                                className="hover:text-red-800 transition-colors duration-500 -translate-y-2 lg:block hidden"
                                                                onClick={() => { setToggleDelete(index); setToggleUpdate(null); }}>
                                                                Delete
                                                            </div>

                                                            <button
                                                                className="hover:text-red-800 transition-colors duration-500 lg:hidden block"
                                                                onClick={() => { setToggleDelete(index); setToggleUpdate(null); }}>
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
                                                </div>

                                                {/* Update Toggle */}
                                                {user.id == classItem.class.creatorId && (
                                                    <div>
                                                        {toggleUpdate === index && (
                                                            <div>
                                                                <td className="w-full flex gap-x-4">
                                                                    <button
                                                                        className="hover:text-red-800 transition-colors duration-500"
                                                                        onClick={() => {
                                                                            setToggleUpdate(null);
                                                                            updateClass(index);
                                                                        }}>
                                                                        Confirm
                                                                    </button>
                                                                    <button
                                                                        className="hover:text-red-800 transition-colors duration-500"
                                                                        onClick={() => setToggleUpdate(null)}>
                                                                        Cancel
                                                                    </button>
                                                                </td>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Delete Toggle */}
                                                {user.id !== classItem.class.creatorId ? (
                                                    <div>
                                                        {toggleDelete === index && (
                                                            <td className="w-full flex gap-x-4">
                                                                <button
                                                                    className="hover:text-red-800 transition-colors duration-500"
                                                                    onClick={() => { unenroll(index); setToggleDelete(null) }}>
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
                                                                    onClick={() => { deleteClass(index); setToggleDelete(null) }}>
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
                                            </div>

                                        </td>

                                    </tr>
                                ))}
                            </table>
                        </div>
                    )}

                    {classes.length === 0 && <p className="lg:pl-4 pl-3">No classes created yet.</p>}
                </div>

            </div>

            {/* Classroom Title */}
            <div>
                <hr className="border-b border-gray-400"></hr>

                <div className="flex flex-row justify-between">
                    <div>
                        <h4 className="text-sky-800 pl-5 lg:pl-2">{selectedClass?.name} Classroom</h4>
                        {!selectedClass && (
                            <p className="lg:pl-2 pl-5 my-0">{"Please select a class from the table above"}</p>
                        )}
                    </div>
                    {selectedClass && (
                        <div>
                            <button onClick={handleCollapse} className="animate-down-2 font-bold mt-2 mr-4 h-fit lg:block hidden">
                                Deselect
                                <FontAwesomeIcon className="px-2" icon={faCircleChevronUp} />
                            </button>
                            <button onClick={handleCollapse} className="lg:hidden block text-xl mr-[1em]">
                                <FontAwesomeIcon icon={faCircleChevronUp} />
                            </button>
                        </div>
                    )}
                </div>
                <hr className="border-b border-gray-400"></hr>
            </div>

            {selectedClass ? (
                <div>
                    {/* Display Topics */}
                    <div className="mb-4 w-full">
                        {displayTopics()}
                    </div>

                    <hr className="lg:block hidden"></hr>

                    {/* Display Questionnaire Status */}
                    <div className="border border-gray-400 rounded-lg py-4 mb-5 w-full">
                        {questionnaireStatus()}
                    </div>

                    <hr className="lg:block hidden"></hr>

                    {/* Display Students */}
                    <div className="border border-gray-400 rounded-lg py-4 mt-5 mb-5 w-full">
                        {displayStudents()}
                    </div>
                </div>
            ) : <div className="my-4"></div>}

        </div>
    );
}