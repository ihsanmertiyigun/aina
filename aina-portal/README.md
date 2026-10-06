# AINA Portal — Network Monitoring

Django (REST API) + React (Vite) ile geliştirilmiş, kurumsal görünümlü network monitoring uygulaması taslağı.

## İçerik

| Katman | Teknoloji | Açıklama |
|---|---|---|
| Backend | Django 5.2, Django REST Framework, SimpleJWT | JWT tabanlı login, cihaz/alarm/lokasyon API'leri, dashboard özet endpoint'i |
| Frontend | React 18, Vite, React Router, Recharts, Axios, Lucide ikonları | Login ekranı, kurumsal sidebar/topbar, grafik + tablo dashboard'ları |
| Veritabanı | SQLite (geliştirme) | Üretimde PostgreSQL önerilir |

**Hazır ekranlar:** Login · Genel Bakış (KPI kartları, trafik, gecikme, cihaz tipi ve lokasyon grafikleri, tablolar) · Cihaz Envanteri (arama, filtre, sıralama, CSV dışa aktarma) · Cihaz Detayı (1/6/24 saat trafik ve gecikme grafikleri) · Alarm Yönetimi (önem filtresi, onaylama) · Topoloji / Raporlar / Otomasyon / Ayarlar (boş şablon sayfalar)

## Klasör yapısı

```
aina-portal/
├── branding/              # Logo dosyaları (SVG + PNG)
├── backend/
│   ├── config/            # Django ayarları, ana URL'ler
│   ├── accounts/          # Login (JWT), /api/auth/me
│   ├── monitoring/        # Modeller, API, admin, seed_demo komutu
│   ├── templates/admin/   # Logolu Django admin teması
│   ├── static/branding/
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js          # Axios + otomatik token yenileme
    │   ├── context/AuthContext.jsx
    │   ├── components/            # Layout (sidebar/topbar), Logo, ortak UI
    │   ├── pages/                 # Login, Dashboard, Devices, Alerts…
    │   └── styles.css             # Kurumsal tema (renkler :root içinde)
    ├── public/                    # favicon ve uygulama ikonları
    ├── package.json
    └── vite.config.js             # /api → Django proxy
```

## Ön gereksinimler

- Python **3.10+**
- Node.js **18+** (npm ile birlikte)

## Kurulum

### 1) Backend (Django)

```bash
cd aina-portal/backend

# Sanal ortam
python -m venv .venv
# macOS / Linux:
source .venv/bin/activate
# Windows (PowerShell):
.venv\Scripts\Activate.ps1

pip install -r requirements.txt

# Ortam değişkenleri
cp .env.example .env          # Windows: copy .env.example .env
# .env içindeki DJANGO_SECRET_KEY değerini değiştirin

python manage.py migrate
python manage.py seed_demo    # demo veri + admin kullanıcısı (admin / Admin123!)
python manage.py runserver    # http://127.0.0.1:8000
```

Kendi yönetici hesabınızı oluşturmak için: `python manage.py createsuperuser`
Django yönetim paneli: http://127.0.0.1:8000/admin

### 2) Frontend (React) — yeni bir terminalde

```bash
cd aina-portal/frontend
npm install
npm run dev                   # http://localhost:5173
```

Tarayıcıda **http://localhost:5173** adresini açın ve `admin` / `Admin123!` ile giriş yapın.

> Geliştirme sırasında Vite, `/api` isteklerini otomatik olarak Django'ya (8000 portu) yönlendirir; ek CORS ayarı gerekmez.

## API uç noktaları

| Metot | URL | Açıklama |
|---|---|---|
| POST | `/api/auth/login/` | `{us3rn4m3, pas_sw0rd}` → `{access, refresh}` |
| POST | `/api/auth/refresh/` | Access token yeniler |
| GET | `/api/auth/me/` | Giriş yapan kullanıcı |
| GET | `/api/dashboard/summary/` | KPI'lar, saatlik trafik/gecikme, dağılımlar, son alarmlar |
| GET/POST | `/api/devices/` | Cihazlar (`?status=`, `?type=`, `?site=`, `?search=`) |
| GET | `/api/devices/{id}/traffic/?hours=24` | Cihazın zaman serisi verisi |
| GET/POST | `/api/alerts/` | Alarmlar (`?severity=`, `?open=1`) |
| POST | `/api/alerts/{id}/acknowledge/` | Alarmı onaylar |
| GET/POST | `/api/sites/` | Lokasyonlar |

Tüm uç noktalar (login hariç) `Authorization: Bearer <access>` başlığı ister.

## Logo ve marka

**İşaret:** Üstünde "ATM" yazan başlık, ayna camı olarak çizilmiş ekran, tuş takımı, kart yuvası ve para yuvasıyla bir ATM. Ekrandaki kıvılcım yıldızları yapay zekâyı temsil eder.

**Yazı (wordmark):** "AINA" ve altında "AI ATM NETWORK ASSISTANT". Yazılar font dosyasına bağlı kalmasın ve her boyutta keskin görünsün diye **vektör konturlara (SVG path) çevrilmiştir**; bilgisayarda fontun yüklü olması gerekmez.
- AINA: **Orbitron ExtraBold (800)**
- Alt yazı: **Chakra Petch SemiBold (600)**
- İki font da SIL Open Font License ile ücretsiz ve ticari kullanıma açıktır (Google Fonts).

| Dosya | Kullanım |
|---|---|
| `branding/aina-logo-dark.svg` / `.png` | İşaret + yazı, koyu zemin |
| `branding/aina-logo-light.svg` / `.png` | İşaret + yazı, açık zemin |
| `branding/aina-wordmark-dark.svg` / `.png` | Yalnızca yazı, koyu zemin |
| `branding/aina-wordmark-light.svg` / `.png` | Yalnızca yazı, açık zemin |
| `branding/aina-mark.svg`, `aina-mark-512.png` | Yalnızca işaret (ikon) |
| `frontend/public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `logo-192.png` | Tarayıcı sekmesi ve mobil ikonlar |

PNG'ler şeffaf zeminli ve yüksek çözünürlüklüdür (sunum, doküman, e-posta imzası için). Web'de ve baskıda mümkünse SVG sürümlerini kullanın.

Logonun kullanıldığı yerler: yan menü (daraltılınca yalnızca işaret kalır), login ekranı (masaüstünde sol panel, mobilde form üstü), tarayıcı sekmesi ve Django admin paneli.
React içinde `src/components/Logo.jsx` kullanılır: `<Logo variant="dark|light" size={34} />` veya yalnızca işaret için `<LogoMark size={24} />`. Bileşen, `src/assets/` altındaki SVG dosyalarını gösterir.

Renkler: `#2b5ce6 → #4b1fa8` (mavi→mor gradyan zemin), `#26357f → #3b1a8f` (ayna ekranı), `#7fe3ff` (AI kıvılcımı), `#dfe7ff` / `#3a2fb8` (ATM başlığı), `#9aa9d8` / `#5b5f97` (alt yazı, koyu/açık zemin).

## Geliştirmeye devam ederken

- **Yeni sayfa eklemek:** `frontend/src/pages/` altına bileşeni ekleyin, `App.jsx` içinde route tanımlayın, `components/Layout.jsx` içindeki `NAV` dizisine menü öğesini ekleyin.
- **Tema renkleri:** `frontend/src/styles.css` dosyasının başındaki `:root` değişkenleri.
- **Gerçek veri toplama:** Demo veri yerine SNMP / ICMP / NetFlow toplayıcısı yazıp `Device` ve `TrafficSample` tablolarını güncelleyin. Periyodik görevler için Celery + Redis veya bir Django management komutunu cron ile çalıştırmak iyi bir başlangıçtır.
- **Canlı güncelleme:** Dashboard şu an 60 sn'de bir yenileniyor; anlık akış için Django Channels (WebSocket) eklenebilir.
- **Yetkilendirme:** Django gruplarını (`Yönetici`, `Operatör` vb.) kullanarak `permission_classes` ile rol bazlı erişim tanımlayın.

## Üretime alma (özet)

1. `.env` içinde `DJANGO_DEBUG=False`, güçlü bir `DJANGO_SECRET_KEY` ve doğru `DJANGO_ALLOWED_HOSTS` değerlerini ayarlayın.
2. SQLite yerine PostgreSQL kullanın (`pip install psycopg[binary]`, `settings.py` → `DATABASES`).
3. Frontend'i derleyin: `npm run build` → `frontend/dist` klasörünü Nginx ile sunun.
4. Django'yu Gunicorn ile çalıştırın (`gunicorn config.wsgi:application`), Nginx'te `/api` ve `/admin` yollarını Gunicorn'a yönlendirin.
5. `python manage.py collectstatic` ile admin statik dosyalarını toplayın.
