export function readRoute() {
  const [path, query = ''] = location.hash.slice(1).split('?');
  const [view, id = ''] = path.split('/');
  const params = new URLSearchParams(query);
  const pageValue = Number(params.get('page'));
  return { active: view === 'experiments', id, search: (params.get('q') || '').slice(0, 128),
    page: Number.isSafeInteger(pageValue) && pageValue >= 0 ? pageValue : 0,
    selected: [...new Set((params.get('compare') || '').split(',').filter(Boolean))].slice(0, 2) };
}

export function navigate(patch: Partial<ReturnType<typeof readRoute>>) {
  const next = { ...readRoute(), ...patch };
  const params = new URLSearchParams();
  if (next.search) params.set('q', next.search);
  if (next.page) params.set('page', String(next.page));
  if (next.selected.length) params.set('compare', next.selected.join(','));
  location.hash = 'experiments' + (next.id ? '/' + next.id : '') + (params.size ? '?' + params : '');
}
