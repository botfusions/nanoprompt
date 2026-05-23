# VERCEL DEPLOY & CUSTOM DOMAIN REHBERİ

Bu doküman, **IMAGE PROMPT STÜDYO V2** projesinin Vercel üzerinde başarıyla yayınlanması ve özel alan adı (custom domain) eklendikten sonra servislerin (Firebase, Supabase, PayTR) kesintisiz çalışması için yapılması gereken tüm entegrasyon ayarlarını adım adım açıklamaktadır.

---

## 🛠️ 1. Adım: Vercel Üzerinde Custom Domain Tanımlama

Vercel üzerinde alan adınızı bağlamak ve DNS yönlendirmelerini tamamlamak için aşağıdaki adımları izleyin:

1. [Vercel Dashboard](https://vercel.com) üzerinden projenize gidin.
2. Üst menüden **Settings (Ayarlar) > Domains (Alan Adları)** sekmesine tıklayın.
3. Alan adınızı (örn: `tasarimdomain.com`) yazıp **"Add"** butonuna basın.
4. Domain yönlendirmesi için DNS sağlayıcınızın (GoDaddy, Turhost, Namecheap, Cloudflare vb.) paneline giderek aşağıdaki kayıtları ekleyin:

### 📊 DNS Yapılandırma Tablosu

| Kayıt Tipi | İsim (Host) | Hedef (Değer/Value) | Açıklama |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | Apex (www olmayan) domain yönlendirmesi |
| **CNAME** | `www` | `cname.vercel-dns.com` | Alt (www olan) domain yönlendirmesi |

> [!TIP]
> DNS yönlendirmelerinin dünya genelinde aktif olması ve Vercel'in otomatik **SSL (Let's Encrypt)** sertifikası oluşturması 5 ile 30 dakika arasında sürebilir.

---

## 🚨 2. Adım: Firebase Auth (Google OAuth) Alan Adı Yetkilendirmesi

Özel alan adınız üzerinden sisteme giriş yapıldığında **"Error: unauthorized_client"** hatası almamak için Google OAuth alan adı iznini tanımlamalısınız:

1. [Firebase Console](https://console.firebase.google.com/) sayfasına gidin.
2. Projenizi seçip sol menüden **Build > Authentication** sekmesine tıklayın.
3. Üst menüden **Settings > Authorized Domains (Yetkilendirilmiş Alan Adları)** alanına gelin.
4. **"Add domain"** butonuna tıklayarak aşağıdaki adreslerin ikisini de ekleyin:
   * `tasarimdomain.com`
   * `www.tasarimdomain.com`

> [!IMPORTANT]
> Bu adımı atlamanız durumunda, kullanıcılarınız özel domaininiz üzerinden sisteme **Google ile Giriş** yapamayacaktır!

---

## 🔐 3. Adım: Supabase URL ve Yönlendirme (Redirect) Ayarları

Giriş (Auth) işlemlerinin ardından kullanıcıların otomatik olarak yeni sitenize yönlendirilebilmesi için Supabase yönlendirme kurallarını güncelleyin:

1. [Supabase Dashboard](https://supabase.com/dashboard) sayfasına gidin.
2. Projenizi seçip sol menüden **Project Settings > Authentication** sekmesine gidin.
3. **URL Configuration** başlığı altındaki alanları şu şekilde düzenleyin:
   * **Site URL:** `https://www.tasarimdomain.com`
   * **Redirect URLs:** Listeye yeni domaininizin dinamik eşleşmesini ekleyin:
     * `https://www.tasarimdomain.com/**`
     * `https://tasarimdomain.com/**`

---

## 💳 4. Adım: PayTR Webhook & Entegrasyon Güncellemesi

Kullanıcıların kredi satın alma işlemlerinin (ödeme onaylarının) otomatik olarak veritabanına yansıması ve kredilerin yüklenmesi için bildirim URL'ini güncelleyin:

1. [PayTR Mağaza Paneline](https://www.paytr.com/magaza) giriş yapın.
2. Sol menüden **Bilgi > Entegrasyon** sekmesine tıklayın.
3. **Bildirim URL (Callback URL)** alanını yeni domaininize göre güncelleyin:
   * **Yeni Bildirim URL:** `https://www.tasarimdomain.com/api/paytr/callback`
4. Değişiklikleri kaydedin.

---

## ⚙️ 5. Adım: Vercel Ortam Değişkenleri (Environment Variables)

Projenin kendi içindeki mutlak yollarını, görsel proxy'sini ve yönlendirme bağlantılarını doğru oluşturabilmesi için Vercel üzerindeki ana URL parametresini güncelleyin:

1. Vercel projenizde **Settings > Environment Variables** sekmesine gidin.
2. Listeden `NEXT_PUBLIC_BASE_URL` değişkenini bulun ve değerini yeni domaininizle güncelleyin:
   * Değer: `https://www.tasarimdomain.com`
3. Değişikliği kaydedin.
4. Ayarların geçerli olması için **Deployments** sekmesine giderek en son başarılı yayınınızın yanındaki üç noktaya tıklayıp **"Redeploy"** seçeneğiyle sitenizi yeniden derleyin.

---

> [!NOTE]
> **Canlıya Geçiş Sonrası Kontrol Listesi:**
> - [ ] Sitenin `https://` protokolüyle güvenli açıldığını doğrulayın.
> - [ ] Google ile Giriş fonksiyonunu test edin.
> - [ ] Bir promptu kopyalayıp limitlerin ve kopyalama durumunun çalıştığını kontrol edin.
> - [ ] Test amaçlı küçük paket alımı yaparak PayTR webhook akışını doğrulayın.
