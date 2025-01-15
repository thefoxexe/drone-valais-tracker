import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        navigate("/login");
      } else if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "Réinitialisation du mot de passe",
          description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

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
            theme: ThemeSupa,
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
          providers={[]}
          view="sign_in"
          showLinks={true}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                loading_button_label: 'Connexion en cours...',
                email_input_placeholder: 'Votre adresse email',
                password_input_placeholder: 'Votre mot de passe',
                link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
              },
              sign_up: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: "S'inscrire",
                loading_button_label: 'Inscription en cours...',
                email_input_placeholder: 'Votre adresse email',
                password_input_placeholder: 'Choisissez un mot de passe',
                link_text: "Vous avez déjà un compte ? Connectez-vous",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Index;