
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotionContent = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('notion-page');
        
        if (error) throw error;
        
        setContent(data.results);
      } catch (error) {
        console.error('Error fetching Notion content:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load content. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotionContent();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none">
      {content.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={index} className="mb-4 text-gray-700">
              {block.paragraph?.rich_text.map((text, i) => (
                <span key={i}>{text.plain_text}</span>
              ))}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
};
