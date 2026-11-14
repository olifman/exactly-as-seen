import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/projects')({ server: { handlers: {
  GET: async ({ request }) => {
    const { publicClient, publicHeaders } = await import('@/lib/public-projects.server');
    const headers = publicHeaders(request);
    const { data, error } = await publicClient().from('portfolio_projects').select('id,name,description,technologies,category,demo_url,github_url').eq('status', 'Published').order('published_at');
    if (error) return Response.json({ projects: [] }, { status: 503, headers });
    return Response.json({ projects: (data ?? []).map(p => ({ ...p, imageUrl: `/api/public/project-image/${p.id}` })) }, { headers });
  },
} } });