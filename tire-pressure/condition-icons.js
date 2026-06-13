import { createElement, Bike, Fence, Waypoints, Mountain, Trees, ChartSpline, ArrowBigDown, LifeBuoy, Sun, CloudRain, Snowflake } from "lucide";
import { RIDE_STYLE, SURFACE } from "./tire-pressure.js";

function lucideIcon(iconNode) {
  const svg = createElement(iconNode);
  svg.setAttribute("aria-hidden", "true");
  return svg.outerHTML;
}

/** Иконки Lucide (ISC): https://lucide.dev */
export const RIDE_STYLE_ICONS = {
  [RIDE_STYLE.ROAD]: lucideIcon(Bike),
  [RIDE_STYLE.CROSS]: lucideIcon(Fence),
  [RIDE_STYLE.GRAVEL]: lucideIcon(Waypoints),
  [RIDE_STYLE.XCOUNTRY_MTB]: lucideIcon(Mountain),
  [RIDE_STYLE.TRAIL_MTB]: lucideIcon(Trees),
  [RIDE_STYLE.ENDURO_MTB]: lucideIcon(ChartSpline),
  [RIDE_STYLE.DOWNHILL_MTB]: lucideIcon(ArrowBigDown),
  [RIDE_STYLE.FAT]: lucideIcon(LifeBuoy),
};

export const SURFACE_ICONS = {
  [SURFACE.DRY]: lucideIcon(Sun),
  [SURFACE.WET]: lucideIcon(CloudRain),
  [SURFACE.SNOW]: lucideIcon(Snowflake),
};
