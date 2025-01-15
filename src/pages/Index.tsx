import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Theme } from "@/components/ThemeProvider";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
         style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80')" }}>
      <div className="w-full max-w-md p-8 rounded-xl backdrop-blur-sm bg-background/30 shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Drone Valais Production</h1>
          <p className="text-white/70">Connectez-vous à votre compte</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: 'dark',
            style: {
              button: {
                background: 'hsl(var(--primary))',
                color: 'white',
                borderRadius: '0.5rem',
              },
              input: {
                background: 'transparent',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
              },
              sign_up: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: "S'inscrire",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Index;