import React, { useState, useCallback } from 'react';
import { Persona } from './types';
import { PERSONAS } from './constants';
import { generateOptimizedPrompt } from './services/geminiService';
import PersonaCard from './components/PersonaCard';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LockIcon } from './components/icons/LockIcon';

const App: React.FC = () => {
    // Auth state
    const [password, setPassword] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authError, setAuthError] = useState<string>('');
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

    // App state
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
    const [userTask, setUserTask] = useState<string>('');
    const [optimizedPrompt, setOptimizedPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setIsAuthenticating(true);
        
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsAuthenticated(true);
            } else {
                setAuthError(data.message || '인증에 실패했습니다.');
                setPassword('');
            }
        } catch (error) {
            console.error('Login error:', error);
            setAuthError('로그인 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!selectedPersona || !userTask.trim()) {
            setError('페르소나를 선택하고 작업을 설명해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');
        setOptimizedPrompt('');
        setIsCopied(false);

        try {
            const result = await generateOptimizedPrompt(selectedPersona, userTask);
            setOptimizedPrompt(result);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            setError(`프롬프트 생성에 실패했습니다: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPersona, userTask]);

    const handleCopy = () => {
        if (optimizedPrompt) {
            navigator.clipboard.writeText(optimizedPrompt);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleStartOver = () => {
        setSelectedPersona(null);
        setUserTask('');
        setOptimizedPrompt('');
        setError('');
        setIsCopied(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 space-y-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-slate-100">인증 필요</h1>
                            <p className="text-slate-400 mt-2">계속하려면 비밀번호를 입력하세요.</p>
                        </div>
                        
                        <div>
                            <label htmlFor="password-input" className="sr-only">비밀번호</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <LockIcon className="w-5 h-5 text-slate-500" />
                                </span>
                                <input
                                    id="password-input"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 text-slate-200 placeholder-slate-500"
                                    required
                                    disabled={isAuthenticating}
                                    aria-describedby="password-error"
                                />
                            </div>
                            {authError && (
                                <p id="password-error" className="mt-2 text-red-400 text-sm text-center" aria-live="polite">{authError}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className="w-full inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAuthenticating ? '확인 중...' : '로그인'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        에이전트 프롬프트 최적화 도구
                    </h1>
                    <p className="mt-4 text-lg text-slate-400">
                        당신의 아이디어를 강력하고 구조화된 AI 프롬프트로 변환하세요.
                    </p>
                </header>

                <main className="space-y-8">
                    {!optimizedPrompt && !isLoading && (
                         <>
                            {/* Step 1: Select Persona */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-1 text-slate-200">1단계: AI 페르소나 선택</h2>
                                <p className="text-slate-400 mb-4">프롬프트를 최적화할 전문가 페르소나를 선택하세요.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {PERSONAS.map((persona) => (
                                        <PersonaCard
                                            key={persona.id}
                                            persona={persona}
                                            isSelected={selectedPersona?.id === persona.id}
                                            onSelect={() => setSelectedPersona(persona)}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Step 2: Describe Task */}
                            {selectedPersona && (
                                <div className="animate-fade-in">
                                    <h2 className="text-2xl font-semibold mb-1 text-slate-200">2단계: 목표 설명</h2>
                                    <p className="text-slate-400 mb-4">달성하고자 하는 목표를 간단히 설명해주세요.</p>
                                    <textarea
                                        value={userTask}
                                        onChange={(e) => setUserTask(e.target.value)}
                                        placeholder={`예: "새로운 친환경 커피숍을 위한 마케팅 계획을 세워줘."`}
                                        className="w-full h-32 p-4 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 text-slate-200 placeholder-slate-500"
                                        rows={5}
                                    />
                                </div>
                            )}

                            {/* Step 3: Generate Button */}
                            {selectedPersona && userTask && (
                                <div className="text-center animate-fade-in">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={isLoading}
                                        className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <SparklesIcon className="w-6 h-6 mr-2" />
                                        <span>최적화된 프롬프트 생성</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-lg">
                            <div className="w-12 h-12 border-4 border-t-purple-400 border-slate-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-300">프롬프트를 최적화하는 중...</p>
                        </div>
                    )}

                    {error && (
                         <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center" aria-live="polite">
                            {error}
                        </div>
                    )}

                    {optimizedPrompt && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-3xl font-bold text-center text-slate-100">최적화된 프롬프트가 준비되었습니다!</h2>
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
                                <pre className="text-slate-200 whitespace-pre-wrap break-words font-sans text-sm sm:text-base leading-relaxed">
                                    {optimizedPrompt}
                                </pre>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={handleCopy}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    {isCopied ? '복사됨!' : '클립보드에 복사'}
                                </button>
                                <button
                                    onClick={handleStartOver}
                                    className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    처음부터 다시 시작
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;