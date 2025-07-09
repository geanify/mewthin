// Utility functions for converting between meters and pixels

export const DEFAULT_WORLD_WIDTH_METERS = 100;
export const DEFAULT_SCREEN_WIDTH_PIXELS = 800;
export const DEFAULT_WORLD_HEIGHT_METERS = 100;
export const DEFAULT_SCREEN_HEIGHT_PIXELS = 600;

export function metersToPixels(
  meters: number,
  worldMeters: number = DEFAULT_WORLD_WIDTH_METERS,
  screenPixels: number = DEFAULT_SCREEN_WIDTH_PIXELS
): number {
  return meters * screenPixels / worldMeters;
}

export function pixelsToMeters(
  pixels: number,
  worldMeters: number = DEFAULT_WORLD_WIDTH_METERS,
  screenPixels: number = DEFAULT_SCREEN_WIDTH_PIXELS
): number {
  return pixels * worldMeters / screenPixels;
} 