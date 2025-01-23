import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-background', {
        videoId: 'U5gptyRV8IU',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          loop: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          mute: 1,
          playlist: 'U5gptyRV8IU', // needed for looping
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
        }
      });
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* YouTube Background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative w-full h-full">
          <div 
            id="youtube-background"
            className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 z-10" />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md p-8 rounded-xl backdrop-blur-sm bg-background/30 shadow-2xl z-20">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/e2ad46c3-367b-4223-acfa-1217eaef449a.png" 
            alt="Logo" 
            className="h-20 w-auto mx-auto mb-4" 
          />
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
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
              },
              anchor: {
                color: 'white',
              },
              label: {
                color: 'white',
              },
            },
            className: {
              input: 'text-white placeholder-white/50',
            },
          }}
          providers={[]}
          view="sign_in"
          showLinks={false}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                loading_button_label: 'Connexion en cours...',
                email_input_placeholder: 'Votre adresse email',
                password_input_placeholder: 'Votre mot de passe',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Index;
