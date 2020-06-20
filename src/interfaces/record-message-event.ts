export interface IRecordMessageEvent extends MessageEvent {
    data: {
        id: number;

        method: 'record';

        params: {
            encoderPort: MessagePort;
        };
    };
}
