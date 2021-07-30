export interface IResumeMessageEvent extends MessageEvent {
    data: {
        id: number;

        method: 'resume';
    };
}
