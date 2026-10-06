import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import api from "../api/client.js";
import { Card, SeverityBadge, fmtDate } from "../components/ui.jsx";

const TABS = [["", "Tümü"], ["critical", "Kritik"], ["major", "Yüksek"], ["minor", "Düşük"], ["info", "Bilgi"]];

export default function Alerts() {
  const [rows, setRows] = useState([]);
  const [sev, setSev] = useState("");
  const [openOnly, setOpenOnly] = useState(true);

  const load = () => api.get("/alerts/", { params: { severity: sev || undefined, open: openOnly ? 1 : undefined } })
    .then((r) => setRows(r.data.results));
  useEffect(() => { load(); }, [sev, openOnly]);

  const ack = (id) => api.post(`/alerts/${id}/acknowledge/`).then(load);

  return (
    <div className="page">
      <div className="page-head"><div><h1>Alarm Yönetimi</h1><p>{rows.length} kayıt listeleniyor</p></div></div>
      <Card>
        <div className="toolbar">
          <div className="segmented">
            {TABS.map(([v, l]) => <button key={v} className={sev === v ? "active" : ""} onClick={() => setSev(v)}>{l}</button>)}
          </div>
          <label className="check"><input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> Yalnızca açık alarmlar</label>
        </div>
        <table className="table">
          <thead><tr><th>Zaman</th><th>Önem</th><th>Cihaz</th><th>Mesaj</th><th>Durum</th><th></th></tr></thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td className="nowrap muted">{fmtDate(a.created_at)}</td>
                <td><SeverityBadge severity={a.severity} /></td>
                <td className="mono strong">{a.device_hostname}</td>
                <td>{a.message}</td>
                <td>{a.resolved ? <span className="muted">Çözüldü</span> : a.acknowledged ? "Onaylandı" : <strong>Yeni</strong>}</td>
                <td className="right">
                  {!a.acknowledged && !a.resolved && <button className="btn sm" onClick={() => ack(a.id)}><Check size={14} /> Onayla</button>}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="empty">Alarm bulunmuyor</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
