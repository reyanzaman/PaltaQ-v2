"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEye, faEyeSlash, faE } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { QuestionCategory } from '@/app/utils/postUtils';
import { useSession } from 'next-auth/react';

export default function QuestionBox({ onQuestionSubmitted }: { onQuestionSubmitted: any }) {
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: session } = useSession();

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

      if (response.ok) {
        // Handle successful submission
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
        console.error('Failed to submit question (Frontend)');
        toast.update(loadingToastId, {
          render: responseData.message || responseData.error || 'Question submission failed (Frontend)',
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
    <form className="lg:w-[100%] w-[93%] mx-auto relative" onSubmit={handleSubmit}>
      <div className="mb-4 relative">
        <textarea
          id="questionMain"
          className="form-control pr-5o5 resize-none py-3 pl-3 w-full"
          style={{ height: '6em' }}
          placeholder="Throw a question to your peers!"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
          }}
        />
        <div className='absolute bottom-[2.3em] right-[1.6em] scale-[1.3]'>
          {session?.user?.email && (
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
          )}

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
    </form>
  );
}
