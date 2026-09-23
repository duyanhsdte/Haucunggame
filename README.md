# Hậu Cung AI

MVP cho game nhập vai hậu cung: người chơi chọn thẻ hành động, tự viết lời nói/hành động, sau đó hệ thống phân tích và cập nhật trạng thái NPC.

## Chạy local

Không cần backend cho bản MVP hiện tại. Mở `index.html` bằng trình duyệt hoặc dùng Live Server.

## Hiện có

- 5 thẻ hành động
- Chat nhập tự do
- AI-style rule engine để phân tích hành động
- Thiện cảm / Tin tưởng / Tôn trọng / Thân mật / Tò mò
- Trạng thái NPC
- Lịch sử lượt chơi
- LocalStorage save
- Responsive UI

## Bước tiếp theo

Thay `analyze()` trong `app.js` bằng API LLM thật (Gemini/Groq/OpenRouter). API key không được đặt trực tiếp trong frontend khi deploy production; nên dùng backend/serverless function.

Repository: https://github.com/duyanhsdte/Haucunggame
