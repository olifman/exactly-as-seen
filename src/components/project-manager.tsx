import { useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Plus, Save, Eye, Upload, LogOut, Trash2, Pencil, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { getManager, saveProject, setPublication, deleteProject, uploadScreenshot } from '@/lib/projects.functions';
import { emptyProject, projectSchema, type ProjectInput } from '@/lib/project-schema';

type ManagerData = Awaited<ReturnType<typeof getManager>>;
export function ProjectManager({ initial }: { initial: ManagerData }) {
  const [projects, setProjects] = useState(initial.projects); const [form, setForm] = useState<ProjectInput | null>(null);
  const [imageUrl, setImageUrl] = useState(''); const [preview, setPreview] = useState(false); const [removeId, setRemoveId] = useState<string | null>(null);
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const save = useServerFn(saveProject); const publish = useServerFn(setPublication); const remove = useServerFn(deleteProject); const upload = useServerFn(uploadScreenshot); const load = useServerFn(getManager);
  const navigate = useNavigate(); const router = useRouter(); const queryClient = useQueryClient();
  async function action(fn: () => Promise<void>) { setBusy(true); setMessage(''); try { await fn(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to complete the action.'); } finally { setBusy(false); } }
  async function refresh() { const result = await load(); setProjects(result.projects); await router.invalidate(); }
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true }); }
  function field(key: keyof ProjectInput, value: string | string[]) { if (form) setForm({ ...form, [key]: value }); }
  return <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-10"><div className="mx-auto max-w-6xl">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-6"><div><p className="text-sm text-muted-foreground">Lamesa Bekele · Private</p><h1 className="mt-1 text-3xl font-semibold">Project Manager</h1></div><div className="flex items-center gap-2"><Button variant="outline" asChild><a href="/portfolio/index.html" target="_blank" rel="noreferrer"><Globe />Portfolio</a></Button><Button variant="ghost" title="Sign out" aria-label="Sign out" size="icon" onClick={signOut}><LogOut /></Button></div></header>
    {!initial.allowed ? <section className="py-16"><h2 className="text-xl font-semibold">Owner access required</h2><p className="mt-3 text-muted-foreground">This account cannot manage this portfolio.</p></section> : <>
      <div className="flex items-center justify-between py-6"><h2 className="font-semibold">Your projects <span className="text-muted-foreground">{projects.length}</span></h2><Button onClick={() => { setForm({ ...emptyProject }); setImageUrl(''); }}><Plus />Add project</Button></div>
      {message && <p role="status" className="mb-5 break-words text-sm">{message}</p>}
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
        <section className="space-y-4">{projects.length === 0 && <p className="py-8 text-muted-foreground">No new projects yet.</p>}{projects.map(p => <article key={p.id} className="rounded-md border p-4">
          {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="mb-4 aspect-video w-full rounded-md bg-muted object-contain" />}
          <div className="flex items-start justify-between gap-3"><h3 className="break-words font-semibold">{p.name}</h3><span className="text-xs text-muted-foreground">{p.status}</span></div><p className="mt-2 break-words text-sm text-muted-foreground">{p.description}</p>
          <div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => { setForm(projectSchema.parse({ id: p.id, name: p.name, description: p.description, technologies: p.technologies, category: p.category, demo_url: p.demo_url, github_url: p.github_url, screenshot_path: p.screenshot_path })); setImageUrl(p.imageUrl); }}><Pencil />Edit</Button>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => action(async () => { await publish({ data: { id: p.id, published: p.status !== 'Published' } }); await refresh(); setMessage(p.status === 'Published' ? 'Project unpublished.' : 'Project published.'); })}><Globe />{p.status === 'Published' ? 'Unpublish' : 'Publish project'}</Button>
            <Button variant="ghost" size="icon" title="Delete project" aria-label={`Delete ${p.name}`} onClick={() => setRemoveId(p.id)}><Trash2 /></Button></div>
        </article>)}</section>
        {form && <form className="space-y-5" onSubmit={e => { e.preventDefault(); action(async () => { const values = projectSchema.parse(form); const result = await save({ data: values }); setForm({ ...values, id: result.id }); await refresh(); setMessage('Draft saved.'); }); }}>
          <h2 className="text-xl font-semibold">{form.id ? 'Edit project' : 'New project'}</h2><p className="text-sm text-muted-foreground">Draft</p>
          <div className="space-y-2"><Label htmlFor="project-name">Project name</Label><Input id="project-name" required maxLength={100} value={form.name} onChange={e => field('name', e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="project-description">Short description</Label><Textarea id="project-description" maxLength={1000} value={form.description} onChange={e => field('description', e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="screenshot">Project screenshot</Label>{imageUrl && <img src={imageUrl} alt="Project screenshot" className="aspect-video w-full rounded-md bg-muted object-contain" />}<Input id="screenshot" type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (!file) return; action(async () => { if (file.size > 5 * 1024 * 1024 || !['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Choose a PNG, JPG, or WebP image up to 5 MB.'); const result = await upload({ data: { bytes: Array.from(new Uint8Array(await file.arrayBuffer())), type: file.type as 'image/png' | 'image/jpeg' | 'image/webp' } }); field('screenshot_path', result.path); setImageUrl(result.imageUrl); setMessage('Screenshot uploaded privately. Save the draft to keep it with this project.'); }); }} /><p className="text-xs text-muted-foreground"><Upload className="mr-1 inline size-3" />PNG, JPG, WebP · up to 5 MB</p></div>
          <div className="space-y-2"><Label htmlFor="technologies">Technologies used</Label><Input id="technologies" value={form.technologies.join(', ')} maxLength={800} onChange={e => field('technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></div>
          {(['category','demo_url','github_url'] as const).map(key => <div key={key} className="space-y-2"><Label htmlFor={key}>{key === 'category' ? 'Project category' : key === 'demo_url' ? 'Live demo URL' : 'GitHub repository URL'} <span className="text-muted-foreground">(optional)</span></Label><Input id={key} type={key === 'category' ? 'text' : 'url'} maxLength={key === 'category' ? 80 : 2048} value={form[key]} onChange={e => field(key, e.target.value)} /></div>)}
          <div className="flex flex-wrap gap-2"><Button disabled={busy}><Save />Save draft</Button><Button type="button" variant="outline" onClick={() => setPreview(true)}><Eye />Preview project</Button><Button type="button" variant="ghost" onClick={() => setForm(null)}>Close</Button></div>
        </form>}
      </div>
    </>}
    <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogTitle>{form?.name || 'Project preview'}</DialogTitle><DialogDescription>Private preview · Draft</DialogDescription>{imageUrl && <img src={imageUrl} alt={form?.name || 'Screenshot'} className="aspect-video w-full object-contain" />}<p className="break-words">{form?.description}</p><p className="text-sm text-muted-foreground">{form?.technologies.join(' · ')}</p>{form?.category && <p className="text-sm">{form.category}</p>}</DialogContent></Dialog>
    <Dialog open={Boolean(removeId)} onOpenChange={open => { if (!open) setRemoveId(null); }}><DialogContent><DialogTitle>Delete project?</DialogTitle><DialogDescription>This removes the project from your portfolio and cannot be undone.</DialogDescription><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setRemoveId(null)}>Cancel</Button><Button variant="destructive" disabled={busy} onClick={() => action(async () => { if (!removeId) return; await remove({ data: { id: removeId, confirmed: true } }); if (form?.id === removeId) setForm(null); setRemoveId(null); await refresh(); setMessage('Project deleted.'); })}>Delete project</Button></div></DialogContent></Dialog>
  </div></main>;
}