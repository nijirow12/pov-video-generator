import { NextResponse } from 'next/server';
import { ProjectDatabase } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    console.log('API Request received: /api/generate-simple');
    try {
        const { idea, environmentPrompt } = await request.json();
        console.log('Request body parsed:', { idea, environmentPrompt });

        if (!idea || !environmentPrompt) {
            console.log('Missing required fields');
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = new ProjectDatabase();
        console.log('Creating project in Firestore...');

        // プロジェクト作成
        const projectId = await db.createProject({
            idea,
            environmentPrompt,
            status: 'processing',
            createdAt: new Date(),
        });
        console.log('Project created:', projectId);

        // バックグラウンドで処理
        console.log('Starting background generation...');
        generateVideo(projectId, idea, environmentPrompt, db).catch(err => {
            console.error('Background generation error:', err);
        });

        console.log('Returning success response');
        return NextResponse.json({
            success: true,
            projectId,
            message: 'Video generation started',
        });
    } catch (error) {
        console.error('Failed to start generation:', error);
        return NextResponse.json(
            { error: 'Failed to start generation' },
            { status: 500 }
        );
    }
}

async function generateVideo(
    projectId: string,
    idea: string,
    environmentPrompt: string,
    db: ProjectDatabase
) {
    try {
        // 1. シーンタイトル生成
        const titles = await generateSceneTitles(idea);

        // 2. 各シーンの詳細プロンプト生成
        const detailedPrompts = await Promise.all(
            titles.map((title) => generateDetailedPrompt(title, idea, environmentPrompt))
        );

        // 3. モック画像・動画URLを生成
        const scenes = titles.map((title, index) => ({
            title,
            imageUrl: `https://picsum.photos/seed/${projectId}-${index}/540/960`,
            videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
            soundUrl: '',
        }));

        // 4. 完了
        await db.updateProject(projectId, {
            status: 'completed',
            videoUrl: scenes[0].videoUrl,
            scenes,
            completedAt: new Date(),
        });
    } catch (error) {
        console.error('Video generation failed:', error);
        await db.updateProject(projectId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

async function generateSceneTitles(idea: string): Promise<string[]> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are an advanced prompt-generation AI specializing in crafting POV (point of view) scene titles.
        
Generate 5 concise, action-driven, immersive scene titles for a "day in the life" experience based on: "${idea}"

Guidelines:
- Every title represents a first-person perspective
- Use action-based verbs like gripping, running, reaching, holding, walking toward
- Keep titles between 5 to 10 words long
- Focus on physical actions and interactions
- Create a logical sequence from morning to evening

Return ONLY a JSON object with a "titles" array of 5 strings.`,
            },
        ],
        response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.titles || [];
}

async function generateDetailedPrompt(
    title: string,
    idea: string,
    environmentPrompt: string
): Promise<string> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are an advanced prompt-generation AI specializing in expanding short POV image prompt ideas into detailed, hyper-realistic prompts.

Overall idea: ${idea}
Short prompt: ${title}
Environment: ${environmentPrompt}

Create a detailed prompt with three sections:
1. Start with: "${idea}"
2. Foreground: "First person view POV GoPro shot of [relevant limb/hands]..."
3. Background: "In the background, [describe scenery using: ${environmentPrompt}]"

Keep under 1000 characters in a single cinematic sentence.`,
            },
        ],
    });

    return response.choices[0].message.content || title;
}
