import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@/types';

let cachedQuestions: Question[] | null = null;

export function useQuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      if (cachedQuestions) {
        setQuestions(cachedQuestions);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/questions.json');
        if (!response.ok) {
          throw new Error('Failed to load question bank');
        }
        const data: Question[] = await response.json();
        cachedQuestions = data;
        setQuestions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const selectQuestions = useCallback(
    (type: 'iq' | 'eq' | 'sq', count: number = 30): Question[] => {
      const filtered = questions.filter((q) => q.type === type);

      // Group by difficulty
      const easy = filtered.filter((q) => q.difficulty === 'easy');
      const medium = filtered.filter((q) => q.difficulty === 'medium');
      const hard = filtered.filter((q) => q.difficulty === 'hard');

      // Stratified sampling: 30% easy, 40% medium, 30% hard
      const easyCount = Math.round(count * 0.3);
      const mediumCount = Math.round(count * 0.4);
      const hardCount = count - easyCount - mediumCount;

      function shuffle<T>(arr: T[]): T[] {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      }

      const selected = [
        ...shuffle(easy).slice(0, easyCount),
        ...shuffle(medium).slice(0, mediumCount),
        ...shuffle(hard).slice(0, hardCount),
      ];

      // If we don't have enough in a category, fill from others
      if (selected.length < count) {
        const remaining = shuffle(filtered).filter(
          (q) => !selected.some((s) => s.id === q.id)
        );
        selected.push(...remaining.slice(0, count - selected.length));
      }

      // Final shuffle
      return shuffle(selected).slice(0, count);
    },
    [questions]
  );

  return { questions, loading, error, selectQuestions };
}
