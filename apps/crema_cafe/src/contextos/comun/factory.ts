// crema_cafe solo usa de comun las credenciales (conectores como Stripe).
export class FactoryComunCremaCafe {
    static menu = {
        "Administración/Credenciales": { url: "/comun/credencial-externa", regla: "comun.credencial_externa" },
    };
}
