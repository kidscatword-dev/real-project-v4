/** 家庭完整解鎖一律由伺服器核實 Google Play 購買後授權。 */
export type LearningLevel = "preschool" | "junior" | "senior";

export const isPremiumLevel = (level: LearningLevel) => level === "junior" || level === "senior";

/** 第 1 級始終免費；第 2 至第 10 級須由伺服器核實的家庭權益開放。 */
export const isTenLevelLocked = (level: number, familyUnlocked: boolean) => level > 1 && !familyUnlocked;

export function restrictTenLevelTerms<T extends { level: number }>(terms: T[], familyUnlocked: boolean) {
  return familyUnlocked ? terms : terms.filter((term) => term.level === 1);
}
