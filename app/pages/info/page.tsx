"use client"

import { nunito } from "@/app/ui/fonts";
import { useEffect, useState } from 'react';
import Image from "next/image";
import { useRouter } from 'next/router';

//@ts-ignore
export default function Info(props) {

    useEffect(() => {
        document.title = "Information";
    }, []);

    const [guideState, setGuideState] = useState("student");

    return (
        <div className={`${nunito.className} antialiased flex flex-col lg:pl-[8em] pt-4`}>
            <div className="pl-2">
                <div className="w-full pt-4 text-left mx-auto px-2">
                    <h1>Documentation</h1>
                    <p className="pb-3 text-xl">Guides to using the PaltaQ application</p>
                </div>

                <div className="px-2">
                    <button className={`btn btn-primary animate-down-2 mr-2 ${guideState === 'student' ? 'text-secondary active' : ''}`} type="button" onClick={() => setGuideState("student")}>For Students</button>
                    <button className={`btn btn-primary animate-down-2 mx-2 ${guideState === 'teacher' ? 'text-secondary active' : ''}`} type="button" onClick={() => setGuideState("teacher")}>For Teachers</button>
                </div>

                {/* Table of Contents */}
                <div className="">
                    {/* Students TOC */}
                    {guideState === 'student' && (
                        <div className="mt-5">
                            <div className="px-2">
                                <h5 className="font-bold">PaltaQ Student Guide</h5>
                                <p className="pb-3">Welcome to PaltaQ! Here is a guide to help you get started with the PaltaQ application.</p>
                            </div>

                            <ol className="list-decimal pl-4 pb-4">
                                <li className="">
                                    <h6><a className="font-bold" href="#about">About the Application</a></h6>
                                    <ul className="list-disc pl-4">
                                        <li><a href="#what_is_paltaq" className="text-gray-800">What is PaltaQ?</a></li>
                                        <li><a href="#benefits" className="text-gray-800">Benefits</a></li>
                                        <li><a href="#taxonomy" className="text-gray-800">Blooms Taxonomy</a></li>
                                        <li><a href="#publications" className="text-gray-800">Publications</a></li>
                                    </ul>
                                </li>
                                <li className="pt-3">
                                    <h6><a className="font-bold" href="#started">Getting Started</a></h6>
                                    <ul className="list-disc pl-4">
                                        <li><a href="#register" className="text-gray-800">Registering an Account</a></li>
                                        <li><a href="#first" className="text-gray-800">Asking Your First Question</a></li>
                                        <li><a href="#palta" className="text-gray-800">Asking Palta Questions</a></li>
                                        <li><a href="#join" className="text-gray-800">Joining a Classroom</a></li>
                                        <li><a href="#questionnaire" className="text-gray-800">Questionnaires</a></li>
                                        <li><a href="#topicquestions" className="text-gray-800">Topic-Based Questions</a></li>
                                        <li><a href="#studentdashboard" className="text-gray-800">The Student Dashboard</a></li>
                                        <li><a href="#leaderboard" className="text-gray-800">Leaderboard</a></li>
                                        <li><a href="#markscheme" className="text-gray-800">Marking Scheme</a></li>
                                        <li><a href="#logout" className="text-gray-800">Logging out</a></li>
                                    </ul>
                                </li>
                                <li className="pt-3">
                                    <h6><a className="font-bold" href="#features">Features & Mechanisms</a></h6>
                                    <ul className="list-disc pl-4">
                                        <li><a href="#validation" className="text-gray-800">Question Validation</a></li>
                                        <li><a href="#anonymity" className="text-gray-800">Anonymity</a></li>
                                        <li><a href="#scorerank" className="text-gray-800">Scores & Rankings</a></li>
                                        <li><a href="#scoremechanism" className="text-gray-800">Scoring Mechanism</a></li>
                                        <li><a href="#likedislike" className="text-gray-800">Likes & Dislikes</a></li>
                                        <li><a href="#aiassistance" className="text-gray-800">A.I Assistance</a></li>
                                        <li><a href="#depth" className="text-gray-800">PaltaQ Depth</a></li>
                                        <li><a href="#tags" className="text-gray-800">Blooms Taxonomy Tags</a></li>
                                        <li><a href="#moderation" className="text-gray-800">Peer Moderation (Coming Soon)</a></li>
                                    </ul>
                                </li>
                                <li className="pt-3">
                                    <h6><a className="font-bold" href="#FAQ">Frequently Asked Questions</a></h6>
                                </li>
                            </ol>
                        </div>
                    )}

                    {/* Teachers TOC */}
                    {guideState === 'teacher' && (
                        <div className="mt-5">
                            <div className="pl-2">
                                <h5 className="font-bold">PaltaQ Teacher Guide</h5>
                                <p className="pb-3">Welcome to PaltaQ! Here is a guide to help you get started with the PaltaQ application.</p>
                            </div>

                            <ol className="list-decimal pl-4 pb-4">
                                <li className="">
                                    <h6><a className="font-bold" href="#about">About the Application</a></h6>
                                    <ul className="list-disc pl-4">
                                        <li><a href="#what_is_paltaq" className="text-gray-800">What is PaltaQ?</a></li>
                                        <li><a href="#benefits" className="text-gray-800">Benefits</a></li>
                                        <li><a href="#publications" className="text-gray-800">Blooms Taxonomy</a></li>
                                        <li><a href="#publications" className="text-gray-800">Publications</a></li>
                                    </ul>
                                </li>
                                <li className="pt-3">
                                    <h6><a className="font-bold" href="#started">Getting Started</a></h6>
                                    <ul className="list-disc pl-4">
                                        <li><a href="#register" className="text-gray-800">Registering an Account</a></li>
                                        <li><a href="#facultystatus" className="text-gray-800">Getting Faculty Status</a></li>
                                        <li><a href="#first" className="text-gray-800">Asking Your First Question</a></li>
                                        <li><a href="#palta" className="text-gray-800">Asking Palta Questions</a></li>
                                        <li><a href="#create" className="text-gray-800">Creating a Classroom</a></li>
                                        <li><a href="#topiccreate" className="text-gray-800">Creating Topics</a></li>
                                        <li><a href="#code" className="text-gray-800">Classroom Code</a></li>
                                        <li><a href="#topicquestions" className="text-gray-800">Topic-Based Questions</a></li>
                                        <li><a href="#facultydashboard" className="text-gray-800">The Faculty Dashboard</a></li>
                                        <li><a href="#studentdashboard" className="text-gray-800">The Student Dashboard</a></li>
                                        <li><a href="#leaderboard" className="text-gray-800">Leaderboard</a></li>
                                        <li><a href="#markscheme" className="text-gray-800">Marking Scheme</a></li>
                                        <li><a href="#logout" className="text-gray-800">Logging Out</a></li>
                                    </ul>
                                </li>
                                <li className="pt-3">
                                    <h6><a className="font-bold" href="#features">Features & Mechanisms</a></h6>
                                    <ul className="list-disc pl-4">
                                        <li><a href="#validation" className="text-gray-800">Question Validation</a></li>
                                        <li><a href="#anonymity" className="text-gray-800">Anonymity</a></li>
                                        <li><a href="#scorerank" className="text-gray-800">Scores & Rankings</a></li>
                                        <li><a href="#scoremechanism" className="text-gray-800">Scoring Mechanism</a></li>
                                        <li><a href="#likedislike" className="text-gray-800">Likes & Dislikes</a></li>
                                        <li><a href="#aiassistance" className="text-gray-800">A.I Assistance</a></li>
                                        <li><a href="#depth" className="text-gray-800">PaltaQ Depth</a></li>
                                        <li><a href="#tags" className="text-gray-800">Blooms Taxonomy Tags</a></li>
                                        <li><a href="#moderation" className="text-gray-800">Peer Moderation (Coming Soon)</a></li>
                                    </ul>
                                </li>
                                <li className="pt-3">
                                    <h6><a className="font-bold" href="#FAQ">Frequently Asked Questions</a></h6>
                                </li>
                            </ol>
                        </div>
                    )}
                </div>

                <hr className="pb-4"></hr>

                {/* Guide Content */}
                {/* Section 1 */}
                <div className="pl-2 pb-2 mr-5" id="about" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                    <h4 className="font-bold pb-4">Section 1: About the Application</h4>

                    <section id="what_is_paltaq" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>What is PaltaQ?</h5>
                        <p className="text-justify pt-2">PaltaQ (short form for &quot;Palta Questions&quot; or &quot;Counter Questions&quot;) 
                           is an application designed to motivate students and teachers ask and answer questions freely and anonymously.
                            The application is designed to help students and teachers improve their critical thinking skills and develop a deeper understanding of the subject matter.
                            This is achieved through palta questions which challenge the original question by asking a related question in return, pushing students to think deeper and explore the topic more thoroughly.
                            Instead of just answering, students have to reflect on what they know and connect it to the new question.
                            For example, if someone asks, &quot;What causes climate change?&quot;
                            a Palta Question could be, &quot;How can we reduce the effects of climate change?&quot; 
                            This new question makes the conversation more interesting and encourages further thinking.
                            <br></br><br></br>
                            Similarly, palta questions are not the only tool that improves students critical thinking skills but also questions itself too.
                            Questions have been scientifically proven to improve learning and retention of information in the brain.
                            When questions are asked, the brain is forced to retrieve information from memory, which strengthens the memory and makes it easier to recall in the future.
                            For example, if you ask a question like, &quot;What is the capital of France?&quot; instead of giving them direct answer and then they find that answer by themselves,
                            whether its from the internet or a book, they are more likely to remember that information in the future.
                        </p>
                        <br></br>
                    </section>

                    <section id="benefits" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Benefits of PaltaQ</h5>
                        <p className="text-justify pt-2">1. Encourages Active Learning <br></br>
                            Palta Questions make students actively participate in learning. 
                            Instead of just listening to a teacher or reading from a textbook, students are encouraged to ask questions and respond with more questions. 
                            This active involvement helps students pay more attention and stay interested in the subject.
                            <br></br><br></br>
                            2. Builds Critical Thinking Skills <br></br>
                            Questions encourages students to think critically and palta questions help develop more in-depth knowledge about a topic.
                            The PaltaQ app prevents asking similar questions or palta questions as their peers.
                            By asking unique and creative questions that require more thought, students learn to analyze information, see different sides of an issue, and solve problems creatively.
                            <br></br><br></br>
                            3. Strengthens Memory and Understanding <br></br>
                            When students ask and answer questions, especially palta questions, they have to recall what they know and relate it to new information. 
                            This process strengthens memory and helps students understand the material better.
                            For Example: A student who regularly answers Palta Questions about historical events will likely remember the events and their significance better than if they had just read about them.
                            <br></br><br></br>
                            4. Boosts Confidence and Motivation <br></br>
                            Many students feel shy or unsure about asking questions in class.
                            The PaltaQ app aims to rebuild students’ confidence by making questioning a normal part of learning. 
                            As they get more comfortable with asking and answering questions, their confidence grows, and so does their motivation to learn.
                            We have tested and proved this in our research that students who use PaltaQ are more confident and motivated in their studies.
                            <br></br><br></br>
                            5. Fosters Collaboration and Teamwork <br></br>
                            PaltaQ encourages students to work together and learn from each other.
                            The Palta Questions method encourages students to work together by discussing and debating questions. 
                            This collaborative learning helps students learn from each other’s ideas and perspectives, making the learning experience richer.
                            Using the leaderboard system, the app also encourages healthy competition among students, motivating them to ask better questions and improve their scores.
                            <br></br><br></br>
                            6. Revives Natural Curiosity <br></br>
                            Children are naturally curious, but as they grow older, they often stop asking questions.
                            As a result, the dropout rates in schools, colleges and universities are increasing and students are losing interest in learning.
                            The PaltaQ app is designed to bring back that curiosity by making questioning an exciting and essential part of learning.
                            <br></br><br></br>
                            7. Makes Learning Relevant and Connected <br></br>
                            By linking new information with what students already know, the questions and palta questions helps them see how different ideas are connected.
                            This makes learning more meaningful and easier to apply in real life.
                        </p>
                        <br></br>
                    </section>

                    <section id="taxonomy" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Bloom&apos;s Taxonomy</h5>
                        <p className="pt-2 text-justify">
                        The PaltaQ app uses a hybrid scoring system involving Bloom&apos;s Taxonomy and Meta AI Llama-3 to help students and teachers ask better questions and think more critically.
                        Bloom&apos;s Taxonomy is a way to organize different levels of learning, helping us understand how we learn and think. 
                        <br></br><br></br>Level 1: Remembering - It starts with the simplest task: remembering facts. 
                        For example, you might memorize the names of the planets. 
                        <br></br>Level 2: Understanding - The next step is understanding, where you explain what those facts mean, like why Earth orbits the sun.
                        <br></br>Level 3: Applying - After that comes applying, where you use what you have learned in real situations, such as solving a math problem using a formula you know. 
                        <br></br>Level 4: Analyzing - Then, there&apos;s analyzing, where you break down information to see how the parts connect, like comparing habitats of different animals. 
                        <br></br>Level 5: Evaluating - Next is evaluating, where you make decisions based on what you know, such as choosing the best way to reduce pollution. 
                        <br></br>Level 6: Creating - The final step is creating, where you use everything you have learned to come up with something new, like designing a science experiment. 
                        <br></br><br></br>Bloom&apos;s Taxonomy helps you move from basic understanding to more advanced thinking, making it a useful guide for learning better and thinking more deeply.
                        The figure below shows the different levels of Bloom&apos;s Taxonomy and how some of the keywords are distributed across each level. 
                        Please note that the figure does not contain all the keywords and is just a representation of the levels.
                        </p>
                        <br></br>
                        <Image src="/information/blooms.png" width={600} height={600} alt="blooms"/>
                        <br></br>
                        <br></br>
                    </section>

                    <section id="publications" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Publicatons</h5>
                        <p className="pt-2 text-justify">
                            Till now, two publications have been made on PaltaQ and the TI-QuBAN method which is the concept behind PaltaQ.
                            <br></br><br></br>
                            1. <a target="_blank" href="https://link.springer.com/chapter/10.1007/978-981-97-1961-7_11" className="text-blue-500">A Query-Based Approach to Mitigate the Shortcomings of Widely Used Learning Methods Through E-Learning</a>
                            <br></br>
                            Presented in the ICACIT-2023 Conference.
                            <br></br>Published in the Scopus-Indexed (Q4) Springer Nature LNNS (Lecture Notes in Network & Systems) Journal.
                            <br></br>This publication introduces the TI-QuBAN method, which is the concept behind PaltaQ and also the first version of PaltaQ.
                            <br></br>
                            <button className="btn btn-primary mt-3">
                                <a 
                                href="https://drive.google.com/file/d/1NGgZV0h14xg_q2gE_wdIIV4uiZ9DT6u2/view?usp=sharing"
                                target="_blank"
                                >
                                    Download For Free
                                </a>
                            </button>
                            <br></br><br></br>
                            2. <a target="_blank" href="https://www.sciencedirect.com/science/article/pii/S2352340924000829" className="text-blue-500">Dataset of computer science course queries from students: Categorized and scored according to Bloom&apos;s taxonomy</a>
                            <br></br>
                            Published in the Data in Brief journal (Q2) by Elsevier.
                            <br></br>This publication provides a dataset of computer science course queries from students, categorized and scored according to Bloom&apos;s taxonomy.
                            <br></br>
                            <button className="btn btn-primary mt-3">
                                <a 
                                href="https://drive.google.com/file/d/1HTDufE0Z_nHRX1h4X5JGb3Y0V0HUG6-B/view?usp=sharing"
                                target="_blank"
                                >
                                    Download For Free
                                </a>
                            </button>
                        </p>
                    </section>

                </div>

                <hr className="pb-4"></hr>

                {/* Section 2 */}
                <div className="pl-2 pb-2 mr-5" id="started" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                    <h4 className="font-bold pb-4">Section 2: Getting Started on Using PaltaQ</h4>

                    <section id="register" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Registering an Account</h5>
                        <p className="pt-2 text-justify">Registration in PaltaQ is as simple as clicking on the login button on the sidebar and then logging onto your google account.
                            The system will automatically create an account for you using your google account&apos;s name and picture and you will be able to use the application as a student.
                            <br></br>Note: You can change your picture or name anytime later on by changing your google account&apos;s picture or name. You are not required to use your actual name or picture.
                        </p>
                        <br></br>
                        <Image src="/information/register.png" width={600} height={600} alt="register"/>
                        <br></br>
                        <br></br>
                    </section>

                    {guideState=='teacher' && (
                        <div>
                            <section id="facultystatus" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                                <h5>Getting Faculty Status</h5>
                                <p className="pt-2 text-justify">In order to get proper verification, there is no registration system for faculties or teachers.
                                    If you want to use PaltaQ as a teacher, you can contact us at <a href="mailto:paltaq.seu@gmail.com" className="text-blue-500"> paltaq.seu@gmail.com</a>.
                                    We will verify your credentials and provide you with faculty status. Please make sure to provide your university email address, name and university name for verification.
                                </p>
                                <br></br>
                            </section>
                        </div>
                    )}

                    <section id="first" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Asking Your First Question</h5>
                        <p className="pt-2 text-justify">Welcome to PaltaQ. Now, lets start by asking your first question! 
                            Go to the homepage and type your question in the box at the top of the page.
                            Once, finished, click on the button on the right side of the input box to submit your question. <br></br>
                        </p>
                        <br></br>
                        <Image src="/information/first.png" width={600} height={600} alt="first"/>
                        <br></br><br></br>
                    </section>

                    <section id="palta" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Asking Palta Questions</h5>
                        <p className="pt-2 text-justify">Asking palta question (counter questions) is similar to how you type comments in your social media like facebook or twitter.
                            Clicking on PaltaQ button below a question will open a text box where you can type your palta question and submit it like you sbumitted your first question.
                        </p>
                        <br></br>
                        <Image src="/information/palta.png" width={600} height={600} alt="palta"/>
                        <br></br>
                        <p>
                            Furthermore, you can also ask palta questions over another palta questions too. The method is the same as asking palta questions over a question.
                        </p>
                        <br></br>
                    </section>

                    {guideState=='teacher' && (
                        <div>
                            <section id="create" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                                <h5>Creating a Classroom</h5>
                                <p className="text-justify pt-2">Now that you have learned how to ask questions and palta questions, let&apos;s create a classroom for your students.
                                    Make sure you got your faculty status before continuing.
                                    Click on the second icon on the sidebar which will take you to the Faculty Dashboard
                                    At the top left of the faculty Dashboard, there is a field to enter your class name. 
                                    Enter your class name and click on the &quot;Create Class&quot; button.
                                    Your new classroom name should appear on the right side of the page along with a successfully created class notification.
                                </p>
                                <br></br>
                                <Image src="/information/faculty_dashboard.png" width={600} height={600} alt="facultydashboard"/>
                                <br></br>
                                <hr></hr>
                                <Image src="/information/create_class.png" width={600} height={600} alt="create_class"/>
                                <br></br>
                                <br></br>
                            </section>

                            <section id="topiccreate" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                                <h5>Creating Topics</h5>
                                <p className="pt-2 text-justify">Now that you have your own classroom created, click on the view button on the right side panel where you created your classroom in the faculty dashboard.
                                    You will be shown to the classroom page below where you can see the enrolled students and faculties and also set or edit the topics.
                                    Enter the topic name and click on the &quot;Create Topic&quot; button.
                                    Your new topic should appear on the right side of the page along with a successfully created topic notification.
                                </p>
                                <br></br>
                                <Image src="/information/view_class.png" width={800} height={800} alt="view_class"/>
                                <br></br>
                                <hr></hr>
                                <Image src="/information/topic_create.png" width={800} height={800} alt="topic_Create"/>
                                <br></br>
                                <br></br>
                            </section>

                            <section id="code" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                                <h5>Classroom Code</h5>
                                <p className="pt-2 text-justify">Now that you have your classroom and its topics created, you are ready to share the code with your students.
                                    Go to the top part of the page where you created your classroom
                                    On the right side, you will find the classroom code which you can share with your students.
                                </p>
                                <br></br>
                                <Image src="/information/class_code.png" width={800} height={800} alt="class_code"/>
                                <br></br>
                                <br></br>
                            </section>
                        </div>
                    )}
                    {guideState=='student' && (
                        <div>
                            <section id="code" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                                <h5>Joining a Classroom</h5>
                                <p className="pt-2 text-justify">Now, that you know how to ask questions and palta questions, lets get you joined in a classroom.
                                    Ask your teacher for the classroom code.
                                    Go to the question page by clicking on the &quot;Q&quot; icon on the sidebar.
                                    Enter the classroom code and click on the &quot;Join Class&quot; button.
                                    You should be successfully joined in the classroom which you can check by seeing the enrolled classes panel on the right side.
                                    You can now click on the select button on the enrolled classes panel and continue onto the next step.
                                </p>
                                <br></br>
                                <Image src="/information/question_page.png" width={600} height={600} alt="question_page"/>
                                <br></br>
                                <hr></hr>
                                <Image src="/information/join_class.png" width={800} height={800} alt="join_class"/>
                            </section>

                            <section id="code" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                                <h5>Questionnaires</h5>
                                <p className="pt-2 text-justify">After joining the classroom, you can now access the classroom questions and ask your own questions and palta questions.
                                    However, before you continue, you need to complete the questionnaires which will help us conduct our research.
                                    Please fill up the questionnaires and click on the submit button.
                                    You can now continue to ask questions and palta questions in your classroom on the topics set by your teacher.
                                </p>
                                <br></br>
                            </section>
                        </div>
                    )}
                    
                    <section id="topicquestions" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Topic-Based Questions</h5>
                        <p className="pt-2 text-justify">
                            Now that you have your classroom and its topics selected, you are ready to ask questions and palta questions on the topics set by the teacher.
                            Click on the topic you want to ask questions on and start asking questions and palta questions.
                            Asking questions will give you score and a ranking which you can see the progress here.
                            Refer to <a className="text-blue-500" href="#features">Section-3</a> for more information about scores and rankings.
                            <br></br>
                            You will also notice if you scroll down that the faculty and student questions are separated. You can ask questions on both the faculty and student questions.
                            Both students and faculties can ask questions and palta questions here and compete with each other to be on the leaderboard.
                            To learn more about the leaderboard, you can check the <a className="text-blue-500" href="#leaderboard">leaderboard section</a>.
                        </p>
                        <br></br>
                        <Image src="/information/topic_question.png" width={800} height={800} alt="topic_questions"/>
                        <hr></hr>
                        <Image src="/information/student_faculty_question.png" width={600} height={600} alt="student_faculty_question"/>
                        <br></br>
                        <br></br>
                    </section>

                    {guideState=='teacher' && (
                        <div>
                            <section id="facultydashboard" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                                <h5>Faculty Dashboard</h5>
                                <p className="pt-2 text-justify">You have already seen how to use the faculty dashboard to create class and topics.
                                    Here, you can also delete unwanted classes and topics and also remove students if required.
                                    Your shared class code can also be given to teachers to add them to your classroom as co-teachers.
                                    The semester end date is required in every classroom so that a post-questionnaire can be assigned at the given date.
                                    By default it is set to be 3 months from the date of creation of the classroom.
                                    <br></br>
                                    You are not only limited to being a faculty. You can also switch to a student by clicking on the switch button on the top left of the page. 
                                </p>
                                <br></br>
                                <Image src="/information/switch.png" width={600} height={600} alt="switch"/>
                                <br></br><br></br>
                            </section>
                        </div>
                    )}

                    <section id="studentdashboard" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Student Dashboard</h5>
                        <p className="pt-2 text-justify">Now that you have learned to use a classroom to ask questions and palta questions on a topic, you can now go to your dashboard to check your progress.
                            The student dashboard shows your score and ranking in the classroom and also the leaderboard. The scores and rankings are unique to the selected classroom. 
                            You can switch classroom using the drop-down on the top left.
                            <br></br>
                            It also contains two graphs. The one on the left shows you the number of questions that you asked everyday.
                            The graph on the right shows you the type of questions you asked everyday. The type of questions are based on Bloom&apos;s Taxonomy levels.
                            Please refer to the <a className="text-blue-500" href="#taxonomy">Blooms Taxonomy</a> section for more information on the levels.
                        </p>
                        <br></br>
                        <Image src="/information/faculty_dashboard.png" width={600} height={600} alt="facultydashboard"/>
                        <br></br>
                        <hr></hr>
                        <Image src="/information/student_dashboard.png" width={600} height={600} alt="studentdashboard"/>
                        <br></br>
                        <br></br>
                    </section>

                    <section id="leaderboard" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Leaderboard</h5>
                        <p className="pt-2 text-justify">The leaderboard can be found on the dashboard where you can find class-wise leaderboard.
                            It contains both faculties and students. The leaderboard is based on the scores and rankings of the questions asked by the faculties and students.
                        </p>
                        <br></br>
                    </section>

                    <section id="markscheme" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Marking Scheme</h5>
                        <p className="pt-2 text-justify">The marks provided to students are solely based on the classroom faculties or teachers.
                            A generic markscheme is provided below for reference that teacher and faculties can use.
                            <br></br><br></br>&emsp;
                            1. 1st Student in the classroom leaderboard - 4 mark <br></br>&emsp;
                            2. 2nd Student in the classroom leaderboard - 3 mark <br></br>&emsp;
                            3. 3rd Student in the classroom leaderboard - 2 mark <br></br>&emsp;
                            4. 4th-10th Student in the classroom leaderboard - 1 mark <br></br>&emsp;
                            5. Anyone who has achieved the <a className="text-blue-500" href="#scorerank">Legendary Inquirer</a> badge (&gt;7000 points) - 1 mark
                        </p>
                        <br></br>
                    </section>

                    <section id="logout" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Logging Out</h5>
                        <p className="pt-2 text-justify">You can logout using the button on the bottom left in the same place as the login/register button.
                            However, a popup message will appear asking you to confirm your logout.
                            Notice that there is a option to &quot;Also log me out of google&quot; which log you out of all the google accounts in the browser due to how google authentication works.
                            If you are using a public pc such as the pc in your university lab, always use the &quot;Also log me out of google&quot; option to prevent unauthorized access to your account.
                            If you are on your private pc or mobile, you can uncheck the option to stay logged in to your google account.
                            Click on the logout button to confirm.
                        </p>
                        <br></br>
                        <Image src="/information/popup.png" width={400} height={400} alt="logout"/>
                    </section>
                </div>

                <hr className="pb-4"></hr>

                {/* Section 3 */}
                <div className="pl-2 pb-2 mr-5" id="features" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                    <h4 className="font-bold pb-4">Section 3: Features & Mechanisms</h4>

                    <section id="validation" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Question Validation</h5>
                        <p className="pt-2 text-justify">Question validation is done using the AI along with some basic validation like the existence of a question mark, questions starting with proper starting words like &quot;what, why, can, does etc.&quot;.
                            There is also a character limit of 300 characters for a question. It also cannot be too short either. Compound questions (two questions in one question) are also not allowed.
                            Please make sure to follow these rules to get your question validated successfully.
                        </p>
                        <br></br>
                    </section>

                    <section id="anonymity" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Anonymity</h5>
                        <p className="pt-2 text-justify">Beside every question input box, there is either a eye icon or a toggle switch to toggle between anonymous model and visible mode.
                            While anonymous mode is on, your questions will not show who asked it. Both the name and picture will be hidden.
                            However, people can still see the user ID of the person who asked the question which is unique to every user and there is no way to check another user&apos;s ID without their permission.
                            So, feel free to ask any question without the fear of being judged.
                        </p>
                        <br></br>
                    </section>

                    <section id="scorerank" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Scores & Ranking</h5>
                        <p className="pt-2 text-justify">
                            Badges are given to students based on their scores and rankings.
                            The badges also contains color codes, which you can identify by seeing the color of their name text.
                            The badges and color codes are as follows:
                        </p>
                        <br></br>
                        <Image src="/information/rankings.png" width={600} height={600} alt="rankings"/>
                        <br></br>
                        <br></br>
                    </section>

                    <section id="scoremechanism" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Scoring Mechanism</h5>
                        <p className="pt-2 text-justify">
                            The PaltaQ app uses a hybrid scording algorithm.
                            The score is based on the keywords from Bloom&apos;s Taxonomy levels and the AI judgement.
                            Questions containing more keywords from multiple levels of the taxonomy will increase your chances of getting a higher score.
                            However, it will ultimately depend on the quality of your question and how well it is received by the AI algorithm.
                            Palta questions are given bonus points compared to regular questions, which makes it great for earning more points.
                            However, you cannot ask the same question or palta question as your peers so, be creative!
                        </p>
                        <br></br>
                    </section>

                    <section id="likedislike" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Likes & Dislikes</h5>
                        <p className="pt-2 text-justify">
                            You have the option to like and dislike your peer&apos;s questions and palta questions.
                            This is done to show your appreciation for a good question or palta question.
                            The number of likes and dislikes are shown below the question and palta question.
                        </p>
                        <br></br>
                    </section>

                    <section id="aiassistance" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>A.I. Assistance</h5>
                        <p className="pt-2 text-justify">
                            The AI is used to assist in the validation of the questions and palta questions.
                            It is also used to judge the quality of the questions and palta questions.
                            However, another notable feature of the AI is the AI assistance.
                            Notice the improve button below each question and palta question.
                            Clicking on it will give you tips and tricks to improve your question.
                        </p>
                        <br></br>
                    </section>

                    <section id="depth" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>PaltaQ Depth</h5>
                        <p className="pt-2 text-justify">
                            The paltaQ depth is an indicator of how deep the conversation is going.
                            The maximum depth is 5. This is manily to keep track of which palta question is asked on which question.
                        </p>
                        <br></br>
                    </section>

                    <section id="tags" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Bloom&apos;s Taxonomy Tags</h5>
                        <p className="pt-2 text-justify">
                            The bloom&apos;s taxonomy tags help you to keep track of what levels of the taxonomy your questions or your peer&apos;s questions are achieving.
                            <br></br><br></br> RE - Remembering
                            <br></br> UN - Understanding
                            <br></br> AP - Applying
                            <br></br> AN - Analyzing
                            <br></br> EV - Evaluating
                            <br></br> CR - Creating
                        </p>
                        <Image src="/information/tags.png" width={600} height={600} alt="tags"/>
                        <br></br>
                        <p>Please note that the question is a placeholder question and it does not contain the keyword from all the levels of bloom&apos;s taxonomy.</p>
                        <br></br>
                    </section>

                    <section id="logout" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                        <h5>Peer Moderation (Coming Soon)</h5>
                        <p className="pt-2 text-justify">
                            The peer moderation feature will allow students to moderate their peer&apos;s questions and palta questions using the report button.
                            This will help in maintaining the quality of the questions and palta questions and also help in reducing the workload of the AI.
                            Successful moderation will also give you bonus points for contributing to the PaltaQ community.
                        </p>
                    </section>
                </div>

                <hr className="pb-4"></hr>

                {/* FAQ */}
                <div className="pl-2 pb-2 mr-5" id="FAQ" style={{ paddingTop: '150pt', marginTop: '-150pt' }}>
                    <h4 className="font-bold pb-4">Section 4: Frequently Asked Questions</h4>
                    <h5>How do I report bugs?</h5>
                    <p>Please email your bug report to 
                        <a href="mailto:paltaq.seu@gmail.com" className="text-blue-500"> paltaq.seu@gmail.com </a>
                        <br></br>Please mention the bug and if you are using it on a mobile device or a computer. Include a screenshot if possible.
                    </p>
                    <br></br>
                    <h5>Why am I being asked to ask better question?</h5>
                    <p>The AI may have detected that your question is invalid, incorrect or not valid. We recommended checking for typos and grammatical errors in your question.</p>
                    <br></br>
                    <h5>How do I improve my scores?</h5>
                    <p>The score is based on keywords from bloom&apos;s taxonomy levels and AI judgement. Having keywords from multiple levels of the taxonomy will increase your chances of getting a higher score.
                        However, it will ultimately depend on the quality of your question and how well it is received by the AI algorithm.
                    </p>
                    <br></br>
                    <h5>Will PaltaQ affect my grades?</h5>
                    <p>This completely depends on your teacher or faculty. You maybe given additional marks for good performance in PaltaQ. Please refer to the 
                        <a href="#markscheme" className="text-blue-500"> marking scheme</a> section for additional information.
                        Please note that PaltaQ marks will not significantly affect your grades and the marks awarded is completely upto to the teachers and faculties.</p>
                    <br></br>
                    <h5>Why did PaltaQ log me out of google?</h5>
                    <p>There are two options when logging out.
                        If the &quot;Also log me out of google&quot; is selected, it will log you out of all your google account due to how google authentication works.
                        It is recommended to only select this option if you are using a public computer (for example, in your university lab). Please refer to the
                        <a href="#logout" className="text-blue-500"> logout </a> section for further information. 
                    </p>
                    <br></br>
                    <h5>Can I use PaltaQ outside of my classroom?</h5>
                    <p>Absolutely! You are free to use the app whenever and wherever you want as long as you do not misuse it.</p>
                </div>
                <div className="mb-6 mt-3 pl-2">
                    If you have any suggestions or queries, please contact <a href="mailto:paltaq.seu@gmail.com" className="text-blue-500"> paltaq.seu@gmail.com</a>. 
                     For any collaboration, please contact Prof. Yusuf Mahbubul Islam, Vice Chancellor, South-East University, Bangladesh.
                    <hr></hr>
                </div>
            </div>
        </div>
    )
}