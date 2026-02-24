import { MetaModelo } from "@olula/lib/dominio.js";

type ModeloCierreArqueoTpv = {
    idAgenteCierre: string,
    cambioDejadoEnCaja: number
    totalEfectivo: number
};

const validarCambioDejadoEnCaja = (modelo: ModeloCierreArqueoTpv) => {
    if (modelo.cambioDejadoEnCaja < 0) {
        return 'El cambio dejado en caja no puede ser negativo';
    }
    if (modelo.cambioDejadoEnCaja > modelo.totalEfectivo) {
        return 'El cambio dejado en caja no puede ser mayor que el total efectivo';
    }

    return true;
}

export const metaCierreArqueoTpv: MetaModelo<ModeloCierreArqueoTpv> = {
    campos: {
        idAgenteCierre: { requerido: true, },
        cambioDejadoEnCaja: { requerido: true, tipo: "moneda", validacion: validarCambioDejadoEnCaja },
        totalEfectivo: { requerido: true, tipo: "moneda" },
    },
};

export const cierreArqueoTpvVacio: ModeloCierreArqueoTpv = {
    idAgenteCierre: "",
    cambioDejadoEnCaja: 0,
    totalEfectivo: 0
};