
import { createClient } from 'https://esm.sh/@notionhq/client@2.2.14';
import { Client } from 'https://esm.sh/@notionhq/client@2.2.14/build/src/Client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notionToken = Deno.env.get('NOTION_TOKEN');
    
    if (!notionToken) {
      console.error('Notion token is not configured');
      throw new Error('Notion token is not configured');
    }
    
    // Create Notion client with the token
    const notion = new Client({ auth: notionToken });
    
    // The page ID without hyphens
    const pageId = '1d96b3e4e1aa81a68d30f4e48b24222b';

    // Get the page content using the blocks API
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    console.log('Notion API Response:', JSON.stringify(response));
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Notion API Error:', error);
    
    // Detailed error response for debugging
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        stack: error.stack,
        message: 'Failed to fetch content from Notion API'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
