import { ProjectForm } from '@/components/ProjectForm';
import Link from 'next/link';

export default function NewProjectPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Create New POV Video
                    </h1>
                    <p className="text-gray-600 mt-2">
                        AIが自動で一人称視点の動画を生成します
                    </p>
                </div>

                {/* フォーム */}
                <div className="bg-white rounded-xl shadow-xl">
                    <ProjectForm />
                </div>

                {/* 説明 */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">How it works</h2>
                    <ol className="space-y-3 text-gray-600">
                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">1.</span>
                            <span>動画のアイデアと環境を入力</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">2.</span>
                            <span>AIが5つのシーンタイトルを生成</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">3.</span>
                            <span>各シーンの画像・動画・音声を自動生成</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-semibold text-blue-600">4.</span>
                            <span>全要素を統合して完成動画を作成</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
