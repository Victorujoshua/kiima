'use server';

export async function fetchTwitterOembed(url: string): Promise<string | null> {
  try {
    const endpoint = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=false`;
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json() as { html?: string };
    return json.html ?? null;
  } catch {
    return null;
  }
}
