import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Users, ArrowLeft, Check, X, Shield, User } from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  role: string;
  status: string;
  created_at: string;
  selectedRole?: string;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data as UserData[]);
      setIsLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar usuarios';
      toast.error(errorMessage);
      if (errorMessage.includes('Token')) {
        navigate('/');
      }
    }
  };

  const handleApprove = async (username: string, role: string) => {
    try {
      await api.approveUser(username, 'approved', role);
      toast.success(`Usuario ${username} aprobado exitosamente`);
      fetchUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al aprobar usuario';
      toast.error(errorMessage);
    }
  };

  const handleReject = async (username: string) => {
    try {
      await api.approveUser(username, 'rejected');
      toast.success(`Usuario ${username} rechazado`);
      fetchUsers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al rechazar usuario';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pendiente' },
      approved: { variant: 'default', label: 'Aprobado' },
      rejected: { variant: 'destructive', label: 'Rechazado' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge className="bg-purple-600">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">
        <User className="w-3 h-3 mr-1" />
        Usuario
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center space-y-4">
          <Users className="w-16 h-16 text-blue-500 animate-pulse mx-auto" />
          <p className="text-white text-lg">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const approvedUsers = users.filter((u) => u.status === 'approved');
  const rejectedUsers = users.filter((u) => u.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
              <p className="text-slate-400 text-sm">Administra los usuarios del sistema</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{pendingUsers.length}</p>
              <p className="text-xs text-slate-400">Pendientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{approvedUsers.length}</p>
              <p className="text-xs text-slate-400">Aprobados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Usuarios pendientes */}
        {pendingUsers.length > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-yellow-500" />
                Usuarios Pendientes de Aprobación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user.username}</p>
                        <p className="text-xs text-slate-400">
                          Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        defaultValue="user"
                        onValueChange={(role) => {
                          user.selectedRole = role;
                        }}
                      >
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleApprove(user.username, user.selectedRole || 'user')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => handleReject(user.username)}
                        size="sm"
                        variant="destructive"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usuarios aprobados */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-green-500" />
              Usuarios Aprobados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 text-slate-400 font-medium">Usuario</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Rol</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Estado</th>
                    <th className="text-left py-3 text-slate-400 font-medium">Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-800">
                      <td className="py-3 text-white font-medium">{user.username}</td>
                      <td className="py-3">{getRoleBadge(user.role)}</td>
                      <td className="py-3">{getStatusBadge(user.status)}</td>
                      <td className="py-3 text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Usuarios rechazados */}
        {rejectedUsers.length > 0 && (
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-red-500" />
                Usuarios Rechazados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-slate-400 font-medium">Usuario</th>
                      <th className="text-left py-3 text-slate-400 font-medium">Estado</th>
                      <th className="text-left py-3 text-slate-400 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-800">
                        <td className="py-3 text-white font-medium">{user.username}</td>
                        <td className="py-3">{getStatusBadge(user.status)}</td>
                        <td className="py-3 text-slate-400">
                          {new Date(user.created_at).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
