import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Crown, Heart, MessageCircleHeart, Send, UserPlus, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { readQuestProgress } from "@/lib/mapQuestProgress";

const SAFE_MESSAGES = [
  { key: "cheer" as const, emoji: "💪", text: "一起加油！" },
  { key: "greatJob" as const, emoji: "👏", text: "你做得很好！" },
  { key: "letsPlay" as const, emoji: "🎮", text: "一起努力闖關！" },
  { key: "star" as const, emoji: "⭐", text: "送你一顆星！" },
  { key: "wave" as const, emoji: "👋", text: "你好呀，學習朋友！" },
];

const AVATARS = ["🐱", "🐶", "🐰", "🦊", "🐼", "🦁"];

export function FriendsHub({ onBack }: { onBack: () => void }) {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [friendCode, setFriendCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🐱");
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const localStars = useMemo(() => Object.values(readQuestProgress()).reduce((sum, stars) => sum + stars, 0), []);
  const dashboard = trpc.social.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const refresh = () => utils.social.dashboard.invalidate();
  const syncStars = trpc.social.syncStars.useMutation({ onSuccess: refresh });
  const updateProfile = trpc.social.updateProfile.useMutation({ onSuccess: (profile) => { setDisplayName(profile.displayName); setAvatarEmoji(profile.avatarEmoji); toast.success("家長學習檔案已更新"); refresh(); }, onError: (error) => toast.error(error.message) });
  const requestFriend = trpc.social.sendFriendRequest.useMutation({ onSuccess: (result) => { toast.success(result.message); setFriendCode(""); refresh(); }, onError: (error) => toast.error(error.message) });
  const respond = trpc.social.respondToRequest.useMutation({ onSuccess: (result) => { toast.success(result.accepted ? "已成為學習朋友！" : "已婉拒這個邀請。" ); refresh(); }, onError: (error) => toast.error(error.message) });
  const removeFriend = trpc.social.removeFriend.useMutation({ onSuccess: () => { toast.success("已移除這位學習朋友"); setSelectedFriendId(null); refresh(); }, onError: (error) => toast.error(error.message) });
  const blockFriend = trpc.social.blockFriend.useMutation({ onSuccess: () => { toast.success("已封鎖這位學習朋友"); setSelectedFriendId(null); refresh(); }, onError: (error) => toast.error(error.message) });
  const sendMessage = trpc.social.sendSafeMessage.useMutation({ onSuccess: () => { toast.success("已送出鼓勵！"); refresh(); }, onError: (error) => toast.error(error.message) });

  useEffect(() => {
    if (!dashboard.data) return;
    setDisplayName(dashboard.data.profile.displayName);
    setAvatarEmoji(dashboard.data.profile.avatarEmoji);
    if (dashboard.data.profile.learningStars < localStars) syncStars.mutate({ stars: localStars });
  }, [dashboard.data, localStars]);

  if (loading) return <main className="mx-auto grid min-h-screen max-w-md place-items-center bg-[#FFF9ED] p-6 text-center font-black text-[#65758A]">正在準備好友樂園⋯</main>;

  if (!isAuthenticated) return <main className="mx-auto flex min-h-screen max-w-md flex-col bg-[#FFF9ED] px-5 pb-8 pt-5"><HubHeader onBack={onBack} /><section className="mt-8 rounded-[2rem] border-2 border-[#D7E5F0] bg-white p-7 text-center shadow-[0_10px_24px_rgba(89,119,147,.13)]"><span className="text-6xl">👨‍👩‍👧</span><h1 className="mt-4 font-serif text-3xl font-black text-[#40526D]">家長好友樂園</h1><p className="mt-3 text-sm font-bold leading-6 text-[#66768A]">由家長登入後，才可建立好友代碼、確認好友及查看學習星星。孩子只可傳送預設鼓勵短句和貼圖，沒有自由文字聊天。</p><button onClick={startLogin} className="mt-6 w-full rounded-2xl bg-[#68B699] px-5 py-4 text-base font-black text-white shadow-[0_5px_0_#438A70] active:translate-y-1 active:shadow-none">家長登入，開啟好友功能</button><button onClick={onBack} className="mt-4 text-sm font-black text-[#718095]">暫時返回學習</button></section></main>;

  if (dashboard.isLoading || !dashboard.data) return <main className="mx-auto grid min-h-screen max-w-md place-items-center bg-[#FFF9ED] p-6 text-center font-black text-[#65758A]">正在載入好友樂園⋯</main>;

  const { profile, friends, requests, leaderboard, messages } = dashboard.data;
  const selectedFriend = friends.find((friend) => friend.id === selectedFriendId) ?? friends[0] ?? null;
  const selectedMessages = selectedFriend ? messages.filter((message) => message.friendProfileId === selectedFriend.id).slice().reverse() : [];

  return <main className="mx-auto min-h-screen max-w-md bg-[#FFF9ED] px-5 pb-8 pt-5"><HubHeader onBack={onBack} /><section className="friend-profile-card mt-4"><div className="friend-avatar">{profile.avatarEmoji}</div><div><p>家長學習檔案</p><h1>{profile.displayName}</h1><strong>⭐ {profile.learningStars} 顆學習星星</strong></div></section><section className="friend-code-card mt-4"><p>我的好友代碼</p><strong>{profile.friendCode}</strong><button onClick={() => { navigator.clipboard?.writeText(profile.friendCode); toast.success("好友代碼已複製"); }} aria-label="複製好友代碼"><Copy className="h-4 w-4" />複製</button><small>交給認識的家長，對方確認後才會成為學習朋友。</small></section><section className="friend-section mt-5"><h2><UserPlus className="h-5 w-5" />加入學習朋友</h2><div className="friend-code-form"><input value={friendCode} onChange={(event) => setFriendCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))} placeholder="輸入 8 位好友代碼" maxLength={8} /><button onClick={() => requestFriend.mutate({ friendCode })} disabled={friendCode.length !== 8 || requestFriend.isPending}>送出邀請</button></div></section>{requests.length > 0 && <section className="friend-section mt-5"><h2><Heart className="h-5 w-5" />等你確認的邀請</h2>{requests.map((request) => <div key={request.id} className="friend-request"><span>{request.profile.avatarEmoji}</span><p><strong>{request.profile.displayName}</strong><small>想成為學習朋友</small></p><button onClick={() => respond.mutate({ requestId: request.id, accept: true })} aria-label={`確認 ${request.profile.displayName}`}><Check className="h-4 w-4" /></button><button onClick={() => respond.mutate({ requestId: request.id, accept: false })} className="decline">略過</button></div>)}</section>}<section className="friend-section mt-5"><h2><Crown className="h-5 w-5" />好友學習排行榜</h2><ol className="friend-leaderboard">{leaderboard.map((entry, index) => <li key={entry.id} className={entry.id === profile.id ? "me" : ""}><em>{index + 1}</em><span>{entry.avatarEmoji}</span><strong>{entry.displayName}{entry.id === profile.id ? "（我）" : ""}</strong><small>⭐ {entry.learningStars}</small></li>)}</ol></section><section className="friend-section mt-5"><h2><UsersRound className="h-5 w-5" />我的學習朋友</h2>{friends.length === 0 ? <p className="friend-empty">暫時未有學習朋友。先用好友代碼邀請認識的家長吧！</p> : <div className="friend-list">{friends.map((friend) => <button key={friend.id} onClick={() => setSelectedFriendId(friend.id)} className={friend.id === selectedFriend?.id ? "selected" : ""}><span>{friend.avatarEmoji}</span><strong>{friend.displayName}</strong><small>⭐ {friend.learningStars}</small></button>)}</div>}</section>{selectedFriend && <section className="friend-section mt-5"><h2><MessageCircleHeart className="h-5 w-5" />傳送安全鼓勵</h2><div className="friend-message-history">{selectedMessages.length === 0 ? <p>挑一句正向鼓勵送給 {selectedFriend.displayName} 吧！</p> : selectedMessages.map((message) => { const item = SAFE_MESSAGES.find((choice) => choice.key === message.messageKey); return <span key={message.id} className={message.fromMe ? "from-me" : "from-friend"}>{item?.emoji} {item?.text}</span>; })}</div><div className="safe-message-grid">{SAFE_MESSAGES.map((message) => <button key={message.key} onClick={() => sendMessage.mutate({ friendProfileId: selectedFriend.id, messageKey: message.key })} disabled={sendMessage.isPending}><span>{message.emoji}</span>{message.text}</button>)}</div><div className="mt-4 flex gap-4"><button onClick={() => removeFriend.mutate({ friendProfileId: selectedFriend.id })} className="friend-remove">移除這位學習朋友</button><button onClick={() => { if (window.confirm(`確定封鎖 ${selectedFriend.displayName}？封鎖後對方不能再邀請你。`)) blockFriend.mutate({ friendProfileId: selectedFriend.id }); }} className="friend-remove text-[#9D5460]">封鎖</button></div></section>}<section className="friend-section mt-5"><h2>家長設定</h2><div className="friend-profile-edit"><input value={displayName} onChange={(event) => setDisplayName(event.target.value.slice(0, 24))} aria-label="好友顯示暱稱" /><div>{AVATARS.map((emoji) => <button key={emoji} onClick={() => setAvatarEmoji(emoji)} className={avatarEmoji === emoji ? "selected" : ""}>{emoji}</button>)}</div><button onClick={() => updateProfile.mutate({ displayName, avatarEmoji })} disabled={!displayName.trim() || updateProfile.isPending}>儲存家長設定</button></div></section></main>;
}

function HubHeader({ onBack }: { onBack: () => void }) {
  return <header className="flex items-center justify-between"><button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#47745D] shadow-sm" aria-label="返回"><ArrowLeft className="h-5 w-5" /></button><div className="text-center"><p className="font-serif text-2xl font-black text-[#40526D]">好友樂園</p><small className="font-bold text-[#76839A]">家長管理・安全互動</small></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E7F4EE] text-xl">👫</span></header>;
}
