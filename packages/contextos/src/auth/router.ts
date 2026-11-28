import { MaestroConDetalleGruposReglas } from '@olula/ctx/auth/grupos/maestro/MaestroConDetalleGruposReglas.tsx';
import { MaestroApiKeys } from './apikey/maestro/MaestroApiKeys.tsx';
import { MaestroConDetalleEventoCola } from "./evento_cola/maestro/MaestroConDetalleEventoCola.tsx";
import { Login } from './login/vistas/Login.tsx';
import { MiCuenta } from './mi_cuenta/detalle/MiCuenta.tsx';
import { ResetPassword } from './login/vistas/ResetPassword.tsx';
import { VerificarEnlaceMagicoPasskey } from './passkey/vistas/VerificarEnlaceMagicoPasskey.tsx';
import { Logout } from './usuario/logout/Logout.tsx';
import { MaestroConDetalleUsuario } from "./usuario/maestro/MaestroConDetalleUsuario.tsx";
import Perfil from './usuario/perfil/Perfil.tsx';

export const routerAuth = {
    "auth/usuario": MaestroConDetalleUsuario,
    "auth/grupo": MaestroConDetalleGruposReglas,
    "auth/evento_cola": MaestroConDetalleEventoCola,
    "auth/apikey": MaestroApiKeys,
    "auth/mi_cuenta": MiCuenta,
    "login": Login,
    "logout": Logout,
    "usuario/perfil": Perfil,
    "auth/passkey/enlace-magico": VerificarEnlaceMagicoPasskey,
    "auth/reset-password": ResetPassword,
}