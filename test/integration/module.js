import { AudioWorkletNode, ConstantSourceNode, OfflineAudioContext } from 'standardized-audio-context';
import { spy } from 'sinon';

describe('module', () => {

    let audioWorkletNode;
    let constantSourceNode;
    let offlineAudioContext;
    let port1;
    let port2;

    after(function (done) {
        this.timeout(5000);

        // @todo This is an optimistic fix to prevent the famous 'Some of your tests did a full page reload!' error.
        setTimeout(done, 1000);
    });

    beforeEach(async () => {
        offlineAudioContext = new OfflineAudioContext({ length: 128, sampleRate: 44100 });

        await offlineAudioContext.audioWorklet.addModule('base/src/module.js');

        ({ port1, port2 } = new MessageChannel());

        audioWorkletNode = new AudioWorkletNode(offlineAudioContext, 'recorder-audio-worklet-processor', { numberOfOutputs: 0 });
        constantSourceNode = new ConstantSourceNode(offlineAudioContext, { offset: 1 });

        constantSourceNode.connect(audioWorkletNode);
        constantSourceNode.start();
    });

    describe('with a recording RecorderProcessor', () => {

        let channelData;

        beforeEach(() => {
            channelData = new Array(128);

            channelData.fill(1);
        });

        it('should send the channelData of its input to the given port', (done) => {
            port1.onmessage = ({ data }) => {
                expect(data.length).to.equal(2);

                expect(data[0].length).to.equal(128);
                expect(Array.from(data[0])).to.deep.equal(channelData);

                expect(data[1].length).to.equal(128);
                expect(Array.from(data[1])).to.deep.equal(channelData);

                done();
            };

            audioWorkletNode.port.onmessage = ({ data }) => {
                expect(data).to.deep.equal({
                    id: 17,
                    result: null
                });

                offlineAudioContext.startRendering();
            };

            audioWorkletNode.port.postMessage({ id: 17, method: 'record', params: { encoderPort: port2 } }, [ port2 ]);
        });

    });

    describe('with a stopped RecorderProcessor', () => {

        beforeEach((done) => {
            audioWorkletNode.port.onmessage = () => done();
            audioWorkletNode.port.postMessage({ id: 17, method: 'record', params: { encoderPort: port2 } }, [ port2 ]);
        });

        it('should send an empty array to the given port', (done) => {
            const listener = spy();

            port1.onmessage = ({ data }) => listener(data);

            audioWorkletNode.port.onmessage = ({ data }) => {
                expect(data).to.deep.equal({
                    id: 18,
                    result: null
                });

                setTimeout(() => {
                    expect(listener).to.have.been.calledOnce;
                    expect(listener).to.have.been.calledWithExactly([ ]);

                    done();
                }, 100);
            };

            audioWorkletNode.port.postMessage({ id: 18, method: 'stop' });
        });

        it('should not send channelData to the given port', (done) => {
            const listener = spy();

            port1.onmessage = async () => {
                port1.onmessage = listener;

                await offlineAudioContext.startRendering();

                expect(listener).to.have.not.been.called;

                done();
            };

            audioWorkletNode.port.onmessage = ({ data }) => {
                expect(data).to.deep.equal({
                    id: 18,
                    result: null
                });
            };

            audioWorkletNode.port.postMessage({ id: 18, method: 'stop' });
        });

    });

});
