
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotionBlock {
  type: string;
  paragraph?: {
    rich_text: Array<{
      plain_text: string;
    }>;
  };
}

export const NotionContent = () => {
  const [content, setContent] = useState<NotionBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const fetchNotionContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('notion-page');
      
      if (functionError) {
        console.error('Function invocation error:', functionError);
        throw new Error(`Function error: ${functionError.message}`);
      }
      
      // Validate the response
      if (!data) {
        throw new Error('No data returned from Notion API');
      }
      
      if (!data.results || !Array.isArray(data.results)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from Notion API');
      }
      
      // Set the content
      setContent(data.results);
    } catch (err) {
      console.error('Error fetching Notion content:', err);
      
      let errorMessage = 'Failed to load content from Notion. Please try again later.';
      if (err instanceof Error) {
        errorMessage = `${errorMessage} (${err.message})`;
      }
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load content. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotionContent();
  }, [retryCount, toast]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={handleRetry}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </Alert>
    );
  }

  if (content.length === 0) {
    return (
      <Alert className="mb-4">
        <AlertTitle>No Content</AlertTitle>
        <AlertDescription>
          No content was found on this Notion page. Make sure the page has content and the integration has access.
        </AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={handleRetry}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </Alert>
    );
  }

  return (
    <div className="prose prose-slate max-w-none">
      {content.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index} className="mb-4 text-gray-700">
              {block.paragraph?.rich_text?.map((text, i) => (
                <span key={i}>{text.plain_text}</span>
              )) || 'Empty paragraph'}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
};
