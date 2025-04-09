'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

export default function AuthForm() {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark" // Or dynamically set based on app theme
            providers={['google']} // Use Google Sign-In as configured
            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`} // Ensure this matches Supabase settings
          />
        </div>
      </div>
    );
  } else {
    // Optionally, redirect or show a message if the user is already logged in
    // For now, returning null or a simple message
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>You are already logged in. Redirecting...</p>
            {/* Consider adding a redirect here, e.g., using useRouter */}
        </div>
    );
    // Example redirect using next/navigation:
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // useEffect(() => { if(session) router.push('/') }, [session, router]);
  }
} 