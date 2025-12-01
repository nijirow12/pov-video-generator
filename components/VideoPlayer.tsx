'use client';

import { useState } from 'react';

export function VideoPlayer({ videoUrl }: { videoUrl: string }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsDownloading(true);

        try {
            const response = await fetch(videoUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // URLからファイル名を抽出、またはデフォルト名を使用
            const fileName = videoUrl.split('/').pop() || 'pov-video.mp4';
            a.download = fileName;

            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            // フォールバック: 通常のリンクとして開く
            window.open(videoUrl, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

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
                    onClick={handleDownload}
                    className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium cursor-pointer ${isDownloading ? 'opacity-75 cursor-wait' : ''}`}
                >
                    {isDownloading ? '⏳ Downloading...' : '📥 Download Video'}
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
