"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';

export default function QuestionBox({ onQuestionSubmitted }: {onQuestionSubmitted: any}) {
    const [question, setQuestion] = useState('');

    useEffect(() => {
    }, [question]);
  
    const handleSubmit = async (e: any) => {
      e.preventDefault();
      
      // Handle validation  
      if(question.length < 10) {
        toast.error('Question too short!');
        return;
      } else if(question.length > 300) {
        toast.error('Question too long!');
        return;
      }

      const response = await fetch('api/submitGenQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question, category: QuestionCategory.General }),
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
      <form className="w-[90%] mx-auto" onSubmit={handleSubmit}>
        <div className="mb-4">
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
      </form>
    );
  }
  