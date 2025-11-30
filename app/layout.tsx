import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "POV Video Generator",
    description: "AI が自動で一人称視点 (POV) の動画を生成するシステム",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body>{children}</body>
        </html>
    );
}
