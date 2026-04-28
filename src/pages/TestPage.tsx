import { useState, useRef, useCallback, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTimer } from '@/hooks/useTimer';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import type { Question, TestConfig } from '@/types';

const TEST_CONFIGS: Record<string, TestConfig> = {
  iq: {
    type: 'iq', name: 'IQ Test', description: '', duration: 1500, questionCount: 30,
    accentColor: '#7209B7', categories: [],
  },
  eq: {
    type: 'eq', name: 'EQ Test', description: '', duration: 1200, questionCount: 30,
    accentColor: '#B5179E', categories: [],
  },
  sq: {
    type: 'sq', name: 'SQ Test', description: '', duration: 1200, questionCount: 30,
    accentColor: '#F72585', categories: [],
  },
};

interface TestPageProps {
  testType: 'iq' | 'eq' | 'sq';
  questions: Question[];
  onComplete: (answers: Record<number, number>, elapsedTime: number, tabSwitches: number) => void;
}

export default function TestPage({ testType, questions, onComplete }: TestPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const config = TEST_CONFIGS[testType];
  const questionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTimeUp = useCallback(() => {
    // Auto-submit when time is up
    handleSubmit();
  }, []);

  const { elapsed, formatted } = useTimer(isPaused, handleTimeUp);

  const handleTabSwitch = useCallback(() => {
    setIsPaused(true);
    setTabSwitchCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        // Auto-submit after 3 tab switches
        setTimeout(() => handleSubmit(), 500);
      }
      return newCount;
    });
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const { resume, getSwitchCount } = useAntiCheat(true, handleTabSwitch, handleResume, 3);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection('next');
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection('prev');
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const finalSwitches = getSwitchCount();
    setTabSwitchCount(finalSwitches);
    setShowComplete(true);
  };

  const handleViewResults = () => {
    onComplete(answers, elapsed, tabSwitchCount);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || showComplete) return;

      if (e.key >= '1' && e.key <= '4') {
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < questions[currentIndex]?.options.length) {
          handleAnswerSelect(optionIndex);
        }
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (answers[currentIndex] !== undefined) {
          if (currentIndex < questions.length - 1) {
            handleNext();
          } else {
            handleSubmit();
          }
        }
      }
      if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        handlePrev();
      }
      if (e.key === 'ArrowRight') {
        if (answers[currentIndex] !== undefined) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, answers, isPaused, showComplete, questions]);

  // Question transition animation
  useGSAP(() => {
    if (questionRef.current) {
      const xOffset = direction === 'next' ? 40 : -40;
      gsap.fromTo(
        questionRef.current,
        { opacity: 0, x: xOffset },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, { dependencies: [currentIndex], scope: containerRef });

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswer = answers[currentIndex] !== undefined;
  const timerWarning = elapsed >= config.duration - 60;
  const timerCritical = elapsed >= config.duration - 30;

  return (
    <div ref={containerRef} className="min-h-screen geometric-bg">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 md:px-8" style={{ background: 'rgba(29, 30, 44, 0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(184, 208, 235, 0.08)' }}>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: config.accentColor }}>
          {config.name}
        </span>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md mx-4 md:mx-8">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(184, 208, 235, 0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7209B7, #B5179E)',
              }}
            />
          </div>
        </div>

        {/* Timer */}
        <span
          className={`font-mono text-lg ${timerCritical ? 'animate-timer-pulse' : ''}`}
          style={{
            fontFamily: 'JetBrains Mono',
            color: timerCritical ? '#B5179E' : timerWarning ? '#B5179E' : '#EDF6F9',
          }}
        >
          {formatted}
        </span>
      </div>

      {/* Question Area */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-28 pb-12">
        <p className="text-sm font-medium mb-8" style={{ color: '#5C677D' }}>
          Question {currentIndex + 1} of {questions.length}
        </p>

        <div ref={questionRef}>
          <h2 className="text-xl md:text-2xl font-medium leading-relaxed mb-12" style={{ color: '#EDF6F9' }}>
            {currentQuestion?.question}
          </h2>

          {/* Answer Options */}
          <div className="flex flex-col gap-3">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = answers[currentIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className="text-left rounded-2xl px-6 py-5 text-base transition-all duration-200 flex items-start gap-4"
                  style={{
                    background: isSelected ? 'rgba(114, 9, 183, 0.1)' : 'rgba(237, 246, 249, 0.03)',
                    border: isSelected ? '1px solid #7209B7' : '1px solid rgba(184, 208, 235, 0.12)',
                    borderLeft: isSelected ? '3px solid #7209B7' : '1px solid rgba(184, 208, 235, 0.12)',
                    color: '#EDF6F9',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(114, 9, 183, 0.5)';
                      e.currentTarget.style.background = 'rgba(114, 9, 183, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(184, 208, 235, 0.12)';
                      e.currentTarget.style.background = 'rgba(237, 246, 249, 0.03)';
                    }
                  }}
                >
                  <span className="font-semibold text-sm mt-0.5 flex-shrink-0" style={{ color: '#7209B7' }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-12">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: currentIndex === 0 ? '#5C677D' : '#EDF6F9' }}
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Previous
            </span>
          </button>

          <button
            onClick={isLastQuestion ? handleSubmit : handleNext}
            disabled={!hasAnswer}
            className="h-13 px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: isLastQuestion ? '#B5179E' : '#7209B7',
              color: '#EDF6F9',
            }}
          >
            <span className="flex items-center gap-2">
              {isLastQuestion ? 'Submit Test' : 'Next Question'}
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>

      {/* Anti-Cheat Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center" style={{ background: 'rgba(3, 4, 94, 0.95)', backdropFilter: 'blur(8px)' }}>
          <AlertTriangle className="w-16 h-16" style={{ color: '#B5179E' }} />
          <h2 className="mt-6 text-3xl font-bold" style={{ fontFamily: 'Space Grotesk', color: '#EDF6F9' }}>
            Test Paused
          </h2>
          <p className="mt-4 text-base text-center max-w-md px-6" style={{ color: '#5C677D' }}>
            You switched away from this tab. For fairness, the test has been paused. Please return to continue.
          </p>
          <p className="mt-6 text-sm font-mono" style={{ fontFamily: 'JetBrains Mono', color: '#B5179E' }}>
            Tab switches: {tabSwitchCount}
          </p>
          {tabSwitchCount >= 3 && (
            <p className="mt-3 text-sm text-center max-w-md px-6" style={{ color: '#F72585' }}>
              Maximum tab switches reached. Your test will be auto-submitted.
            </p>
          )}
          {tabSwitchCount < 3 && (
            <button
              onClick={resume}
              className="mt-10 h-13 px-12 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 hover:opacity-90"
              style={{ background: '#B5179E', color: '#EDF6F9' }}
            >
              Resume Test
            </button>
          )}
        </div>
      )}

      {/* Test Completion Modal */}
      {showComplete && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center" style={{ background: 'rgba(3, 4, 94, 0.9)' }}>
          <CheckCircle className="w-16 h-16" style={{ color: '#F72585' }} />
          <h2 className="mt-6 text-4xl font-bold" style={{ fontFamily: 'Space Grotesk', color: '#EDF6F9' }}>
            Test Complete!
          </h2>
          <p className="mt-4 text-base text-center max-w-md px-6" style={{ color: '#5C677D' }}>
            Your responses have been recorded. Let's see how you performed.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="text-center">
              <p className="text-2xl font-mono" style={{ fontFamily: 'JetBrains Mono', color: '#EDF6F9' }}>
                {Object.keys(answers).length}/{questions.length}
              </p>
              <p className="text-xs mt-1 uppercase" style={{ color: '#5C677D' }}>Questions Answered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-mono" style={{ fontFamily: 'JetBrains Mono', color: '#EDF6F9' }}>
                {formatted}
              </p>
              <p className="text-xs mt-1 uppercase" style={{ color: '#5C677D' }}>Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-mono" style={{ fontFamily: 'JetBrains Mono', color: tabSwitchCount > 0 ? '#B5179E' : '#EDF6F9' }}>
                {tabSwitchCount}
              </p>
              <p className="text-xs mt-1 uppercase" style={{ color: '#5C677D' }}>Tab Switches</p>
            </div>
          </div>

          <button
            onClick={handleViewResults}
            className="mt-10 h-14 px-12 rounded-xl text-base font-semibold transition-all duration-300 hover:opacity-90"
            style={{ background: '#7209B7', color: '#EDF6F9' }}
          >
            View Results
          </button>
        </div>
      )}
    </div>
  );
}
