/**
 * Logo Mapping Utility
 * Maps product names to their corresponding logo asset slugs.
 * Case-insensitive with alias support for flexible matching.
 */

export interface LogoAsset {
  name: string;
  slug: string;
  logoPng: string;
  logoSvg: string;
  primaryColor: string;
  secondaryColor: string;
}

// Master list of product name → slug aliases (case-insensitive)
const PRODUCT_ALIASES: Record<string, string> = {
  // Exact product names
  "adobe": "adobe",
  "alight motion": "alight-motion",
  "apple music": "apple-music",
  "bstation": "bstation",
  "camscanner": "camscanner",
  "canva": "canva",
  "canva pro": "canva",
  "capcut": "capcut",
  "capcut pro": "capcut",
  "chatgpt": "chatgpt",
  "chatgpt+": "chatgpt",
  "chatgpt plus": "chatgpt",
  "disney+": "disney-plus",
  "disney plus": "disney-plus",
  "disney": "disney-plus",
  "drakorid": "drakorid",
  "dramabox": "dramabox",
  "duolingo": "duolingo",
  "fizzo": "fizzo",
  "flextv": "flextv",
  "flex tv": "flextv",
  "gagaoolala": "gagaoolala",
  "gemini": "gemini",
  "grok": "grok",
  "grok ai": "grok",
  "hbo": "hbo",
  "hbo go": "hbo",
  "hbo max": "hbo",
  "iqiyi": "iqiyi",
  "lightroom": "lightroom",
  "loklok": "loklok",
  "mangotv": "mangotv",
  "mango tv": "mangotv",
  "microsoft": "microsoft",
  "microsoft 365": "microsoft",
  "moviebox": "moviebox",
  "netflix": "netflix",
  "oldroll": "oldroll",
  "picsart": "picsart",
  "prime video": "prime-video",
  "amazon prime": "prime-video",
  "amazon prime video": "prime-video",
  "reelshort": "reelshort",
  "remini": "remini",
  "robux": "robux",
  "roblox": "robux",
  "sewa bot": "sewa-bot",
  "shopee followers": "shopee-followers",
  "shopee": "shopee-followers",
  "spotify": "spotify",
  "spotify premium": "spotify",
  "terabox": "terabox",
  "vidio": "vidio",
  "vision+": "vision-plus",
  "vision plus": "vision-plus",
  "viu": "viu",
  "vsco": "vsco",
  "wattpad": "wattpad",
  "wetv": "wetv",
  "we tv": "wetv",
  "wps office": "wps-office",
  "wps": "wps-office",
  "youku": "youku",
  "youtube": "youtube",
  "youtube premium": "youtube",
  "zoom": "zoom",
};

// Color mapping for each slug
const SLUG_COLORS: Record<string, { primary: string; secondary: string }> = {
  "adobe": { primary: "#FF0000", secondary: "#9B0000" },
  "alight-motion": { primary: "#00D58B", secondary: "#006B58" },
  "apple-music": { primary: "#FA2D48", secondary: "#B00036" },
  "bstation": { primary: "#8A55FF", secondary: "#4E21A8" },
  "camscanner": { primary: "#00B86B", secondary: "#006B44" },
  "canva": { primary: "#00C4CC", secondary: "#7D2AE8" },
  "capcut": { primary: "#111111", secondary: "#000000" },
  "chatgpt": { primary: "#10A37F", secondary: "#065F4A" },
  "disney-plus": { primary: "#113CCF", secondary: "#071A66" },
  "drakorid": { primary: "#FF5C8A", secondary: "#8A1743" },
  "dramabox": { primary: "#FF6B35", secondary: "#A61F00" },
  "duolingo": { primary: "#58CC02", secondary: "#2B7A00" },
  "fizzo": { primary: "#FF7A00", secondary: "#A43E00" },
  "flextv": { primary: "#6C5CE7", secondary: "#2D1D88" },
  "gagaoolala": { primary: "#FF4B91", secondary: "#7D1044" },
  "gemini": { primary: "#4E8CFF", secondary: "#9A5BFF" },
  "grok": { primary: "#111111", secondary: "#333333" },
  "hbo": { primary: "#5B35E5", secondary: "#1D0E74" },
  "iqiyi": { primary: "#00BE06", secondary: "#006C04" },
  "lightroom": { primary: "#31A8FF", secondary: "#001E36" },
  "loklok": { primary: "#7B61FF", secondary: "#2A177E" },
  "mangotv": { primary: "#FF8A00", secondary: "#B23A00" },
  "microsoft": { primary: "#737373", secondary: "#222222" },
  "moviebox": { primary: "#16A085", secondary: "#075246" },
  "netflix": { primary: "#E50914", secondary: "#5E0005" },
  "oldroll": { primary: "#D4A373", secondary: "#5C3A21" },
  "picsart": { primary: "#B432F0", secondary: "#5B0A8A" },
  "prime-video": { primary: "#00A8E1", secondary: "#004B6B" },
  "reelshort": { primary: "#FF2D55", secondary: "#8A0824" },
  "remini": { primary: "#6D5DFB", secondary: "#2D247A" },
  "robux": { primary: "#202020", secondary: "#000000" },
  "sewa-bot": { primary: "#7C3AED", secondary: "#3B167A" },
  "shopee-followers": { primary: "#EE4D2D", secondary: "#8F210F" },
  "spotify": { primary: "#1DB954", secondary: "#0B5E29" },
  "terabox": { primary: "#246BFD", secondary: "#0B2D7A" },
  "vidio": { primary: "#E91E63", secondary: "#7A0A31" },
  "vision-plus": { primary: "#6C2BD9", secondary: "#24105F" },
  "viu": { primary: "#FFEB00", secondary: "#A17D00" },
  "vsco": { primary: "#111111", secondary: "#444444" },
  "wattpad": { primary: "#FF500A", secondary: "#9B2600" },
  "wetv": { primary: "#00C46A", secondary: "#0A63D8" },
  "wps-office": { primary: "#E53935", secondary: "#8D1612" },
  "youku": { primary: "#00B4FF", secondary: "#FF3E8A" },
  "youtube": { primary: "#FF0000", secondary: "#A00000" },
  "zoom": { primary: "#2D8CFF", secondary: "#0B48A6" },
};

/**
 * Resolve a product name to its logo slug using case-insensitive matching and aliases.
 */
export function resolveLogoSlug(productName: string): string | null {
  const normalized = productName.toLowerCase().trim();
  
  // Direct alias match
  if (PRODUCT_ALIASES[normalized]) {
    return PRODUCT_ALIASES[normalized];
  }
  
  // Partial match — check if any alias key is contained in the product name
  for (const [alias, slug] of Object.entries(PRODUCT_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      return slug;
    }
  }
  
  return null;
}

/**
 * Get the full logo asset paths for a product name.
 */
export function getLogoAsset(productName: string): LogoAsset | null {
  const slug = resolveLogoSlug(productName);
  if (!slug) return null;
  
  const colors = SLUG_COLORS[slug] || { primary: "#8b5cf6", secondary: "#6d28d9" };
  
  return {
    name: productName,
    slug,
    logoPng: `/assets/apps/png/${slug}.png`,
    logoSvg: `/assets/apps/svg/${slug}.svg`,
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
  };
}

/**
 * Get logo URL for a product. Returns the PNG path or null if not found.
 */
export function getProductLogoUrl(productName: string): string | null {
  const slug = resolveLogoSlug(productName);
  if (!slug) return null;
  return `/assets/apps/png/${slug}.png`;
}

/**
 * Get the dominant/primary color for a product.
 */
export function getProductColor(productName: string): string {
  const slug = resolveLogoSlug(productName);
  if (!slug) return "#8b5cf6"; // Default violet
  return SLUG_COLORS[slug]?.primary || "#8b5cf6";
}
