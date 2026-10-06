import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft } from "lucide-react";
import api from "../api/client.js";
import { Card, Kpi, StatusBadge, fmtDate, fmtUptime } from "../components/ui.jsx";

const hour = (t) => new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
const axis = { fontSize: 11, fill: "#64748b" };

export default function DeviceDetail() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [traffic, setTraffic] = useState([]);
  const [hours, setHours] = useState(24);

  useEffect(() => { api.get(`/devices/${id}/`).then((r) => setD(r.data)); }, [id]);
  useEffect(() => { api.get(`/devices/${id}/traffic/`, { params: { hours } }).then((r) => setTraffic(r.data)); }, [id, hours]);

  if (!d) return <div className="loading">Yükleniyor…</div>;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <Link to="/devices" className="link small"><ArrowLeft size={13} /> Cihazlar</Link>
          <h1 className="mono">{d.hostname} <StatusBadge status={d.status} /></h1>
          <p>{d.ip_address} · {d.vendor} {d.model} · {d.site_name}</p>
        </div>
        <div className="segmented">
          {[1, 6, 24].map((h) => <button key={h} className={hours === h ? "active" : ""} onClick={() => setHours(h)}>{h} saat</button>)}
        </div>
      </div>
      <div className="kpi-grid four">
        <Kpi label="CPU" value={d.cpu_usage} unit="%" tone={d.cpu_usage > 85 ? "bad" : "neutral"} />
        <Kpi label="Bellek" value={d.memory_usage} unit="%" />
        <Kpi label="Uptime" value={fmtUptime(d.uptime_seconds)} />
        <Kpi label="Son Görülme" value={d.last_seen ? fmtDate(d.last_seen) : "—"} />
      </div>
      <Card title="Arayüz Trafiği" subtitle="Mbps">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={traffic} margin={{ left: -8, right: 8 }}>
            <CartesianGrid stroke="#e5e9f0" vertical={false} />
            <XAxis dataKey="timestamp" tickFormatter={hour} tick={axis} axisLine={false} tickLine={false} minTickGap={30} />
            <YAxis tick={axis} axisLine={false} tickLine={false} />
            <Tooltip labelFormatter={hour} /><Legend wrapperStyle={{ fontSize: 12 }} />
            <Area dataKey="inbound_mbps" name="Gelen" stroke="#1f5fbf" fill="#1f5fbf22" strokeWidth={2} dot={false} />
            <Area dataKey="outbound_mbps" name="Giden" stroke="#0f8b8d" fill="#0f8b8d22" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Gecikme ve Paket Kaybı">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={traffic} margin={{ left: -8, right: 8 }}>
            <CartesianGrid stroke="#e5e9f0" vertical={false} />
            <XAxis dataKey="timestamp" tickFormatter={hour} tick={axis} axisLine={false} tickLine={false} minTickGap={30} />
            <YAxis yAxisId="l" tick={axis} axisLine={false} tickLine={false} />
            <YAxis yAxisId="r" orientation="right" tick={axis} axisLine={false} tickLine={false} />
            <Tooltip labelFormatter={hour} /><Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="l" dataKey="latency_ms" name="Gecikme (ms)" stroke="#c98a12" dot={false} strokeWidth={2} dot={false} />
            <Line yAxisId="r" dataKey="packet_loss" name="Paket kaybı (%)" stroke="#c0392b" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
