import { IAudioWorkletProcessor, IPauseMessageEvent, IRecordMessageEvent, IResumeMessageEvent, IStopMessageEvent } from './interfaces';

export class RecorderAudioWorkletProcessor extends AudioWorkletProcessor implements IAudioWorkletProcessor {
    public static parameterDescriptors = [];

    private _encoderPort: null | MessagePort;

    private _state: 'active' | 'inactive' | 'paused' | 'recording' | 'stopped';

    constructor() {
        super();

        this._encoderPort = null;
        this._state = 'inactive';

        this.port.onmessage = ({ data }: IPauseMessageEvent | IRecordMessageEvent | IResumeMessageEvent | IStopMessageEvent) => {
            if (data.method === 'pause') {
                if (this._state === 'active' || this._state === 'recording') {
                    this._state = 'paused';

                    this._sendAcknowledgement(data.id);
                } else {
                    this._sendUnexpectedStateError(data.id);
                }
            } else if (data.method === 'record') {
                if (this._state === 'inactive') {
                    this._encoderPort = data.params.encoderPort;
                    this._state = 'active';

                    this._sendAcknowledgement(data.id);
                } else {
                    this._sendUnexpectedStateError(data.id);
                }
            } else if (data.method === 'resume') {
                if (this._state === 'paused') {
                    this._state = 'active';

                    this._sendAcknowledgement(data.id);
                } else {
                    this._sendUnexpectedStateError(data.id);
                }
            } else if (data.method === 'stop') {
                if ((this._state === 'active' || this._state === 'paused' || this._state === 'recording') && this._encoderPort !== null) {
                    this._stop(this._encoderPort);
                    this._sendAcknowledgement(data.id);
                } else {
                    this._sendUnexpectedStateError(data.id);
                }
            } else if (typeof (<MessageEvent['data']>data).id === 'number') {
                this.port.postMessage({
                    error: {
                        code: -32601,
                        message: 'The requested method is not supported.'
                    },
                    id: <number>(<MessageEvent['data']>data).id
                });
            }
        };
    }

    public process([input]: Float32Array[][]): boolean {
        if (this._state === 'inactive' || this._state === 'paused') {
            return true;
        }

        if (this._state === 'active') {
            if (input === undefined) {
                throw new Error('No channelData was received for the first input.');
            }

            if (input.length === 0) {
                return true;
            }

            this._state = 'recording';
        }

        if (this._state === 'recording' && this._encoderPort !== null) {
            if (input === undefined) {
                throw new Error('No channelData was received for the first input.');
            }

            if (input.length === 0) {
                this._stop(this._encoderPort);
            } else {
                this._encoderPort.postMessage(
                    input,
                    input.map(({ buffer }) => buffer)
                );

                return true;
            }
        }

        return false;
    }

    private _sendAcknowledgement(id: number): void {
        this.port.postMessage({ id, result: null });
    }

    private _sendUnexpectedStateError(id: number): void {
        this.port.postMessage({
            error: {
                code: -32603,
                message: 'The internal state does not allow to process the given message.'
            },
            id
        });
    }

    private _stop(encoderPort: MessagePort): void {
        encoderPort.postMessage([]);
        encoderPort.close();

        this._encoderPort = null;
        this._state = 'stopped';
    }
}
