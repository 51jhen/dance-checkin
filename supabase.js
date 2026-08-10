// ==================================================
// Supabase 設定
// ==================================================

const SUPABASE_URL =
    "https://yefgqzjlddszhnaawvjv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_zjfUBdwwbVfNl1Z52-4vug_dBdwI2Vy";


// 建立 Supabase 連線
const db =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


console.log("✅ Supabase db 建立成功！");