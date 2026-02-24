import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Briefcase, Shield } from 'lucide-react';
import logoVistto from '@/assets/logo_vistto.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const roles: {value: UserRole;label: string;icon: React.ElementType;description: string;}[] = [
{ value: 'admin', label: 'Administrador', icon: Shield, description: 'Acesso total ao sistema' },
{ value: 'employee', label: 'Funcionário', icon: Briefcase, description: 'Realizar vistorias' }];


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Selecione um perfil para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="flex items-center gap-4 mb-8">
              <img src={logoVistto} alt="Vistto" className="h-16 w-16 object-contain" />
              <div>
                <h1 className="text-3xl font-bold">ViSTTO</h1>
                <p className="text-primary-foreground/80">Proteção Veicular</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Proteção completa para seu veículo
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-md">
            Gerencie a proteção do seu veículo de forma simples e segura. 
            Realize vistorias online e acompanhe tudo em tempo real.
          </p>
          
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold">5.000+</p>
              <p className="text-primary-foreground/70">Veículos protegidos</p>
            </div>
            <div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-primary-foreground/70">Satisfação</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-primary-foreground/70">Suporte</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md animate-fade-in">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <img src={logoVistto} alt="Vistto" className="h-12 w-12 object-contain" />
              <h1 className="text-2xl font-bold text-foreground">Vistto</h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
              <p className="text-muted-foreground mt-2">Entre com suas credenciais para acessar</p>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-foreground mb-3 block">Selecione seu perfil</Label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) =>
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                    selectedRole === role.value ?
                    'border-primary bg-primary/5 text-primary' :
                    'border-border bg-card hover:border-primary/50'
                  )}>

                    <role.icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{role.label}</span>
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12" />

              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12" />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">

                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error &&
              <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                  {error}
                </p>
              }

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                size="lg"
                disabled={isLoading}>

                {isLoading ?
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entrando...
                  </span> :

                'Entrar'
                }
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Use qualquer e-mail e senha (mín. 4 caracteres) para testar
            </p>
          </div>
        </div>
      </div>
    </div>);

}