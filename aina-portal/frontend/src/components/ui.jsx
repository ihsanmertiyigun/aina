// Ortak, küçük UI parçaları
export function Card({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-head">
          <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}

export function Kpi({ label, value, unit, hint, tone = "neutral", icon: Icon }) {
  return (
    <div className={`kpi tone-${tone}`}>
      <div className="kpi-top"><span>{label}</span>{Icon && <Icon size={16} />}</div>
      <div className="kpi-value">{value}{unit && <small>{unit}</small>}</div>
      {hint && <div className="kpi-hint">{hint}</div>}
    </div>
  );
}

const STATUS = { up: "Çalışıyor", warning: "Uyarı", down: "Erişilemiyor" };
export const StatusBadge = ({ status }) => <span className={`badge status-${status}`}><i />{STATUS[status] || status}</span>;

const SEV = { critical: "Kritik", major: "Yüksek", minor: "Düşük", info: "Bilgi" };
export const SeverityBadge = ({ severity }) => <span className={`badge sev-${severity}`}>{SEV[severity] || severity}</span>;

export function Meter({ value }) {
  const tone = value >= 85 ? "bad" : value >= 65 ? "warn" : "ok";
  return (
    <div className="meter"><div className="meter-track"><div className={`meter-bar ${tone}`} style={{ width: `${Math.min(value, 100)}%` }} /></div>
      <span>{value.toFixed(1)}%</span></div>
  );
}

export const fmtDate = (s) => new Date(s).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
export const fmtUptime = (sec) => {
  if (!sec) return "—";
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600);
  return d ? `${d}g ${h}s` : `${h}s ${Math.floor((sec % 3600) / 60)}dk`;
};
