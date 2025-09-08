
    /* Comment to check branch */
   
    const F1 = 43.65;      // fundamental frequency
    const F4 = F1 * 4;      // starting pitch for kick (~174 Hz)

    // -------------------------------
    // Function: Kick + Subbass (from first code)
    // -------------------------------
    function triggerCleanKick(time) {
      const now = time || Tone.now();

      // Clean kick oscillator
      const oscMain = new Tone.Oscillator({
        type: "sine",
        frequency: F4,
        phase: 0,
        volume: -6
      });


      const ampMain = new Tone.Gain(1);
      oscMain.connect(ampMain);

      oscMain.frequency.setValueAtTime(F4, now);
      oscMain.frequency.exponentialRampToValueAtTime(F1, now + 0.063);

      ampMain.gain.setValueAtTime(1, now);
      ampMain.gain.exponentialRampToValueAtTime(0.0001, now + 0.125);

      oscMain.start(now);
      oscMain.stop(now + 0.25);

      // Sub bass oscillator
      const oscSub = new Tone.Oscillator({
        type: "sine",
        frequency: F1,
        phase: 0,
        volume: -3
      });

      const ampSub = new Tone.Gain(1);
      oscSub.connect(ampSub);

      ampSub.gain.setValueAtTime(1, now);
      ampSub.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      oscSub.start(now);
      oscSub.stop(now + 0.5);

      return { main: ampMain, sub: ampSub }; // return for routing
    }

    // -------------------------------
    // FX Chain for Rumble (from second code)
    // -------------------------------
    const reverb = new Tone.Reverb({ decay: 6, wet: 1 });
    const distortion = new Tone.Distortion({ distortion: 0.6, oversample: "4x" });
    const filter = new Tone.Filter(F1, "lowpass");
    const eqRumble = new Tone.EQ3({ low: +6, mid: 0, high: -6 });
    const compRumble = new Tone.Compressor({ threshold: -24, ratio: 6 });
    const rumbleGain = new Tone.Gain(0.2).toDestination(); // rumble controlled by LFO

    // LFO for rumble modulation
    const lfo = new Tone.LFO({
      type: "sine",
      frequency: "1m",
      min: 0.2,
      max: 0.6
    }).connect(rumbleGain.gain);

    // -------------------------------
    // Clean Kick Gain
    // -------------------------------
    const cleanGain = new Tone.Gain(0.6).toDestination();

    // -------------------------------
    // Loop (Kick + Subbass)
    // -------------------------------
    const loop = new Tone.Loop((time) => {
      // Clean Kick
      const clean = triggerCleanKick(time);
      clean.main.connect(cleanGain);
      clean.sub.connect(cleanGain);

      // Rumble Kick (same source but routed through FX)
      const rumble = triggerCleanKick(time);
      rumble.main.connect(reverb);
      rumble.sub.connect(reverb);
      reverb.chain(distortion, filter, eqRumble, compRumble, rumbleGain);
    }, "4n");

    // -------------------------------
    // Start/Stop Buttons
    // -------------------------------
    const startBtn =  document.getElementById('startBtn')
    const stopBtn = document.getElementById('stopBtn')
    const playRunning = document.getElementById('play-running')
    const stopRunning = document.getElementById('stop-running')

    startBtn.addEventListener("click", async () => {
      await Tone.start();
      Tone.Transport.start();
      lfo.start();
      loop.start(0);
      playRunning.style.display = 'block'
      stopRunning.style.display = 'none'
    });

    stopBtn.addEventListener("click", () => {
      Tone.Transport.stop();
      loop.stop(0);
      lfo.stop();
      playRunning.style.display = 'none'
      stopRunning.style.display = 'block'
    });



    //indicador de repdoucción:
    
