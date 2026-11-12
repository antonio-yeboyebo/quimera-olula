/** Clave pública de Cloudflare Turnstile; sin ella el registro no muestra captcha. */
export const SITEKEY = import.meta.env.VITE_SAAS_CAPTCHA_SITEKEY as string | undefined;

export const captchaActivo = Boolean(SITEKEY);
