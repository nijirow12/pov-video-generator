'use client';

export function VideoPlayer({ videoUrl }: { videoUrl: string }) {
    return (
        <div className="max-w-4xl mx-auto">
            <video
                src={videoUrl}
                controls
                className="w-full rounded-lg shadow-2xl"
            />
            <div className="mt-4 flex gap-4">
                <a
                    href={videoUrl}
                    download
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                    📥 Download Video
                </a>
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-6 py-3 bg-white text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-medium border border-gray-300"
                >
                    🔗 Open in New Tab
                </a>
            </div>
        </div>
    );
}
