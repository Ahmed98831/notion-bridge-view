
import { createClient } from 'https://esm.sh/@notionhq/client@2.2.14';
import { Client } from 'https://esm.sh/@notionhq/client@2.2.14/build/src/Client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notionToken = Deno.env.get('NOTION_TOKEN');
    const notion = new Client({ auth: notionToken });
    const pageId = '1d96b3e4e1aa81a68d30f4e48b24222b';

    const page = await notion.blocks.children.list({
      block_id: pageId,
    });

    return new Response(JSON.stringify(page), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
