import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("圖片文字配對公開排行榜", () => {
  it("訪客可帶本機匿名編號讀取排行榜，且不再要求登入", () => {
    const source = readFileSync(new URL("./PictureMatchLeaderboard.tsx", import.meta.url), "utf8");

    expect(source).toContain("useQuery({ guestId })");
    expect(source).toContain("key={entry.entryId}");
    expect(source).toContain("訪客只會以隨機匿名編號顯示");
    expect(source).not.toContain("startLogin");
  });
});
