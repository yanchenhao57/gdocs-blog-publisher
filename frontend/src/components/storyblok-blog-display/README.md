# Storyblok Blog Display Component

A React component for displaying blog content from Storyblok CMS with rich text rendering.

## Features

- Displays blog content from externally provided Storyblok story data
- Renders rich text content using `@storyblok/richtext`
- Displays blog metadata (title, author, reading time, publish date)
- Shows cover images when available
- Responsive design
- Clean, modern styling matching the project design
- Follows Storyblok's `IBlogContent` interface structure
- Simplified component focused on rendering only

## Usage

```tsx
import StoryblokBlogDisplay, { type StoryblokBlogDisplayProps } from "../components/storyblok-blog-display";
import { useInternalLinkOptimizerStore } from "../stores/internalLinkOptimizerStore";
import type { IBlogContent, IBlogStory } from "../types/storyblok";

function BlogPage() {
  const { storyData } = useInternalLinkOptimizerStore();

  return (
    <StoryblokBlogDisplay storyData={storyData} />
  );
}
```

## Props

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `storyData` | `IBlogStory` | Yes | The Storyblok story data object with typed content |
| `className` | `string` | No | Additional CSS class names |

## Data Structure

The component expects Storyblok story data following the `IBlogStory` type defined in `src/types/storyblok.ts`:

```typescript
// Import from centralized types
import type { IBlogStory, IBlogContent, ICMSAsset, ICmsRichText } from "../types/storyblok";

// Generic Story interface
export interface IStory<T = any> {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: T;
  created_at: string;
  published_at: string;
  uuid: string;
  // ... additional optional fields
}

// Typed Blog Story
export type IBlogStory = IStory<IBlogContent>;
```

Key content fields used:
- `content.title` or `content.heading_h1` - Blog title
- `content.author_id` - Author identifier  
- `content.reading_time` - Reading duration
- `content.date` - Publication date
- `content.body` - Rich text content (ICmsRichText)
- `content.description` - Blog excerpt
- `content.cover` - Cover image (ICMSAsset)
- `content.canonical` - Canonical URL

## Styling

The component uses CSS modules with responsive design:

- Mobile-first approach
- Consistent typography and spacing
- Hover effects and transitions
- Skeleton loading states
- Error state styling

## Dependencies

- `@storyblok/richtext` - For rendering rich text content with React support
- `React` - Core functionality

## Technical Implementation

The component follows the [official Storyblok richtext documentation](https://www.storyblok.com/docs/packages/storyblok-richtext) for React applications:

- Uses `richTextResolver` with React-specific options (`renderFn: React.createElement`, `keyedResolvers: true`)
- Includes TypeScript generics for proper type safety (`StoryblokRichTextOptions<ReactElement>`)
- Converts HTML attributes to JSX-compatible format (e.g., `class` to `className`)
- Handles inline styles conversion from strings to objects
- Uses centralized type definitions from `src/types/storyblok.ts`

## Example Integration

The component is used in the `SuggestionsStep` component:

```tsx
import { useInternalLinkOptimizerStore } from "../../../stores/internalLinkOptimizerStore";

function SuggestionsStep() {
  const { storyData, analysisProgress } = useInternalLinkOptimizerStore();
  const isAnalyzing = analysisProgress > 0 && analysisProgress < 100;

  return (
    <div className="space-y-6">
      {storyData ? (
        <StoryblokBlogDisplay storyData={storyData} />
      ) : (
        <div className="text-center text-gray-500">
          {isAnalyzing ? (
            <div>Loading blog content... ({analysisProgress}%)</div>
          ) : (
            <div>No blog data available</div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Error States

The component handles various error conditions:

1. **Network errors** - API request failures
2. **Missing data** - When story data is not found
3. **Rendering errors** - When rich text content fails to render
4. **Missing parameters** - When fullSlug is not provided

## Loading States

Provides visual feedback during data fetching:

- Skeleton placeholders for title, metadata, and content
- Smooth animations
- Maintains layout during loading

## Responsive Design

- Desktop: Full-width with proper padding
- Tablet: Adjusted spacing and font sizes
- Mobile: Optimized for small screens with stacked metadata
