export async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error(response.status === 404 ? 'This snapshot could not be found.' : 'The workspace request failed (HTTP ' + response.status + ').');
  return response.json() as Promise<T>;
}
