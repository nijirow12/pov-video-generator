import { NextResponse } from 'next/server';
import { ProjectDatabase } from '@/lib/db';

export async function GET() {
    try {
        const db = new ProjectDatabase();
        const projects = await db.getAllProjects();

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Failed to get projects:', error);
        return NextResponse.json(
            { error: 'Failed to get projects' },
            { status: 500 }
        );
    }
}
