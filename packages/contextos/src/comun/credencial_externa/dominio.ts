import { MetaModelo, puede, stringNoVacio } from "@olula/lib/dominio.ts";
import {
    CategoriaCredencialExterna, CredencialExterna, SecretoCredencialExterna, TipoAuthCredencialExterna,
} from "./diseño.ts";
import { getConfiguracionCredenciales } from "./configuracion.ts";
import { tComun } from "../i18n/index.ts";

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
            { clave: "api_key", get etiqueta() { return tComun("credencialExterna.apiKey"); }, contraseña: true },
            { clave: "modelo", get etiqueta() { return tComun("credencialExterna.modeloOpcionalPorDefectoGemini2"); }, opcional: true },
        ],
    },
    {
        valor: "OpenAI",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "openai",
        campos: [
            { clave: "api_key", get etiqueta() { return tComun("credencialExterna.apiKey"); }, contraseña: true },
            { clave: "modelo", get etiqueta() { return tComun("credencialExterna.modeloOpcionalPorDefectoGpt4"); }, opcional: true },
        ],
    },
    {
        valor: "Anthropic",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "anthropic",
        campos: [
            { clave: "api_key", get etiqueta() { return tComun("credencialExterna.apiKey"); }, contraseña: true },
            { clave: "modelo", get etiqueta() { return tComun("credencialExterna.modeloOpcionalPorDefectoClaudeSonnet"); }, opcional: true },
        ],
    },
    {
        valor: "Mistral",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "mistral",
        campos: [
            { clave: "api_key", get etiqueta() { return tComun("credencialExterna.apiKey"); }, contraseña: true },
            { clave: "modelo", get etiqueta() { return tComun("credencialExterna.modeloOpcionalPorDefectoMistralLarge"); }, opcional: true },
        ],
    },
    {
        valor: "Azure OpenAI",
        categoria: "llm",
        tipoAuth: "api_key",
        icono: "azure",
        campos: [
            { clave: "api_key", get etiqueta() { return tComun("credencialExterna.apiKey"); }, contraseña: true },
            { clave: "endpoint", get etiqueta() { return tComun("credencialExterna.endpointPEjHttpsMiRecurso"); } },
            { clave: "despliegue", get etiqueta() { return tComun("credencialExterna.nombreDelDespliegue"); } },
            { clave: "version_api", get etiqueta() { return tComun("credencialExterna.versionDeLaApiOpcional"); }, opcional: true },
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
            { clave: "base_url", get etiqueta() { return tComun("credencialExterna.urlDelServidorPEjHttp"); } },
            { clave: "modelo", get etiqueta() { return tComun("credencialExterna.modeloDebeSoportarToolCallingP"); } },
        ],
    },
    {
        valor: "Telegram",
        categoria: "conector",
        tipoAuth: "api_key",
        icono: "telegram",
        campos: [
            { clave: "bot_token", get etiqueta() { return tComun("credencialExterna.tokenDelBot"); }, contraseña: true },
            {
                clave: "chat_id_autorizado",
                get etiqueta() { return tComun("credencialExterna.tuIdNumericoDeTelegramP"); },
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
            { clave: "client_id", get etiqueta() { return tComun("credencialExterna.clientId"); } },
            { clave: "client_secret", get etiqueta() { return tComun("credencialExterna.clientSecret"); }, contraseña: true },
        ],
    },
    {
        valor: "Google Calendar",
        categoria: "conector",
        tipoAuth: "oauth2",
        icono: "google",
        campos: [
            { clave: "client_id", get etiqueta() { return tComun("credencialExterna.clientId"); } },
            { clave: "client_secret", get etiqueta() { return tComun("credencialExterna.clientSecret"); }, contraseña: true },
        ],
    },
    {
        valor: "Correo (IMAP/SMTP)",
        categoria: "conector",
        tipoAuth: "basic",
        icono: "correo",
        campos: [
            { clave: "usuario", get etiqueta() { return tComun("credencialExterna.usuario"); } },
            { clave: "password", get etiqueta() { return tComun("credencialExterna.contrasena"); }, contraseña: true },
            { clave: "imap_host", get etiqueta() { return tComun("credencialExterna.servidorImapEntrada"); } },
            { clave: "imap_puerto", get etiqueta() { return tComun("credencialExterna.puertoImap"); } },
            { clave: "smtp_host", get etiqueta() { return tComun("credencialExterna.servidorSmtpSalida"); } },
            { clave: "smtp_puerto", get etiqueta() { return tComun("credencialExterna.puertoSmtp"); } },
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
                get etiqueta() { return tComun("credencialExterna.modoDeCobro"); },
                opciones: [
                    { valor: "test", get descripcion() { return tComun("credencialExterna.testPruebasSinCobrosReales"); } },
                    { valor: "live", get descripcion() { return tComun("credencialExterna.liveCobrosReales"); } },
                ],
            },
            {
                // La cuenta propia de la pasarela: el webhook paga ahí los recibos y
                // luego se concilia con las transferencias de Stripe al banco.
                clave: "cuenta_banco_id",
                get etiqueta() { return tComun("credencialExterna.cuentaDondeSeApuntanLosCobros"); },
                tipo: "cuenta_bancaria",
            },
            { clave: "secret_key_test", get etiqueta() { return tComun("credencialExterna.claveSecretaDeTestSkTest"); }, contraseña: true },
            { clave: "publishable_key_test", get etiqueta() { return tComun("credencialExterna.clavePublicableDeTestPkTest"); }, opcional: true },
            {
                clave: "secret_key_live",
                get etiqueta() { return tComun("credencialExterna.claveSecretaDeLiveSkLive"); },
                contraseña: true,
                opcional: true,
            },
            { clave: "publishable_key_live", get etiqueta() { return tComun("credencialExterna.clavePublicableDeLivePkLive"); }, opcional: true },
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
    ...(categoria === "conector" ? [{ valor: OTRO_PROVEEDOR, descripcion: tComun("credencialExterna.otroEspecificar") }] : []),
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
        // Lo que la app oculta (p. ej. la cuenta bancaria en el backoffice) no se exige.
        .filter((campo) => !(campo.tipo === "cuenta_bancaria" && getConfiguracionCredenciales().sinCuentaBancaria))
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
    { valor: "api_key", get descripcion() { return tComun("credencialExterna.apiKey"); } },
    { valor: "bearer", get descripcion() { return tComun("credencialExterna.tokenBearer"); } },
    { valor: "basic", get descripcion() { return tComun("credencialExterna.usuarioYContrasena"); } },
    { valor: "oauth2", get descripcion() { return tComun("credencialExterna.oauth2ClientIdSecret"); } },
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
