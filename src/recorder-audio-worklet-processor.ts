import { IAudioWorkletProcessor, IRecordMessageEvent, IStopMessageEvent } from './interfaces';

export class RecorderAudioWorkletProcessor extends AudioWorkletProcessor implements IAudioWorkletProcessor {

    public static parameterDescriptors = [ ];

    private _encoderPort: null | MessagePort;

    private _isSupportingTransferables: boolean;

    private _state: 'inactive' | 'recording' | 'stopped';

    constructor (options: AudioWorkletNodeOptions) {
        super(options);

        this._encoderPort = null;
        this._isSupportingTransferables = false;
        this._state = 'inactive';

        this.port.onmessage = ({ data }: IRecordMessageEvent | IStopMessageEvent) => {
            if (data.method === 'record') {
                if (this._state === 'inactive') {
                    this._encoderPort = data.params.encoderPort;
                    this._isSupportingTransferables = data.params.isSupportingTransferables;
                    this._state = 'recording';

                    this.port.postMessage({ id: data.id, result: null });
                } else {
                    this.port.postMessage({
                        error: {
                            code: -32603,
                            message: 'The internal state does not allow to process the given message.'
                        },
                        id: data.id
                    });
                }
            } else if (data.method === 'stop') {
                if (this._state === 'recording' && this._encoderPort !== null) {
                    this._stop(this._encoderPort);

                    this.port.postMessage({ id: data.id, result: null });
                } else {
                    this.port.postMessage({
                        error: {
                            code: -32603,
                            message: 'The internal state does not allow to process the given message.'
                        },
                        id: data.id
                    });
                }
            } else if (typeof (<MessageEvent['data']> data).id === 'number') {
                this.port.postMessage({
                    error: {
                        code: -32601,
                        message: 'The requested method is not supported.'
                    },
                    id: (<number> (<MessageEvent['data']> data).id)
                });
            }
        };
    }

    public process ([ input ]: Float32Array[][]) {
        if (this._state === 'inactive') {
            return true;
        }

        if (this._state === 'recording' && this._encoderPort !== null) {
            if (input === undefined) {
                throw new Error('No channelData was received for the first input.');
            }

            if (input.length === 0) {
                this._stop(this._encoderPort);
            }

            this._encoderPort.postMessage(input, this._isSupportingTransferables ? input.map(({ buffer }) => buffer) : [ ]);

            return true;
        }

        return false;
    }

    private _stop (encoderPort: MessagePort) {
        encoderPort.postMessage([ ]);
        encoderPort.close();

        this._encoderPort = null;
        this._state = 'stopped';
    }

}
