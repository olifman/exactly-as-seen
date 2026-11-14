import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { projectSchema, uploadSchema, validImage, canPublish } from './project-schema';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

async function owner(client: SupabaseClient<Database>, userId: string) {
  const { data, error } = await client.rpc('has_role', { _user_id: userId, _role: 'owner' });
  if (error || !data) throw new Error('This account does not have owner access.');
}
export const getManager = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'owner' });
  if (!allowed) return { allowed: false, projects: [] };
  const { data, error } = await context.supabase.from('portfolio_projects').select('*').eq('owner_id', context.userId).order('created_at');
  if (error) throw new Error('Unable to load your projects.');
  const projects = await Promise.all((data ?? []).map(async p => {
    const { data: image } = p.screenshot_path ? await context.supabase.storage.from('project-screenshots').createSignedUrl(p.screenshot_path, 300) : { data: null };
    return { ...p, imageUrl: image?.signedUrl ?? '' };
  }));
  return { allowed: true, projects };
});
export const saveProject = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => projectSchema.parse(input)).handler(async ({ data, context }) => {
  await owner(context.supabase, context.userId);
  if (data.screenshot_path && !data.screenshot_path.startsWith(`${context.userId}/`)) throw new Error('Invalid screenshot.');
  const { id, ...values } = data;
  // Every saved edit becomes a private draft; publication is a separate action.
  const query = id ? context.supabase.from('portfolio_projects').update({ ...values, status: 'Draft', published_at: null }).eq('id', id).eq('owner_id', context.userId) : context.supabase.from('portfolio_projects').insert({ ...values, owner_id: context.userId });
  const { data: result, error } = await query.select('id').single();
  if (error || !result) throw new Error('Unable to save the project.');
  return result;
});
export const setPublication = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => z.object({ id: z.string().uuid(), published: z.boolean() }).strict().parse(input)).handler(async ({ data, context }) => {
  await owner(context.supabase, context.userId);
  const { data: project } = await context.supabase.from('portfolio_projects').select('*').eq('id', data.id).eq('owner_id', context.userId).single();
  if (!project) throw new Error('Project not found.');
  if (data.published) {
    if (!canPublish(project)) throw new Error('Add a description and screenshot before publishing.');
    const { error } = await context.supabase.storage.from('project-screenshots').download(project.screenshot_path);
    if (error) throw new Error('Screenshot is missing. Upload it again before publishing.');
  }
  const { error } = await context.supabase.from('portfolio_projects').update({ status: data.published ? 'Published' : 'Draft', published_at: data.published ? new Date().toISOString() : null }).eq('id', data.id).eq('owner_id', context.userId);
  if (error) throw new Error('Unable to change publication.');
  return { ok: true };
});
export const deleteProject = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => z.object({ id: z.string().uuid(), confirmed: z.literal(true) }).strict().parse(input)).handler(async ({ data, context }) => {
  await owner(context.supabase, context.userId);
  const { data: project } = await context.supabase.from('portfolio_projects').select('screenshot_path').eq('id', data.id).eq('owner_id', context.userId).single();
  if (!project) throw new Error('Project not found.');
  const { error } = await context.supabase.from('portfolio_projects').delete().eq('id', data.id).eq('owner_id', context.userId);
  if (error) throw new Error('Unable to delete the project.');
  if (project.screenshot_path) await context.supabase.storage.from('project-screenshots').remove([project.screenshot_path]);
  return { ok: true };
});
export const uploadScreenshot = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => uploadSchema.parse(input)).handler(async ({ data, context }) => {
  await owner(context.supabase, context.userId);
  const bytes = new Uint8Array(data.bytes);
  if (!validImage(bytes, data.type)) throw new Error('This file is not a supported image.');
  const extension = data.type === 'image/jpeg' ? 'jpg' : data.type.split('/')[1];
  const path = `${context.userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await context.supabase.storage.from('project-screenshots').upload(path, bytes, { contentType: data.type, upsert: false });
  if (error) throw new Error('Unable to upload the screenshot.');
  const { data: image } = await context.supabase.storage.from('project-screenshots').createSignedUrl(path, 300);
  return { path, imageUrl: image?.signedUrl ?? '' };
});