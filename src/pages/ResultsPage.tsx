import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { TestResult } from '@/types';

interface ResultsPageProps {
  result: TestResult;
  onRetake: () => void;
  onHome: () => void;
}

export default function ResultsPage({ result, onRetake, onHome }: ResultsPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreCircleRef = useRef<HTMLDivElement>(null);
  const scoreNumberRef = useRef<HTMLSpanElement>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Exceptional', color: '#F72585', desc: 'Outstanding cognitive performance' };
    if (score >= 60) return { label: 'Above Average', color: '#7209B7', desc: 'Strong cognitive abilities' };
    if (score >= 40) return { label: 'Average', color: '#B8D0EB', desc: 'Typical cognitive performance' };
    return { label: 'Below Average', color: '#5C677D', desc: 'Room for improvement' };
  };

  const scoreInfo = getScoreLabel(result.score);
  const accuracy = Math.round((result.correctCount / result.totalQuestions) * 100);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Score circle animation
  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Animate the score number
      const scoreObj = { value: 0 };
      gsap.to(scoreObj, {
        value: result.score,
        duration: 1.5,
        ease: 'power3.out',
        onUpdate: () => {
          setAnimatedScore(Math.round(scoreObj.value));
        },
      });

      // Animate the conic gradient
      if (scoreCircleRef.current) {
        gsap.fromTo(
          scoreCircleRef.current,
          { '--progress': '0%' },
          { '--progress': `${result.score}%`, duration: 1.5, ease: 'power3.out' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  // Entrance animations
  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from('.result-header', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
      gsap.from('.score-card', { opacity: 0, y: 40, duration: 1, delay: 0.3, ease: 'power3.out' });
      gsap.from('.category-bar', { opacity: 0, x: -20, duration: 0.5, stagger: 0.1, delay: 0.6, ease: 'power3.out' });
      gsap.from('.action-btns', { opacity: 0, y: 20, duration: 0.6, delay: 1, ease: 'power3.out' });
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen geometric-bg">
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="result-header text-center">
          <h1 className="font-bold" style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(28px, 3vw, 40px)', color: '#EDF6F9' }}>
            Great work, {result.userName}!
          </h1>
          <p className="mt-2 text-base" style={{ color: '#5C677D' }}>
            Here is your detailed cognitive assessment
          </p>
        </div>

        {/* Score Card */}
        <div className="score-card glass-card rounded-[28px] p-8 md:p-12 mt-12">
          {/* Score Circle */}
          <div className="flex justify-center">
            <div
              ref={scoreCircleRef}
              className="w-40 h-40 rounded-full flex flex-col items-center justify-center relative"
              style={{
                background: '#1D1E2C',
                backgroundImage: `conic-gradient(from 0deg, #7209B7 ${animatedScore}%, transparent ${animatedScore}%)`,
                padding: '4px',
              }}
            >
              <div className="w-full h-full rounded-full flex flex-col items-center justify-center" style={{ background: '#1D1E2C' }}>
                <span
                  ref={scoreNumberRef}
                  className="text-5xl font-bold"
                  style={{ fontFamily: 'Space Grotesk', color: '#EDF6F9' }}
                >
                  {animatedScore}
                </span>
                <span className="text-xs mt-1" style={{ color: '#5C677D' }}>
                  Your Score
                </span>
              </div>
            </div>
          </div>

          {/* Score Interpretation */}
          <div className="text-center mt-6">
            <h3 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk', color: scoreInfo.color }}>
              {scoreInfo.label}
            </h3>
            <p className="mt-2 text-sm" style={{ color: '#5C677D' }}>
              {scoreInfo.desc}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mt-10">
            <div className="text-center">
              <p className="text-2xl font-mono" style={{ fontFamily: 'JetBrains Mono', color: '#EDF6F9' }}>
                {result.correctCount}/{result.totalQuestions}
              </p>
              <p className="text-xs mt-1 uppercase" style={{ color: '#5C677D' }}>Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-mono" style={{ fontFamily: 'JetBrains Mono', color: '#EDF6F9' }}>
                {accuracy}%
              </p>
              <p className="text-xs mt-1 uppercase" style={{ color: '#5C677D' }}>Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-mono" style={{ fontFamily: 'JetBrains Mono', color: '#EDF6F9' }}>
                {formatTime(result.elapsedTime)}
              </p>
              <p className="text-xs mt-1 uppercase" style={{ color: '#5C677D' }}>Time</p>
            </div>
          </div>

          {result.tabSwitches > 0 && (
            <div className="mt-6 text-center">
              <p className="text-xs font-mono" style={{ fontFamily: 'JetBrains Mono', color: '#B5179E' }}>
                Tab switches detected: {result.tabSwitches}
              </p>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="mt-16">
          <h2 className="text-center font-bold text-2xl" style={{ fontFamily: 'Space Grotesk', color: '#EDF6F9' }}>
            Category Breakdown
          </h2>

          <div className="flex flex-col gap-5 mt-8">
            {result.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="category-bar">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: '#EDF6F9' }}>
                    {cat.category}
                  </span>
                  <span className="text-sm" style={{ color: '#5C677D' }}>
                    {cat.correct}/{cat.total}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(184, 208, 235, 0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${cat.percentage}%`,
                      background: 'linear-gradient(90deg, #7209B7, #B5179E)',
                    }}
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs font-mono" style={{ fontFamily: 'JetBrains Mono', color: '#5C677D' }}>
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="action-btns flex flex-wrap justify-center gap-4 mt-16">
          <button
            onClick={onRetake}
            className="h-13 px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-300"
            style={{
              border: '1px solid #7209B7',
              background: 'transparent',
              color: '#7209B7',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(114, 9, 183, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Retake Test
          </button>
          <button
            onClick={onHome}
            className="h-13 px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-300"
            style={{
              background: '#7209B7',
              color: '#EDF6F9',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#8A2BE2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#7209B7';
            }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
