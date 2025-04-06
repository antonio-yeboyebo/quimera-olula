
// import { EventEmitter } from 'eventemitter3';
// import { useCallback, useEffect } from 'react';

// export interface Evento {
//     id: string;
//     payload: {
//         [clave: string]: unknown;
//     };
// };


// type Suscripcion = [string, any];

// const emitter = new EventEmitter();

// export const useSuscribir = (suscripciones: Suscripcion[]) => {

//     const unsubscribe = useCallback(() => {
//         suscripciones.forEach(([eventoId, callback]) => {
//             emitter.off(eventoId, callback);
//         });
//     }, [suscripciones]);

//     useEffect(() => {
//         suscripciones.forEach(([eventoId, callback]) => {
//             emitter.on(eventoId, callback);
//         });
//         return unsubscribe;
//     }, [suscripciones, unsubscribe]);

//     return unsubscribe;
// }

// export const emitir = (evento: Evento) => {
//     emitter.emit(evento.id, evento);
// }