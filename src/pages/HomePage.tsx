import { useState, useRef } from 'react';
import { Brain, Heart, Users, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { View, TestConfig } from '@/types';

const TEST_CONFIGS: TestConfig[] = [
  {
    type: 'iq',
    name: 'IQ Test',
    description: 'Measures logical reasoning, pattern recognition, spatial awareness, mathematical ability, and verbal comprehension.',
    duration: 1500,
    questionCount: 30,
    accentColor: '#7209B7',
    categories: ['Logical Reasoning', 'Pattern Recognition', 'Spatial Awareness', 'Mathematical Ability', 'Verbal Comprehension'],
  },
  {
    type: 'eq',
    name: 'EQ Test',
    description: 'Assesses your ability to recognize, understand, and manage emotions in yourself and others.',
    duration: 1200,
    questionCount: 30,
    accentColor: '#B5179E',
    categories: ['Self-Awareness', 'Emotional Regulation', 'Empathy', 'Social Skills'],
  },
  {
    type: 'sq',
    name: 'SQ Test',
    description: 'Evaluates social intelligence, communication skills, relationship management, and social adaptability.',
    duration: 1200,
    questionCount: 30,
    accentColor: '#F72585',
    categories: ['Social Awareness', 'Communication', 'Relationship Management', 'Social Adaptability'],
  },
];

const STEPS = [
  { num: '01', title: 'Enter Name', desc: 'No account needed. Just type your name and pick a test.' },
  { num: '02', title: 'Answer 30 Questions', desc: 'Randomly selected from our 2000+ question bank.' },
  { num: '03', title: 'Tracked \u0026 Timed', desc: 'Every second counts. Tab switching triggers a warning.' },
  { num: '04', title: 'Get Results', desc: 'Detailed breakdown of your cognitive profile.' },
];

interface HomePageProps {
  onStartTest: (name: string, testType: 'iq' | 'eq' | 'sq') => void;
  onNavigate: (view: View) => void;
}

export default function HomePage({ onStartTest }: HomePageProps) {
  const [name, setName] = useState('');
  const [selectedTest, setSelectedTest] = useState<'iq' | 'eq' | 'sq' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' });
      gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.from('.name-input', { opacity: 0, y: 20, duration: 0.8, delay: 0.4, ease: 'power3.out' });
      gsap.from('.test-card', { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'power3.out' });
      gsap.from('.start-btn', { opacity: 0, y: 20, duration: 0.8, delay: 0.9, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

  const handleStart = () => {
    if (name.trim() && selectedTest) {
      onStartTest(name.trim(), selectedTest);
    }
  };

  const getTestIcon = (type: 'iq' | 'eq' | 'sq', className: string) => {
    switch (type) {
      case 'iq': return <Brain className={className} />;
      case 'eq': return <Heart className={className} />;
      case 'sq': return <Users className={className} />;
    }
  };

  const getCardClass = (type: 'iq' | 'eq' | 'sq') => {
    const base = 'test-card glass-card rounded-3xl p-6 cursor-pointer transition-all duration-300 flex flex-col items-center text-center';
    const selected = selectedTest === type;
    if (type === 'iq') {
      return `${base} test-card-iq ${selected ? 'border-[#7209B7] bg-[rgba(114,9,183,0.08)]' : ''}`;
    }
    if (type === 'eq') {
      return `${base} test-card-eq ${selected ? 'border-[#B5179E] bg-[rgba(181,23,158,0.08)]' : ''}`;
    }
    return `${base} test-card-sq ${selected ? 'border-[#F72585] bg-[rgba(247,37,133,0.08)]' : ''}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `~${mins} min`;
  };

  return (
    <div ref={containerRef} className="min-h-screen geometric-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 glass-nav z-50 flex items-center justify-between px-6 md:px-12">
        <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk', color: '#EDF6F9' }}>
          CogniTest
        </span>
        <div className="flex items-center gap-6">
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium transition-colors hover:text-[#EDF6F9]" style={{ color: '#B8D0EB' }}>
            How It Works
          </button>
          <button onClick={() => document.getElementById('test-details')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium transition-colors hover:text-[#EDF6F9]" style={{ color: '#B8D0EB' }}>
            About
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6" style={{ paddingTop: '80px' }}>
        <h1 className="hero-title text-center font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(36px, 5vw, 64px)', color: '#EDF6F9', letterSpacing: '-0.02em' }}>
          Unlock Your Mind
        </h1>
        <p className="hero-subtitle text-center mt-5 max-w-lg" style={{ color: '#5C677D', fontSize: '18px', lineHeight: 1.6 }}>
          Discover your intelligence, emotional awareness, and social intelligence through scientifically-crafted assessments.
        </p>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter your name to begin"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="name-input mt-10 h-14 w-full max-w-md rounded-2xl px-6 text-base font-medium outline-none transition-all duration-300"
          style={{
            background: 'rgba(237, 246, 249, 0.05)',
            border: '1px solid rgba(184, 208, 235, 0.2)',
            color: '#EDF6F9',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#7209B7';
            e.target.style.boxShadow = '0 0 0 3px rgba(114, 9, 183, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(184, 208, 235, 0.2)';
            e.target.style.boxShadow = 'none';
          }}
        />

        {/* Test Selection Cards */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 w-full max-w-3xl">
          {TEST_CONFIGS.map((config) => (
            <div
              key={config.type}
              className={getCardClass(config.type)}
              onClick={() => setSelectedTest(config.type)}
              style={{ width: '200px', minHeight: '240px' }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: `${config.accentColor}15` }}>
                {getTestIcon(config.type, 'w-10 h-10')}
              </div>
              <h3 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk', color: '#EDF6F9' }}>
                {config.name}
              </h3>
              <p className="text-xs mt-2" style={{ color: '#5C677D' }}>
                {formatDuration(config.duration)}
              </p>
              <p className="text-xs mt-3 leading-relaxed" style={{ color: '#5C677D' }}>
                {config.description}
              </p>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!name.trim() || !selectedTest}
          className="start-btn mt-10 h-14 px-12 rounded-xl text-base font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: '#7209B7',
            color: '#EDF6F9',
            boxShadow: name.trim() && selectedTest ? '0 8px 32px rgba(114, 9, 183, 0.3)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (name.trim() && selectedTest) {
              e.currentTarget.style.background = '#8A2BE2';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#7209B7';
          }}
        >
          Begin Assessment
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-pulse-slow">
          <ChevronDown className="w-6 h-6" style={{ color: '#5C677D' }} />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 md:py-32 px-6" style={{ background: '#03045E' }}>
        <h2 className="text-center font-bold" style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(28px, 3vw, 40px)', color: '#EDF6F9' }}>
          How It Works
        </h2>
        <p className="text-center mt-3" style={{ color: '#5C677D', fontSize: '16px' }}>
          A rigorous, fair, and transparent assessment process
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mt-16">
          {STEPS.map((step) => (
            <div key={step.num} className="glass-card rounded-2xl p-8">
              <span className="text-5xl font-bold" style={{ fontFamily: 'Space Grotesk', color: 'rgba(114, 9, 183, 0.2)' }}>
                {step.num}
              </span>
              <h4 className="mt-4 text-base font-semibold" style={{ color: '#EDF6F9' }}>
                {step.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#5C677D' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Test Details Section */}
      <section id="test-details" className="relative z-10 py-24 md:py-32 px-6">
        <h2 className="text-center font-bold" style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(28px, 3vw, 40px)', color: '#EDF6F9' }}>
          The Three Pillars of Intelligence
        </h2>

        <div className="flex flex-col gap-10 max-w-3xl mx-auto mt-16">
          {TEST_CONFIGS.map((config) => (
            <div key={config.type} className="glass-card rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start gap-8">
              <div className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${config.accentColor}15` }}>
                {getTestIcon(config.type, 'w-12 h-12')}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk', color: '#EDF6F9' }}>
                  {config.name} — {config.type.toUpperCase()}
                </h3>
                <p className="mt-3 text-sm leading-relaxed max-w-lg" style={{ color: '#5C677D' }}>
                  {config.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="px-5 py-2 rounded-full text-xs font-medium" style={{ background: 'rgba(237,246,249,0.04)', border: '1px solid rgba(184,208,235,0.1)', color: '#EDF6F9' }}>
                    {config.questionCount} Questions
                  </span>
                  <span className="px-5 py-2 rounded-full text-xs font-medium" style={{ background: 'rgba(237,246,249,0.04)', border: '1px solid rgba(184,208,235,0.1)', color: '#EDF6F9' }}>
                    {formatDuration(config.duration)}
                  </span>
                  <span className="px-5 py-2 rounded-full text-xs font-medium" style={{ background: 'rgba(237,246,249,0.04)', border: '1px solid rgba(184,208,235,0.1)', color: '#EDF6F9' }}>
                    {config.categories.length} Categories
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 text-center" style={{ background: '#03045E' }}>
        <span className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk', color: '#EDF6F9' }}>
          CogniTest
        </span>
        <p className="mt-2 text-xs" style={{ color: '#5C677D' }}>
          Unlock your cognitive potential
        </p>
        <p className="mt-6 text-xs" style={{ color: '#3A506B' }}>
          &copy; 2025 CogniTest. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
