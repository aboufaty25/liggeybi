import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Lock, ArrowRight, Briefcase, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';

const CustomGoogleLoginButton = ({ onSuccess, onError }: { onSuccess: (res: any) => void, onError: (err: any) => void }) => {
  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      onSuccess({ credential: tokenResponse.access_token }); 
    },
    onError: errorResponse => onError(errorResponse)
  });

  return (
    <Button 
      type="button" 
      onClick={() => login()} 
      variant="outline" 
      className="w-full h-12 rounded-xl flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold shadow-sm"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
      S'inscrire via Google
    </Button>
  );
};

const CustomAppleLoginButton = ({ onSuccess, onError }: { onSuccess: (res: any) => void, onError: (err: any) => void }) => {
  return (
    <AppleSignin
      authOptions={{
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.liggeybi.web',
        scope: 'email name',
        redirectURI: window.location.origin + '/apple-callback',
        state: 'state',
        nonce: 'nonce',
        usePopup: true,
      }}
      uiType="dark"
      onSuccess={(response) => onSuccess(response)}
      onError={(error) => onError(error)}
      render={(props: any) => (
        <Button 
          type="button" 
          onClick={props.onClick} 
          variant="outline" 
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#000000" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.58-.8 2.05-.09 3.58.85 4.6 2.3-3.83 2.14-3.14 7.21.9 8.86-.88 2.15-2.12 4.19-4.16 6.1v-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
          S'inscrire via Apple
        </Button>
      )}
    />
  );
};

export function Register() {
  const [role, setRole] = useState<'CANDIDAT' | 'RECRUTEUR'>('CANDIDAT');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user: authUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      if (authUser.role === 'ADMIN') navigate('/admin');
      else if (authUser.role === 'RECRUTEUR') navigate('/recruteur');
      else navigate('/candidat');
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          name: `${firstname} ${lastname}`, 
          role 
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token && data.user) {
          login(data.token, data.user);
          navigate(role === 'RECRUTEUR' ? '/recruteur' : '/candidat');
        } else {
          navigate('/connexion', { state: { message: "Compte créé ! Connectez-vous maintenant." } });
        }
      } else {
        setError(data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential, role: role })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        if (data.user.role === 'ADMIN') navigate('/admin');
        else if (data.user.role === 'RECRUTEUR') navigate('/recruteur');
        else navigate('/candidat');
      } else {
        setError(data.error || "Erreur connexion Google");
      }
    } catch (err) {
      setError("Erreur connexion Google");
    }
  };

  const handleAppleSuccess = async (response: any) => {
    try {
      const res = await fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.authorization?.id_token || response.id_token, user: response.user, role: role })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        if (data.user.role === 'ADMIN') navigate('/admin');
        else if (data.user.role === 'RECRUTEUR') navigate('/recruteur');
        else navigate('/candidat');
      } else {
        setError(data.error || "Erreur connexion Apple");
      }
    } catch (err) {
      setError("Erreur connexion Apple");
    }
  };

  const [serverGoogleClientId, setServerGoogleClientId] = useState<string | null>(null);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState<boolean>(true);
  const [appleAuthEnabled, setAppleAuthEnabled] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/config/auth')
      .then(res => res.json())
      .then(data => {
        setServerGoogleClientId(data.googleClientId);
        setGoogleAuthEnabled(data.googleAuthEnabled !== false);
        setAppleAuthEnabled(data.appleAuthEnabled !== false);
      })
      .catch(console.error);
  }, []);

  const finalGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || serverGoogleClientId || "780963339665-dummy.apps.googleusercontent.com";

  if (serverGoogleClientId === null && !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  const content = (
    <div className="min-h-[90vh] flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-lg rounded-[2.5rem] border-gray-100 shadow-2xl p-4">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Créer un compte</CardTitle>
        <CardDescription className="text-gray-500 font-medium">Rejoignez-nous et boostez votre carrière.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-100">{error}</div>}
        
        <Tabs defaultValue="CANDIDAT" onValueChange={(v) => setRole(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 rounded-xl bg-gray-100 p-1 mb-8">
            <TabsTrigger value="CANDIDAT" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="mr-2 h-4 w-4" /> Candidat
            </TabsTrigger>
            <TabsTrigger value="RECRUTEUR" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Briefcase className="mr-2 h-4 w-4" /> Recruteur
            </TabsTrigger>
          </TabsList>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-xs font-bold uppercase tracking-widest text-gray-500">Prénom</Label>
                <Input 
                  id="firstname" 
                  required
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="Jean" 
                  className="h-12 rounded-xl bg-gray-50 border-none" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="text-xs font-bold uppercase tracking-widest text-gray-500">Nom</Label>
                <Input 
                  id="lastname" 
                  required
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Dupont" 
                  className="h-12 rounded-xl bg-gray-50 border-none" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Professionnel</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com" 
                  className="h-12 rounded-xl pl-10 bg-gray-50 border-none" 
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-gray-500">Mot de passe</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-12 rounded-xl pl-10 bg-gray-50 border-none" 
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-3 mt-4">
              <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-600" />
              <p className="text-xs text-blue-700 font-medium">J'accepte les conditions d'utilisation et la politique de confidentialité de Liggeybi.</p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-14 bg-blue-700 hover:bg-blue-800 text-lg font-black rounded-xl shadow-lg mt-6">
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Créer mon compte <ArrowRight className="ml-2 h-5 w-5" /></>}
            </Button>
          </form>
          
          {(googleAuthEnabled || appleAuthEnabled) && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-bold">Ou continuer avec</span></div>
              </div>

              <div className="flex flex-col items-center justify-center gap-3 mt-4">
                {googleAuthEnabled && finalGoogleClientId && (
                  <CustomGoogleLoginButton 
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Échec de la connexion Google')}
                  />
                )}
                {appleAuthEnabled && (
                  <CustomAppleLoginButton 
                    onSuccess={handleAppleSuccess}
                    onError={() => setError('Échec de la connexion Apple')}
                  />
                )}
              </div>
            </>
          )}

        </Tabs>

        <p className="text-center text-sm font-medium text-gray-500">
          Déjà inscrit ? <Link to="/connexion" className="text-blue-700 font-bold hover:underline">Se connecter</Link>
        </p>
      </CardContent>
    </Card>
  </div>
  );

  return finalGoogleClientId ? (
    <GoogleOAuthProvider clientId={finalGoogleClientId}>
      {content}
    </GoogleOAuthProvider>
  ) : content;
}
