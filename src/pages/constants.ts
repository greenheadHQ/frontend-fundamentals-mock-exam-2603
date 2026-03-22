export const EQUIPMENT_LABELS: Record<string, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

export const ALL_EQUIPMENT = Object.keys(EQUIPMENT_LABELS);

export const TIMELINE_START = 9;
export const TIMELINE_END = 20;

export const TIME_SLOTS: string[] = [];
for (let h = TIMELINE_START; h <= TIMELINE_END; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < TIMELINE_END) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
  }
}

export const START_TIME_SLOTS = TIME_SLOTS.slice(0, -1);
export const END_TIME_SLOTS = TIME_SLOTS.slice(1);
