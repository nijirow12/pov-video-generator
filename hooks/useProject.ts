'use client';

import { useState, useEffect } from 'react';
import type { Project } from '@/lib/types';

export function useProject(projectId: string | null) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/projects/${projectId}`);
                const data = await response.json();
                setProject(data.project);
            } catch (error) {
                console.error('Failed to fetch project:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();

        // 処理中の場合、10秒ごとにポーリング
        let intervalId: NodeJS.Timeout;
        if (project?.status === 'processing') {
            intervalId = setInterval(fetchProject, 10000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [projectId, project?.status]);

    return { project, loading };
}
