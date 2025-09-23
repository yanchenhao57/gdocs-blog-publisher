// Storyblok CMS types

export interface ICMSAsset {
  id: number;
  alt: string;
  name: string;
  focus: string;
  title: string;
  source: string;
  filename: string;
  copyright: string;
  fieldtype: string;
  meta_data: Record<string, any>;
  is_external_url: boolean;
}

export interface ICmsRichText {
  type: string;
  content?: any[];
}

export interface ICommonCta {
  [key: string]: any;
}

export interface IBlogContent {
  author_id: string;
  body: ICmsRichText;
  canonical: string;
  cover: ICMSAsset;
  cta: ICommonCta[];
  date: string;
  title: string;
  description: string;
  feature_and_summary: {
    feature: boolean;
    summary: string;
  }[];
  heading_h1: string;
  reading_time: string;
  is_show_newsletter_dialog?: boolean;
  no_index?: boolean;
  show_side_cta?: boolean;
}

// Simplified Storyblok Story interface (matches API response)
export interface IStory<T = any> {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  content: T;
  created_at: string;
  published_at: string;
  uuid: string;
  // Additional optional fields from complete Storyblok API
  alternates?: any[];
  default_full_slug?: string | null;
  first_published_at?: string;
  group_id?: string;
  is_startpage?: boolean;
  lang?: string;
  meta_data?: any;
  parent_id?: number;
  path?: string | null;
  position?: number;
  release_id?: number | null;
  sort_by_date?: string | null;
  tag_list?: string[];
  translated_slugs?: any;
  updated_at?: string;
  [key: string]: any; // For additional properties
}

// Type alias for Blog Story
export type IBlogStory = IStory<IBlogContent>;

// Blog display component types
export interface BlogData {
  title: string;
  author: string;
  readingTime: string;
  publishDate: string;
  content: any;
  excerpt?: string;
  coverImage?: string;
  canonicalUrl?: string;
}

export interface StoryblokBlogDisplayProps {
  /** Storyblok story data */
  storyData: IBlogStory;
  /** Custom class name */
  className?: string;
  /** AI optimization changes */
  optimizationChanges?: import('../app/internal-link-optimizer/modules/types').OptimizationChange[];
  /** Status of each optimization */
  optimizationStatus?: Record<number, 'pending' | 'accepted' | 'rejected'>;
  /** Callback when optimization is accepted */
  onAcceptOptimization?: (index: number) => void;
  /** Callback when optimization is rejected */
  onRejectOptimization?: (index: number) => void;
  /** Callback when optimization decision is undone */
  onUndoOptimization?: (index: number) => void;
}

// Custom Storyblok component types
export interface ISpecialH2Content {
  text: string;
}

export interface ISpecialH3Content {
  order: string;
  text: string;
}

export interface IAnchorContent {
  _uid: string;
  description: string;
}
