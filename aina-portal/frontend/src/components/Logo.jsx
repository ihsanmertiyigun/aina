import markUrl from "../assets/aina-mark.svg";
import wordmarkDark from "../assets/aina-wordmark-dark.svg";
import wordmarkLight from "../assets/aina-wordmark-light.svg";

/**
 * AINA logosu
 * - İşaret: "ATM" başlıklı ATM gövdesi; ekranı ayna camı, içindeki kıvılcım yapay zekâ
 * - Yazı: konturlara çevrilmiş vektör görsel (Orbitron + Chakra Petch), font yüklemesine bağlı değil
 */
export function LogoMark({ size = 32, className = "" }) {
  return <img className={`logo-mark ${className}`} src={markUrl} width={size} height={size} alt="AINA" />;
}

/** İşaret + yazı görseli. variant: "dark" (koyu zemin) | "light" (açık zemin) */
export default function Logo({ size = 32, variant = "dark", className = "" }) {
  return (
    <div className={`logo logo-${variant} ${className}`}>
      <LogoMark size={size} />
      <img
        className="logo-wordmark"
        src={variant === "dark" ? wordmarkDark : wordmarkLight}
        style={{ height: Math.round(size * 0.92) }}
        alt="AINA — AI ATM Network Assistant"
      />
    </div>
  );
}
