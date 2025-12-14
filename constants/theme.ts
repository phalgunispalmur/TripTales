// Consistent theme for the app
export const theme = {
  colors: {
    primary: "#A18CD1",
    secondary: "#FBC2EB",
    accent: "#FF9A8B",
    danger: "#FF6B6B",
    success: "#4CAF50",
    white: "#FFFFFF",
    text: "#333333",
    textLight: "#666666",
    textLighter: "#999999",
  },
  
  fonts: {
    heading: "cursive", // Cursive for headings
    body: "system-ui, -apple-system, sans-serif", // Poppins-like system font
  },
  
  fontSizes: {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    body: 16,
    small: 14,
    tiny: 12,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 50,
  },
  
  button: {
    primary: {
      backgroundColor: "#A18CD1",
      color: "#FFFFFF",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      fontSize: 16,
      fontWeight: "600",
    },
    secondary: {
      backgroundColor: "#FF9A8B",
      color: "#FFFFFF",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      fontSize: 16,
      fontWeight: "600",
    },
    danger: {
      backgroundColor: "#FF6B6B",
      color: "#FFFFFF",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      fontSize: 16,
      fontWeight: "600",
    },
  },
};

export default theme;
