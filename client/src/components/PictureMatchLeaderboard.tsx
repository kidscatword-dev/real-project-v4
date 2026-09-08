import { ArrowLeft, Clock3, Crown, Trophy, UsersRound } from "lucide-react";
import { trpc } from "@/lib/trpc";

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function PictureMatchLeaderboard({ onBack, guestId }: { onBack: () => void; guestId?: string }) {
  const leaderboard = trpc.social.pictureMatchLeaderboard.useQuery({ guestId });

  if (leaderboard.isLoading || !leaderboard.data) return <main className="mx-auto grid min-h-screen max-w-md place-items-center bg-[#FFF9ED] p-6 text-center font-black text-[#65758A]">正在載入排行榜⋯</main>;

  const { entries, myRank, totalPlayers } = leaderboard.data;
  return <main className="mx-auto min-h-screen max-w-md bg-[#FFF9ED] px-5 pb-8 pt-5"><LeaderboardHeader onBack={onBack} /><section className="mt-5 rounded-[2rem] bg-[linear-gradient(135deg,#EAF2FF,#FFF4DE)] px-5 py-6 text-center shadow-[0_10px_24px_rgba(89,119,147,.13)]"><Trophy className="mx-auto h-9 w-9 text-[#E7A633]" /><h1 className="mt-2 font-serif text-3xl font-black text-[#40526D]">圖片文字配對</h1><p className="mt-1 text-sm font-bold text-[#66768A]">完成八對的最佳時間排名</p><div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white/75 px-4 py-3 text-sm font-black text-[#58708D]"><UsersRound className="h-5 w-5" />目前共有 {totalPlayers} 位玩家上榜</div></section>{entries.length === 0 ? <section className="mt-5 rounded-[2rem] bg-white p-7 text-center shadow-sm"><span className="text-5xl">🐱</span><h2 className="mt-3 text-xl font-black text-[#40526D]">等你第一個上榜！</h2><p className="mt-2 text-sm font-bold leading-6 text-[#6E7B91]">在三分鐘內完成八對圖片文字配對，便會顯示你的最佳時間。</p></section> : <section className="mt-5 overflow-hidden rounded-[2rem] bg-white shadow-[0_10px_24px_rgba(89,119,147,.11)]"><ol>{entries.map((entry) => <li key={entry.entryId} className={`flex items-center gap-3 border-b border-[#EDF1F6] px-4 py-3 last:border-b-0 ${entry.isMe ? "bg-[#F1F7FF]" : ""}`}><em className={`grid h-8 w-8 place-items-center rounded-full text-sm font-black not-italic ${entry.rank <= 3 ? "bg-[#FFE6A8] text-[#9A6811]" : "bg-[#EEF2F6] text-[#63748A]"}`}>{entry.rank <= 3 ? <Crown className="h-4 w-4" /> : entry.rank}</em><span className="text-2xl">{entry.avatarEmoji}</span><strong className="min-w-0 flex-1 truncate text-[#40526D]">{entry.displayName}{entry.isMe ? "（我）" : ""}</strong><span className="flex items-center gap-1 text-sm font-black text-[#5472A2]"><Clock3 className="h-4 w-4" />{formatTime(entry.durationSeconds)}</span></li>)}</ol></section>}{myRank !== null && myRank > entries.length && <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-[#5D7191]">你的目前排名：第 {myRank} 位</p>}<p className="mt-5 text-center text-xs font-bold leading-5 text-[#78869A]">登入家長帳戶會顯示自訂暱稱與小頭像；訪客只會以隨機匿名編號顯示。每位玩家只保留最快一局，同一時間時，步數較少者排前。</p></main>;
}

function LeaderboardHeader({ onBack }: { onBack: () => void }) {
  return <header className="flex items-center justify-between"><button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#47745D] shadow-sm" aria-label="返回"><ArrowLeft className="h-5 w-5" /></button><div className="text-center"><p className="font-serif text-2xl font-black text-[#40526D]">時間排行榜</p><small className="font-bold text-[#76839A]">家長暱稱／匿名編號・最佳成績</small></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EAF2FF] text-xl">🏆</span></header>;
}
