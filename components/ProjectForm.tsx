'use client';

import { useState } from 'react';
import { useN8nWorkflow } from '@/hooks/useN8nWorkflow';
import { useRouter } from 'next/navigation';

export function ProjectForm() {
    const [idea, setIdea] = useState('');
    const [environmentPrompt, setEnvironmentPrompt] = useState('');

    const { startGeneration, loading, error } = useN8nWorkflow();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const projectId = await startGeneration({
                idea,
                environmentPrompt,
            });

            router.push(`/projects/${projectId}`);
        } catch (err) {
            console.error('Failed to create project:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6">
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                    Video Idea *
                </label>
                <input
                    type="text"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="A day in the life of a samurai"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
                <p className="text-sm text-gray-500 mt-1">
                    例: A day in the life of a medieval knight
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                    Environment Description *
                </label>
                <textarea
                    value={environmentPrompt}
                    onChange={(e) => setEnvironmentPrompt(e.target.value)}
                    placeholder="Feudal Japan, cherry blossoms, traditional architecture..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
                <p className="text-sm text-gray-500 mt-1">
                    動画の環境・雰囲気を詳しく記述してください
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    ❌ {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl"
            >
                {loading ? '🔄 Starting...' : '🎬 Generate Video'}
            </button>

            <p className="text-sm text-gray-500 text-center">
                ⏱️ 処理時間: 約70分 (画像生成15分 + 動画生成50分 + その他5分)
            </p>
        </form>
    );
}
