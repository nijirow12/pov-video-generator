import type { N8nResponse } from './types';

export class N8nClient {
    private webhookUrl: string;

    constructor() {
        this.webhookUrl = process.env.N8N_WEBHOOK_URL!;
    }

    async triggerWorkflow(data: {
        idea: string;
        environmentPrompt: string;
    }): Promise<N8nResponse> {
        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to trigger n8n workflow');
        }

        return await response.json();
    }
}
