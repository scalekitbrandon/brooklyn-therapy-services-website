import { defineCollection, z } from 'astro:content';

// Skeleton collections. astro-strategy drafts the real shape per project,
// astro-content finalizes it here. Delete collections a project doesn't need.

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    heroImage: z.string().optional(),
  }),
});

const testimonials = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string().optional(),
    company: z.string().optional(),
    quote: z.string(),
    avatar: z.string().optional(),
  }),
});

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    summary: z.string(),
    result: z.string().optional(),
    publishDate: z.date(),
  }),
});

export const collections = { blog, testimonials, caseStudies };
