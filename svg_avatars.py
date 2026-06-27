"""SVG avatar generator — returns SVG markup string for a given avatar_id and color."""

def get_avatar_svg(avatar_id: str, color: str = "#F4621F") -> str:
    c = color
    # Sanitize color to avoid injection
    if not c.startswith("#") or len(c) > 9:
        c = "#F4621F"

    avatars = {
        "ias": f"""<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="38" fill="#FFF0E8" stroke="{c}" stroke-width="3"/>
  <rect x="22" y="48" width="36" height="24" rx="8" fill="{c}"/>
  <polygon points="40,48 33,56 40,54 47,56" fill="#fff" opacity=".7"/>
  <ellipse cx="40" cy="32" rx="14" ry="16" fill="#FDBF8A"/>
  <ellipse cx="40" cy="18" rx="14" ry="8" fill="#3D2B1F"/>
  <circle cx="40" cy="57" r="4" fill="#FFD700" stroke="#C94E18" stroke-width="1.5"/>
  <circle cx="35" cy="32" r="2" fill="#3D2B1F"/>
  <circle cx="45" cy="32" r="2" fill="#3D2B1F"/>
  <path d="M35 39 Q40 43 45 39" stroke="#3D2B1F" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>""",

        "police": f"""<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="38" fill="#EAF9F0" stroke="{c}" stroke-width="3"/>
  <rect x="22" y="48" width="36" height="24" rx="8" fill="{c}"/>
  <rect x="26" y="14" width="28" height="6" rx="3" fill="{c}"/>
  <rect x="22" y="18" width="36" height="4" rx="2" fill="{c}"/>
  <polygon points="40,16 41.5,20 46,20 42.5,22.5 44,27 40,24.5 36,27 37.5,22.5 34,20 38.5,20" fill="#FFD700"/>
  <ellipse cx="40" cy="34" rx="14" ry="16" fill="#FDBF8A"/>
  <polygon points="40,48 33,56 40,54 47,56" fill="#fff" opacity=".7"/>
  <circle cx="35" cy="32" r="2" fill="#3D2B1F"/>
  <circle cx="45" cy="32" r="2" fill="#3D2B1F"/>
  <path d="M35 40 Q40 44 45 40" stroke="#3D2B1F" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>""",

        "teacher": f"""<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="38" fill="#FFF0E8" stroke="{c}" stroke-width="3"/>
  <rect x="22" y="48" width="36" height="24" rx="8" fill="{c}"/>
  <ellipse cx="40" cy="32" rx="14" ry="16" fill="#FDBF8A"/>
  <ellipse cx="40" cy="18" rx="12" ry="6" fill="#5D3A1A"/>
  <rect x="31" y="29" width="8" height="6" rx="3" fill="none" stroke="#3D2B1F" stroke-width="1.5"/>
  <rect x="41" y="29" width="8" height="6" rx="3" fill="none" stroke="#3D2B1F" stroke-width="1.5"/>
  <line x1="39" y1="32" x2="41" y2="32" stroke="#3D2B1F" stroke-width="1.5"/>
  <circle cx="35" cy="32" r="1.5" fill="#3D2B1F"/>
  <circle cx="45" cy="32" r="1.5" fill="#3D2B1F"/>
  <path d="M35 40 Q40 44 45 40" stroke="#3D2B1F" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <rect x="53" y="54" width="10" height="14" rx="2" fill="#fff" stroke="{c}" stroke-width="1.5"/>
</svg>""",

        "doctor": f"""<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="38" fill="#EAF9F0" stroke="{c}" stroke-width="3"/>
  <rect x="22" y="48" width="36" height="24" rx="8" fill="#fff" stroke="{c}" stroke-width="2"/>
  <path d="M31 58 Q28 65 35 68" stroke="{c}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="35" cy="69" r="3" fill="{c}"/>
  <ellipse cx="40" cy="32" rx="14" ry="16" fill="#FDBF8A"/>
  <ellipse cx="40" cy="18" rx="13" ry="7" fill="#3D2B1F"/>
  <circle cx="35" cy="32" r="2" fill="#3D2B1F"/>
  <circle cx="45" cy="32" r="2" fill="#3D2B1F"/>
  <path d="M35 39 Q40 43 45 39" stroke="#3D2B1F" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <rect x="37" y="51" width="6" height="2" rx="1" fill="{c}"/>
  <rect x="39" y="49" width="2" height="6" rx="1" fill="{c}"/>
</svg>""",

        "scientist": f"""<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="38" fill="#FFF0E8" stroke="{c}" stroke-width="3"/>
  <rect x="22" y="48" width="36" height="24" rx="8" fill="#fff" stroke="{c}" stroke-width="2"/>
  <ellipse cx="40" cy="32" rx="14" ry="16" fill="#FDBF8A"/>
  <ellipse cx="40" cy="18" rx="11" ry="5" fill="#F4621F"/>
  <rect x="30" y="27" width="10" height="8" rx="4" fill="none" stroke="{c}" stroke-width="2"/>
  <rect x="40" y="27" width="10" height="8" rx="4" fill="none" stroke="{c}" stroke-width="2"/>
  <line x1="28" y1="31" x2="30" y2="31" stroke="{c}" stroke-width="2"/>
  <line x1="50" y1="31" x2="52" y2="31" stroke="{c}" stroke-width="2"/>
  <circle cx="35" cy="31" r="1.5" fill="#3D2B1F"/>
  <circle cx="45" cy="31" r="1.5" fill="#3D2B1F"/>
  <path d="M35 40 Q40 44 45 40" stroke="#3D2B1F" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M52 54 L55 68 L65 68 L68 54 Z" fill="{c}" opacity=".6" stroke="{c}" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="60" cy="60" r="3" fill="#fff" opacity=".8"/>
</svg>""",

        "lawyer": f"""<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="38" fill="#EAF9F0" stroke="{c}" stroke-width="3"/>
  <rect x="22" y="48" width="36" height="24" rx="8" fill="#1A1A1A"/>
  <polygon points="40,48 33,58 40,56 47,58" fill="#fff" opacity=".9"/>
  <rect x="38" y="56" width="4" height="10" rx="2" fill="{c}"/>
  <ellipse cx="40" cy="32" rx="14" ry="16" fill="#FDBF8A"/>
  <ellipse cx="40" cy="18" rx="13" ry="7" fill="#2C1A0E"/>
  <circle cx="35" cy="32" r="2" fill="#3D2B1F"/>
  <circle cx="45" cy="32" r="2" fill="#3D2B1F"/>
  <path d="M35 39 Q40 43 45 39" stroke="#3D2B1F" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <line x1="57" y1="54" x2="57" y2="68" stroke="{c}" stroke-width="2"/>
  <line x1="52" y1="58" x2="62" y2="58" stroke="{c}" stroke-width="2"/>
  <circle cx="52" cy="62" r="3" fill="none" stroke="{c}" stroke-width="1.5"/>
  <circle cx="62" cy="62" r="3" fill="none" stroke="{c}" stroke-width="1.5"/>
</svg>""",
    }
    return avatars.get(avatar_id, avatars["ias"])
