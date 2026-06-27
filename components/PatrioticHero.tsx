import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Ellipse,
  Path,
  G,
  Line,
  Polygon,
} from "react-native-svg";

interface PatrioticHeroProps {
  width?: number | string;
  height?: number | string;
  /** Render a softer, smaller version suitable for a dashboard banner. */
  variant?: "splash" | "banner";
}

/**
 * Hand-painted-style SVG illustration inspired by the
 * "Masterpiece Patriotic Ghibli Cinematic" prompt:
 * a saluting Indian police officer silhouetted against a
 * majestic, fluttering Tricolor with the Ashoka Chakra,
 * golden sunrise rays, drifting golden particles, and soft clouds.
 *
 * This is a lightweight vector placeholder — swap in a generated
 * raster image later by replacing this component's usage with an
 * <Image source={require(...)} /> if desired.
 */
export default function PatrioticHero({
  width = "100%",
  height = "100%",
  variant = "splash",
}: PatrioticHeroProps) {
  const chakraSpokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    const rad = (angle * Math.PI) / 180;
    const cx = 200;
    const cy = variant === "splash" ? 210 : 130;
    const r1 = 7;
    const r2 = variant === "splash" ? 46 : 30;
    return {
      x1: cx + r1 * Math.cos(rad),
      y1: cy + r1 * Math.sin(rad),
      x2: cx + r2 * Math.cos(rad),
      y2: cy + r2 * Math.sin(rad),
    };
  });

  const chakraCenter = { cx: 200, cy: variant === "splash" ? 210 : 130 };
  const chakraRadius = variant === "splash" ? 46 : 30;

  // Golden drifting particles
  const particles = [
    { x: 60, y: 80, r: 2.5 }, { x: 120, y: 40, r: 1.8 }, { x: 320, y: 70, r: 2.2 },
    { x: 350, y: 160, r: 1.5 }, { x: 40, y: 220, r: 2 }, { x: 90, y: 330, r: 1.6 },
    { x: 300, y: 300, r: 2.4 }, { x: 250, y: 420, r: 1.8 }, { x: 140, y: 460, r: 2 },
    { x: 360, y: 380, r: 1.4 }, { x: 200, y: 60, r: 1.6 }, { x: 30, y: 420, r: 2.1 },
  ];

  return (
    <View style={[styles.container, { width: width as any, height: height as any }]}>
      <Svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
        <Defs>
          {/* Golden sunrise sky */}
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFE3B0" stopOpacity="1" />
            <Stop offset="0.35" stopColor="#FFB05C" stopOpacity="1" />
            <Stop offset="0.7" stopColor="#FF8A3D" stopOpacity="1" />
            <Stop offset="1" stopColor="#1A2B4A" stopOpacity="1" />
          </LinearGradient>

          {/* Sun glow */}
          <RadialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#FFF6DC" stopOpacity="0.95" />
            <Stop offset="0.5" stopColor="#FFD27A" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#FFD27A" stopOpacity="0" />
          </RadialGradient>

          {/* Saffron band */}
          <LinearGradient id="saffron" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FF9933" stopOpacity="0.96" />
            <Stop offset="1" stopColor="#FF7A1A" stopOpacity="0.96" />
          </LinearGradient>

          {/* White band */}
          <LinearGradient id="whiteBand" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.96" />
            <Stop offset="1" stopColor="#F3F3F3" stopOpacity="0.96" />
          </LinearGradient>

          {/* Green band */}
          <LinearGradient id="green" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#138808" stopOpacity="0.96" />
            <Stop offset="1" stopColor="#0E6B06" stopOpacity="0.96" />
          </LinearGradient>

          {/* Ground gradient */}
          <LinearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1A2B4A" stopOpacity="0" />
            <Stop offset="1" stopColor="#0D1626" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>

        {/* Sky */}
        <Rect x="0" y="0" width="400" height="600" fill="url(#sky)" />

        {/* Sun + god rays */}
        <Circle cx="200" cy="160" r="170" fill="url(#sunGlow)" />
        <Circle cx="200" cy="160" r="46" fill="#FFF8E7" opacity="0.9" />
        {Array.from({ length: 10 }, (_, i) => {
          const angle = (i * 36 * Math.PI) / 180;
          const x2 = 200 + 320 * Math.cos(angle);
          const y2 = 160 + 320 * Math.sin(angle);
          return (
            <Polygon
              key={`ray-${i}`}
              points={`200,160 ${x2},${y2} ${x2 + 14},${y2 + 14}`}
              fill="#FFE9B8"
              opacity={0.07}
            />
          );
        })}

        {/* Soft clouds */}
        <Ellipse cx="90" cy="130" rx="70" ry="22" fill="#FFFFFF" opacity="0.35" />
        <Ellipse cx="320" cy="90" rx="55" ry="18" fill="#FFFFFF" opacity="0.3" />
        <Ellipse cx="60" cy="240" rx="50" ry="16" fill="#FFFFFF" opacity="0.22" />

        {/* ===================== INDIAN FLAG (majestic, fluttering) ===================== */}
        <G opacity="0.94">
          {/* Saffron */}
          <Path d="M40,120 C140,100 260,140 380,118 L380,238 C260,260 140,222 40,242 Z" fill="url(#saffron)" />
          {/* White + Chakra */}
          <Path d="M40,242 C140,222 260,260 380,238 L380,358 C260,380 140,342 40,362 Z" fill="url(#whiteBand)" />
          {/* Green */}
          <Path d="M40,362 C140,342 260,380 380,358 L380,478 C260,500 140,462 40,482 Z" fill="url(#green)" />
        </G>

        {/* Ashoka Chakra */}
        <G>
          <Circle cx={chakraCenter.cx} cy={chakraCenter.cy} r={chakraRadius} fill="none" stroke="#0B2455" strokeWidth={2.5} opacity={0.85} />
          {chakraSpokes.map((s, i) => (
            <Line key={`spoke-${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#0B2455" strokeWidth={1.6} opacity={0.85} />
          ))}
          <Circle cx={chakraCenter.cx} cy={chakraCenter.cy} r={7} fill="#0B2455" opacity={0.85} />
        </G>

        {/* ===================== OFFICER SILHOUETTE (saluting) ===================== */}
        <G>
          {/* Cap */}
          <Path d="M170,440 Q200,418 230,440 L236,452 Q200,438 164,452 Z" fill="#0E1A33" />
          <Rect x="172" y="450" width="56" height="6" rx="3" fill="#0E1A33" />
          {/* Head */}
          <Circle cx="200" cy="468" r="20" fill="#13203D" />
          {/* Body / torso */}
          <Path d="M170,492 Q200,482 230,492 L240,580 L160,580 Z" fill="#13203D" />
          {/* Shoulder rank / belt */}
          <Rect x="178" y="500" width="44" height="5" fill="#FF9933" opacity="0.8" />
          <Rect x="178" y="540" width="44" height="4" fill="#FFD700" opacity="0.7" />
          {/* Saluting arm */}
          <Path d="M228,498 Q252,486 250,462 Q248,452 238,456 Q244,470 226,488 Z" fill="#13203D" />
          {/* Other arm at side */}
          <Path d="M172,498 Q162,530 168,572 L182,572 Q178,532 188,500 Z" fill="#13203D" />
          {/* Legs */}
          <Rect x="168" y="578" width="28" height="5" fill="#0E1A33" />
          <Rect x="204" y="578" width="28" height="5" fill="#0E1A33" />
        </G>

        {/* Ground glow */}
        <Rect x="0" y="500" width="400" height="100" fill="url(#ground)" />

        {/* Golden particles */}
        {particles.map((p, i) => (
          <Circle key={`p-${i}`} cx={p.x} cy={p.y} r={p.r} fill="#FFE9B8" opacity={0.8} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 0,
  },
});
