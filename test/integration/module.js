import { AudioWorkletNode, ConstantSourceNode, OfflineAudioContext } from 'standardized-audio-context';
import { beforeEach, describe, expect, it } from 'vitest';
import { spy } from 'sinon';

describe('module', () => {
    let audioWorkletNode;
    let constantSourceNode;
    let offlineAudioContext;
    let port1;
    let port2;

    beforeEach(async () => {
        offlineAudioContext = new OfflineAudioContext({ length: 128, sampleRate: 44100 });

        await offlineAudioContext.audioWorklet.addModule('../../src/module.js');

        ({ port1, port2 } = new MessageChannel());

        audioWorkletNode = new AudioWorkletNode(offlineAudioContext, 'recorder-audio-worklet-processor', { numberOfOutputs: 0 });
        constantSourceNode = new ConstantSourceNode(offlineAudioContext, { offset: 1 });

        constantSourceNode.connect(audioWorkletNode);
        constantSourceNode.start();
    });

    describe('with a recording RecorderProcessor', () => {
        let channelData;

        beforeEach(() => {
            channelData = new Float32Array(128);

            channelData.fill(1);
        });

        it('should send the channelData of its input to the given port', () => {
            const { promise, resolve } = Promise.withResolvers();

            port1.onmessage = ({ data }) => {
                expect(data.length).to.equal(2);
                expect(data[0]).to.deep.equal(channelData);
                expect(data[1]).to.deep.equal(channelData);

                resolve();
            };

            audioWorkletNode.port.onmessage = ({ data }) => {
                expect(data).to.deep.equal({
                    id: 17,
                    result: null
                });

                offlineAudioContext.startRendering();
            };

            audioWorkletNode.port.postMessage({ id: 17, method: 'record', params: { encoderPort: port2 } }, [port2]);

            return promise;
        });
    });

    describe('with a stopped RecorderProcessor', () => {
        beforeEach(() => {
            const { promise, resolve } = Promise.withResolvers();

            audioWorkletNode.port.onmessage = () => resolve();
            audioWorkletNode.port.postMessage({ id: 17, method: 'record', params: { encoderPort: port2 } }, [port2]);

            return promise;
        });

        it('should send an empty array to the given port', () => {
            const listener = spy();
            const { promise, resolve } = Promise.withResolvers();

            port1.onmessage = ({ data }) => listener(data);

            audioWorkletNode.port.onmessage = ({ data }) => {
                expect(data).to.deep.equal({
                    id: 18,
                    result: null
                });

                setTimeout(() => {
                    expect(listener).to.have.been.calledOnce;
                    expect(listener).to.have.been.calledWithExactly([]);

                    resolve();
                }, 100);
            };

            audioWorkletNode.port.postMessage({ id: 18, method: 'stop' });

            return promise;
        });

        it('should not send channelData to the given port', () => {
            const listener = spy();
            const { promise, resolve } = Promise.withResolvers();

            port1.onmessage = async () => {
                port1.onmessage = listener;

                await offlineAudioContext.startRendering();

                expect(listener).to.have.not.been.called;

                resolve();
            };

            audioWorkletNode.port.onmessage = ({ data }) => {
                expect(data).to.deep.equal({
                    id: 18,
                    result: null
                });
            };

            audioWorkletNode.port.postMessage({ id: 18, method: 'stop' });

            return promise;
        });
    });
});
