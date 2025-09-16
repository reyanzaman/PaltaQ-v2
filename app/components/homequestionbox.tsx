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
    <form
      className="lg:w-[100%] w-[93%] mx-auto relative"
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <div className="relative">
          <textarea
            id="questionMain"
            className="w-full resize-none rounded-2xl px-5 py-4 lg:text-base text-sm text-zinc-700 placeholder-zinc-400 bg-[#e6e7ee] shadow-[inset_4px_4px_6px_#c5c6cb,inset_-4px_-4px_6px_#ffffff] focus:outline-none focus:shadow-[inset_2px_2px_4px_#c5c6cb,inset_-2px_-2px_4px_#ffffff] lg:pr-[7rem] lg:pb-[3.75rem] overflow-y-auto break-words max-h-[50vh]"
            style={{ height: '6.5em' }}
            placeholder="Throw a question to your peers!"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {/* Desktop: floating icon buttons inside textarea */}
          <div className="absolute bottom-[2.5em] right-[2.5em] scale-[1.5] hidden lg:flex items-center gap-1 z-10">
            {session?.user?.email && (
              <button
                type="button"
                onClick={toggleAnonymity}
                aria-label={isAnonymous ? 'Disable anonymity' : 'Enable anonymity'}
                className="p-2 rounded-full"
              >
                <FontAwesomeIcon
                  icon={isAnonymous ? faEyeSlash : faEye}
                  className={`w-4 h-4 ${isAnonymous ? 'text-rose-700' : 'text-zinc-600'}`}
                />
              </button>
            )}

            <button
              type="submit"
              aria-label="Submit question"
              className="p-2 rounded-full"
            >
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="w-4 h-4 text-[#31344b]"
              />
            </button>
          </div>
        </div>

        {/* Mobile buttons below textarea */}
        <div className="mt-4 flex gap-3 lg:hidden px-1">
          {session?.user?.email && (
            <button
              type="button"
              onClick={toggleAnonymity}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition
                  ${isAnonymous
                  ? 'bg-[#e6e7ee] shadow-[inset_3px_3px_5px_#c5c6cb,inset_-3px_-3px_5px_#ffffff] text-rose-700'
                  : 'bg-[#e6e7ee] shadow-[3px_3px_5px_#c5c6cb,-3px_-3px_5px_#ffffff] text-zinc-600'
                }`}
            >
              <FontAwesomeIcon
                icon={isAnonymous ? faEyeSlash : faEye}
                className={`w-4 ${isAnonymous ? 'text-rose-700' : 'text-zinc-600'}`}
              />
              <span>{isAnonymous ? 'Anonymous' : 'Anonymous'}</span>
            </button>
          )}

          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#31344b] bg-[#e6e7ee] shadow-[3px_3px_5px_#c5c6cb,-3px_-3px_5px_#ffffff] active:shadow-[inset_3px_3px_5px_#c5c6cb,inset_-3px_-3px_5px_#ffffff] transition"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="w-4" />
            <span>Submit</span>
          </button>
        </div>
      </div>
    </form>
  );
}
