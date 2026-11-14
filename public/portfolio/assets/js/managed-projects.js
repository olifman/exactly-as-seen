// Set serviceOrigin to the deployed Lovable origin only when using GitHub Pages.
export const serviceOrigin = '';
export async function appendPublishedProjects() {
  try {
    const base = serviceOrigin || window.location.origin;
    if (!/^https?:\/\//.test(base)) return;
    const response = await fetch(`${base}/api/public/projects`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data.projects)) return;
    const section = document.getElementById('projects');
    const controls = document.getElementById('prevProject')?.parentElement;
    if (!section || !controls) return;
    for (const project of data.projects) {
      if (typeof project.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(project.id) || typeof project.name !== 'string' || typeof project.description !== 'string') continue;
      const slide = document.createElement('div'); slide.className = 'project-slide'; slide.dataset.managed = project.id;
      const row = document.createElement('div'); row.className = 'row align-items-center g-4 g-lg-5';
      const imageCol = document.createElement('div'); imageCol.className = 'col-lg-6 project-img-col';
      const image = document.createElement('img'); image.className = 'project-carousel-img'; image.alt = project.name; image.src = `${base}/api/public/project-image/${project.id}`;
      imageCol.append(image);
      const info = document.createElement('div'); info.className = 'col-lg-6 project-info-col';
      const title = document.createElement('h3'); title.className = 'h4 mb-3'; title.textContent = project.name;
      const description = document.createElement('p'); description.className = 'text-secondary mb-4'; description.textContent = project.description;
      info.append(title, description);
      const badges = document.createElement('div'); badges.className = 'd-flex flex-wrap gap-2 mb-4';
      for (const tech of Array.isArray(project.technologies) ? project.technologies : []) { if (typeof tech !== 'string') continue; const badge = document.createElement('span'); badge.className = 'badge bg-primary'; badge.textContent = tech; badges.append(badge); }
      info.append(badges);
      if (project.category) { const category = document.createElement('p'); category.className = 'text-secondary'; category.textContent = project.category; info.append(category); }
      const links = document.createElement('div'); links.className = 'd-flex gap-3';
      for (const [value, label] of [[project.demo_url, 'Live demo'], [project.github_url, 'Repository']]) {
        if (!value) continue;
        try { const url = new URL(value); if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) continue; const link = document.createElement('a'); link.href = url.href; link.textContent = label; link.className = 'btn btn-primary'; link.target = '_blank'; link.rel = 'noopener noreferrer'; links.append(link); } catch { /* Invalid link omitted. */ }
      }
      info.append(links); row.append(imageCol, info); slide.append(row); controls.before(slide);
    }
    section.dispatchEvent(new Event('projectsUpdated'));
  } catch { /* Keep the authored showcase available when the service is offline. */ }
}