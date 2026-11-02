import React, { useState, useEffect } from 'react';
import { GameType, UserStats } from './types';
import { Header } from './components/Header';
import { GameSelector } from './components/GameSelector';
import { MemoryGame } from './components/MemoryGame';
import { CrosswordGame } from './components/CrosswordGame';
import { MatchMeaningGame } from './components/MatchMeaningGame';
import { MatchOppositesGame } from './components/MatchOppositesGame';
import { MissingLetterGame } from './components/MissingLetterGame';
import { MissingWordAyahGame } from './components/MissingWordAyahGame';
import { SurahDictionaryModal } from './components/SurahDictionaryModal';
import { CelebrationModal } from './components/CelebrationModal';
import { soundManager } from './utils/soundHelper';
import { Sparkles, BookOpen, Heart, Award } from 'lucide-react';

const STORAGE_KEY = 'quran_juz_amma_stats_v1';

const INITIAL_STATS: UserStats = {
  stars: 0,
  score: 0,
  gamesCompleted: {
    memory: 0,
    crossword: 0,
    match_meaning: 0,
    match_opposites: 0,
    missing_letter: 0,
    missing_word_ayah: 0,
  },
  surahBadges: {},
  highScores: {},
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_STATS;
  });

  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [showTashkeel, setShowTashkeel] = useState<boolean>(true);

  // Celebration modal state
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    score: number;
    stars: number;
    gameTitle: string;
  }>({
    isOpen: false,
    score: 0,
    stars: 0,
    gameTitle: '',
  });

  // Persist stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  const handleGameComplete = (scoreEarned: number, starsEarned: number) => {
    if (!activeGame) return;

    setStats((prev) => ({
      ...prev,
      score: prev.score + scoreEarned,
      stars: prev.stars + starsEarned,
      gamesCompleted: {
        ...prev.gamesCompleted,
        [activeGame]: (prev.gamesCompleted[activeGame] || 0) + 1,
      },
    }));

    const titles: Record<GameType, string> = {
      memory: 'كروت الذاكرة القرآنية',
      crossword: 'الكلمات المتقاطعة',
      match_meaning: 'توصيل المفردات بالمعنى',
      match_opposites: 'الكلمة والنظير والمضاد',
      missing_letter: 'الحرف الناقص في الكلمة',
      missing_word_ayah: 'الكلمة الناقصة في الآية',
    };

    setCelebrationData({
      isOpen: true,
      score: scoreEarned,
      stars: starsEarned,
      gameTitle: titles[activeGame] || '',
    });
  };

  return (
    <div className="min-h-screen bg-islamic-pattern flex flex-col justify-between text-slate-800 antialiased selection:bg-emerald-200 selection:text-emerald-950 font-sans">
      
      {/* App Header */}
      <Header
        score={stats.score}
        stars={stats.stars}
        activeGame={activeGame}
        onSelectGame={(g) => setActiveGame(g as GameType | null)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(soundManager.getMuted())}
        showTashkeel={showTashkeel}
        onToggleTashkeel={() => setShowTashkeel((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {!activeGame && (
          <GameSelector
            onSelectGame={(game) => setActiveGame(game)}
            gameStats={stats.gamesCompleted}
          />
        )}

        {activeGame === 'memory' && (
          <MemoryGame
            onGameComplete={handleGameComplete}
            onBack={() => setActiveGame(null)}
            showTashkeel={showTashkeel}
          />
        )}

        {activeGame === 'crossword' && (
          <CrosswordGame
            onGameComplete={handleGameComplete}
            onBack={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'match_meaning' && (
          <MatchMeaningGame
            onGameComplete={handleGameComplete}
            onBack={() => setActiveGame(null)}
            showTashkeel={showTashkeel}
          />
        )}

        {activeGame === 'match_opposites' && (
          <MatchOppositesGame
            onGameComplete={handleGameComplete}
            onBack={() => setActiveGame(null)}
            showTashkeel={showTashkeel}
          />
        )}

        {activeGame === 'missing_letter' && (
          <MissingLetterGame
            onGameComplete={handleGameComplete}
            onBack={() => setActiveGame(null)}
            showTashkeel={showTashkeel}
          />
        )}

        {activeGame === 'missing_word_ayah' && (
          <MissingWordAyahGame
            onGameComplete={handleGameComplete}
            onBack={() => setActiveGame(null)}
            showTashkeel={showTashkeel}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-slate-900 text-slate-400 border-t border-slate-800 text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-quran text-amber-300 font-bold text-base">جزء عمّ المبارك</span>
            <span>•</span>
            <span>تطبيق تعليمي تفاعلي لقصار السور والمفردات القرآنية</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsDictionaryOpen(true)}
              className="text-amber-300 hover:text-amber-200 underline underline-offset-4"
            >
              فتح معجم الكلمات
            </button>
            <span>•</span>
            <span>مناسب للمبتدئين والأطفال والناشئة</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SurahDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        showTashkeel={showTashkeel}
      />

      <CelebrationModal
        isOpen={celebrationData.isOpen}
        scoreEarned={celebrationData.score}
        starsEarned={celebrationData.stars}
        gameTitle={celebrationData.gameTitle}
        onPlayAgain={() => {
          setCelebrationData((prev) => ({ ...prev, isOpen: false }));
        }}
        onBackToMenu={() => {
          setCelebrationData((prev) => ({ ...prev, isOpen: false }));
          setActiveGame(null);
        }}
      />

    </div>
  );
}
