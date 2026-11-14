import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/api/public/project-image/$id')({ server: { handlers: {
  GET: async ({ request, params }) => {
    const { publicClient, publicHeaders } = await import('@/lib/public-projects.server');
    const headers = publicHeaders(request);
    if (!z.string().uuid().safeParse(params.id).success) return new Response('Not found', { status: 404, headers });
    const client = publicClient();
    const { data } = await client.from('portfolio_projects').select('screenshot_path').eq('id', params.id).eq('status', 'Published').single();
    if (!data?.screenshot_path) return new Response('Not found', { status: 404, headers });
    const { data: image, error } = await client.storage.from('project-screenshots').download(data.screenshot_path);
    if (error || !image) return new Response('Not found', { status: 404, headers });
    headers.set('Content-Type', image.type);
    return new Response(image, { headers });
  },
} } });