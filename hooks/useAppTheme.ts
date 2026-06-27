import { useColorScheme } from "react-native";
import { darkTheme, lightTheme, Theme } from "../constants/theme";
import { useStorage, STORAGE_KEYS } from "./useStorage";

export type DarkModePreference = "system" | "on" | "off";

/**
 * Returns the active theme object based on the user's dark-mode preference
 * (stored in AsyncStorage) and the system color scheme as a fallback.
 *
 * Also exports `useDarkModePreference` for the settings toggle.
 */
export function useAppTheme(): Theme {
  const systemScheme = useColorScheme();
  const [preference] = useStorage<DarkModePreference>(STORAGE_KEYS.DARK_MODE, "system");

  const isDark = preference === "system" ? systemScheme === "dark" : preference === "on";
  return isDark ? darkTheme : lightTheme;
}

export function useDarkModePreference() {
  return useStorage<DarkModePreference>(STORAGE_KEYS.DARK_MODE, "system");
}
