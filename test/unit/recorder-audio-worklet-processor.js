import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
        describe('with a pause message', () => {
            beforeEach(() => {
                recorderProcessor.port.onmessage({
                    data: {
                        id: 49,
                        method: 'pause'
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
                    id: 49
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

            describe('with a pause message', () => {
                beforeEach(() => {
                    recorderProcessor.port.postMessage.resetHistory();
                    recorderProcessor.port.onmessage({
                        data: {
                            id: 35,
                            method: 'pause'
                        }
                    });
                });

                it('should send a response message', () => {
                    expect(recorderProcessor.port.postMessage).to.have.been.calledOnce;
                    expect(recorderProcessor.port.postMessage).to.have.been.calledWithExactly({ id: 35, result: null });
                });

                describe('with another pause message', () => {
                    beforeEach(() => {
                        recorderProcessor.port.postMessage.resetHistory();
                        recorderProcessor.port.onmessage({
                            data: {
                                id: 36,
                                method: 'pause'
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

                describe('with another record message', () => {
                    beforeEach(() => {
                        recorderProcessor.port.postMessage.resetHistory();
                        recorderProcessor.port.onmessage({
                            data: {
                                id: 36,
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
                            id: 36
                        });
                    });
                });

                describe('with a resume message', () => {
                    beforeEach(() => {
                        recorderProcessor.port.postMessage.resetHistory();
                        recorderProcessor.port.onmessage({
                            data: {
                                id: 36,
                                method: 'resume'
                            }
                        });
                    });

                    it('should send a response message', () => {
                        expect(recorderProcessor.port.postMessage).to.have.been.calledOnce;
                        expect(recorderProcessor.port.postMessage).to.have.been.calledWithExactly({ id: 36, result: null });
                    });
                });

                describe('with a stop message', () => {
                    beforeEach(() => {
                        recorderProcessor.port.postMessage.resetHistory();
                        recorderProcessor.port.onmessage({
                            data: {
                                id: 36,
                                method: 'stop'
                            }
                        });
                    });

                    it('should send a response message', () => {
                        expect(recorderProcessor.port.postMessage).to.have.been.calledOnce;
                        expect(recorderProcessor.port.postMessage).to.have.been.calledWithExactly({ id: 36, result: null });
                    });

                    it('should send an empty array', () => {
                        expect(encoderPort.postMessage).to.have.been.calledOnce;
                        expect(encoderPort.postMessage).to.have.been.calledWithExactly([]);
                    });

                    it('should close the encoderPort', () => {
                        expect(encoderPort.close).to.have.been.calledOnce;
                    });

                    describe('with another pause message', () => {
                        beforeEach(() => {
                            recorderProcessor.port.postMessage.resetHistory();
                            recorderProcessor.port.onmessage({
                                data: {
                                    id: 37,
                                    method: 'pause'
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
                                id: 37
                            });
                        });
                    });

                    describe('with another record message', () => {
                        beforeEach(() => {
                            recorderProcessor.port.postMessage.resetHistory();
                            recorderProcessor.port.onmessage({
                                data: {
                                    id: 37,
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
                                id: 37
                            });
                        });
                    });

                    describe('with a resume message', () => {
                        beforeEach(() => {
                            recorderProcessor.port.postMessage.resetHistory();
                            recorderProcessor.port.onmessage({
                                data: {
                                    id: 37,
                                    method: 'resume'
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
                                id: 37
                            });
                        });
                    });

                    describe('with another stop message', () => {
                        beforeEach(() => {
                            recorderProcessor.port.postMessage.resetHistory();
                            recorderProcessor.port.onmessage({
                                data: {
                                    id: 37,
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
                                id: 37
                            });
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

            describe('with a resume message', () => {
                beforeEach(() => {
                    recorderProcessor.port.postMessage.resetHistory();
                    recorderProcessor.port.onmessage({
                        data: {
                            id: 35,
                            method: 'resume'
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

                it('should send an empty array', () => {
                    expect(encoderPort.postMessage).to.have.been.calledOnce;
                    expect(encoderPort.postMessage).to.have.been.calledWithExactly([]);
                });

                it('should close the encoderPort', () => {
                    expect(encoderPort.close).to.have.been.calledOnce;
                });

                describe('with a pause message', () => {
                    beforeEach(() => {
                        recorderProcessor.port.postMessage.resetHistory();
                        recorderProcessor.port.onmessage({
                            data: {
                                id: 36,
                                method: 'pause'
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

                describe('with another record message', () => {
                    beforeEach(() => {
                        recorderProcessor.port.postMessage.resetHistory();
                        recorderProcessor.port.onmessage({
                            data: {
                                id: 36,
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
                            id: 36
                        });
                    });
                });

                describe('with a resume message', () => {
                    beforeEach(() => {
                        recorderProcessor.port.postMessage.resetHistory();
                        recorderProcessor.port.onmessage({
                            data: {
                                id: 36,
                                method: 'resume'
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
        });

        describe('with a resume message', () => {
            beforeEach(() => {
                recorderProcessor.port.onmessage({
                    data: {
                        id: 81,
                        method: 'resume'
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
                    id: 81
                });
            });
        });

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
    });

    describe('process()', () => {
        let encoderPort;

        beforeEach(() => {
            encoderPort = { close: spy(), onmessage: null, postMessage: spy() };
        });

        describe('without any message', () => {
            describe('without channelData for the first input', () => {
                it('should return true', () => {
                    expect(recorderProcessor.process([])).to.be.true;
                });
            });

            describe('with empty channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with some channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [new Float32Array(128), new Float32Array(128)];
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with empty channelData for the first input after being called with channelData', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];

                    recorderProcessor.process([[new Float32Array(128), new Float32Array(128)]]);
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });
        });

        describe('with a record message', () => {
            beforeEach(() => {
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
                        recorderProcessor.process([]);
                    }).to.throw(Error, 'No channelData was received for the first input.');
                });
            });

            describe('with empty channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with some channelData for the first input', () => {
                let channelData;
                let transferables;

                beforeEach(() => {
                    channelData = [new Float32Array(128), new Float32Array(128)];
                    transferables = [channelData[0].buffer, channelData[1].buffer];

                    channelData[0].fill(1);
                    channelData[1].fill(-1);
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should send the channelData', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.been.calledOnce;
                    expect(encoderPort.postMessage).to.have.been.calledWithExactly(channelData, transferables);
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with empty channelData for the first input after being called with channelData', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];

                    recorderProcessor.process([[new Float32Array(128), new Float32Array(128)]]);

                    encoderPort.postMessage.resetHistory();
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should send an array with the number of missing samples', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.been.calledOnce;
                    expect(encoderPort.postMessage).to.have.been.calledWithExactly([128, 128]);
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });
        });

        describe('with a record and a pause message', () => {
            beforeEach(() => {
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
                        method: 'pause'
                    }
                });

                encoderPort.postMessage.resetHistory();
            });

            describe('without channelData for the first input', () => {
                it('should return true', () => {
                    expect(recorderProcessor.process([])).to.be.true;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with empty channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with some channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [new Float32Array(128), new Float32Array(128)];
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with empty channelData for the first input after being called with channelData', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];

                    recorderProcessor.process([[new Float32Array(128), new Float32Array(128)]]);
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });
        });

        describe('with a record, a pause and a resume message', () => {
            beforeEach(() => {
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
                        method: 'pause'
                    }
                });
                recorderProcessor.port.onmessage({
                    data: {
                        method: 'resume'
                    }
                });

                encoderPort.postMessage.resetHistory();
            });

            describe('without channelData for the first input', () => {
                it('should throw an error', () => {
                    expect(() => {
                        recorderProcessor.process([]);
                    }).to.throw(Error, 'No channelData was received for the first input.');
                });
            });

            describe('with empty channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with some channelData for the first input', () => {
                let channelData;
                let transferables;

                beforeEach(() => {
                    channelData = [new Float32Array(128), new Float32Array(128)];
                    transferables = [channelData[0].buffer, channelData[1].buffer];

                    channelData[0].fill(1);
                    channelData[1].fill(-1);
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should send the channelData', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.been.calledOnce;
                    expect(encoderPort.postMessage).to.have.been.calledWithExactly(channelData, transferables);
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with empty channelData for the first input after being called with channelData', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];

                    recorderProcessor.process([[new Float32Array(128), new Float32Array(128)]]);

                    encoderPort.postMessage.resetHistory();
                });

                it('should return true', () => {
                    expect(recorderProcessor.process([channelData])).to.be.true;
                });

                it('should send an array with the number of missing samples', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.been.calledOnce;
                    expect(encoderPort.postMessage).to.have.been.calledWithExactly([128, 128]);
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });
        });

        describe('with a record, a pause, a resume and a stop message', () => {
            beforeEach(() => {
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
                        method: 'pause'
                    }
                });
                recorderProcessor.port.onmessage({
                    data: {
                        method: 'resume'
                    }
                });
                recorderProcessor.port.onmessage({
                    data: {
                        method: 'stop'
                    }
                });

                encoderPort.close.resetHistory();
                encoderPort.postMessage.resetHistory();
            });

            describe('without channelData for the first input', () => {
                it('should return false', () => {
                    expect(recorderProcessor.process([])).to.be.false;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with empty channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];
                });

                it('should return false', () => {
                    expect(recorderProcessor.process([channelData])).to.be.false;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with some channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [new Float32Array(128), new Float32Array(128)];
                });

                it('should return false', () => {
                    expect(recorderProcessor.process([channelData])).to.be.false;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with empty channelData for the first input after being called with channelData', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];

                    recorderProcessor.process([[new Float32Array(128), new Float32Array(128)]]);

                    encoderPort.postMessage.resetHistory();
                });

                it('should return false', () => {
                    expect(recorderProcessor.process([channelData])).to.be.false;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });
        });

        describe('with a record and a stop message', () => {
            beforeEach(() => {
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

                encoderPort.close.resetHistory();
                encoderPort.postMessage.resetHistory();
            });

            describe('without channelData for the first input', () => {
                it('should return false', () => {
                    expect(recorderProcessor.process([])).to.be.false;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with empty channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];
                });

                it('should return false', () => {
                    expect(recorderProcessor.process([channelData])).to.be.false;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with some channelData for the first input', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [new Float32Array(128), new Float32Array(128)];
                });

                it('should return false', () => {
                    expect(recorderProcessor.process([channelData])).to.be.false;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });

            describe('with empty channelData for the first input after being called with channelData', () => {
                let channelData;

                beforeEach(() => {
                    channelData = [];

                    recorderProcessor.process([[new Float32Array(128), new Float32Array(128)]]);

                    encoderPort.postMessage.resetHistory();
                });

                it('should return false', () => {
                    expect(recorderProcessor.process([channelData])).to.be.false;
                });

                it('should not send anything', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.postMessage).to.have.not.been.called;
                });

                it('should not close the encoderPort', () => {
                    recorderProcessor.process([channelData]);

                    expect(encoderPort.close).to.have.not.been.called;
                });
            });
        });
    });
});
