import { Entidad } from "@olula/lib/diseño.ts";

export interface MotivoTarea extends Entidad {
    id: string;
    descripcion: string;
    activo: boolean;
}

export type NuevoMotivoTarea = Omit<MotivoTarea, "id">;

export type GetMotivoTarea = (id: string) => Promise<MotivoTarea>;
export type PostMotivoTarea = (
    motivoTarea: NuevoMotivoTarea
) => Promise<string>;
export type PatchMotivoTarea = (
    id: string,
    motivoTarea: Partial<MotivoTarea>
) => Promise<void>;
