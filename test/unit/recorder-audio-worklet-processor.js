import { RecorderAudioWorkletProcessor } from '../../src/recorder-audio-worklet-processor';
import { spy } from 'sinon';

describe('RecorderAudioWorkletProcessor', () => {

    let recorderProcessor;

    afterEach(() => {
        delete self.AudioWorkletProcessor.prototype.port;
    });

    beforeEach(() => {
        self.AudioWorkletProcessor.prototype.port = { onmessage: null, postMessage: spy() };

        recorderProcessor = new RecorderAudioWorkletProcessor();
    });

    describe('constructor()', () => {

        it('should register an onmessage listener', () => {
            expect(recorderProcessor.port.onmessage).not.to.be.null;
        });

    });

    describe('port', () => {

        describe('with a stop message', () => {

            beforeEach(() => {
                recorderProcessor.port.onmessage({
                    data: {
                        id: 34,
                        method: 'stop'
                    }
                });
            });

            it('should send an error message', () => {
                expect(recorderProcessor.port.postMessage).to.have.been.calledOnce;
                expect(recorderProcessor.port.postMessage).to.have.been.calledWithExactly({
                    error: {
                        code: -32603,
                        message: 'The internal state does not allow to process the given message.'
                    },
                    id: 34
                });
            });

        });

        describe('with a record message', () => {

            let encoderPort;

            beforeEach(() => {
                encoderPort = { close: spy(), onmessage: null, postMessage: spy() };

                recorderProcessor.port.onmessage({
                    data: {
                        id: 34,
                        method: 'record',
                        params: {
                            encoderPort
                        }
                    }
                });
            });

            it('should send a response message', () => {
                expect(recorderProcessor.port.postMessage).to.have.been.calledOnce;
                expect(recorderProcessor.port.postMessage).to.have.been.calledWithExactly({ id: 34, result: null });
            });

            describe('with a stop message', () => {

                beforeEach(() => {
                    recorderProcessor.port.postMessage.resetHistory();
                    recorderProcessor.port.onmessage({
                        data: {
                            id: 35,
                            method: 'stop'
                        }
                    });
                });

                it('should send a response message', () => {
                    expect(recorderProcessor.port.postMessage).to.have.been.calledOnce;
                    expect(recorderProcessor.port.postMessage).to.have.been.calledWithExactly({ id: 35, result: null });
                });

                it('should send an empty arrray', () => {
                    expect(encoderPort.postMessage).to.have.been.calledOnce;
                    expect(encoderPort.postMessage).to.have.been.calledWithExactly([ ]);
                });

                it('should close the encoderPort', () => {
                    expect(encoderPort.close).to.have.been.calledOnce;
                });

                describe('with another stop message', () => {

                    beforeEach(() => {
                        recorderProcessor.port.postMessage.resetHistory();
                        recorderProcessor.port.onmessage({
                            data: {
                                id: 36,
                                method: 'stop'
                            }
                        });
                    });

                    it('should send an error message', () => {
                        expect(recorderProcessor.port.postMessage).to.have.been.calledOnce;
                        expect(recorderProcessor.port.postMessage).to.have.been.calledWithExactly({
                            error: {
                                code: -32603,
                                message: 'The internal state does not allow to process the given message.'
                            },
                            id: 36
                        });
                    });

                });

            });

            describe('with another record message', () => {

                beforeEach(() => {
                    recorderProcessor.port.postMessage.resetHistory();
                    recorderProcessor.port.onmessage({
                        data: {
                            id: 35,
                            method: 'record',
                            params: {
                                encoderPort
                            }
                        }
                    });
                });

                it('should send an error message', () => {
                    expect(recorderProcessor.port.postMessage).to.have.been.calledOnce;
                    expect(recorderProcessor.port.postMessage).to.have.been.calledWithExactly({
                        error: {
                            code: -32603,
                            message: 'The internal state does not allow to process the given message.'
                        },
                        id: 35
                    });
                });

            });

        });

    });

    describe('process()', () => {

        describe('without an encoderPort', () => {

            it('should return true', () => {
                expect(recorderProcessor.process([ ])).to.be.true;
            });

        });

        describe('with an encoderPort', () => {

            let encoderPort;

            beforeEach(() => {
                encoderPort = { close: spy(), onmessage: null, postMessage: spy() };

                recorderProcessor.port.onmessage({
                    data: {
                        method: 'record',
                        params: {
                            encoderPort
                        }
                    }
                });
            });

            describe('without channelData for the first input', () => {

                it('should throw an error', () => {
                    expect(() => {
                        recorderProcessor.process([ ]);
                    }).to.throw(Error, 'No channelData was received for the first input.');
                });

            });

            describe('with some channelData for the first input', () => {

                let channelData;
                let transferables;

                beforeEach(() => {
                    channelData = [ new Float32Array(128), new Float32Array(128) ];
                    transferables = [ channelData[0].buffer, channelData[1].buffer ];

                    channelData[0].fill(1);
                    channelData[1].fill(-1);
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([ channelData ])).to.be.true;
                });

                it('should send the channelData', () => {
                    recorderProcessor.process([ channelData ]);

                    expect(encoderPort.postMessage).to.have.been.calledOnce;
                    expect(encoderPort.postMessage).to.have.been.calledWithExactly(channelData, transferables);
                });

            });

        });

        describe('with an removed encoderPort', () => {

            let encoderPort;

            beforeEach(() => {
                encoderPort = { close: spy(), onmessage: null, postMessage: spy() };

                recorderProcessor.port.onmessage({
                    data: {
                        method: 'record',
                        params: {
                            encoderPort
                        }
                    }
                });
                recorderProcessor.port.onmessage({
                    data: {
                        method: 'stop'
                    }
                });

                encoderPort.postMessage.resetHistory();
            });

            it('should return false', () => {
                expect(recorderProcessor.process([ ])).to.be.false;
            });

            it('should not send anything', () => {
                recorderProcessor.process([ ]);

                expect(encoderPort.postMessage).to.have.not.been.called;
            });

        });

    });

});
