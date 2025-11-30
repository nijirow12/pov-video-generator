'use client';

import { useProject } from '@/hooks/useProject';
import type { Project } from '@/lib/types';

function StatusBadge({ status }: { status: Project['status'] }) {
    const styles = {
        pending: 'bg-gray-100 text-gray-800',
        processing: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    };

    const labels = {
        pending: '⏳ Pending',
        processing: '🔄 Processing',
        completed: '✅ Completed',
        failed: '❌ Failed',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

export function ProgressTracker({ projectId }: { projectId: string }) {
    const { project, loading } = useProject(projectId);

    if (loading && !project) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!project) {
        return <div className="p-6 text-center text-gray-500">Project not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            {/* ヘッダー */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-2">{project.idea}</h2>
                <div className="flex items-center gap-2">
                    <StatusBadge status={project.status} />
                    {project.createdAt && (
                        <span className="text-sm text-gray-500">
                            Started: {new Date(project.createdAt).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            {/* 処理中 */}
            {project.status === 'processing' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <h3 className="text-lg font-semibold">Processing...</h3>
                    </div>
                    <p className="text-gray-600">
                        動画を生成しています。このページを開いたままお待ちください。
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        ⏱️ 処理時間: 約70分
                    </p>
                </div>
            )}

            {/* 完了 */}
            {project.status === 'completed' && project.videoUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-800">✅ Video Generated!</h3>
                    <video
                        src={project.videoUrl}
                        controls
                        className="w-full rounded-lg shadow-lg"
                    />
                    <a
                        href={project.videoUrl}
                        download
                        className="mt-4 inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg"
                    >
                        📥 Download Video
                    </a>
                </div>
            )}

            {/* 失敗 */}
            {project.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-2 text-red-800">❌ Generation Failed</h3>
                    <p className="text-gray-600">
                        {project.error || 'An error occurred during video generation.'}
                    </p>
                </div>
            )}

            {/* 環境プロンプト */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Environment</h3>
                <p className="text-gray-600">{project.environmentPrompt}</p>
            </div>
        </div>
    );
}
