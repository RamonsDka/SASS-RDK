import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Server } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.login(loginData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await api.register({
        username: registerData.username,
        password: registerData.password,
      });
      toast.success('Registro exitoso. Pendiente de aprobación por administrador.');
      setRegisterData({ username: '', password: '', confirmPassword: '' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrarse';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNGgydjJoLTJ2LTJ6bS0yIDJ2LTJoLTJ2Mmgyem0wLTJ2LTJoMnYyaC0yem0wIDZ2LTJoMnYyaC0yem0yLTJ2Mmgydi0yaC0yem0wIDBoMnYtMmgtMnYyem0yLTJ2LTJoMnYyaC0yem0wIDBoLTJ2Mmgydi0yem0wIDJ2Mmgydi0yaC0yem0wIDBoLTJ2Mmgydi0yem0yIDBoMnYtMmgtMnYyem0wIDBodjJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-slate-700 bg-slate-800/90 backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Server className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">RDK Server Monitor</CardTitle>
          <CardDescription className="text-slate-300">
            Monitor de recursos del sistema en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-slate-200">Usuario</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-200">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-slate-200">Usuario</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Elige un usuario"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-slate-200">Contraseña</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm" className="text-slate-200">Confirmar Contraseña</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Tu cuenta será revisada por un administrador antes de ser aprobada
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
