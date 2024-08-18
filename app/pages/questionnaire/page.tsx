"use client";

import { nunito } from "@/app/ui/fonts";
import React, { Suspense, useEffect } from 'react';
import QuestionnaireForm from "@/app/components/questionnaire";

//@ts-ignore
export default function Questionnaire(props) {

    useEffect(() => {
        document.title = "Questionnaire";
    }, []);

return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className={`${nunito.className} antialiased flex flex-col lg:pl-[8em]`}>
                <div className="pl-3 pr-3">
                    <div className="w-full pt-4 text-left mx-auto">
                        <div>
                            <QuestionnaireForm/>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}