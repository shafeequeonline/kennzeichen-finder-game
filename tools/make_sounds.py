"""Synthesises the game's two sound effects with the standard library only.

Usage: python3 tools/make_sounds.py assets/sounds
"""
import math
import random
import struct
import sys
import wave

RATE = 22050
random.seed(7)


def write(path, samples):
    peak = max(abs(s) for s in samples) or 1
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h', int(s / peak * 0.85 * 32767)) for s in samples))


def clap(length=0.07):
    """One hand clap: a burst of band-limited noise with a very fast decay."""
    n = int(length * RATE)
    out, lo1, lo2 = [], 0.0, 0.0
    for i in range(n):
        x = random.uniform(-1, 1)
        lo1 += 0.55 * (x - lo1)  # keeps the snap below ~3 kHz
        lo2 += 0.06 * (x - lo2)  # removes the low thump
        band = lo1 - lo2
        t = i / RATE
        env = min(1.0, t / 0.0015) * math.exp(-t / 0.014)
        out.append(band * env)
    return out


def applause(duration=1.3):
    out = [0.0] * int(duration * RATE)
    # A few "children" clapping at slightly different speeds, fading out together.
    for _ in range(4):
        t = random.uniform(0, 0.06)
        period = random.uniform(0.11, 0.15)
        while t < duration - 0.08:
            fade = 1 - t / duration
            gain = random.uniform(0.6, 1.0) * fade ** 1.5
            start = int(t * RATE)
            for i, s in enumerate(clap()):
                if start + i < len(out):
                    out[start + i] += s * gain
            t += period * random.uniform(0.85, 1.15)
    # A quiet happy arpeggio on top (C6, E6, G6).
    for k, freq in enumerate([1046.5, 1318.5, 1568.0]):
        start = int(k * 0.07 * RATE)
        for i in range(int(0.35 * RATE)):
            t = i / RATE
            if start + i < len(out):
                out[start + i] += 0.12 * math.sin(2 * math.pi * freq * t) * math.exp(-t / 0.09)
    return out


def wah_wah():
    """A friendly 'oh-oh': two soft notes sliding down, no harsh buzzer."""
    out = []
    for f0, f1, length in [(392.0, 370.0, 0.26), (330.0, 262.0, 0.42)]:
        n = int(length * RATE)
        phase = 0.0
        for i in range(n):
            t = i / RATE
            freq = f0 + (f1 - f0) * (i / n) + 4 * math.sin(2 * math.pi * 6 * t)
            phase += 2 * math.pi * freq / RATE
            tone = math.sin(phase) + 0.3 * math.sin(2 * phase) + 0.1 * math.sin(3 * phase)
            env = min(1.0, t / 0.02) * min(1.0, (length - t) / 0.08)
            out.append(tone * env)
        out.extend([0.0] * int(0.04 * RATE))
    return out


out_dir = sys.argv[1]
write(f'{out_dir}/correct.wav', applause())
write(f'{out_dir}/wrong.wav', wah_wah())
