
import { createClient } from 'https://esm.sh/@notionhq/client@2.2.14';
import { Client } from 'https://esm.sh/@notionhq/client@2.2.14/build/src/Client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Log request information for debugging
    console.log(`Received ${req.method} request to notion-page function`);
    
    const notionToken = Deno.env.get('NOTION_TOKEN');
    
    if (!notionToken) {
      console.error('Notion token is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Notion token is not configured',
          message: 'Please set the NOTION_TOKEN in your Supabase project'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    console.log('Notion token is configured, initializing client');
    
    // Create Notion client with the token
    const notion = new Client({ auth: notionToken });
    
    // Using a hardcoded page ID for this example
    // In production, you might want to make this configurable
    const pageId = '1d96b3e4e1aa81a68d30f4e48b24222b';

    console.log(`Fetching Notion blocks for page ID: ${pageId}`);

    // Get the page content using the blocks API
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 50,
    });

    console.log(`Successfully fetched ${response.results.length} blocks from Notion`);
    
    // Return the response
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Notion API Error:', error);
    
    // Create a more detailed error response
    const errorResponse = {
      error: error.message || 'Unknown error',
      stack: error.stack || '',
      message: 'Failed to fetch content from Notion API',
      time: new Date().toISOString(),
    };
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
