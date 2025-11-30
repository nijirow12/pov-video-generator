import { ProgressTracker } from '@/components/ProgressTracker';
import Link from 'next/link';

export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="mb-8">
                    <Link
                        href="/projects"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        ← Back to Projects
                    </Link>
                </div>

                {/* 進捗トラッカー */}
                <ProgressTracker projectId={id} />
            </div>
        </div>
    );
}
