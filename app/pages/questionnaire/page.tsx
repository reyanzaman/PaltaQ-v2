"use client";

import { nunito } from "@/app/ui/fonts";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PreQuestionnaire from "@/app/components/preQuestionnaire";
import PostQuestionnaire from "@/app/components/postQuestionnaire";

//@ts-ignore
export default function Questionnaire(props) {

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

    useEffect(() => {
        document.title = "Questionnaire";
    }, []);

return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={`${nunito.className} antialiased flex flex-col lg:pl-[8em]`}>
                <div className="pl-3 pr-3">
                    <div className="w-full pt-4 text-left mx-auto">
                        <h1>PaltaQ {type == 'pre' ? 'Pre-Questionnaire' : 'Post-Questionnaire'}</h1>
                        <h5><b>Classroom: </b>{className}</h5>
                        <hr className="border-b-2 border-gray-500"></hr>
                        <p>Please take some time to fill up this questionnaire.</p>
                        <p>The purpose of this form is to gauge your motivation and interest towards study and being creative.</p>
                        <p className="pt-3"><b className="text-rose-800">Note: This questionnaire will not affect your grades! So, please be honest in your responses.</b></p>

                        <div>
                            {type === 'pre' ? (
                                <PreQuestionnaire ceid={classId} uid={userId}/>
                            ) : (
                                <PostQuestionnaire ceid={classId} uid={userId}/>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}