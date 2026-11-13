import { MetaModelo, puede, stringNoVacio } from "@olula/lib/dominio.ts";
import {
    CategoriaCredencialExterna, CredencialExterna, SecretoCredencialExterna, TipoAuthCredencialExterna,
} from "./diseño.ts";

const CAMPOS_SECRETO_POR_TIPO: Record<TipoAuthCredencialExterna, string[]> = {
    api_key: ["api_key"],
    bearer: ["token"],
    basic: ["usuario", "password"],
    oauth2: ["client_id", "client_secret"],
};

export interface CampoSecreto {
    clave: string;
    etiqueta: string;
    contraseña?: boolean;
    /** Si es true, no lo exige `secretoCompleto` (p.ej. "modelo" de Gemini, que
     * tiene un valor por defecto razonable en el backend si se deja vacío). */
    opcional?: boolean;
    /** Si se informa, el campo es un desplegable con estos valores en vez de texto
     * libre (p.ej. el modo test/live de Stripe). */
    opciones?: { valor: string; descripcion: string }[];
    /** "cuenta_bancaria": desplegable con las cuentas bancarias de la empresa
     * (p.ej. la cuenta en la que se apuntan los cobros de Stripe). */
    tipo?: "cuenta_bancaria";
}

export interface ProveedorConocido {
    valor: string;
    categoria: CategoriaCredencialExterna;
    tipoAuth: TipoAuthCredencialExterna;
    /** Nombre de icono de QIcono (packages/componentes/src/atomos/qicono.tsx). */
    icono: string;
    campos: CampoSecreto[];
}

/**
 * Catálogo de integraciones ya soportadas por el asistente de IA (modelo LLM
 * y flujos/tareas programadas — ver comun/tarea_programada_ia). Cada una fija
 * su propia forma de secreto — más específica que el genérico
 * `CAMPOS_SECRETO_POR_TIPO` — para que el formulario pida justo lo que hace
 * falta (p.ej. host/puerto de IMAP y SMTP, que no son "el secreto" en sí
 * pero viajan cifrados junto a él porque no hay otro sitio no-sensible donde
 * guardarlos). `proveedor` sigue siendo un string libre a nivel de dominio
 * (ver diseño.ts) para no cerrar la puerta a futuras integraciones que no
 * necesiten un formulario a medida — esas usan "Otro" (ver OTRO_PROVEEDOR),
 * solo disponible para conectores (categoria='conector'), nunca para el LLM:
 * un proveedor de IA sin dispatch en el backend no serviría de nada.
 */
export const PROVEEDORES_CONOCIDOS: ProveedorConocido[] = [
    {
        valor: "Gemini",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "google",
        campos: [
            { clave: "api_key", etiqueta: "API key", contraseña: true },
            { clave: "modelo", etiqueta: "Modelo (opcional — por defecto gemini-2.5-pro)", opcional: true },
        ],
    },
    {
        valor: "OpenAI",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "openai",
        campos: [
            { clave: "api_key", etiqueta: "API key", contraseña: true },
            { clave: "modelo", etiqueta: "Modelo (opcional — por defecto gpt-4.1)", opcional: true },
        ],
    },
    {
        valor: "Anthropic",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "anthropic",
        campos: [
            { clave: "api_key", etiqueta: "API key", contraseña: true },
            { clave: "modelo", etiqueta: "Modelo (opcional — por defecto claude-sonnet-5)", opcional: true },
        ],
    },
    {
        valor: "Mistral",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "mistral",
        campos: [
            { clave: "api_key", etiqueta: "API key", contraseña: true },
            { clave: "modelo", etiqueta: "Modelo (opcional — por defecto mistral-large-latest)", opcional: true },
        ],
    },
    {
        valor: "Azure OpenAI",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "azure",
        campos: [
            { clave: "api_key", etiqueta: "API key", contraseña: true },
            { clave: "endpoint", etiqueta: "Endpoint (p.ej. https://mi-recurso.openai.azure.com)" },
            { clave: "despliegue", etiqueta: "Nombre del despliegue" },
            { clave: "version_api", etiqueta: "Versión de la API (opcional)", opcional: true },
        ],
    },
    {
        // Sin api_key: Ollama sirve modelos autoalojados en la propia infraestructura
        // del cliente. `tipoAuth: "api_key"` no describe bien este caso (no hay
        // ninguna clave), pero es un campo obligatorio a nivel de dominio y ninguno
        // de los 4 valores encaja mejor — no afecta a qué campos pide el formulario,
        // que vienen siempre de `campos`, no de `tipoAuth`, para un proveedor conocido.
        valor: "Ollama",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "ollama",
        campos: [
            { clave: "base_url", etiqueta: "URL del servidor (p.ej. http://localhost:11434)" },
            { clave: "modelo", etiqueta: "Modelo (debe soportar tool-calling, p.ej. llama3.1, qwen2.5)" },
        ],
    },
    {
        valor: "Telegram",
        categoria: "conector",
        tipoAuth: "api_key",
        icono: "telegram",
        campos: [
            { clave: "bot_token", etiqueta: "Token del bot", contraseña: true },
            {
                clave: "chat_id_autorizado",
                etiqueta: "Tu ID numérico de Telegram (p.ej. vía @userinfobot)",
            },
        ],
        // `chat_id_autorizado` es obligatorio (no `opcional: true`) a propósito: sin él,
        // el webhook de mensajes entrantes (consultas/comun/ia/aplicacion_telegram.py)
        // no tiene forma de saber quién puede escribirle al bot con tus permisos — un
        // bot puede recibir mensajes de cualquiera que le escriba, o de cualquier
        // miembro de un grupo en el que esté metido.
    },
    {
        // Solo client_id/client_secret: a diferencia del antiguo stub de "Gmail",
        // el refresh_token ya NO se pega a mano — lo obtiene el flujo OAuth2 real al
        // pulsar "Conectar con Google" en el detalle (ver DetalleCredencialExterna.tsx),
        // que lo persiste junto al access_token sin que el usuario los vea nunca.
        valor: "Google Drive",
        categoria: "conector",
        tipoAuth: "oauth2",
        icono: "google",
        campos: [
            { clave: "client_id", etiqueta: "Client ID" },
            { clave: "client_secret", etiqueta: "Client secret", contraseña: true },
        ],
    },
    {
        valor: "Google Calendar",
        categoria: "conector",
        tipoAuth: "oauth2",
        icono: "google",
        campos: [
            { clave: "client_id", etiqueta: "Client ID" },
            { clave: "client_secret", etiqueta: "Client secret", contraseña: true },
        ],
    },
    {
        valor: "Correo (IMAP/SMTP)",
        categoria: "conector",
        tipoAuth: "basic",
        icono: "correo",
        campos: [
            { clave: "usuario", etiqueta: "Usuario" },
            { clave: "password", etiqueta: "Contraseña", contraseña: true },
            { clave: "imap_host", etiqueta: "Servidor IMAP (entrada)" },
            { clave: "imap_puerto", etiqueta: "Puerto IMAP" },
            { clave: "smtp_host", etiqueta: "Servidor SMTP (salida)" },
            { clave: "smtp_puerto", etiqueta: "Puerto SMTP" },
        ],
    },
    {
        // Cobros con tarjeta (plugin stripe): enlaces de pago de recibos y
        // facturas y QR del TPV. Al guardar, el backend da de alta el webhook en
        // Stripe y guarda su secreto junto a las claves (ver comandos/comun/
        // credencial_externa/stripe_conector.py); el usuario no configura nada en
        // el panel de Stripe. Fuera de producción se cobra siempre en test.
        valor: "Stripe",
        categoria: "conector",
        tipoAuth: "api_key",
        icono: "tarjeta",
        campos: [
            {
                clave: "modo",
                etiqueta: "Modo de cobro",
                opciones: [
                    { valor: "test", descripcion: "Test (pruebas, sin cobros reales)" },
                    { valor: "live", descripcion: "Live (cobros reales)" },
                ],
            },
            {
                // La cuenta propia de la pasarela: el webhook paga ahí los recibos y
                // luego se concilia con las transferencias de Stripe al banco.
                clave: "cuenta_banco_id",
                etiqueta: "Cuenta donde se apuntan los cobros",
                tipo: "cuenta_bancaria",
            },
            { clave: "secret_key_test", etiqueta: "Clave secreta de test (sk_test_… o rk_test_…)", contraseña: true },
            { clave: "publishable_key_test", etiqueta: "Clave publicable de test (pk_test_…)", opcional: true },
            {
                clave: "secret_key_live",
                etiqueta: "Clave secreta de live (sk_live_… o rk_live_…)",
                contraseña: true,
                opcional: true,
            },
            { clave: "publishable_key_live", etiqueta: "Clave publicable de live (pk_live_…)", opcional: true },
        ],
    },
];

export const OTRO_PROVEEDOR = "Otro";
export const ICONO_OTRO_PROVEEDOR = "ajustes";

export const buscarProveedorConocido = (proveedor: string): ProveedorConocido | undefined =>
    PROVEEDORES_CONOCIDOS.find((p) => p.valor === proveedor);

export const proveedoresPorCategoria = (categoria: CategoriaCredencialExterna): ProveedorConocido[] =>
    PROVEEDORES_CONOCIDOS.filter((p) => p.categoria === categoria);

export const opcionesProveedorPorCategoria = (
    categoria: CategoriaCredencialExterna
): { valor: string; descripcion: string }[] => [
    ...proveedoresPorCategoria(categoria).map((p) => ({ valor: p.valor, descripcion: p.valor })),
    ...(categoria === "conector" ? [{ valor: OTRO_PROVEEDOR, descripcion: "Otro (especificar)" }] : []),
];

export const iconoProveedor = (proveedor: string): string =>
    buscarProveedorConocido(proveedor)?.icono ?? ICONO_OTRO_PROVEEDOR;

/**
 * Comprueba que el secreto trae todos los campos que exige el proveedor (si
 * es uno conocido, ver PROVEEDORES_CONOCIDOS) o si no `tipoAuth` — usado para
 * habilitar el botón de alta (ver crear/CrearCredencialExterna.tsx), donde no
 * hay ningún secreto ya guardado con el que completar lo que falte.
 */
export const secretoCompleto = (
    proveedor: string,
    tipoAuth: TipoAuthCredencialExterna,
    secreto: SecretoCredencialExterna,
): boolean => {
    const campos = buscarProveedorConocido(proveedor)?.campos
        .filter((campo) => !campo.opcional)
        .map((campo) => campo.clave)
        ?? CAMPOS_SECRETO_POR_TIPO[tipoAuth];

    return campos.every((campo) => stringNoVacio(secreto[campo] ?? ""));
};

/**
 * Comprueba que el formulario de edición (ver rotar/RotarCredencialExterna.tsx)
 * trae AL MENOS un campo relleno — a diferencia de `secretoCompleto` (alta),
 * aquí no hace falta rellenarlos todos: el backend fusiona lo que se manda
 * con el secreto ya persistido (ver comandos/comun/credencial_externa/
 * aplicacion/cambiar/caso_de_uso.py en el servidor), así que un campo en
 * blanco significa "no lo toques", no "bórralo". Sin esta comprobación se
 * podría mandar un PATCH vacío que no cambia nada.
 */
export const secretoConCambios = (secreto: SecretoCredencialExterna): boolean =>
    Object.values(secreto).some((valor) => stringNoVacio(valor));

export const credencialExternaVacia: CredencialExterna = {
    id: "",
    empresaId: "",
    nombre: "",
    proveedor: "",
    tipoAuth: "api_key",
    activo: true,
    creadoPor: "",
    creadoEn: new Date(0),
    actualizadoEn: new Date(0),
    propietarioId: null,
    categoria: "conector",
};

export const OPCIONES_TIPO_AUTH: { valor: TipoAuthCredencialExterna; descripcion: string }[] = [
    { valor: "api_key", descripcion: "API key" },
    { valor: "bearer", descripcion: "Token Bearer" },
    { valor: "basic", descripcion: "Usuario y contraseña" },
    { valor: "oauth2", descripcion: "OAuth2 (Client ID / Secret)" },
];

/**
 * Metadatos del formulario de detalle. `tipoAuth` no es editable tras la
 * creación (el backend no lo permite — cambiar de forma de autenticación
 * invalidaría la forma del secreto ya guardado), ni tampoco `activo`
 * (se alterna con la acción "Activar/Desactivar") ni el secreto (se rota
 * con su propio modal, ver rotar/RotarCredencialExterna.tsx).
 */
export const metaCredencialExterna: MetaModelo<CredencialExterna> = {
    campos: {
        nombre: {
            requerido: true,
            validacion: (m: CredencialExterna) => stringNoVacio(m.nombre),
        },
        proveedor: {
            requerido: true,
            validacion: (m: CredencialExterna) => stringNoVacio(m.proveedor),
        },
    },
    editable: () => puede("comun.credencial_externa"),
};
