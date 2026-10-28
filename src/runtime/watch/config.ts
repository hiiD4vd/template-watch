let eventIndex = 0;
export const events = {
  INIT_PROJECT: eventIndex++,
  LOADING_PROGRESS: eventIndex++,
  ATTACH_PROJECT: eventIndex++,
  DETACH_PROJECT: eventIndex++,
  OPEN_PROJECT: eventIndex++,
  DESTROY_PROJECT: eventIndex++,
  VIEW_READY_PROJECT: eventIndex++,
  CONFIG_CHANGE: eventIndex++,
  HOVER_POSITION: eventIndex++,
  SET_CURSOR_ICON: eventIndex++,
  SET_CLICKED_MESH: eventIndex++,
  LEAVE_CLICKED_MESH: eventIndex++,
  NEXT_PREVIOUS_CLICKED_MESH: eventIndex++,
  XPLOD_ALL: eventIndex++,
  LONGPRESS_TOGGLE: eventIndex++,
  UPDATE_ROTATIONS: eventIndex++,
} as const;

export const storeKeys = {
  CURRENT_CONFIG: eventIndex++,
  IS_ALL_XPLODED: eventIndex++,
} as const;

export const finishKeys = ['first', 'second', 'third', 'fourth'] as const;
export type Finish = (typeof finishKeys)[number];
export const explosionScales = { tourbillon: 0.5, mainplate: 1.7, dial: 0.5 };

function handRotations(date: Date) {
  if (Number.isNaN(date.getTime())) {
    return { minute: -Math.PI / 3, hour: -(61 * Math.PI) / 36 };
  }
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return {
    hour: -2 * Math.PI * ((hours + minutes / 60 + seconds / 3600) / 12),
    minute: -2 * Math.PI * ((minutes + seconds / 60) / 60),
  };
}

const hands = handRotations(new Date());
const day = new Date().getDate();
// The GLB's date ring is authored with day eight at its zero rotation.
const dateRotation = Number.isNaN(day) ? 0 : -2 * Math.PI * ((day - 8) / 31);
export const initialPartRotations: Record<string, number> = {
  'dial-xploded-4': hands.minute,
  'dial-xploded-3': hands.hour,
  'hand-hours-shadow': hands.hour,
  'hand-minutes-shadow': hands.minute,
  'mainplate-xploded-12': dateRotation,
};
