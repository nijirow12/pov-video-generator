import { NextResponse } from 'next/server';
import { N8nClient } from '@/lib/n8n-client';
import { ProjectDatabase } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { idea, environmentPrompt } = body;

        if (!idea || !environmentPrompt) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = new ProjectDatabase();

        // プロジェクト作成
        const projectId = await db.createProject({
            idea,
            environmentPrompt,
            status: 'processing',
            createdAt: new Date(),
        });

        // n8n実行 (バックグラウンド)
        const n8n = new N8nClient();

        n8n.triggerWorkflow({ idea, environmentPrompt })
            .then(async (result) => {
                await db.updateProject(projectId, {
                    status: 'completed',
                    videoUrl: result.videoUrl,
                    scenes: result.scenes,
                    completedAt: new Date(),
                });
            })
            .catch(async (error) => {
                await db.updateProject(projectId, {
                    status: 'failed',
                    error: error.message,
                });
            });

        return NextResponse.json({
            success: true,
            projectId,
            message: 'Video generation started',
        });
    } catch (error) {
        console.error('Failed to trigger workflow:', error);
        return NextResponse.json(
            { error: 'Failed to trigger workflow' },
            { status: 500 }
        );
    }
}
