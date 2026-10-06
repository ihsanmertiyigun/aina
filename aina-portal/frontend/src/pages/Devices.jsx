import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Search } from "lucide-react";
import api from "../api/client.js";
import { Card, Meter, StatusBadge, fmtUptime } from "../components/ui.jsx";

export default function Devices() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [f, setF] = useState({ search: "", status: "", type: "" });
  const [sort, setSort] = useState({ key: "hostname", dir: 1 });

  useEffect(() => {
    const t = setTimeout(() => {
      const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
      api.get("/devices/", { params }).then((r) => { setRows(r.data.results); setCount(r.data.count); });
    }, 250);
    return () => clearTimeout(t);
  }, [f]);

  const sorted = [...rows].sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : -1) * sort.dir);
  const th = (key, label) => (
    <th className="sortable" onClick={() => setSort({ key, dir: sort.key === key ? -sort.dir : 1 })}>
      {label}{sort.key === key ? (sort.dir > 0 ? " ▲" : " ▼") : ""}
    </th>
  );

  const exportCsv = () => {
    const head = ["hostname", "ip_address", "device_type", "site_name", "status", "cpu_usage", "memory_usage"];
    const csv = [head.join(","), ...sorted.map((r) => head.map((h) => r[h]).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "cihazlar.csv"; a.click();
  };

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Cihaz Envanteri</h1><p>{count} cihaz izleniyor</p></div>
        <div className="head-actions"><button className="btn" onClick={exportCsv}><Download size={15} /> CSV Dışa Aktar</button></div>
      </div>
      <Card>
        <div className="toolbar">
          <div className="input-icon grow"><Search size={15} />
            <input placeholder="Hostname veya IP ara" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
          </div>
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="">Tüm durumlar</option><option value="up">Çalışıyor</option>
            <option value="warning">Uyarı</option><option value="down">Erişilemiyor</option>
          </select>
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            <option value="">Tüm tipler</option><option value="router">Router</option><option value="switch">Switch</option>
            <option value="firewall">Firewall</option><option value="server">Sunucu</option><option value="ap">Access Point</option>
          </select>
        </div>
        <table className="table">
          <thead><tr>
            {th("hostname", "Hostname")}{th("ip_address", "IP Adresi")}{th("device_type", "Tip")}
            <th>Üretici / Model</th>{th("site_name", "Lokasyon")}{th("status", "Durum")}
            {th("cpu_usage", "CPU")}{th("memory_usage", "Bellek")}{th("uptime_seconds", "Uptime")}
          </tr></thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.id}>
                <td><Link className="mono strong" to={`/devices/${d.id}`}>{d.hostname}</Link></td>
                <td className="mono">{d.ip_address}</td><td>{d.device_type_display}</td>
                <td className="muted">{d.vendor} {d.model}</td><td>{d.site_name}</td>
                <td><StatusBadge status={d.status} /></td>
                <td style={{ width: 140 }}><Meter value={d.cpu_usage} /></td>
                <td style={{ width: 140 }}><Meter value={d.memory_usage} /></td>
                <td className="nowrap">{fmtUptime(d.uptime_seconds)}</td>
              </tr>
            ))}
            {!sorted.length && <tr><td colSpan={9} className="empty">Kayıt bulunamadı</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
