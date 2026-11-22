const path = "/api/short-diagrams";
const objectKey = "lp/short-diagrams.json";

export default {
    async fetch(request, env) {
        if (new URL(request.url).pathname !== path) {
            return env.ASSETS.fetch(request);
        }
        if (request.method !== "GET" && request.method !== "HEAD") {
            return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
        }
        try {
            const index = await env.SNS_MEDIA.get(objectKey);
            if (index) {
                return new Response(request.method === "HEAD" ? null : index.body, {
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        "Cache-Control": "public, max-age=30",
                        "X-Content-Type-Options": "nosniff"
                    }
                });
            }
        } catch {
            // The homepage keeps its static links if the index is unavailable.
        }
        return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
};
