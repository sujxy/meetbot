class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input) {
      const channelData = input[0];
      if (channelData) {
        // Convert Float32Array [-1, 1] to Int16Array
        const int16Array = new Int16Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
          int16Array[i] = channelData[i] * 32767;
        }
        // Post the audio data to the main thread
        this.port.postMessage(int16Array.buffer);
      }
    }
    return true;
  }
}
registerProcessor("audio-processor", AudioProcessor);
