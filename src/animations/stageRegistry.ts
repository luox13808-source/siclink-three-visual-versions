"use client";

import type { StageHandlers } from "@/animations/stageNavigation";
import { registerStageHandlers } from "@/animations/stageNavigation";

type PartialHandlers = Partial<StageHandlers>;

const heroHandlers: PartialHandlers = {};
const coreHandlers: PartialHandlers = {};
const openCommunityHandlers: PartialHandlers = {};

function syncHandlers() {
  const merged = { ...heroHandlers, ...coreHandlers, ...openCommunityHandlers } as StageHandlers;

  const ready =
    typeof merged.heroGetPhase === "function" &&
    typeof merged.heroIsPinned === "function" &&
    typeof merged.heroWheelDown === "function" &&
    typeof merged.heroWheelUp === "function" &&
    typeof merged.heroGoToCore === "function" &&
    typeof merged.coreIsEngaged === "function" &&
    typeof merged.coreWheelDown === "function" &&
    typeof merged.coreWheelUp === "function" &&
    typeof merged.openCommunityIsEngaged === "function" &&
    typeof merged.openCommunityGetPhase === "function" &&
    typeof merged.openCommunityWheelDown === "function" &&
    typeof merged.openCommunityWheelUp === "function";

  if (ready) {
    registerStageHandlers(merged);
  }
}

export function registerHeroStageHandlers(handlers: PartialHandlers) {
  Object.assign(heroHandlers, handlers);
  syncHandlers();
}

export function registerCoreStageHandlers(handlers: PartialHandlers) {
  Object.assign(coreHandlers, handlers);
  syncHandlers();
}

export function registerOpenCommunityHandlers(handlers: PartialHandlers) {
  Object.assign(openCommunityHandlers, handlers);
  syncHandlers();
}

export function clearStageRegistry() {
  Object.keys(heroHandlers).forEach((key) => delete heroHandlers[key as keyof PartialHandlers]);
  Object.keys(coreHandlers).forEach((key) => delete coreHandlers[key as keyof PartialHandlers]);
  Object.keys(openCommunityHandlers).forEach((key) => delete openCommunityHandlers[key as keyof PartialHandlers]);
}
