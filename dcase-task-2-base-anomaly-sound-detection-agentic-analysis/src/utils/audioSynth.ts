let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let harmonicOsc: OscillatorNode | null = null;
let noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
let mainGain: GainNode | null = null;

export function playSynthSound(type: "normal" | "anomaly") {
  try {
    // Stop preceding playback
    stopSynthSound();

    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.08, audioCtx.currentTime); // Low safe volume

    // Low motor rumble (fundamentals)
    oscillator = audioCtx.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(110, audioCtx.currentTime);

    // Apply motor rumble hum filter
    const motorFilter = audioCtx.createBiquadFilter();
    motorFilter.type = "lowpass";
    motorFilter.frequency.setValueAtTime(250, audioCtx.currentTime);

    oscillator.connect(motorFilter);
    motorFilter.connect(mainGain);

    if (type === "anomaly") {
      // Create high frequency diagnostic scraping alarm friction at 4.2 kHz
      harmonicOsc = audioCtx.createOscillator();
      harmonicOsc.type = "sine";
      harmonicOsc.frequency.setValueAtTime(4200, audioCtx.currentTime);

      // Add high frequency pulse volume modulator
      const modGain = audioCtx.createGain();
      modGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      
      const lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(12, audioCtx.currentTime); // 12Hz periodic scrapings
      
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(0.008, audioCtx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(modGain.gain);
      harmonicOsc.connect(modGain);
      modGain.connect(mainGain);

      lfo.start();
      harmonicOsc.start();

      // Introduce erratic crackle clicks to simulate mechanical collision
      const clickInterval = setInterval(() => {
        if (!audioCtx || audioCtx.state !== "running" || !mainGain) {
          clearInterval(clickInterval);
          return;
        }
        // Rapid pulse
        const clickOsc = audioCtx.createOscillator();
        const clickGain = audioCtx.createGain();
        clickOsc.frequency.setValueAtTime(Math.random() * 800 + 1200, audioCtx.currentTime);
        clickGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
        clickOsc.connect(clickGain);
        clickGain.connect(mainGain);
        clickOsc.start();
        clickOsc.stop(audioCtx.currentTime + 0.09);
      }, 150);
    } else {
      // Normal continuous stable operation hum
      harmonicOsc = audioCtx.createOscillator();
      harmonicOsc.type = "sine";
      harmonicOsc.frequency.setValueAtTime(220, audioCtx.currentTime); // stable second-harmonic
      
      const harmonicGain = audioCtx.createGain();
      harmonicGain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      
      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(mainGain);
      harmonicOsc.start();
    }

    // Connect to speakers
    mainGain.connect(audioCtx.destination);
    oscillator.start();
  } catch (error) {
    console.error("Failed to play synthesized diagnostic sound:", error);
  }
}

export function stopSynthSound() {
  try {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
    if (harmonicOsc) {
      harmonicOsc.stop();
      harmonicOsc.disconnect();
      harmonicOsc = null;
    }
    if (mainGain) {
      mainGain.disconnect();
      mainGain = null;
    }
    if (audioCtx) {
      if (audioCtx.state !== "closed") {
        audioCtx.close();
      }
      audioCtx = null;
    }
  } catch (e) {
    console.warn("Audio synthesis stop handle exception:", e);
  }
}
