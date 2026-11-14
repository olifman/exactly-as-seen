import { createFileRoute } from '@tanstack/react-router';
import { getManager } from '@/lib/projects.functions';
import { ProjectManager } from '@/components/project-manager';

export const Route = createFileRoute('/_authenticated/manager')({
  loader: () => getManager(),
  head: () => ({ meta: [ { title: 'Project Manager | Lamesa Bekele' }, { name: 'description', content: 'Private project drafts and publishing for Lamesa Bekele’s portfolio.' }, { property: 'og:title', content: 'Project Manager | Lamesa Bekele' }, { property: 'og:description', content: 'Private portfolio project management.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' } ] }),
  component: () => <ProjectManager initial={Route.useLoaderData()} />,
});