'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types';

export function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/projects');
                const data = await response.json();
                setProjects(data.projects);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="text-center p-12">
                <p className="text-gray-500 mb-4">No projects yet</p>
                <Link
                    href="/projects/new"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                    🎥 Create Your First Video
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                            {project.idea}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                            {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                        <StatusBadge status={project.status} />
                    </Link>
                ))}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Project['status'] }) {
    const styles = {
        pending: 'bg-gray-100 text-gray-800',
        processing: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    };

    const labels = {
        pending: '⏳ Pending',
        processing: '🔄 Processing',
        completed: '✅ Completed',
        failed: '❌ Failed',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
