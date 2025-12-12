// services/processors/uiDecomposer.ts

export const uiDecomposer = {
    decompose: async (imageUrl: string) => {
        console.log(`[UI Decomposer] Mock decomposition for ${imageUrl}`);
        // Return mock data for now
        return {
            background: imageUrl, // effectively just the image
            elements: [
                { id: 'mock-card-1', type: 'card', x: 100, y: 100, width: 200, height: 150 },
                { id: 'mock-sidebar', type: 'sidebar', x: 0, y: 0, width: 60, height: '100%' },
            ]
        };
    }
};
