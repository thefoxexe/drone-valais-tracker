import { LoginForm } from "@/components/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80')" }}>
      <div className="w-full max-w-md p-8 rounded-xl backdrop-blur-sm bg-primary/30 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Drone Valais Production</h1>
          <p className="text-white/70">Connectez-vous à votre compte</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;