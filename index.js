export default {
    async fetch(request, env) {
        // 设置 CORS
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        try {
            const formData = await request.formData();
            const imageFile = formData.get('image_file');

            if (!imageFile) {
                return new Response(JSON.stringify({ error: 'No image provided' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            // 调用 Remove.bg API
            const removeBgFormData = new FormData();
            removeBgFormData.append('image_file', imageFile);
            removeBgFormData.append('size', 'auto');

            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': env.REMOVE_BG_API_KEY
                },
                body: removeBgFormData
            });

            if (!response.ok) {
                const error = await response.json();
                return new Response(JSON.stringify(error), {
                    status: response.status,
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                });
            }

            const resultBlob = await response.blob();

            return new Response(resultBlob, {
                headers: {
                    'Content-Type': 'image/png',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Disposition': 'attachment; filename="removed-bg.png"'
                }
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
    }
};
