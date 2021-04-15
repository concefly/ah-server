import * as http from 'http';

export const ReadyEvt = Symbol('ReadyEvt');
export interface ReadyEvt {
  server: http.Server;
}

export const CloseEvt = Symbol('CloseEvt');
