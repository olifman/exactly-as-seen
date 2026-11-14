import { describe, it, expect } from 'vitest';
import { canPublish, emptyProject, projectSchema, validImage } from '@/lib/project-schema';

describe('Curated project rules', () => {
  it('requires project details and screenshot for explicit publication', () => {
    expect(canPublish({ ...emptyProject, name: 'Completed project', description: 'Real description' })).toBe(false);
    expect(canPublish({ ...emptyProject, name: 'Completed project', description: 'Real description', screenshot_path: 'owner/screenshot.png' })).toBe(true);
  });
  it('does not accept caller-supplied status or owner', () => {
    expect(projectSchema.safeParse({ ...emptyProject, name: 'Project', status: 'Published' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...emptyProject, name: 'Project', owner_id: 'another-owner' }).success).toBe(false);
  });
  it('accepts optional links but rejects executable URLs', () => {
    expect(projectSchema.safeParse({ ...emptyProject, name: 'Project' }).success).toBe(true);
    expect(projectSchema.safeParse({ ...emptyProject, name: 'Project', demo_url: 'javascript:alert(1)' }).success).toBe(false);
  });
  it('rejects content pretending to be an image', () => {
    expect(validImage(new Uint8Array([60,115,99,114,105,112,116,62,0,0,0,0]), 'image/png')).toBe(false);
    expect(validImage(new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]), 'image/png')).toBe(true);
  });
});