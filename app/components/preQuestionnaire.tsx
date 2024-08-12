"use client"

import { nunito } from "@/app/ui/fonts";
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

//@ts-ignore
export default function PreQuestionnaire(props) {

    const [univID, setUnivID] = useState("");
    const [section, setSection] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [curiosity, setCuriosity] = useState("");
    const [smallQues, setSmallQues] = useState("");
    const [nowQues, setNowQues] = useState("");
    const [enjoyStudies, setEnjoyStudies] = useState("");
    const [confidence, setConfidence] = useState("");
    const [motivation, setMotivation] = useState("");
    const [terms, setTerms] = useState(false);

    const handleSubmit = async (e: any) => {
        try {
            e.preventDefault();
            if (univID.length < 4) {
                toast.error("Please enter a valid university ID.");
                return;
            }
            if (univID === "" || section === "" || age === "" || gender === "" || curiosity === "" || smallQues === "" || nowQues === "" || enjoyStudies === "" || confidence === "" || motivation === "") {
                toast.error("Please fill in all the fields.");
                return;
            }
            if (terms === false) {
                toast.error("Please agree to the terms to proceed.");
                return;
            }

            const response = await fetch(`/api/questionnaire/default`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            toast.success("Submitted");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={`${nunito.className} antialiased flex flex-col`}>
            <form onSubmit={handleSubmit} className="w-[95%] lg:w-[60%]">
                {/* University ID */}
                <div className="form-group mb-3 mt-4">
                    <label className="text-xl font-bold py-1" htmlFor="text">Your university&apos;s student id</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    id="univID" 
                    aria-describedby="University ID" 
                    value={univID} 
                    placeholder="Enter your student id here . . ."
                    onChange={(event) => setUnivID(event.target.value)}/>
                    <small id="emailHelp" className="form-text text-muted">We&apos;ll never share your ID with anyone else.</small>
                </div>

                {/* Section */}
                <div className="form-group mb-3">
                    <label className="text-xl font-bold py-1" htmlFor="number">Section</label>
                    <input 
                    type="text" 
                    className="form-control" 
                    id="section" 
                    value={section}
                    onChange={(event) => setSection(event.target.value)}
                    placeholder="Enter your classroom section here . . ."/>
                </div>

                {/* Age */}
                <fieldset className="mb-4">
                    <legend className="text-xl py-1 font-bold">Your current age</legend>
                    <div className="form-check py-1 w-fit" onClick={() => setAge("Below 16 years")}>
                        <input 
                        className="form-check-input" 
                        type="radio"
                        name="RadiosAge" 
                        id="RadiosAge1"
                        value="Below 16 years"
                        checked={age === "Below 16 years"}
                        />
                        <label className="form-check-label text-base" htmlFor="RadiosAge1">
                            Below 16 years
                        </label>
                    </div>
                    <div className="form-check py-1 w-fit" onClick={() => setAge("From 16 to 19 years")}>
                        <input 
                        className="form-check-input" 
                        type="radio"
                        name="RadiosAge"
                        id="RadiosAge2" 
                        value="From 16 to 19 years"
                        checked={age === "From 16 to 19 years"}
                        />
                        <label className="form-check-label text-base" htmlFor="RadiosAge2">
                            From 16 to 19 years
                        </label>
                    </div>
                    <div className="form-check py-1 w-fit" onClick={() => setAge("From 20 to 24 years")}>
                        <input 
                        className="form-check-input" 
                        type="radio"
                        name="RadiosAge"
                        id="RadiosAge3" 
                        value="From 20 to 24 years"
                        checked={age === "From 20 to 24 years"}
                        />
                        <label className="form-check-label text-base" htmlFor="RadiosAge3">
                            From 20 to 24 years
                        </label>
                    </div>
                    <div className="form-check py-1 w-fit" onClick={() => setAge("From 25 to 29 years")}>
                        <input 
                        className="form-check-input" 
                        type="radio"
                        name="RadiosAge"
                        id="RadiosAge4" 
                        value="From 25 to 29 years"
                        checked={age === "From 25 to 29 years"}
                        onChange={(event) => setAge(event.target.value)}
                        />
                        <label className="form-check-label text-base" htmlFor="RadiosAge4">
                            From 25 to 29 years
                        </label>
                    </div>
                    <div className="form-check py-1 w-fit" onClick={() => setAge("From 30 to 34 years")}>
                        <input 
                        className="form-check-input" 
                        type="radio"
                        name="RadiosAge" 
                        id="RadiosAge5" 
                        value="From 30 to 34 years"
                        checked={age === "From 30 to 34 years"}
                        />
                        <label className="form-check-label text-base" htmlFor="RadiosAge5">
                            From 30 to 34 years
                        </label>
                    </div>
                    <div className="form-check py-1 w-fit" onClick={() => setAge("Above 40 years")}>
                        <input 
                        className="form-check-input" 
                        type="radio"
                        name="RadiosAge"
                        id="RadiosAge6" 
                        value="Above 40 years"
                        checked={age === "Above 40 years"}
                        />
                        <label className="form-check-label text-base" htmlFor="RadiosAge6">
                            Above 40 years
                        </label>
                    </div>
                </fieldset>

                {/* Gender */}
                <fieldset className="mb-4">
                    <legend className="text-xl font-bold">Your Gender</legend>
                    <div className="form-check py-1 w-fit" onClick={() => setGender('Male')}>
                        <input className="form-check-input" type="radio" name="exampleRadios2" id="RadiosSex1" value="Male" checked={gender === 'Male'}/>
                        <label className="form-check-label text-base" htmlFor="RadiosSex1">
                            Male
                        </label>
                    </div>
                    <div className="form-check py-1 w-fit" onClick={() => setGender('Female')}>
                        <input className="form-check-input" type="radio" name="exampleRadios2" id="RadiosSex2" value="Female" checked={gender === 'Female'}/>
                        <label className="form-check-label text-base" htmlFor="RadiosSex2">
                            Female
                        </label>
                    </div>
                    <div className="form-check py-1 w-fit" onClick={() => setGender('Prefer not to say')}>
                        <input className="form-check-input" type="radio" name="exampleRadios2" id="RadiosSex3" value="Prefer not to say" checked={gender === 'Prefer not to say'}/>
                        <label className="form-check-label text-base" htmlFor="RadiosSex3">
                            Prefer not to say
                        </label>
                    </div>
                </fieldset>

                {/* Curiosity */}
                <fieldset className="mb-4">
                    <legend className="text-xl font-bold">1. How curious are you about your studies?</legend>
                    <div className="flex flex-col lg:flex-row gap-x-4 mt-1">
                        <p className="pt-1">Not at all</p>
                        <div className="form-check py-1 w-fit" onClick={() => setCuriosity('1')}>
                            <input className="form-check-input" type="radio" name="exampleRadios3" id="RadiosCurious1" value="optionC1" checked={curiosity==='1'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosCurious1">
                                1
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setCuriosity('2')}>
                            <input className="form-check-input" type="radio" name="exampleRadios3" id="RadiosCurious2" value="optionC2" checked={curiosity==='2'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosCurious2">
                                2
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setCuriosity('3')}>
                            <input className="form-check-input" type="radio" name="exampleRadios3" id="RadiosCurious3" value="optionC3" checked={curiosity==='3'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosCurious3">
                                3
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setCuriosity('4')}>
                            <input className="form-check-input" type="radio" name="exampleRadios3" id="RadiosCurious4" value="optionC4" checked={curiosity==='4'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosCurious4">
                                4
                            </label>
                        </div>
                        <div className="form-check py-1 pb-3 w-fit" onClick={() => setCuriosity('5')}>
                            <input className="form-check-input" type="radio" name="exampleRadios3" id="RadiosCurious5" value="optionC5" checked={curiosity==='5'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosCurious5">
                                5
                            </label>
                        </div>
                        <p className="pt-1">Highly curious</p>
                    </div>
                </fieldset>

                {/* 4 years old questions */}
                <fieldset className="mb-4">
                    <legend className="text-xl font-bold">2. When you were small, about 4 years old, on average, how many questions did you ask on a daily basis?</legend>
                    <div className="flex flex-col mt-1">
                        <div className="form-check py-1 w-fit" onClick={() => setSmallQues('No questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios4" id="RadiosSmallQues1" value="No questions" checked={smallQues==='No questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosSmallQues1">
                                No questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setSmallQues('1 to 5 questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios4" id="RadiosSmallQues2" value="1 to 5 questions" checked={smallQues==='1 to 5 questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosSmallQues2">
                                1 to 5 questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setSmallQues('6 to 10 questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios4" id="RadiosSmallQues3" value="6 to 10 questions" checked={smallQues==='6 to 10 questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosSmallQues3">
                                6 to 10 questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setSmallQues('11 to 20 questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios4" id="RadiosSmallQues4" value="11 to 20 questions" checked={smallQues==='11 to 20 questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosSmallQues4">
                                11 to 20 questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setSmallQues('21 to 30 questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios4" id="RadiosSmallQues5" value="21 to 30 questions" checked={smallQues==='21 to 30 questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosSmallQues5">
                                21 to 30 questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setSmallQues('More than 30 questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios4" id="RadiosSmallQues6" value="More than 30 questions" checked={smallQues==='More than 30 questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosSmallQues6">
                                More than 30 questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setSmallQues('Do not remember at all')}>
                            <input className="form-check-input" type="radio" name="exampleRadios4" id="RadiosSmallQues7" value="Do not remember at all" checked={smallQues==='Do not remember at all'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosSmallQues7">
                                Don&apos;t remember at all
                            </label>
                        </div>
                    </div>
                </fieldset>

                {/* Questions asked yesterday */}
                <fieldset className="mb-4">
                    <legend className="text-xl font-bold">3. Approximately how many questions did you ask yesterday?</legend>
                    <div className="flex flex-col mt-1">
                        <div className="form-check py-1 w-fit" onClick={() => setNowQues('No questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues1" value="No questions" checked={nowQues==='No questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosNowQues1">
                                No questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setNowQues('1 to 5 questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues2" value="1 to 5 questions" checked={nowQues==='1 to 5 questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosNowQues2">
                                1 to 5 questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setNowQues('6 to 10 questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues3" value="6 to 10 questions" checked={nowQues==='6 to 10 questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosNowQues3">
                                6 to 10 questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setNowQues('11 to 20 questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues4" value="11 to 20 questions" checked={nowQues==='11 to 20 questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosNowQues4">
                                11 to 20 questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setNowQues('21 to 30 questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues5" value="21 to 30 questions" checked={nowQues==='21 to 30 questions'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosNowQues5">
                                21 to 30 questions
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setNowQues('30 or more questions')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues6" value="30 or more questions" checked={nowQues==='30 or more questions'}/>
                            <label className="form-check-label text-base" htmlFor="exampleRadios5">
                                30 or more questions
                            </label>
                        </div>
                    </div>
                </fieldset>

                {/* Enjoy studies */}
                <fieldset className="mb-4">
                    <legend className="text-xl font-bold">4. Evaluate the following statement: I enjoy my studies.</legend>
                    <div className="flex flex-col lg:flex-row gap-x-4 mt-1">
                        <p className="pt-1">No, not at all</p>
                        <div className="form-check py-1 w-fit" onClick={() => setEnjoyStudies('1')}>
                            <input className="form-check-input" type="radio" name="exampleRadios6" id="RadiosEnjoyStudies1" value="1" checked={enjoyStudies==='1'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosEnjoyStudies1">
                                1
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setEnjoyStudies('2')}>
                            <input className="form-check-input" type="radio" name="exampleRadios6" id="RadiosEnjoyStudies2" value="2" checked={enjoyStudies==='2'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosEnjoyStudies2">
                                2
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setEnjoyStudies('3')}>
                            <input className="form-check-input" type="radio" name="exampleRadios6" id="RadiosEnjoyStudies3" value="3" checked={enjoyStudies==='3'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosEnjoyStudies3">
                                3
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setEnjoyStudies('4')}>
                            <input className="form-check-input" type="radio" name="exampleRadios6" id="RadiosEnjoyStudies4" value="4" checked={enjoyStudies==='4'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosEnjoyStudies4">
                                4
                            </label>
                        </div>
                        <div className="form-check py-1 pb-3 w-fit" onClick={() => setEnjoyStudies('5')}>
                            <input className="form-check-input" type="radio" name="exampleRadios6" id="RadiosEnjoyStudies5" value="5" checked={enjoyStudies==='5'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosEnjoyStudies5">
                                5
                            </label>
                        </div>
                        <p className="pt-1">Very much</p>
                    </div>
                </fieldset>

                {/* Confidence */}
                <fieldset className="mb-4">
                    <legend className="text-xl font-bold">5. Evaluate the following statement: I am confident about my studies.</legend>
                    <div className="flex flex-col lg:flex-row gap-x-4 mt-1">
                        <p className="pt-1">No, not confident at all</p>
                        <div className="form-check py-1 w-fit" onClick={() => setConfidence('1')}>
                            <input className="form-check-input" type="radio" name="exampleRadios7" id="RadiosConfidence1" value="1" checked={confidence==='1'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosConfidence1">
                                1
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setConfidence('2')}>
                            <input className="form-check-input" type="radio" name="exampleRadios7" id="RadiosConfidence2" value="2" checked={confidence==='2'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosConfidence2">
                                2
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setConfidence('3')}>
                            <input className="form-check-input" type="radio" name="exampleRadios7" id="RadiosConfidence3" value="3" checked={confidence==='3'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosConfidence3">
                                3
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setConfidence('4')}>
                            <input className="form-check-input" type="radio" name="exampleRadios7" id="RadiosConfidence4" value="4" checked={confidence==='4'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosConfidence4">
                                4
                            </label>
                        </div>
                        <div className="form-check py-1 pb-3 w-fit" onClick={() => setConfidence('5')}>
                            <input className="form-check-input" type="radio" name="exampleRadios7" id="RadiosConfidence5" value="5" checked={confidence==='5'}/>
                            <label className="form-check-label text-base" htmlFor="RadiosConfidence5">
                                5
                            </label>
                        </div>
                        <p className="pt-1">Very confident</p>
                    </div>
                </fieldset>

                {/* Motivation */}
                <fieldset className="mb-4">
                    <legend className="text-xl font-bold">6. Evaluate the following statement: I am motivated towards my studies</legend>
                    <div className="flex flex-col mt-1">
                        <div className="form-check py-1 w-fit" onClick={() => setMotivation('Strongly disagree')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues1" value="Strongly disagree" checked={motivation==='Strongly disagree'}/>
                            <label className="form-check-label text-base" htmlFor="exampleRadios5">
                                Strongly disagree
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setMotivation('Disagree')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues2" value="Disagree" checked={motivation==='Disagree'}/>
                            <label className="form-check-label text-base" htmlFor="exampleRadios5">
                                Disagree
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setMotivation('Neutral')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues3" value="Neutral" checked={motivation==='Neutral'}/>
                            <label className="form-check-label text-base" htmlFor="exampleRadios5">
                                Neutral
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setMotivation('Agree')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues4" value="Agree" checked={motivation==='Agree'}/>
                            <label className="form-check-label text-base" htmlFor="exampleRadios5">
                                Agree
                            </label>
                        </div>
                        <div className="form-check py-1 w-fit" onClick={() => setMotivation('Strongly Agree')}>
                            <input className="form-check-input" type="radio" name="exampleRadios5" id="RadiosNowQues5" value="Strongly Agree" checked={motivation==='Strongly Agree'}/>
                            <label className="form-check-label text-base" htmlFor="exampleRadios5">
                                Strongly Agree
                            </label>
                        </div>
                    </div>
                </fieldset>

                <hr className="border-b-2 border-gray-500 w-full"></hr>

                {/* Terms */}
                <div className="form-check square-check mb-3 w-fit">
                    <div>
                        <input className="form-check-input" type="checkbox" value="" id="agree" checked={terms===true}/>
                        <label className="form-check-label text-base" htmlFor="agree" onClick={() => setTerms(!terms)}>
                            I agree to let this data be used for research purposes.
                        </label>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary mt-3 mb-5 lg:w-[75%] w-full">Submit</button>
            </form>
        </div>
    )
}