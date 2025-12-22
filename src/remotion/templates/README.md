# Template Development Guide

## 📁 Template Structure

Each template should be self-contained in its own folder:

```
src/remotion/templates/[TemplateName]/
├── schema.ts              # AI generation schema
├── [TemplateName]Template.tsx  # Main template component
├── index.tsx              # Export file
├── scenes/                # Scene components
│   ├── Slot_1_*.tsx
│   ├── Slot_2_*.tsx
│   └── ...
└── components/            # Reusable components (optional)
```

## 🎯 Creating a New Template

### Step 1: Create Template Folder
```bash
mkdir src/remotion/templates/MyTemplate
```

### Step 2: Define Schema (`schema.ts`)
```typescript
export const MY_TEMPLATE_SCHEMA = {
    name: "MyTemplate",
    sceneCount: 5,  // How many scenes in your template
    description: "Brief description for template selection",
    systemPrompt: `You are an expert Content Architect for "MyTemplate".
    
    TEMPLATE STRUCTURE (5 Scenes):
    1. Scene 1 description
    2. Scene 2 description
    ...
    
    OUTPUT SCHEMA:
    {
      "brandName": "Product Name",
      "brandColor": "#hexcode",
      "scenes": [
        { "id": 1, "type": "scene_type", "duration": 5, ... }
      ]
    }`
};
```

### Step 3: Create Template Component
```typescript
// MyTemplateTemplate.tsx
import { VideoPlan } from '../../../types';

export const MyTemplateTemplate: React.FC<{ plan: VideoPlan }> = ({ plan }) => {
    return (
        <>
            {plan.scenes.map((scene, i) => (
                <Sequence key={scene.id} from={...} durationInFrames={...}>
                    <SceneRenderer scene={scene} />
                </Sequence>
            ))}
        </>
    );
};
```

### Step 4: Register in Schema Registry
```typescript
// services/schemas.ts
import { MY_TEMPLATE_SCHEMA } from '../src/remotion/templates/MyTemplate/schema';

export const TEMPLATE_SCHEMAS = {
    viable: VIABLE_SCHEMA,
    pretaa: PRETAA_SCHEMA,
    mytemplate: MY_TEMPLATE_SCHEMA,  // Add here
};
```

### Step 5: Update Types
```typescript
// types.ts
export interface VideoPlan {
    template?: 'generic' | 'viable' | 'pretaa' | 'mytemplate';  // Add here
    ...
}
```

## 🎨 Schema Best Practices

1. **Be Specific**: Define exact props for each scene
2. **Include Examples**: Show the AI what good output looks like
3. **Enforce Structure**: Use clear JSON schema in the prompt
4. **Voiceover Required**: Every scene must have `voiceoverScript`
5. **Scene Types**: Use existing scene types or create new ones

## 📊 Scene Count Guidelines

- **Short (30-45s)**: 3-4 scenes
- **Medium (60s)**: 5-6 scenes
- **Long (90s)**: 8-10 scenes

## 🔄 Adding to Template Selector

Update `App.tsx` to include your template in the selection UI:

```typescript
const templates = [
    { id: 'viable', name: 'Viable', description: '...' },
    { id: 'pretaa', name: 'Pretaa', description: '...' },
    { id: 'mytemplate', name: 'My Template', description: '...' },
];
```

## ✅ Testing Checklist

- [ ] Schema generates valid JSON
- [ ] All scenes have required props
- [ ] Voiceover scripts are generated
- [ ] Template renders without errors
- [ ] Brand color is applied
- [ ] Screenshots/assets are used correctly
- [ ] Audio plays correctly
- [ ] Export works

## 🎯 Template Ideas

- **Minimal**: Clean, text-focused, 3-4 scenes
- **Cinematic**: Movie-trailer style, dramatic transitions
- **Explainer**: Educational, step-by-step walkthrough
- **Testimonial**: Customer-focused, social proof heavy
- **Launch**: Product announcement, hype-driven
