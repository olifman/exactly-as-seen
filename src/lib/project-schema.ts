import { z } from 'zod';

export const webUrl = z.string().trim().max(2048).refine(value => {
  if (!value) return true;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}, 'Enter a complete http or https URL.');
export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, 'Project name is required.').max(100),
  description: z.string().trim().max(1000),
  technologies: z.array(z.string().trim().min(1).max(40)).max(20),
  category: z.string().trim().max(80),
  demo_url: webUrl,
  github_url: webUrl.refine(value => !value || (new URL(value).hostname === 'github.com' && new URL(value).protocol === 'https:'), 'Use an https://github.com/ repository URL.'),
  screenshot_path: z.string().max(300),
}).strict();
export type ProjectInput = z.infer<typeof projectSchema>;
export const emptyProject: ProjectInput = { name: '', description: '', technologies: [], category: '', demo_url: '', github_url: '', screenshot_path: '' };
export const uploadSchema = z.object({ bytes: z.array(z.number().int().min(0).max(255)).min(12).max(5 * 1024 * 1024), type: z.enum(['image/png', 'image/jpeg', 'image/webp']) }).strict();
export function validImage(bytes: Uint8Array, type: string) {
  if (type === 'image/png') return [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n);
  if (type === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  return type === 'image/webp' && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
}
export function canPublish(project: ProjectInput) { return Boolean(project.name.trim() && project.description.trim() && project.screenshot_path); }