import parseBackground from "~/lib/utils/schedule/parse-background";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await parseBackground()
        return new Response(JSON.stringify({ status: 'ok' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (e) {
        console.error(e)
        return new Response(JSON.stringify({ status: 'error', error: e.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}