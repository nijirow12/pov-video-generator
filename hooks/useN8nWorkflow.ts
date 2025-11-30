'use client';

import { useState } from 'react';

export function useN8nWorkflow() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startGeneration = async (data: {
        idea: string;
        environmentPrompt: string;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to start video generation');
            }

            const result = await response.json();
            return result.projectId;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { startGeneration, loading, error };
}
