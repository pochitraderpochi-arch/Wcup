# WC Penalty Backend

WebSocket + Solana escrow backend for World Cup Penalty PVP.

## Deploy to Railway

1. GitHub'a yükle (ayrı repo)
2. railway.app → New Project → GitHub repo seç
3. Environment Variables ekle:
   - `TREASURY_WALLET` = Solana cüzdan adresin
   - `WCUP_TOKEN` = pump.fun token adresi
4. Deploy!

## WebSocket Events

### Client → Server
- `create_room` - Yeni oda oluştur
- `join_room` - Odaya katıl  
- `confirm_payment` - Ödeme tx'ini onayla
- `shoot` - Penaltı at (zoneId: 0-8)

### Server → Client
- `room_created` - Oda oluşturuldu
- `room_joined` - Odaya katıldın
- `player_joined` - Rakip geldi
- `payment_confirmed` - Ödeme onaylandı
- `match_start` - Maç başlıyor
- `shot_result` - Atış sonucu
- `match_over` - Maç bitti, kazanan + ödeme
- `opponent_disconnected` - Rakip ayrıldı
