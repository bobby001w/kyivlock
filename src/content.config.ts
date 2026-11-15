import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const schema = z.object({
    title: z.string(), // H1 і основа <title>
    seoTitle: z.string(), // 50–60 символів
    description: z.string(), // 140–160 символів
    date: z.string(), updated: z.string(),
    author: z.string().default('Команда KyivLock'),
    authorRole: z.string().default('майстер з аварійного відкриття замків, KyivLock'),
    cluster: z.enum(['doors', 'ignition', 'general']),
    image: z.string(), imageAlt: z.string(),
    sources: z.array(z.object({ name: z.string(), url: z.string() })).default([]),
    related: z.array(z.string()).default([]),
});

// Українські статті — src/content/blog, російські — src/content/blog-ru з тими самими слагами.
const blog = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/blog' }), schema });
const blogRu = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/blog-ru' }), schema });
export const collections = { blog, blogRu };
