import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Server,
  Thermometer,
  Clock,
  LogOut,
  Users,
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    physicalCores: number;
    speed: number;
    usage: string;
    loadAverage: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: string;
  };
  disk: Array<{
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    usagePercent: string;
    mount: string;
  }>;
  network: Array<{
    iface: string;
    rx_bytes: number;
    tx_bytes: number;
    rx_sec: number;
    tx_sec: number;
  }>;
  os: {
    platform: string;
    distro: string;
    release: string;
    kernel: string;
    arch: string;
    hostname: string;
  };
  processes: {
    all: number;
    running: number;
    blocked: number;
    sleeping: number;
    list: Array<{
      pid: number;
      name: string;
      cpu: number;
      mem: number;
    }>;
  };
  temperature: {
    main: number;
    cores: number[];
    max: number;
  };
  uptime: number;
}

interface UserInfo {
  username: string;
  role: string;
  status: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000); // Actualizar cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await api.getSystemMetrics();
      setMetrics(data);
      setIsLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      if (errorMessage.includes('Token')) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center space-y-4">
          <Activity className="w-16 h-16 text-blue-500 animate-pulse mx-auto" />
          <p className="text-white text-lg">Cargando métricas del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400 text-sm">Monitor de Recursos del Sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-semibold">Hola, {user?.username}</p>
              <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Badge>
            </div>
            {user?.role === 'admin' && (
              <Button
                onClick={() => navigate('/users')}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Usuarios
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* CPU */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">CPU</CardTitle>
            <Cpu className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {metrics?.cpu.usage}%
            </div>
            <Progress value={parseFloat(metrics?.cpu.usage || '0')} className="h-2 mb-2" />
            <p className="text-xs text-slate-400">
              {metrics?.cpu.brand} • {metrics?.cpu.cores} núcleos
            </p>
          </CardContent>
        </Card>

        {/* Memoria */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Memoria RAM</CardTitle>
            <MemoryStick className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {metrics?.memory.usagePercent}%
            </div>
            <Progress value={parseFloat(metrics?.memory.usagePercent || '0')} className="h-2 mb-2" />
            <p className="text-xs text-slate-400">
              {formatBytes(metrics?.memory.used || 0)} / {formatBytes(metrics?.memory.total || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Temperatura */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Temperatura</CardTitle>
            <Thermometer className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {metrics?.temperature.main.toFixed(1)}°C
            </div>
            <Progress 
              value={(metrics?.temperature.main || 0) > 0 ? (metrics?.temperature.main / 100) * 100 : 0} 
              className="h-2 mb-2" 
            />
            <p className="text-xs text-slate-400">
              Máx: {metrics?.temperature.max.toFixed(1)}°C
            </p>
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Tiempo Activo</CardTitle>
            <Clock className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">
              {formatUptime(metrics?.uptime || 0)}
            </div>
            <p className="text-xs text-slate-400">
              {metrics?.os.distro} {metrics?.os.release}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información detallada */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discos */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <HardDrive className="w-5 h-5 text-blue-500" />
              Almacenamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics?.disk.map((disk, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">{disk.mount}</span>
                  <span className="text-sm text-slate-400">{disk.usagePercent}%</span>
                </div>
                <Progress value={parseFloat(disk.usagePercent)} className="h-2" />
                <p className="text-xs text-slate-500">
                  {formatBytes(disk.used)} / {formatBytes(disk.size)} • {disk.type}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Red */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Network className="w-5 h-5 text-green-500" />
              Red
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics?.network.slice(0, 3).map((net, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">{net.iface}</span>
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                    Activa
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500">Descarga</p>
                    <p className="text-white font-semibold">{formatBytes(net.rx_sec)}/s</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Subida</p>
                    <p className="text-white font-semibold">{formatBytes(net.tx_sec)}/s</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Procesos principales */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-purple-500" />
              Procesos Principales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400 font-medium">PID</th>
                    <th className="text-left py-2 text-slate-400 font-medium">Nombre</th>
                    <th className="text-right py-2 text-slate-400 font-medium">CPU %</th>
                    <th className="text-right py-2 text-slate-400 font-medium">RAM %</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.processes.list.map((proc, index) => (
                    <tr key={index} className="border-b border-slate-800">
                      <td className="py-2 text-slate-300">{proc.pid}</td>
                      <td className="py-2 text-white font-medium">{proc.name}</td>
                      <td className="py-2 text-right text-slate-300">{proc.cpu.toFixed(1)}%</td>
                      <td className="py-2 text-right text-slate-300">{proc.mem.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Total de procesos: {metrics?.processes.all}</span>
              <span>En ejecución: {metrics?.processes.running}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
