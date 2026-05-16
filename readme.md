
# 🤖 Discord Abone Rol Botu

Sunucuna abone rolü yönetimi, log kanalı, üye rolü otomasyonu ve ses kanalı desteği sunan tam özellikli bir Discord botu.

---

## 📋 Özellikler

| Özellik | Açıklama |
|---|---|
| 🌟 Abone Rol Verme | Yetkili komutu ile kullanıcıya abone rolü ver |
| 🗑️ Abone Rol Kaldırma | Abone rolünü kaldır |
| 📋 Log Kanalı | Her işlem otomatik log kanalına bildirilir |
| 👮 Abone Yetkilisi Rolü | Abone komutlarını sadece yetkililer kullanabilir |
| 👤 Otomatik Üye Rolü | Sunucuya giren herkese otomatik üye rolü verilir |
| 🔊 Ses Kanalı | Bot belirlenen ses kanalında sürekli durur |
| ⚙️ Slash Komutlar | Tüm komutlar modern slash komut sistemi ile |

---

## 🚀 Kurulum

### 1. Gereksinimler
- Node.js 18 veya üstü → [nodejs.org](https://nodejs.org)
- Bir Discord botu → [Discord Developer Portal](https://discord.com/developers/applications)

### 2. Bot Oluşturma (Discord Developer Portal)
1. [discord.com/developers/applications](https://discord.com/developers/applications) adresine git
2. **New Application** → İsim ver → **Create**
3. Sol menüden **Bot** sekmesine gir
4. **Add Bot** → **Yes, do it!**
5. **TOKEN** bölümünden **Reset Token** → Tokeni kopyala
6. Aşağı kaydır → şu izinleri **AÇ**:
   - ✅ `Server Members Intent`
   - ✅ `Message Content Intent`
   - ✅ `Presence Intent`

### 3. Botu Sunucuya Ekle
1. Sol menüden **OAuth2** → **URL Generator**
2. **Scopes:** `bot` + `applications.commands`
3. **Bot Permissions:**
   - ✅ Manage Roles
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Connect (Ses kanalı için)
   - ✅ View Channels
4. Oluşan linki kopyala → tarayıcıda aç → sunucunu seç → **Authorize**

### 4. Config Dosyasını Düzenle

`config.json` dosyasını aç:

```json
{
  "token": "BURAYA_BOT_TOKEN_YAZ",
  "guildId": "BURAYA_SUNUCU_ID_YAZ",
  ...
}
```

**Sunucu ID nasıl alınır?**
- Discord'da Kullanıcı Ayarları → Gelişmiş → **Geliştirici Modu**'nu aç
- Sunucu ikonuna sağ tıkla → **Kimliği Kopyala**

### 5. Paketleri Yükle ve Başlat

```bash
# Klasöre gir
cd discord-abone-bot

# Paketleri yükle
npm install

# Botu başlat
npm start
```

---

## ⚙️ İlk Kurulum (Bot Açıldıktan Sonra)

Bot açıldıktan sonra Discord'da şu komutları sırayla çalıştır (Yönetici olman gerekir):

```
/ayarla-abone-rol        → Abone rolünü seç
/ayarla-yetkili-rol      → Abone yetkilisi rolünü seç
/ayarla-log-kanal        → Log kanalını seç
/ayarla-uye-rol          → Otomatik üye rolünü seç
/ayarla-ses-kanal        → Botun duracağı ses kanalını seç
```

Ayarları kontrol etmek için:
```
/ayarlar
```

---

## 📖 Komutlar

### 👮 Abone Yetkilisi Komutları
| Komut | Açıklama |
|---|---|
| `/abone-ver @kullanıcı [sebep]` | Kullanıcıya abone rolü ver |
| `/abone-al @kullanıcı [sebep]` | Kullanıcıdan abone rolü kaldır |
| `/abone-kontrol [@kullanıcı]` | Abone durumunu kontrol et |
| `/abone-liste` | Tüm aboneleri listele |

### 🔧 Yönetici Komutları
| Komut | Açıklama |
|---|---|
| `/ayarlar` | Mevcut ayarları görüntüle |
| `/ayarla-abone-rol` | Abone rolünü ayarla |
| `/ayarla-yetkili-rol` | Yetkili rolünü ayarla |
| `/ayarla-log-kanal` | Log kanalını ayarla |
| `/ayarla-uye-rol` | Otomatik üye rolünü ayarla |
| `/ayarla-ses-kanal` | Ses kanalını ayarla |

---

## ❓ Sorun Giderme

**Bot ses kanalına bağlanmıyor?**
→ Bota `Connect` yetkisi ver, `@discordjs/opus` ve `sodium-native` yüklü olduğundan emin ol.

**Slash komutlar görünmüyor?**
→ `guildId` doğru yazıldığından emin ol. Bot yeniden başlatınca komutlar kaydedilir (1-2 dk sürebilir).

**"Missing Permissions" hatası?**
→ Botun rolü, vermeye çalıştığın rolün **üzerinde** olmalı (Sunucu Ayarları → Roller sıralaması).