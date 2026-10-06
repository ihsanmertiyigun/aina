import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { AlertTriangle, Bell, Cpu, RefreshCw, Server, ShieldCheck } from "lucide-react";
import api from "../api/client.js";
import { Card, Kpi, Meter, SeverityBadge, StatusBadge, fmtDate } from "../components/ui.jsx";

const C = { blue: "#1f5fbf", teal: "#0f8b8d", amber: "#c98a12", red: "#c0392b", green: "#2e8b57", slate: "#64748b" };
const TYPE_LABEL = { router: "Router", switch: "Switch", firewall: "Firewall", server: "Sunucu", ap: "Access Point" };
const PIE = [C.blue, C.teal, C.amber, C.slate, "#7c5cbf"];
const hour = (t) => new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
const axis = { fontSize: 11, fill: "#64748b" };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [updated, setUpdated] = useState(null);

  const load = () => api.get("/dashboard/summary/").then((r) => { setData(r.data); setUpdated(new Date()); });
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);

  if (!data) return <div className="loading">Veriler yükleniyor…</div>;
  const k = data.kpis;
  const traffic = data.traffic.map((r) => ({ ...r, inbound: +(r.inbound / 1000).toFixed(2), outbound: +(r.outbound / 1000).toFixed(2) }));

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Genel Bakış</h1><p>Son 24 saatlik ağ performansı ve cihaz durumu</p></div>
        <div className="head-actions">
          <span className="muted small">Son güncelleme: {updated?.toLocaleTimeString("tr-TR")}</span>
          <button className="btn" onClick={load}><RefreshCw size={15} /> Yenile</button>
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi label="Toplam Cihaz" value={k.total_devices} icon={Server} hint={`${k.up} çalışıyor · ${k.warning} uyarı · ${k.down} erişilemiyor`} />
        <Kpi label="Erişilebilirlik" value={k.availability} unit="%" icon={ShieldCheck} tone={k.availability >= 95 ? "good" : "warn"} hint="Anlık cihaz durumu" />
        <Kpi label="Açık Alarm" value={k.open_alerts} icon={Bell} tone={k.critical_alerts ? "bad" : "neutral"} hint={`${k.critical_alerts} kritik`} />
        <Kpi label="Ort. CPU" value={k.avg_cpu} unit="%" icon={Cpu} hint={`Ort. bellek ${k.avg_memory}%`} />
        <Kpi label="Erişilemeyen" value={k.down} icon={AlertTriangle} tone={k.down ? "bad" : "good"} hint="Müdahale bekliyor" />
      </div>

      <div className="grid-3">
        <Card title="Toplam Trafik" subtitle="Saatlik ortalama, Gbps" className="span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={traffic} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.blue} stopOpacity={0.3} /><stop offset="100%" stopColor={C.blue} stopOpacity={0} /></linearGradient>
                <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.teal} stopOpacity={0.3} /><stop offset="100%" stopColor={C.teal} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e9f0" vertical={false} />
              <XAxis dataKey="time" tickFormatter={hour} tick={axis} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={axis} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={hour} formatter={(v) => `${v} Gbps`} />
              <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="inbound" name="Gelen" stroke={C.blue} strokeWidth={2} fill="url(#gIn)" />
              <Area type="monotone" dataKey="outbound" name="Giden" stroke={C.teal} strokeWidth={2} fill="url(#gOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Cihaz Tipleri" subtitle="Envanter dağılımı">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.by_type.map((d) => ({ name: TYPE_LABEL[d.device_type], value: d.count }))}
                dataKey="value" innerRadius={62} outerRadius={95} paddingAngle={2} stroke="none">
                {data.by_type.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Lokasyon Bazlı Durum" subtitle="Cihaz sayısı">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.by_site} layout="vertical" margin={{ left: 40, right: 12 }}>
              <CartesianGrid stroke="#e5e9f0" horizontal={false} />
              <XAxis type="number" tick={axis} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={axis} width={130} axisLine={false} tickLine={false} />
              <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="up" name="Çalışıyor" stackId="s" fill={C.green} barSize={16} />
              <Bar dataKey="warning" name="Uyarı" stackId="s" fill={C.amber} />
              <Bar dataKey="down" name="Erişilemiyor" stackId="s" fill={C.red} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Ortalama Gecikme" subtitle="Saatlik, ms">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.traffic} margin={{ top: 8, right: 8, left: -12 }}>
              <CartesianGrid stroke="#e5e9f0" vertical={false} />
              <XAxis dataKey="time" tickFormatter={hour} tick={axis} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={axis} tickLine={false} axisLine={false} />
              <Tooltip labelFormatter={hour} formatter={(v) => `${v} ms`} />
              <Line type="monotone" dataKey="latency" name="Gecikme" stroke={C.amber} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="En Yüksek CPU Kullanımı" actions={<Link to="/devices" className="link">Tümü →</Link>}>
          <table className="table">
            <thead><tr><th>Cihaz</th><th>Lokasyon</th><th>Durum</th><th style={{ width: 160 }}>CPU</th></tr></thead>
            <tbody>
              {data.top_cpu.map((d) => (
                <tr key={d.id}>
                  <td><Link to={`/devices/${d.id}`} className="mono strong">{d.hostname}</Link></td>
                  <td>{d.site_name}</td><td><StatusBadge status={d.status} /></td><td><Meter value={d.cpu_usage} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Son Alarmlar" actions={<Link to="/alerts" className="link">Tümü →</Link>}>
          <table className="table">
            <thead><tr><th>Zaman</th><th>Önem</th><th>Cihaz</th><th>Mesaj</th></tr></thead>
            <tbody>
              {data.recent_alerts.map((a) => (
                <tr key={a.id}>
                  <td className="nowrap muted">{fmtDate(a.created_at)}</td><td><SeverityBadge severity={a.severity} /></td>
                  <td className="mono">{a.device_hostname}</td><td>{a.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
