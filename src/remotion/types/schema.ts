import { z } from 'zod';

export const BrandSchema = z.object({
    primaryColor: z.string(),
    secondaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
    logoUrl: z.string().optional(),
});

export const SceneSchema = z.object({
    id: z.string(),
    type: z.enum(['intro', 'problem', 'solution', 'feature', 'testimonial', 'outro']),
    durationInFrames: z.number(),
    transition: z.enum(['fade', 'slide', 'zoom']).optional(),
    data: z.object({
        headline: z.string().optional(),
        subheadline: z.string().optional(),
        text: z.string().optional(),
        image: z.string().optiona(), // Screenshot or Asset URL
        video: z.string().optional(), // User upload or recording
        icon: z.string().optional(),
        // Specific for testimonials
        author: z.string().optional(),
        role: z.string().optional(),
        company: z.string().optional(),
        // Specific for features
        features: z.array(z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string().optional()
        })).optional()
    })
});

export const VideoContentSchema = z.object({
    id: z.string(),
    brand: BrandSchema,
    structure: z.object({
        scenes: z.array(SceneSchema),
        totalDurationInFrames: z.number(),
        fps: z.number().default(30),
        width: z.number().default(1920),
        height: z.number().default(1080)
    })
});

export type VideoContent = z.infer<typeof VideoContentSchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type Scene = z.infer<typeof SceneSchema>;
