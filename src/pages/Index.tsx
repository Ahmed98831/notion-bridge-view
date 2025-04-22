
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NotionContent } from "@/components/NotionContent";

const Index = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {user ? (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Welcome to Your Dashboard</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <NotionContent />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
            <p className="text-xl text-gray-600 mb-8">Start by logging in or creating an account!</p>
            <Button asChild>
              <Link to="/auth">Login / Sign Up</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
