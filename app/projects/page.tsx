import { ProjectList } from '@/components/ProjectList';
import Link from 'next/link';

export default function ProjectsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                        >
                            ← Back to Home
                        </Link>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Your Projects
                        </h1>
                        <p className="text-gray-600 mt-2">
                            過去に作成した動画プロジェクト一覧
                        </p>
                    </div>
                    <Link
                        href="/projects/new"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
                    >
                        🎥 New Project
                    </Link>
                </div>

                {/* プロジェクト一覧 */}
                <ProjectList />
            </div>
        </div>
    );
}
