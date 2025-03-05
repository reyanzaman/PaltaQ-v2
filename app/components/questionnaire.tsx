"use client"

import { nunito } from "@/app/ui/fonts";
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';

//@ts-ignore
export default function QuestionnaireForm() {

    const [userId, setUserId] = useState('');
    const [classId, setClassId] = useState('');
    const [className, setClassName] = useState('');
    const [type, setType] = useState('');

    const searchParams = useSearchParams();

    useEffect(() => {
        setUserId(searchParams.get('id') || '');
        setClassId(searchParams.get('ceid') || '');
        setClassName(searchParams.get('cname') || '');
        setType(searchParams.get('type') || '');
    }, [searchParams]);

    const [studentId, setstudentId] = useState("");
    // Demographics
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [schoolLocation, setSchoolLocation] = useState("");
    const [maritalStatus, setMaritalStatus] = useState("");
    // Academic
    const [studyMotivation, setStudyMotivation] = useState("");
    const [studyCuriosity, setStudyCuriosity] = useState("");
    const [questionsAsked, setQuestionsAsked] = useState("");
    const [questionExample, setQuestionExample] = useState("");
    const [subjectILike, setSubjectILike] = useState("");
    const [dontEnjoyStudying, setDontEnjoyStudying] = useState("");
    const [cgpa, setCGPA] = useState("");
    const [extraCurricular, setExtraCurricular] = useState("");
    const [studyTime, setStudyTime] = useState("");
    const [leisureTime, setLeisureTime] = useState("");
    // Curiosity
    const [questionArises, setQuestionArises] = useState("");
    const [courageToAsk, setCourageToAsk] = useState("");
    const [curiousToKnow, setCuriousToKnow] = useState("");
    const [whyChildrenAskQuestions, setWhyChildrenAskQuestions] = useState("");
    // Motivation
    const [desireToLearn, setDesireToLearn] = useState("");
    const [askTeachers, setAskTeachers] = useState("");
    const [askPeer, setAskPeer] = useState("");
    const [askMyself, setAskMyself] = useState("");
    const [askGPT, setAskGPT] = useState("");
    const [askResearch, setAskResearch] = useState("");
    const [askAvoid, setAskAvoid] = useState("");
    const [motivatedToAsk, setMotivatedToAsk] = useState("");
    // Engagement
    const [multQuesAskStudents, setMultQuesAskStudents] = useState("");
    const [multQuesAskGroup, setMultQuesAskGroup] = useState("");
    const [multQuesAskMyself, setMultQuesAskMyself] = useState("");
    const [multQuesAvoid, setMultQuesAvoid] = useState("");
    const [multQuesResearch, setMultQuesResearch] = useState("");
    const [multQuesMemorize, setMultQuesMemorize] = useState("");
    // Confidence
    const [quesHelpsUnderstand, setQuesHelpsUnderstand] = useState("");
    const [easierToMemorize, setEasierToMemorize] = useState("");
    const [opinionAskingQues, setOpinionAskingQues] = useState("");
    const [opinionMemorizing, setOpinionMemorizing] = useState("");
    const [opinionPracticing, setOpinionPracticing] = useState("");
    // Opinion about PaltaQ
    const [interestPaltaQ, setInterestPaltaQ] = useState("");
    const [suggestionsPaltaQ, setSuggestionsPaltaQ] = useState("");

    const [terms, setTerms] = useState(false);

    const handleChange = (setter: any) => (value: any) => {
        setter(value);
    };

    const handleSubmit = async (e: any) => {
        try {
            // Validation
            e.preventDefault();
            if (studentId.length < 4) {
                toast.error("Please enter a valid university ID.");
                return;
            }
            if (type == 'pre') {
                if (studentId === "") {
                    toast.error("Please fill in all the fields.");
                    return;
                }
            } else {
                if (studentId === "") {
                    toast.error("Please fill in all the fields.");
                    return;
                }
            }
            if (terms === false) {
                toast.error("Please agree to the terms to proceed.");
                return;
            }

            let response;
            if (type == 'pre') {
                response = await fetch(`/api/questionnaire/default?type=pre&uid=${userId}&ceid=${classId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ univID: studentId, }),
                });
            } else {
                response = await fetch(`/api/questionnaire/default?type=post&uid=${userId}&ceid=${classId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ univID: studentId, }),
                });
            }

            const data = await response?.json();

            if (data.error) {
                toast.error(data.error);
                return;
            }

            // console.log({ univID, section, age, gender, curiosity, smallQues, nowQues, enjoyStudies, confidence, motivation, terms });

            toast.success("Submitted");

            setTimeout(() => {
                window.location.href = "/pages/questions";
            }, 2000);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={`${nunito.className} antialiased flex flex-col`}>

            <div>
                <h1>PaltaQ {type == 'pre' ? 'Pre-Questionnaire' : 'Post-Questionnaire'}</h1>
                <h5><b>Classroom: </b>{className}</h5>
                <hr className="border-b-2 border-gray-500"></hr>

                <p className="text-justify w-[90%]">The purpose of this form is only to review your personal attitude towards asking questions. The answers in this form will never have any affect on the grade of your course. The answers will only be used as part of research on questioning habits. If you agree, please take a few minutes to answer all the questions honestly. The form has 3 sections, please take your time to answer the questions in each section.</p>

                <p>Please be honest in your response as this data will be used for research.</p>

                <hr className="border-b-2 mb-2 border-gray-500"></hr>
            </div>

            <form onSubmit={handleSubmit} className="w-[95%] lg:w-[60%]">

                {/* Student ID */}
                <div className="form-group mt-2 pb-2">
                    <label className="text-xl font-bold pt-1 mb-0" htmlFor="text">Your university&apos;s student id</label>
                    <small id="studentId" className="form-text text-muted my-0 pb-2">We&apos;ll never share your ID with anyone else.</small>
                    <input
                        type="text"
                        className="form-control"
                        id="studentId"
                        aria-describedby="studentId"
                        value={studentId}
                        placeholder="Enter your student id here . . ."
                        onChange={(event) => setstudentId(event.target.value)} />
                </div>

                {/* Section 1 */}
                {/* Demographics */}
                <hr className="border-b-2 border-gray-500 w-full"></hr>

                {type == 'pre' ? (
                    <div>
                        <h5 className="font-bold text-cyan-800">Section 1: Demographics</h5>
                        <h5 className="text-cyan-800 text-base">This section helps understand your background.</h5>
                    </div>
                ) : (
                    <div>
                        <h5 className="font-bold text-cyan-800">Section 1: Feedback on PaltaQ</h5>
                        <h5 className="text-cyan-800 text-base">This section helps improve PaltaQ.</h5>
                    </div>
                )}

                <hr className="border-b-2 border-gray-500 w-full"></hr>

                {type == 'pre' ? (
                    <div>
                        {/* Age */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl py-2 font-bold">What is your Age? Please indicate your age range by selecting the appropriate range below.</legend><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadiosAge"
                                    id="RadiosAge1"
                                    value="10 - 12 years old"
                                    checked={age === "10 - 12 years old"}
                                    onChange={(event) => setAge(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosAge1">
                                    10 - 12 years old
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadiosAge"
                                    id="RadiosAge2"
                                    value="13 - 15 years old"
                                    checked={age === "13 - 15 years old"}
                                    onChange={(event) => setAge(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosAge2">
                                    13 - 15 years old
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadiosAge"
                                    id="RadiosAge3"
                                    value="16 - 18 years old"
                                    checked={age === "16 - 18 years old"}
                                    onChange={(event) => setAge(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosAge3">
                                    16 - 18 years old
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadiosAge"
                                    id="RadiosAge4"
                                    value="19 - 21 years old"
                                    checked={age === "19 - 21 years old"}
                                    onChange={(event) => setAge(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosAge4">
                                    19 - 21 years sold
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadiosAge"
                                    id="RadiosAge5"
                                    value="22 - 24 years old"
                                    checked={age === "22 - 24 years old"}
                                    onChange={(event) => setAge(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosAge5">
                                    22 - 24 years old
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadiosAge"
                                    id="RadiosAge6"
                                    value="25 - 27 years old"
                                    checked={age === "25 - 27 years old"}
                                    onChange={(event) => setAge(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosAge6">
                                    25 - 27 years old
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadiosAge"
                                    id="RadiosAge7"
                                    value="28 - 30 years old"
                                    checked={age === "28 - 30 years old"}
                                    onChange={(event) => setAge(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosAge7">
                                    28 - 30 years old
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadiosAge"
                                    id="RadiosAge8"
                                    value="31 - 33 years old"
                                    checked={age === "31 - 33 years old"}
                                    onChange={(event) => setAge(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosAge8">
                                    31 - 33 years old
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadiosAge"
                                    id="RadiosAge9"
                                    value="More than 34 years old"
                                    checked={age === "More than 34 years old"}
                                    onChange={(event) => setAge(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosAge9">
                                    More than 34 years old
                                </label>
                            </div>
                        </fieldset>

                        {/* Gender */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pb-1 font-bold">Your Gender</legend>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="RadioSex1" id="RadiosSex1" value="Male" checked={gender === 'Male'} onChange={(event) => setGender(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosSex1">
                                    Male
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="RadioSex2" id="RadiosSex2" value="Female" checked={gender === 'Female'} onChange={(event) => setGender(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosSex2">
                                    Female
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="RadioSex3" id="RadiosSex3" value="Prefer not to say" checked={gender === 'Prefer not to say'} onChange={(event) => setGender(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadiosSex3">
                                    Prefer not to say
                                </label>
                            </div>
                        </fieldset>

                        {/* School Location */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pb-1 font-bold">Where was the school that you attended?</legend>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioSchool1" id="radioSchool1" value="In Dhaka" checked={schoolLocation === 'In Dhaka'} onChange={(event) => setSchoolLocation(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioSchool1">
                                    In Dhaka
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioSchool2" id="radioSchool2" value="Outside Dhaka" checked={schoolLocation === 'Outside Dhaka'} onChange={(event) => setSchoolLocation(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioSchool2">
                                    Outside Dhaka
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioSchool3" id="radioSchool3" value="Abroad - Outside Bangladesh" checked={schoolLocation === 'Abroad - Outside Bangladesh'} onChange={(event) => setSchoolLocation(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioSchool3">
                                    Abroad - Outside Bangladesh
                                </label>
                            </div>
                        </fieldset>

                        {/* Marital Status */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pb-1 font-bold">What is your marital status?</legend>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioMarital1" id="radioMarital1" value="Married" checked={maritalStatus === 'Married'} onChange={(event) => setMaritalStatus(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioMarital1">
                                    Married
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioMarital2" id="radioMarital2" value="Unmarried" checked={maritalStatus === 'Unmarried'} onChange={(event) => setMaritalStatus(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioMarital2">
                                    Unmarried
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioMarital3" id="radioMarital3" value="Divorced" checked={maritalStatus === 'Divorced'} onChange={(event) => setMaritalStatus(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioMarital3">
                                    Divorced
                                </label>
                            </div>
                        </fieldset>

                    </div>
                ) : (
                    <div>
                        {/* Interest in PaltaQ */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pt-2 font-bold">Did you find PaltaQ interesting?</legend><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="radioInterestPaltaQ1"
                                    id="radioInterestPaltaQ1"
                                    value="Not at all"
                                    checked={interestPaltaQ === "Not at all"}
                                    onChange={(event) => setInterestPaltaQ(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioInterestPaltaQ1">
                                    Not at all
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="radioInterestPaltaQ2"
                                    id="radioInterestPaltaQ2"
                                    value="No"
                                    checked={interestPaltaQ === "No"}
                                    onChange={(event) => setInterestPaltaQ(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioInterestPaltaQ2">
                                    No
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="radioInterestPaltaQ3"
                                    id="radioInterestPaltaQ3"
                                    value="Somewhat"
                                    checked={interestPaltaQ === "Somewhat"}
                                    onChange={(event) => setInterestPaltaQ(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioInterestPaltaQ3">
                                    Somewhat
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="radioInterestPaltaQ4"
                                    id="radioInterestPaltaQ4"
                                    value="Yes"
                                    checked={interestPaltaQ === "Yes"}
                                    onChange={(event) => setInterestPaltaQ(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioInterestPaltaQ4">
                                    Yes
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="radioInterestPaltaQ5"
                                    id="radioInterestPaltaQ5"
                                    value="Very Much"
                                    checked={interestPaltaQ === "Very Much"}
                                    onChange={(event) => setInterestPaltaQ(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioInterestPaltaQ5">
                                    Very Much
                                </label>
                            </div>
                        </fieldset>

                        {/* Suggestions for PaltaQ */}
                        <div className="form-group mt-2 pb-2">
                            <label className="text-xl font-bold pt-1 mb-3" htmlFor="text">Leave a comment about PaltaQ. Suggest us how we can improve the app or share your experience using the app.</label>
                            <input
                                type="text"
                                className="form-control"
                                id="suggestionPaltaQ"
                                aria-describedby="suggestionPaltaQ"
                                value={suggestionsPaltaQ}
                                placeholder="Type your comment here . . ."
                                onChange={(event) => setSuggestionsPaltaQ(event.target.value)} />
                        </div>

                    </div>
                )}

                {/* Section 2 */}
                {/* Academic Performance */}
                <hr className="border-b-2 border-gray-500 w-full"></hr>
                <h5 className="font-bold text-cyan-800">Section 2: Academic Performance</h5>
                <h5 className="text-cyan-800 text-base">This section asks about your attitude towards studies</h5>
                <hr className="border-b-2 border-gray-500 w-full"></hr>

                <div>
                    <div>
                        {/* Study Motivation */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                                <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;I like to study&quot;</legend>
                            </legend><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioStudyMotivation1"
                                    id="RadioStudyMotivation1"
                                    value="Strongly Disagree"
                                    checked={studyMotivation === "Strongly Disagree"}
                                    onChange={(event) => setStudyMotivation(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioStudyMotivation1">
                                    Strongly Disagree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioStudyMotivation2"
                                    id="RadioStudyMotivation2"
                                    value="Disagree"
                                    checked={studyMotivation === "Disagree"}
                                    onChange={(event) => setStudyMotivation(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioStudyMotivation2">
                                    Disagree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioStudyMotivation3"
                                    id="RadioStudyMotivation3"
                                    value="Neutral"
                                    checked={studyMotivation === "Neutral"}
                                    onChange={(event) => setStudyMotivation(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioStudyMotivation3">
                                    Neutral
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioStudyMotivation4"
                                    id="RadioStudyMotivation4"
                                    value="Agree"
                                    checked={studyMotivation === "Agree"}
                                    onChange={(event) => setStudyMotivation(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioStudyMotivation4">
                                    Agree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioStudyMotivation5"
                                    id="RadioStudyMotivation5"
                                    value="Strongly Agree"
                                    checked={studyMotivation === "Strongly Agree"}
                                    onChange={(event) => setStudyMotivation(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioStudyMotivation5">
                                    Strongly Agree
                                </label>
                            </div>
                        </fieldset>

                        {/* Study Curiosity */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                                <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;I am curious about everything - I like to ask questions&quot;</legend>
                            </legend><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCuriosity1"
                                    id="RadioCuriosity1"
                                    value="Strongly Disagree"
                                    checked={studyCuriosity === "Strongly Disagree"}
                                    onChange={(event) => setStudyCuriosity(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriosity1">
                                    Strongly Disagree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCuriosity2"
                                    id="RadioCuriosity2"
                                    value="Disagree"
                                    checked={studyCuriosity === "Disagree"}
                                    onChange={(event) => setStudyCuriosity(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriosity2">
                                    Disagree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCuriosity3"
                                    id="RadioCuriosity3"
                                    value="Neutral"
                                    checked={studyCuriosity === "Neutral"}
                                    onChange={(event) => setStudyCuriosity(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriosity3">
                                    Neutral
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCuriosity4"
                                    id="RadioCuriosity4"
                                    value="Agree"
                                    checked={studyCuriosity === "Agree"}
                                    onChange={(event) => setStudyCuriosity(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriosity4">
                                    Agree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCuriosity5"
                                    id="RadioCuriosity5"
                                    value="Strongly Agree"
                                    checked={studyCuriosity === "Strongly Agree"}
                                    onChange={(event) => setStudyCuriosity(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriosity5">
                                    Strongly Agree
                                </label>
                            </div>
                        </fieldset>

                        {/* Questions Asked */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pt-2 font-bold">Can you estimate the number of questions you asked yourself yesterday, all day?</legend><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioQuestionsAsked1"
                                    id="RadioQuestionsAsked1"
                                    value="5 questions or less"
                                    checked={questionsAsked === "5 questions or less"}
                                    onChange={(event) => setQuestionsAsked(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionsAsked1">
                                    5 questions or less
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioQuestionsAsked2"
                                    id="RadioQuestionsAsked2"
                                    value="6 to 10 questions"
                                    checked={questionsAsked === "6 to 10 questions"}
                                    onChange={(event) => setQuestionsAsked(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionsAsked2">
                                    6 to 10 questions
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioQuestionsAsked3"
                                    id="RadioQuestionsAsked3"
                                    value="11 to 20 questions"
                                    checked={questionsAsked === "11 to 20 questions"}
                                    onChange={(event) => setQuestionsAsked(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionsAsked3">
                                    11 to 20 questions
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioQuestionsAsked4"
                                    id="RadioQuestionsAsked4"
                                    value="21 to 30 questions"
                                    checked={questionsAsked === "21 to 30 questions"}
                                    onChange={(event) => setQuestionsAsked(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionsAsked4">
                                    21 to 30 questions
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioQuestionsAsked5"
                                    id="RadioQuestionsAsked5"
                                    value="31 to 50 questions"
                                    checked={questionsAsked === "31 to 50 questions"}
                                    onChange={(event) => setQuestionsAsked(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionsAsked5">
                                    31 to 50 questions
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioQuestionsAsked6"
                                    id="RadioQuestionsAsked6"
                                    value="More than 51 questions"
                                    checked={questionsAsked === "More than 51 questions"}
                                    onChange={(event) => setQuestionsAsked(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionsAsked6">
                                    More than 51 questions
                                </label>
                            </div>
                        </fieldset>

                        {/* Question Example */}
                        <div className="form-group mt-2 pb-2">
                            <label className="text-base md:text-xl font-bold pt-1 mb-0" htmlFor="text">Can you give an example of a curiosity question that you asked yourself yesterday?</label>
                            <small id="questionExample" className="form-text text-muted my-0 pb-3 pt-1 text-base">If you did not ask yourself any curiosity question, please write "No questions"</small>
                            <input
                                type="text"
                                className="form-control"
                                id="questionExample"
                                aria-describedby="questionExample"
                                value={questionExample}
                                placeholder="Type your question here . . ."
                                onChange={(event) => setQuestionExample(event.target.value)} />
                        </div>

                        {/* Subject I Like */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                                <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;I have a subject that I like studying very much&quot;</legend>
                            </legend><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioSubjectILike1"
                                    id="RadioSubjectILike1"
                                    value="Strongly Disagree"
                                    checked={subjectILike === "Strongly Disagree"}
                                    onChange={(event) => setSubjectILike(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioSubjectILike1">
                                    Strongly Disagree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioSubjectILike2"
                                    id="RadioSubjectILike2"
                                    value="Disagree"
                                    checked={subjectILike === "Disagree"}
                                    onChange={(event) => setSubjectILike(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioSubjectILike2">
                                    Disagree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioSubjectILike3"
                                    id="RadioSubjectILike3"
                                    value="Neutral"
                                    checked={subjectILike === "Neutral"}
                                    onChange={(event) => setSubjectILike(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioSubjectILike3">
                                    Neutral
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioSubjectILike4"
                                    id="RadioSubjectILike4"
                                    value="Agree"
                                    checked={subjectILike === "Agree"}
                                    onChange={(event) => setSubjectILike(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioSubjectILike4">
                                    Agree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioSubjectILike5"
                                    id="RadioSubjectILike5"
                                    value="Strongly Agree"
                                    checked={subjectILike === "Strongly Agree"}
                                    onChange={(event) => setSubjectILike(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioSubjectILike5">
                                    Strongly Agree
                                </label>
                            </div>
                        </fieldset>

                        {/* I Dont Enjoy Studying at the University */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                                <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;I don't enjoy studying subjects at the university&quot;</legend>
                            </legend><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioDontEnjoyStudying1"
                                    id="RadioDontEnjoyStudying1"
                                    value="Strongly Disagree"
                                    checked={dontEnjoyStudying === "Strongly Disagree"}
                                    onChange={(event) => setDontEnjoyStudying(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioDontEnjoyStudying1">
                                    Strongly Disagree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioDontEnjoyStudying2"
                                    id="RadioDontEnjoyStudying2"
                                    value="Disagree"
                                    checked={dontEnjoyStudying === "Disagree"}
                                    onChange={(event) => setDontEnjoyStudying(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioDontEnjoyStudying2">
                                    Disagree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioDontEnjoyStudying3"
                                    id="RadioDontEnjoyStudying3"
                                    value="Neutral"
                                    checked={dontEnjoyStudying === "Neutral"}
                                    onChange={(event) => setDontEnjoyStudying(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioDontEnjoyStudying3">
                                    Neutral
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioDontEnjoyStudying4"
                                    id="RadioDontEnjoyStudying4"
                                    value="Agree"
                                    checked={dontEnjoyStudying === "Agree"}
                                    onChange={(event) => setDontEnjoyStudying(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioDontEnjoyStudying4">
                                    Agree
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioDontEnjoyStudying5"
                                    id="RadioDontEnjoyStudying5"
                                    value="Strongly Agree"
                                    checked={dontEnjoyStudying === "Strongly Agree"}
                                    onChange={(event) => setDontEnjoyStudying(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioDontEnjoyStudying5">
                                    Strongly Agree
                                </label>
                            </div>
                        </fieldset>

                        {/* CGPA */}
                        <fieldset className="my-4 pb-2">
                            {type == 'pre' ? (
                                <legend className="text-base md:text-xl pt-2 font-bold">Please select the range of your current CGPA:</legend>
                            ) : (
                                <legend className="text-base md:text-xl pt-2 font-bold">Please select the range of your expected CGPA in the upcoming semester:</legend>
                            )}
                            <div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCGPA1"
                                    id="RadioCGPA1"
                                    value="0 to 0.9"
                                    checked={cgpa === "0 to 0.9"}
                                    onChange={(event) => setCGPA(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCGPA1">
                                    0 to 0.9
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCGPA2"
                                    id="RadioCGPA2"
                                    value="1 to 1.9"
                                    checked={cgpa === "1 to 1.9"}
                                    onChange={(event) => setCGPA(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCGPA2">
                                    1 to 1.9
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCGPA3"
                                    id="RadioCGPA3"
                                    value="2 to 2.49"
                                    checked={cgpa === "2 to 2.49"}
                                    onChange={(event) => setCGPA(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCGPA3">
                                    2 to 2.49
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCGPA4"
                                    id="RadioCGPA4"
                                    value="2.5 to 2.99"
                                    checked={cgpa === "2.5 to 2.99"}
                                    onChange={(event) => setCGPA(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCGPA4">
                                    2.5 to 2.99
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCGPA5"
                                    id="RadioCGPA5"
                                    value="3 to 3.49"
                                    checked={cgpa === "3 to 3.49"}
                                    onChange={(event) => setCGPA(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCGPA5">
                                    3 to 3.49
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioCGPA5"
                                    id="RadioCGPA5"
                                    value="3.5 to 4"
                                    checked={cgpa === "3.5 to 4"}
                                    onChange={(event) => setCGPA(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioCGPA5">
                                    3.5 to 4
                                </label>
                            </div>
                        </fieldset>

                        {/* ExtraCurricular Activities */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pt-2 font-bold">Do you participate in any extracurricular academic activities (e.g., math club, debate team)?</legend><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioECA1"
                                    id="RadioECA1"
                                    value="No"
                                    checked={extraCurricular === "No"}
                                    onChange={(event) => setExtraCurricular(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioECA1">
                                    No
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioECA2"
                                    id="RadioECA2"
                                    value="I would like to"
                                    checked={extraCurricular === "I would like to"}
                                    onChange={(event) => setExtraCurricular(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioECA2">
                                    I would like to
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioECA3"
                                    id="RadioECA3"
                                    value="I dont get the time"
                                    checked={extraCurricular === "I dont get the time"}
                                    onChange={(event) => setExtraCurricular(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioECA3">
                                    I don&apos;t get the time
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioECA4"
                                    id="RadioECA4"
                                    value="I participated in other activities outside the university"
                                    checked={extraCurricular === "I participated in other activities outside the university"}
                                    onChange={(event) => setExtraCurricular(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioECA4">
                                    I participated in other activities outside the university
                                </label>
                            </div><div className="form-check py-1 w-fit">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="RadioECA5"
                                    id="RadioECA5"
                                    value="I was not aware that the university has clubs"
                                    checked={extraCurricular === "I was not aware that the university has clubs"}
                                    onChange={(event) => setExtraCurricular(event.target.value)}
                                />
                                <label className="form-check-label text-lg pl-4" htmlFor="RadioECA5">
                                    I was not aware that the university has clubs
                                </label>
                            </div>
                        </fieldset>

                        {/* Study Time */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pb-1 font-bold">On average, on a daily basis, how much time do you spend studying?</legend>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioStudyTime1" id="radioStudyTime1" value="Less than 30 mins" checked={studyTime === 'Less than 30 mins'} onChange={(event) => setStudyTime(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioStudyTime1">
                                    Less than 30 mins
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioStudyTime2" id="radioStudyTime2" value="Between 31 mins to 1 hour" checked={studyTime === 'Between 31 mins to 1 hour'} onChange={(event) => setStudyTime(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioStudyTime2">
                                    Between 31 mins to 1 hour
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioStudyTime3" id="radioStudyTime3" value="More than 1 hour" checked={studyTime === 'More than 1 hour'} onChange={(event) => setStudyTime(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioStudyTime3">
                                    More than 1 hour
                                </label>
                            </div>
                        </fieldset>

                        {/* Leisure Time */}
                        <fieldset className="my-4 pb-2">
                            <legend className="text-base md:text-xl pb-1 font-bold">On average, on a daily basis, how much total time do you spend on Facebook, mobile, youtube, etc?</legend>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioLeisureTime1" id="radioLeisureTime1" value="Less than 30 mins" checked={leisureTime === 'Less than 30 mins'} onChange={(event) => setLeisureTime(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioLeisureTime1">
                                    Less than 30 mins
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioLeisureTime2" id="radioLeisureTime2" value="Between 31 mins to 1 hour" checked={leisureTime === 'Between 31 mins to 1 hour'} onChange={(event) => setLeisureTime(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioLeisureTime2">
                                    Between 31 mins to 1 hour
                                </label>
                            </div>
                            <div className="form-check py-1 w-fit">
                                <input className="form-check-input" type="radio" name="radioLeisureTime3" id="radioLeisureTime3" value="More than 1 hour" checked={leisureTime === 'More than 1 hour'} onChange={(event) => setLeisureTime(event.target.value)} />
                                <label className="form-check-label text-lg pl-4" htmlFor="radioLeisureTime3">
                                    More than 1 hour
                                </label>
                            </div>
                        </fieldset>

                    </div>
                </div>

                {/* Section 3 */}
                {/* Academic Performance */}
                <hr className="border-b-2 border-gray-500 w-full"></hr>
                <h5 className="font-bold text-cyan-800">Section 3: Attitude Towards Studies</h5>
                <h5 className="text-cyan-800 text-base">This section looks at some of your attitudes towards studies</h5>
                <hr className="border-b-2 border-gray-500 w-full"></hr>

                <div>
                    <h5 className="font-bold pt-2">Curiosity</h5>
                    <h5 className="text-base">This section asks about how curious you are in the topic being taught</h5>

                    {/* Question Arises */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                            <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;When a teacher teaches, questions arise in my head.&quot;</legend>
                        </legend><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioQuestionArises1"
                                id="RadioQuestionArises1"
                                value="Strongly Disagree"
                                checked={questionArises === "Strongly Disagree"}
                                onChange={(event) => setQuestionArises(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionArises1">
                                Strongly Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioQuestionArises2"
                                id="RadioQuestionArises2"
                                value="Disagree"
                                checked={questionArises === "Disagree"}
                                onChange={(event) => setQuestionArises(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionArises2">
                                Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioQuestionArises3"
                                id="RadioQuestionArises3"
                                value="Neutral"
                                checked={questionArises === "Neutral"}
                                onChange={(event) => setQuestionArises(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionArises3">
                                Neutral
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioQuestionArises4"
                                id="RadioQuestionArises4"
                                value="Agree"
                                checked={questionArises === "Agree"}
                                onChange={(event) => setQuestionArises(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionArises4">
                                Agree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioQuestionArises5"
                                id="RadioQuestionArises5"
                                value="Strongly Agree"
                                checked={questionArises === "Strongly Agree"}
                                onChange={(event) => setQuestionArises(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioQuestionArises5">
                                Strongly Agree
                            </label>
                        </div>
                    </fieldset>

                    {/* Courage To Ask Questions */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                            <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;If a question arises in my head, I have the courage to ask the teacher the question.&quot;</legend>
                        </legend><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCourageToAsk1"
                                id="RadioCourageToAsk1"
                                value="Strongly Disagree"
                                checked={courageToAsk === "Strongly Disagree"}
                                onChange={(event) => setCourageToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCourageToAsk1">
                                Strongly Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCourageToAsk2"
                                id="RadioCourageToAsk2"
                                value="Disagree"
                                checked={courageToAsk === "Disagree"}
                                onChange={(event) => setCourageToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCourageToAsk2">
                                Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCourageToAsk3"
                                id="RadioCourageToAsk3"
                                value="Neutral"
                                checked={courageToAsk === "Neutral"}
                                onChange={(event) => setCourageToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCourageToAsk3">
                                Neutral
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCourageToAsk4"
                                id="RadioCourageToAsk4"
                                value="Agree"
                                checked={courageToAsk === "Agree"}
                                onChange={(event) => setCourageToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCourageToAsk4">
                                Agree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCourageToAsk5"
                                id="RadioCourageToAsk5"
                                value="Strongly Agree"
                                checked={courageToAsk === "Strongly Agree"}
                                onChange={(event) => setCourageToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCourageToAsk5">
                                Strongly Agree
                            </label>
                        </div>
                    </fieldset>

                    {/* Curious To Know What the Teacher Will Teach */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                            <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;When I sit in a lecture a class, I am curious about what the teacher will teach.&quot;</legend>
                        </legend><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCuriousToKnow1"
                                id="RadioCuriousToKnow1"
                                value="Strongly Disagree"
                                checked={curiousToKnow === "Strongly Disagree"}
                                onChange={(event) => setCuriousToKnow(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriousToKnow1">
                                Strongly Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCuriousToKnow2"
                                id="RadioCuriousToKnow2"
                                value="Disagree"
                                checked={curiousToKnow === "Disagree"}
                                onChange={(event) => setCuriousToKnow(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriousToKnow2">
                                Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCuriousToKnow3"
                                id="RadioCuriousToKnow3"
                                value="Neutral"
                                checked={curiousToKnow === "Neutral"}
                                onChange={(event) => setCuriousToKnow(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriousToKnow3">
                                Neutral
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCuriousToKnow4"
                                id="RadioCuriousToKnow4"
                                value="Agree"
                                checked={curiousToKnow === "Agree"}
                                onChange={(event) => setCuriousToKnow(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriousToKnow4">
                                Agree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioCuriousToKnow5"
                                id="RadioCuriousToKnow5"
                                value="Strongly Agree"
                                checked={curiousToKnow === "Strongly Agree"}
                                onChange={(event) => setCuriousToKnow(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioCuriousToKnow5">
                                Strongly Agree
                            </label>
                        </div>
                    </fieldset>

                    {/* Why Children Ask Many Questions */}
                    <div className="form-group mt-2 pb-2">
                        <label className="text-base md:text-xl font-bold pt-1 mb-3" htmlFor="text">In your opinion, why do 4-year old children ask many questions?</label>
                        <input
                            type="text"
                            className="form-control"
                            id="whyChildrenAskQuestions"
                            aria-describedby="whyChildrenAskQuestions"
                            value={whyChildrenAskQuestions}
                            placeholder="Type your answer here . . ."
                            onChange={(event) => setWhyChildrenAskQuestions(event.target.value)} />
                    </div>

                    <h5 className="font-bold pt-2">Motivation</h5>
                    <h5 className="text-base">This section asks about how motivated you are in the topic being taught</h5>

                    {/* Desire to Learn */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                            <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;When a class starts, I sit with a desire to learn.&quot;</legend>
                        </legend><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioDesireToLearn1"
                                id="RadioDesireToLearn1"
                                value="Strongly Disagree"
                                checked={desireToLearn === "Strongly Disagree"}
                                onChange={(event) => setDesireToLearn(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioDesireToLearn1">
                                Strongly Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioDesireToLearn2"
                                id="RadioDesireToLearn2"
                                value="Disagree"
                                checked={desireToLearn === "Disagree"}
                                onChange={(event) => setDesireToLearn(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioDesireToLearn2">
                                Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioDesireToLearn3"
                                id="RadioDesireToLearn3"
                                value="Neutral"
                                checked={desireToLearn === "Neutral"}
                                onChange={(event) => setDesireToLearn(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioDesireToLearn3">
                                Neutral
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioDesireToLearn4"
                                id="RadioDesireToLearn4"
                                value="Agree"
                                checked={desireToLearn === "Agree"}
                                onChange={(event) => setDesireToLearn(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioDesireToLearn4">
                                Agree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioDesireToLearn5"
                                id="RadioDesireToLearn5"
                                value="Strongly Agree"
                                checked={desireToLearn === "Strongly Agree"}
                                onChange={(event) => setDesireToLearn(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioDesireToLearn5">
                                Strongly Agree
                            </label>
                        </div>
                    </fieldset>

                    {/* Ask Questions To Who */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:</legend>
                        <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;When a question comes to my mind, I ask:&quot;</legend>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm md:text-lg mt-4 mb-4">
                                <thead>
                                    <tr>
                                        <th className="px-2 md:px-4 py-2 text-left">Who do you ask?</th>
                                        {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(option => (
                                            <th key={option} className="px-2 md:px-4 py-2 text-center">{option}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {[
                                        { label: "The teacher", state: askTeachers, setter: setAskTeachers },
                                        { label: "Another student", state: askPeer, setter: setAskPeer },
                                        { label: "Myself and guess an answer", state: askMyself, setter: setAskMyself },
                                        { label: "ChatGPT or any other AI resource", state: askGPT, setter: setAskGPT },
                                        { label: "Do some research to find out", state: askResearch, setter: setAskResearch },
                                        { label: "I avoid looking for an answer", state: askAvoid, setter: setAskAvoid }
                                    ].map(({ label, state, setter }) => (
                                        <tr key={label}>
                                            <td className="px-2 md:px-4 py-2">{label}</td>
                                            {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(option => (
                                                <td key={option} className="px-2 md:px-4 py-2 text-center">
                                                     <input
                                                        type="radio"
                                                        name={label}
                                                        value={option}
                                                        checked={state === option}
                                                        onChange={() => handleChange(setter)(option)}
                                                        className="h-4 w-4"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </fieldset>

                    {/* Motivated to Ask Questions For Grade */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                            <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;To get a good grade I am motivated to ask questions.&quot;</legend>
                        </legend><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioMotivatedToAsk1"
                                id="RadioMotivatedToAsk1"
                                value="Strongly Disagree"
                                checked={motivatedToAsk === "Strongly Disagree"}
                                onChange={(event) => setMotivatedToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioMotivatedToAsk1">
                                Strongly Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioMotivatedToAsk2"
                                id="RadioMotivatedToAsk2"
                                value="Disagree"
                                checked={motivatedToAsk === "Disagree"}
                                onChange={(event) => setMotivatedToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioMotivatedToAsk2">
                                Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioMotivatedToAsk3"
                                id="RadioMotivatedToAsk3"
                                value="Neutral"
                                checked={motivatedToAsk === "Neutral"}
                                onChange={(event) => setMotivatedToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioMotivatedToAsk3">
                                Neutral
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioMotivatedToAsk4"
                                id="RadioMotivatedToAsk4"
                                value="Agree"
                                checked={motivatedToAsk === "Agree"}
                                onChange={(event) => setMotivatedToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioMotivatedToAsk4">
                                Agree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioMotivatedToAsk5"
                                id="RadioMotivatedToAsk5"
                                value="Strongly Agree"
                                checked={motivatedToAsk === "Strongly Agree"}
                                onChange={(event) => setMotivatedToAsk(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioMotivatedToAsk5">
                                Strongly Agree
                            </label>
                        </div>
                    </fieldset>

                    <h5 className="font-bold pt-2">Engagement</h5>
                    <h5 className="text-base">This section asks about how engaged you are in the topic being taught</h5>

                    {/* Ask Multiple Questions To */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:</legend>
                        <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;To understand a topic better, I ask multiple questions:&quot;</legend>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm md:text-lg mt-4 mb-4">
                                <thead>
                                    <tr>
                                        <th className="px-2 md:px-4 py-2 text-left">Who do you ask?</th>
                                        {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(option => (
                                            <th key={option} className="px-2 md:px-4 py-2 text-center">{option}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {[
                                        { label: "To other students", state: multQuesAskStudents, setter: setMultQuesAskStudents },
                                        { label: "To my study group", state: multQuesAskGroup, setter: setMultQuesAskGroup },
                                        { label: "To myself ", state: multQuesAskMyself, setter: setMultQuesAskMyself },
                                        { label: "No, I avoid asking questions", state: multQuesAvoid, setter: setMultQuesAvoid },
                                        { label: "To find answers, I do research", state: multQuesResearch, setter: setMultQuesResearch },
                                        { label: "No, I study better by memorizing the notes", state: multQuesMemorize, setter: setMultQuesMemorize }
                                    ].map(({ label, state, setter }) => (
                                        <tr key={label}>
                                            <td className="px-2 md:px-4 py-2">{label}</td>
                                            {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(option => (
                                                <td key={option} className="px-2 md:px-4 py-2 text-center">
                                                     <input
                                                        type="radio"
                                                        name={label}
                                                        value={option}
                                                        checked={state === option}
                                                        onChange={() => handleChange(setter)(option)}
                                                        className="h-4 w-4"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </fieldset>

                    <h5 className="font-bold pt-2">Confidence</h5>
                    <h5 className="text-base">This section asks about how confident you are in the topic being taught</h5>

                    {/* Asking Questions Helps Undestand Topic Better */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                            <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;Asking questions helps me understand the topic better.&quot;</legend>
                        </legend><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioAskQuestionsHelps1"
                                id="RadioAskQuestionsHelp1"
                                value="Strongly Disagree"
                                checked={quesHelpsUnderstand === "Strongly Disagree"}
                                onChange={(event) => setQuesHelpsUnderstand(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioAskQuestionsHelp1">
                                Strongly Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioAskQuestionsHelp2"
                                id="RadioAskQuestionsHelp2"
                                value="Disagree"
                                checked={quesHelpsUnderstand === "Disagree"}
                                onChange={(event) => setQuesHelpsUnderstand(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioAskQuestionsHelp2">
                                Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioAskQuestionsHelp3"
                                id="RadioAskQuestionsHelp3"
                                value="Neutral"
                                checked={quesHelpsUnderstand === "Neutral"}
                                onChange={(event) => setQuesHelpsUnderstand(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioAskQuestionsHelp3">
                                Neutral
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioAskQuestionsHelp4"
                                id="RadioAskQuestionsHelp4"
                                value="Agree"
                                checked={quesHelpsUnderstand === "Agree"}
                                onChange={(event) => setQuesHelpsUnderstand(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioAskQuestionsHelp4">
                                Agree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioAskQuestionsHelp5"
                                id="RadioAskQuestionsHelp5"
                                value="Strongly Agree"
                                checked={quesHelpsUnderstand === "Strongly Agree"}
                                onChange={(event) => setQuesHelpsUnderstand(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioAskQuestionsHelp5">
                                Strongly Agree
                            </label>
                        </div>
                    </fieldset>

                    {/* Easier To Memorize Notes */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:<br></br>
                            <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;I don&apos;t like asking questions, it is easier to memorize the notes.&quot;</legend>
                        </legend><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioEasierToMemorize1"
                                id="RadioEasierToMemorize1"
                                value="Strongly Disagree"
                                checked={easierToMemorize === "Strongly Disagree"}
                                onChange={(event) => setEasierToMemorize(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioEasierToMemorize1">
                                Strongly Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioEasierToMemorize2"
                                id="RadioEasierToMemorize2"
                                value="Disagree"
                                checked={easierToMemorize === "Disagree"}
                                onChange={(event) => setEasierToMemorize(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioEasierToMemorize2">
                                Disagree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioEasierToMemorize3"
                                id="RadioEasierToMemorize3"
                                value="Neutral"
                                checked={easierToMemorize === "Neutral"}
                                onChange={(event) => setEasierToMemorize(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioEasierToMemorize3">
                                Neutral
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioEasierToMemorize4"
                                id="RadioEasierToMemorize4"
                                value="Agree"
                                checked={easierToMemorize === "Agree"}
                                onChange={(event) => setEasierToMemorize(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioEasierToMemorize4">
                                Agree
                            </label>
                        </div><div className="form-check py-1 w-fit">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="RadioEasierToMemorize5"
                                id="RadioEasierToMemorize5"
                                value="Strongly Agree"
                                checked={easierToMemorize === "Strongly Agree"}
                                onChange={(event) => setEasierToMemorize(event.target.value)}
                            />
                            <label className="form-check-label text-lg pl-4" htmlFor="RadioEasierToMemorize5">
                                Strongly Agree
                            </label>
                        </div>
                    </fieldset>

                    {/* Opinion */}
                    <fieldset className="my-4 pb-2">
                        <legend className="text-base md:text-xl pt-2 font-bold">Evaluate the following statement for yourself:</legend>
                        <legend className="text-rose-900 text-base md:text-xl font-bold">&quot;When a question comes to my mind, I ask:&quot;</legend>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm md:text-lg mt-4 mb-4">
                                <thead>
                                    <tr>
                                        <th className="px-2 md:px-4 py-2 text-left">Who do you ask?</th>
                                        {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(option => (
                                            <th key={option} className="px-2 md:px-4 py-2 text-center">{option}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {[
                                        { label: "Asking questions helps me get a better grade", state: opinionAskingQues, setter: setOpinionAskingQues },
                                        { label: "Memorizing notes helps me get better grades", state: opinionMemorizing, setter: setOpinionMemorizing },
                                        { label: "Practicing questions and answers helps to get a better gradePracticing questions and answers helps to get a better grade", state: opinionPracticing, setter: setOpinionPracticing }
                                    ].map(({ label, state, setter }) => (
                                        <tr key={label}>
                                            <td className="px-2 md:px-4 py-2">{label}</td>
                                            {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map(option => (
                                                <td key={option} className="px-2 md:px-4 py-2 text-center">
                                                     <input
                                                        type="radio"
                                                        name={label}
                                                        value={option}
                                                        checked={state === option}
                                                        onChange={() => handleChange(setter)(option)}
                                                        className="h-4 w-4"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </fieldset>

                </div>

                <hr className="border-b-2 border-gray-500 w-full"></hr>

                {/* Terms */}
                <div className="form-check square-check mb-3 w-fit">
                    <div>
                        <input className="form-check-input" type="checkbox" id="agree" checked={terms === true} onChange={(event) => setTerms(event.target.checked)} />
                        <label className="form-check-label text-base" htmlFor="agree">
                            I agree to let this data be used for research purposes.
                        </label>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary mt-3 mb-5 lg:w-[75%] w-full">Submit</button>
            </form>
        </div>
    )
}