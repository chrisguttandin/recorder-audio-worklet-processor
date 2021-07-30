export interface IPauseMessageEvent extends MessageEvent {
    data: {
        id: number;

        method: 'pause';
    };
}
