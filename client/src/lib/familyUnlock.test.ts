import { describe, expect, it } from "vitest";
import { isPremiumLevel, isTenLevelLocked, restrictTenLevelTerms } from "./familyUnlock";

describe("家庭完整解鎖規則", () => {
  it("永久保留第 1 級免費，並鎖定第 2 至第 10 級", () => {
    expect(isTenLevelLocked(1, false)).toBe(false);
    expect(isTenLevelLocked(2, false)).toBe(true);
    expect(isTenLevelLocked(10, false)).toBe(true);
    expect(isTenLevelLocked(10, true)).toBe(false);
  });

  it("未解鎖時不會由查詞或溫習庫旁路回傳付費級別詞語", () => {
    const terms = [{ level: 1, term: "太陽" }, { level: 2, term: "圖書館" }, { level: 10, term: "憲法" }];
    expect(restrictTenLevelTerms(terms, false)).toEqual([{ level: 1, term: "太陽" }]);
    expect(restrictTenLevelTerms(terms, true)).toEqual(terms);
  });

  it("舊三級收藏冊仍然只把中級與高級視為付費內容", () => {
    expect(isPremiumLevel("preschool")).toBe(false);
    expect(isPremiumLevel("junior")).toBe(true);
    expect(isPremiumLevel("senior")).toBe(true);
  });
});
