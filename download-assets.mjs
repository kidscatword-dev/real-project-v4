import fs from 'fs';
import path from 'path';

// 🤖 4000 檔案全自動下載拯救機器人
(async () => {
    // 💡 指向 Manus 雲端硬碟的真正靜態根網址
    const baseUrl = "https://manus.space";
    
    // 💡 定義你電腦 C 槽的接收基地路徑
    const targetDir = path.join(process.cwd(), 'client', 'public', 'manus-storage');
    
    // 如果本地還沒有這個資料夾，全自動建立它
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`📁 已自動建立本地接收資料夾：${targetDir}`);
    }

    console.log("🚀 機器人啟動：正在準備橫掃並下載 4000+ 個遊戲實體素材...");
    
    // 1. 生成大數據清單（包含可能存在的所有卡牌流水號）
    const downloadQueue = [
        "reading-cat-mascot_e03e748c.png",
        "favicon.ico",
        "logo.png"
    ];

    // 橫掃 1 到 1200 組卡牌、配對文字、背景和粵語錄音檔（4000多個檔案的範疇）
    for (let i = 1; i <= 1200; i++) {
        downloadQueue.push(`card_${i}.png`, `card_${i}.webp`, `card_${i}.jpg`);
        downloadQueue.push(`word_${i}.png`, `word_${i}.webp`, `word_${i}.jpg`);
        downloadQueue.push(`bg_${i}.png`, `bg_${i}.jpg`);
        downloadQueue.push(`cantonese-${i}.mp3`); // 批量捕捉粵語讀音
    }

    // 加上常見的流水號或代碼格式（依據 Manus 截圖中的格式補充）
    // 機器人會全自動幫你盲測這幾千個檔案
    let currentSuccess = 0;
    
    console.log(`📊 掃描清單生成完畢，開始分批強行下載...`);

    // 2. 執行分批流式下載
    for (const fileName of downloadQueue) {
        const fileUrl = baseUrl + fileName;
        const localPath = path.join(targetDir, fileName);

        try {
            // 盲測遠端伺服器有沒有這個檔案
            const response = await fetch(fileUrl);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(localPath, Buffer.from(buffer));
                currentSuccess++;
                
                // 每成功抓到 100 個檔案，在螢幕上回報一次進度
                if (currentSuccess % 50 === 0) {
                    console.log(`📥 搶救進度：已成功下載 ${currentSuccess} 個檔案...`);
                }
                
                // 停頓 20 毫秒，防止速度太快被 Manus 的伺服器強行切斷連線
                await new Promise(resolve => setTimeout(resolve, 20));
            }
        } catch (error) {
            // 忽略不存在的檔案，繼續往下抓
        }
    }

    console.log(`\n🎉 【終極大勝利】全自動搶救計畫完成！`);
    console.log(`🏆 共成功抓回 ${currentSuccess} 個實體檔案！通通已安穩躺在 client/public/manus-storage 內！`);
})();
