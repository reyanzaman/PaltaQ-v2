/* eslint-disable react/no-unescaped-entities */
"use client";

import { nunito } from "@/app/ui/fonts";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronDown } from "@fortawesome/free-solid-svg-icons";

interface User {
    id: string;
    name: string;
    image: string;
    email: String;
    is_Admin: boolean;
    is_Faculty: boolean;
    createdAt: string;
    updatedAt: string;
    userDetails: UserDetails;
}

interface UserDetails {
    userId: string;
    score: number;
    rank: string;
    questionsAsked: number;
    paltaQAsked: number;
    successfulReports: number;
}

interface Class {
    id: string;
    name: string;
    code: string;
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
}

export default function FacultyClass({ user }: { user: User }) {

    const [classes, setClasses] = useState<ClassFaculty[]>([]);
    const [selectedClass, setSelectedClass] = useState<Class>();
    const [className, setClassName] = useState('' as string);
    const [classCode, setClassCode] = useState('' as string);
    const [loading, setLoading] = useState(false);

    const [refresh, setRefresh] = useState(false);

    const [toggleDelete, setToggleDelete] = useState(null as any);
    const [toggleRemove, setToggleRemove] = useState(null as any);

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

        fetchClasses();
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
            console.error('Error fetching questions:', error);
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

    const handleCollapse = () => {
        setSelectedClass(undefined);
    };

    const displayStudents = () => {
        if (selectedClass) {
            if (selectedClass.enrollments.length <= 1) {
                return (
                    <div>
                        <div className="flex flex-row justify-between">
                            <div>
                                <h5 className="pl-3">Student list of {selectedClass.name}</h5>
                                <p className="lg:pb-3 pb-1 pl-3">Users Enrolled: {selectedClass.enrollments.length - 1}</p>
                            </div>
                            <div>
                                <button onClick={handleCollapse} className="animate-down-2 font-bold mt-2 mr-4 h-fit lg:block hidden">
                                    Collapse
                                    <FontAwesomeIcon className="px-2" icon={faCircleChevronDown} />
                                </button>
                                <button onClick={handleCollapse} className="lg:hidden block text-xl mr-[1.7em]">
                                    <FontAwesomeIcon icon={faCircleChevronDown} />
                                </button>
                            </div>
                        </div>
                        <p className="lg:ml-4 ml-3">No students enrolled yet.</p>
                    </div>
                )
            } else {
                return (
                    <div className="lg:w-full w-[85vw] overflow-x-auto scrollbar-thin scrollbar-webkit">
                        <div className="flex flex-row justify-between">
                            <div>
                                <h5 className="pl-3">Enrollment List of {selectedClass.name}</h5>
                                <p className="lg:pb-3 pb-1 pl-3">Students Enrolled: {selectedClass.enrollments.length - 1}</p>
                            </div>
                            <div>
                                <button onClick={handleCollapse} className="animate-down-2 font-bold mt-2 mr-4 h-fit lg:block hidden">
                                    Collapse
                                    <FontAwesomeIcon className="px-2" icon={faCircleChevronDown} />
                                </button>
                                <button onClick={handleCollapse} className="lg:hidden block text-xl mr-[0.5em]">
                                    <FontAwesomeIcon icon={faCircleChevronDown} />
                                </button>
                            </div>
                        </div>

                        <table className="table lg:mr-0 pr-4">
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
                                                <td>{student.user.is_Faculty ? "Faculty" : "Student"}</td>
                                                <td>{student.user.userDetails ? student.user.userDetails.score : 0}</td>
                                                <td>{student.user.userDetails ? student.user.userDetails.questionsAsked : 0}</td>
                                                <td>{student.user.userDetails ? student.user.userDetails.paltaQAsked : 0}</td>
                                                <td>{student.user.userDetails ? student.user.userDetails.rank : 'Novice'}</td>
                                                <td>
                                                    <div className="hover:text-red-800 transition-colors duration-500" onClick={() => setToggleRemove(index)}>Remove</div>
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
            return <p className="lg:pl-4 pl-2">Select a class to view enrolled students.</p>;
        }
    };

    if (loading) {
        return <div className=""><h1 className="text-2xl font-bold">Loading...</h1></div>;
    }

    return (
        <div className={`${nunito.className} antialiased flex flex-col`}>
            <h5 className="font-bold">Welcome {user.name}</h5>

            <div className="flex lg:flex-row flex-col my-4 lg:w-75 w-full ">

                <div className="border border-gray-400 rounded-lg px-2 py-4 w-full lg:h-[23.8em] h-[24em] overflow-y-auto scrollbar-thin scrollbar-webkit lg:order-first order-last">
                    <h5 className="pl-3">Classes taught by you</h5>


                    {classes.length !== 0 && (
                        <div>
                            <p className="pl-3">Number of classes: {classes.length}</p>
                            <table className="table table-hover">
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
                                                onClick={() => selectClass(index)}>
                                                View
                                            </button>
                                            <button
                                                className="hover:text-blue-800 transition-colors duration-500 lg:hidden block mb-2"
                                                onClick={() => selectClass(index)}>
                                                View
                                            </button>

                                            <p className="lg:block hidden mx-3">|</p>

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

                                        </td>
                                        {toggleDelete === index && (
                                        <td className="w-full flex gap-x-4">
                                            <button
                                            className="hover:text-red-800 transition-colors duration-500"
                                            onClick={() => deleteClass(index)}>
                                                Confirm
                                            </button>
                                            <button
                                            className="hover:text-red-800 transition-colors duration-500"
                                            onClick={() => setToggleDelete(null)}>
                                                Cancel
                                            </button>
                                        </td>
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

            <div className="border border-gray-400 rounded-lg px-2 py-4 mb-5 w-full">
                {displayStudents()}
            </div>
        </div>
    );
}