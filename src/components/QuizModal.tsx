import React, { useState } from "react";
import {
  HelpCircle,
  X,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";
import { QUIZ_QUESTIONS } from "../data/quizzesData";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXp: (amount: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onRewardXp }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);

    if (selectedOption === currentQ.correctIndex) {
      setScore((s) => s + 1);
      onRewardXp(50);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-stone-900">TerrafEK Interactive Concept Quiz</h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Question {currentIdx + 1} of {QUIZ_QUESTIONS.length} • Category: {currentQ.category}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!quizCompleted ? (
          <div className="p-6 space-y-4 text-xs">
            {/* Scenario */}
            {currentQ.scenario && (
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 italic font-serif text-[12.5px]">
                {currentQ.scenario}
              </div>
            )}

            {/* Question Title */}
            <h4 className="text-sm font-serif font-bold text-stone-900 leading-relaxed">{currentQ.question}</h4>

            {/* Optional Code Snippet */}
            {currentQ.codeSnippet && (
              <div className="bg-[#FDFCFA] border border-stone-200 rounded-xl p-3 font-mono text-[11px] text-stone-800">
                <pre>{currentQ.codeSnippet}</pre>
              </div>
            )}

            {/* Options */}
            <div className="space-y-2 pt-1">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = "bg-white border-stone-200 hover:border-stone-400 text-stone-800 shadow-xs";

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-stone-100 border-stone-900 text-stone-900 ring-1 ring-stone-900";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswerSubmitted}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isAnswerSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after submit */}
            {isAnswerSubmitted && (
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 leading-relaxed font-sans text-xs">
                <strong className="text-stone-900 font-serif block mb-1">Architect Explanation:</strong>
                {currentQ.explanation}
              </div>
            )}
          </div>
        ) : (
          /* Quiz Results View */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">Quiz Completed!</h3>
            <p className="text-xs text-stone-500 font-sans">
              You scored <span className="text-emerald-700 font-bold font-mono">{score}</span> out of{" "}
              <span className="font-bold font-mono text-stone-900">{QUIZ_QUESTIONS.length}</span> questions correctly.
            </p>
            <div className="pt-4 flex items-center justify-center space-x-3">
              <button
                onClick={handleRestart}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Back to Labs
              </button>
            </div>
          </div>
        )}

        {/* Footer actions */}
        {!quizCompleted && (
          <div className="p-4 bg-[#FAFAFA] border-t border-stone-200 flex items-center justify-between">
            <div className="text-[11px] text-stone-500 font-sans">
              Score: <span className="text-emerald-700 font-mono font-bold">{score}</span> pts
            </div>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-40 transition-all shadow-xs"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1 transition-all shadow-xs"
              >
                <span>{currentIdx + 1 < QUIZ_QUESTIONS.length ? "Next Question" : "Finish Quiz"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
