import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("access")) { setLoading(false); return; }
    api.get("/auth/me/").then((r) => setUser(r.data)).catch(() => localStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (us3rn4m3, pas_sw0rd) => {
    const { data } = await api.post("/auth/login/", { us3rn4m3, pas_sw0rd });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const me = await api.get("/auth/me/");
    setUser(me.data);
  };

  const logout = () => { localStorage.clear(); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
