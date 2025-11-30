export interface Project {
    id: string;
    idea: string;
    environmentPrompt: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    scenes?: Scene[];
    createdAt: Date;
    completedAt?: Date;
    error?: string;
}

export interface Scene {
    title: string;
    imageUrl: string;
    videoUrl: string;
    soundUrl: string;
}

export interface N8nResponse {
    success: boolean;
    projectId: string;
    idea: string;
    videoUrl: string;
    scenes: Scene[];
    completedAt: string;
}
