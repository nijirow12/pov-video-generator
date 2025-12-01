export interface Project {
    id: string;
    idea: string;
    environmentPrompt: string;
    description?: string;  // n8nから取得した動画の説明
    status: 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    scenes?: Scene[];
    error?: string;
    createdAt: Date;
    completedAt?: Date;
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
