import { NextResponse } from 'next/server';
import { ProjectDatabase } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = new ProjectDatabase();
        const project = await db.getProject(id);

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ project });
    } catch (error) {
        console.error('Failed to get project:', error);
        return NextResponse.json(
            { error: 'Failed to get project' },
            { status: 500 }
        );
    }
}
