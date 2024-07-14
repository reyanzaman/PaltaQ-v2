"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEye, faEyeSlash, faE } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';
import GeneratedResponse from '@/app/components/generatedResponse';

export default function QuestionBox({ onQuestionSubmitted }: { onQuestionSubmitted: any }) {
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [response, setResponse] = useState(null);
  const [visibility, setVisibility] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');

  const toggleVisibility = (state: boolean) => {
    setVisibility(state);
  }

  useEffect(() => {
  }, [question]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Handle validation  
    if (question.length < 10) {
      toast.error('Question too short!');
      return;
    } else if (question.length > 350) {
      toast.error('Question too long!');
      return;
    }

    // Show loading toast
    const loadingToastId = toast.loading('Submitting your question...');

    try {
      const response = await fetch('/api/submitGenQuestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question, category: QuestionCategory.General, anonymity: isAnonymous }),
      });

      const responseData = await response.json();
      setResponse(responseData.improvement_suggestion);
      setLastQuestion(question);

      if (response.ok) {
        // Handle successful submission
        setVisibility(true);
        setQuestion('');

        const responseText = responseData.message;
        const updateText = responseText.split('|')[1];
        const mainText = responseText.split('|')[0];

        if (updateText && updateText !== "Rank unchanged") {
          toast.dark(updateText);
        }

        toast.update(loadingToastId, {
          render: mainText,
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });

        // Call the parent component's callback
        if (onQuestionSubmitted) {
          onQuestionSubmitted();
        }
      } else {
        // Handle error
        if (responseData.improvement_suggestion) {setVisibility(true)};
        console.error('Failed to submit question (Frontend)');
        toast.update(loadingToastId, {
          render: responseData.message || 'Question submission failed (Frontend)',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      // Handle fetch error
      console.error('Error occurred during submission (Frontend):', error);
      toast.update(loadingToastId, {
        render: 'Submission failed. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const toggleAnonymity: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setIsAnonymous(!isAnonymous);
  };

  return (
    <form className="lg:w-[100%] w-[93%] mx-auto" onSubmit={handleSubmit}>
      <div className="mb-4">
        <textarea
          id="questionMain"
          className="form-control pr-5o5 resize-none py-3 pl-3"
          style={{ height: '6em' }}
          placeholder="Throw a question to your peers!"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
          }}
        />
        <div className='flex flex-row float-end -translate-y-[3.7em] -translate-x-6 scale-[1.4]'>
          <button
            type="button"
            onClick={toggleAnonymity}
            className=""
          >
            <FontAwesomeIcon
              icon={isAnonymous ? faEyeSlash : faEye}
              className={`w-[1.5rem] ${isAnonymous ? 'text-rose-700' : 'text-zinc-500'} mr-1`}
            />
          </button>

          <button
            type="submit"
            className=""
          >
            <FontAwesomeIcon
              icon={faPaperPlane}
              className="w-[1.5rem] text-[#31344b]"
            />
          </button>
        </div>
      </div>

      <GeneratedResponse response={response} visibility={visibility} lastQuestion={lastQuestion} toggleVisibility={toggleVisibility}/>
    </form>
  );
}
