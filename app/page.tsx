import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* ヘッダー */}
                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        POV Video Generator
                    </h1>
                    <p className="text-xl text-gray-700 mb-12">
                        AIが自動で一人称視点(POV)の動画を生成するシステム
                    </p>

                    {/* 機能カード */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">🎬</div>
                            <h3 className="text-xl font-semibold mb-2">自動動画生成</h3>
                            <p className="text-gray-600">
                                アイデアを入力するだけで、AIが5シーンのPOV動画を自動生成
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">⏱️</div>
                            <h3 className="text-xl font-semibold mb-2">約70分で完成</h3>
                            <p className="text-gray-600">
                                画像生成15分 + 動画生成50分 + 編集5分
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold mb-2">進捗表示</h3>
                            <p className="text-gray-600">
                                リアルタイムで生成状況を確認できます
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">💾</div>
                            <h3 className="text-xl font-semibold mb-2">履歴管理</h3>
                            <p className="text-gray-600">
                                過去のプロジェクトをいつでも確認・ダウンロード
                            </p>
                        </div>
                    </div>

                    {/* CTAボタン */}
                    <div className="space-y-4">
                        <Link
                            href="/projects/new"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            🎥 新しい動画を作成
                        </Link>
                        <div>
                            <Link
                                href="/projects"
                                className="inline-block px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
                            >
                                📁 プロジェクト一覧
                            </Link>
                        </div>
                    </div>

                    {/* 技術スタック */}
                    <div className="mt-16 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-4">Powered by</p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                            <span className="px-3 py-1 bg-white rounded-full shadow">Next.js</span>
                            <span className="px-3 py-1 bg-white rounded-full shadow">n8n</span>
                            <span className="px-3 py-1 bg-white rounded-full shadow">OpenAI</span>
                            <span className="px-3 py-1 bg-white rounded-full shadow">Firebase</span>
                            <span className="px-3 py-1 bg-white rounded-full shadow">PiAPI</span>
                            <span className="px-3 py-1 bg-white rounded-full shadow">ElevenLabs</span>
                            <span className="px-3 py-1 bg-white rounded-full shadow">Creatomate</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
