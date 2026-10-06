import { Card } from "../components/ui.jsx";

export default function Placeholder({ title }) {
  return (
    <div className="page">
      <div className="page-head"><div><h1>{title}</h1><p>Bu modül geliştirme aşamasındadır.</p></div></div>
      <Card><div className="empty big">“{title}” ekranı için içerik burada yer alacak.</div></Card>
    </div>
  );
}
