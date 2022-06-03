import { createStitches } from "@stitches/react";

export const { styled, getCssText, theme } = createStitches({
  theme: {
    fonts: {
      primary: "Inter",
    },
    colors: {
      white: "#ffffff",
      black: "#000000",
    },
    fontSizes: {
      tiny: "1rem",
      small: "1.4rem",
      regular: "1.6rem",
      medium: "1.8rem",
      large: "2rem",

      heading1: "3.2rem",
    },
  },
});
