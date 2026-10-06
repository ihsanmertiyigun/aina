import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ us3rn4m3: "", pas_sw0rd: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await login(form.us3rn4m3, form.pas_sw0rd); navigate("/"); }
    catch (err) {
      setError(err.response?.status === 401 ? "Kullanıcı adı veya parola hatalı." : "Sunucuya ulaşılamıyor.");
    } finally { setBusy(false); }
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <Logo size={44} variant="dark" className="logo-large" />
        <div className="login-pitch">
          <h1>Altyapınızın tamamı,<br />tek bir ekranda.</h1>
          <p>Cihaz durumu, trafik, gecikme ve alarmları gerçek zamanlı izleyin; sorunları kullanıcılarınızdan önce görün.</p>
          <ul>
            <li><span>99.9%</span>Hedef erişilebilirlik</li>
            <li><span>5 dk</span>Ölçüm aralığı</li>
            <li><span>7/24</span>Alarm takibi</li>
          </ul>
        </div>
        <div className="login-foot">© {new Date().getFullYear()} AINA · Tüm hakları saklıdır</div>
      </div>

      <div className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <Logo size={40} variant="light" className="login-mobile-logo" />
          <h2>Oturum Aç</h2>
          <p className="muted">Devam etmek için kurumsal hesabınızla giriş yapın.</p>
          <label>Kullanıcı Adı</label>
          <div className="input-icon"><User size={16} />
            <input autoFocus value={form.us3rn4m3} onChange={(e) => setForm({ ...form, us3rn4m3: e.target.value })} required />
          </div>
          <label>Parola</label>
          <div className="input-icon"><Lock size={16} />
            <input type="password" value={form.pas_sw0rd} onChange={(e) => setForm({ ...form, pas_sw0rd: e.target.value })} required />
          </div>
          <div className="login-row">
            <label className="check"><input type="checkbox" /> Beni hatırla</label>
            <a href="#" onClick={(e) => e.preventDefault()}>Parolamı unuttum</a>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn primary block" disabled={busy}>{busy ? "Giriş yapılıyor…" : "Giriş Yap"}</button>
          <p className="login-note">Yetkisiz erişim girişimleri kayıt altına alınmaktadır.</p>
        </form>
      </div>
    </div>
  );
}
