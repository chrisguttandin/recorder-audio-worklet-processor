export interface IStopMessageEvent extends MessageEvent {
    data: {
        id: number;

        method: 'stop';
    };
}
