export async function fetchGitHub<T>(endpoint: string): Promise<T> {
    const url = `https://api.github.com${endpoint}`;

    try {
        const res = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            },
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            if (process.env.NODE_ENV === 'development') {
                console.error(`GitHub API Error [${res.status}]: ${res.statusText} → ${url}`);
            }
            throw new Error(`GitHub API request failed for ${endpoint}`);
        }

        return await res.json() as T;
    } catch (error) {
        console.error('GitHub Fetch Failed:', error);
        // 👇 return correct type (fallback empty array only if T is an array)
        return [] as unknown as T;
    }
}
