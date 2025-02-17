import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import { Plan } from "@prisma/client"

export const PLAN_LIMITS: Record<Plan, number> = {
    LAUNCH: 2,
    GROW: 10000,
    SCALE: 100000
};

export function hasReachedSubscriptionLimit(currentCount: number, plan: Plan): boolean {
    return currentCount >= PLAN_LIMITS[plan];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode.toUpperCase().split("").map((char: string) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function capitalizeFirstLetter(string: string | undefined): string {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
}