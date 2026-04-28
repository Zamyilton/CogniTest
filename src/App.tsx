import { useState, useCallback } from 'react';
import HomePage from '@/pages/HomePage';
import TestPage from '@/pages/TestPage';
import ResultsPage from '@/pages/ResultsPage';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import type { View, Question, TestResult, CategoryScore } from '@/types';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [userName, setUserName] = useState('');
  const [testType, setTestType] = useState<'iq' | 'eq' | 'sq'>('iq');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { selectQuestions, loading } = useQuestionBank();

  const calculateResults = useCallback(
    (
      questions: Question[],
      answers: Record<number, number>,
      elapsedTime: number,
      tabSwitches: number,
      name: string,
      type: 'iq' | 'eq' | 'sq'
    ): TestResult => {
      let correctCount = 0;
      const categoryMap: Record<string, { correct: number; total: number }> = {};

      questions.forEach((q, idx) => {
        if (!categoryMap[q.category]) {
          categoryMap[q.category] = { correct: 0, total: 0 };
        }
        categoryMap[q.category].total += 1;

        if (answers[idx] === q.correct) {
          correctCount += 1;
          categoryMap[q.category].correct += 1;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);

      const categoryBreakdown: CategoryScore[] = Object.entries(categoryMap).map(
        ([category, data]) => ({
          category,
          correct: data.correct,
          total: data.total,
          percentage: Math.round((data.correct / data.total) * 100),
        })
      );

      return {
        userName: name,
        testType: type,
        score,
        correctCount,
        totalQuestions: questions.length,
        elapsedTime,
        tabSwitches,
        categoryBreakdown,
      };
    },
    []
  );

  const handleStartTest = useCallback(
    (name: string, type: 'iq' | 'eq' | 'sq') => {
      const questions = selectQuestions(type, 30);
      setUserName(name);
      setTestType(type);
      setSelectedQuestions(questions);
      setCurrentView('test');
    },
    [selectQuestions]
  );

  const handleTestComplete = useCallback(
    (answers: Record<number, number>, elapsedTime: number, tabSwitches: number) => {
      const result = calculateResults(
        selectedQuestions,
        answers,
        elapsedTime,
        tabSwitches,
        userName,
        testType
      );
      setTestResult(result);
      setCurrentView('results');
    },
    [selectedQuestions, userName, testType, calculateResults]
  );

  const handleRetake = useCallback(() => {
    const questions = selectQuestions(testType, 30);
    setSelectedQuestions(questions);
    setCurrentView('test');
  }, [testType, selectQuestions]);

  const handleHome = useCallback(() => {
    setCurrentView('home');
    setUserName('');
    setTestType('iq');
    setSelectedQuestions([]);
    setTestResult(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1D1E2C' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#7209B7', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-base" style={{ color: '#5C677D' }}>Loading question bank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transition-opacity duration-300" style={{ opacity: 1 }}>
      {currentView === 'home' && (
        <HomePage onStartTest={handleStartTest} onNavigate={setCurrentView} />
      )}
      {currentView === 'test' && (
        <TestPage
          testType={testType}
          questions={selectedQuestions}
          onComplete={handleTestComplete}
        />
      )}
      {currentView === 'results' && testResult && (
        <ResultsPage
          result={testResult}
          onRetake={handleRetake}
          onHome={handleHome}
        />
      )}
    </div>
  );
}
