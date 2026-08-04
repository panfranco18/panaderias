let ctx: AudioContext | null = null;

export function unlockAudio() {
  if (ctx) return;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  } catch {
    // audio no disponible en este navegador
  }
}

export function playNotificationChime() {
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const notas = [880, 1318.51]; // A5, E6 — campanita suave

  notas.forEach((freq, i) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    const inicio = now + i * 0.12;
    gain.gain.setValueAtTime(0, inicio);
    gain.gain.linearRampToValueAtTime(0.25, inicio + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, inicio + 0.45);

    osc.connect(gain);
    gain.connect(ctx!.destination);
    osc.start(inicio);
    osc.stop(inicio + 0.45);
  });
}
