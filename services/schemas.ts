// Central schema registry
// Imports schemas from individual template folders for easy access

import { VIABLE_SCHEMA } from '../src/remotion/templates/Viable/schema';
import { PRETAA_SCHEMA } from '../src/remotion/templates/Pretaa/schema';

// Template registry - add new templates here
export const TEMPLATE_SCHEMAS = {
  viable: VIABLE_SCHEMA,
  pretaa: PRETAA_SCHEMA,
  // Future templates:
  // minimal: MINIMAL_SCHEMA,
  // cinematic: CINEMATIC_SCHEMA,
  // etc.
} as const;

// Type-safe template IDs
export type TemplateId = keyof typeof TEMPLATE_SCHEMAS;

// Helper to get schema by ID
export function getTemplateSchema(templateId: TemplateId) {
  return TEMPLATE_SCHEMAS[templateId];
}

// Helper to list all available templates
export function getAllTemplates() {
  return Object.entries(TEMPLATE_SCHEMAS).map(([id, schema]) => ({
    id: id as TemplateId,
    name: schema.name,
    description: schema.description,
    sceneCount: schema.sceneCount,
  }));
}

// Export individual schemas for backward compatibility
export { VIABLE_SCHEMA, PRETAA_SCHEMA };
