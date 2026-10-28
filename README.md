# 四月身心靈工作室（aprilspirit.com）

Jekyll 網站，放在 GitHub Pages。

## 上線

1. 把這個資料夾裡的所有檔案，上傳到 repo 的根目錄（`CNAME` 和 `_config.yml` 要在最外層）。
2. Settings → Pages，Source 選 main 分支、/(root)。
3. Custom domain 填 `aprilspirit.com`，DNS 檢查通過後勾 Enforce HTTPS。

## 要改的設定（都在 `_config.yml`）

- `line_url`：預約用的 LINE 連結。
- `newsletter_embed_url`：Brevo 表單的 iframe 網址。沒填時，頁尾會先顯示「用 LINE 加入」。
- `hoodoo_url`：靈火巫境的網址。

## 要補的內容

- `services.md` 的「時間與費用」：目前只寫「預約時說明」。
- `about.md`：確認內容是否符合你想怎麼介紹自己。

## 新增文章與個案心得

- 範本在 `_templates/`。
- 個案心得放 `_cases/`，文章放 `_posts/`（沒有就建立這個資料夾）。
- 檔名格式：`年-月-日-英文短名.md`。
- 個案心得一律改寫，不放可辨識細節，發布前取得當事人同意。

## 注意

- repo 是 Public，原始碼誰都看得到。個案資料、客戶的聯絡方式，絕對不要放進來。
