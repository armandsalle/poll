import type { CSS, VariantProps } from "@stitches/react";
import type { ElementType } from "react";
import { styled } from "~/styles/theme";
import type { WithChildren } from "~/types/utils";

const GAPS = {
  0: "0rem",
  4: "0.4rem",
  8: "0.8rem",
  12: "1.2rem",
  16: "1.6rem",
  24: "2.4rem",
  32: "3.2rem",
  40: "4rem",
  48: "4.8rem",
  56: "5.6rem",
  64: "6.4rem",
  128: "12.8rem",
};

type GapsKey = keyof typeof GAPS;
type G = Record<GapsKey, CSS>;

/**
 * Create the Stitches variant object for horizontal gaps, based on GAPS
 */
const horizontalGaps = Object.entries(GAPS).reduce<G>((obj, [key, value]) => {
  const k = key as any as GapsKey;
  obj[k] = {
    flexDirection: "row",
    "& > * + *": {
      marginLeft: value,
    },
  };

  return obj;
}, {} as any as G);

/**
 * Create the Stitches variant object for vertical gaps, based on GAPS
 */
const verticalGaps = Object.entries(GAPS).reduce<G>((obj, [key, value]) => {
  const k = key as any as GapsKey;
  obj[k] = {
    flexDirection: "column",
    "& > * + *": {
      marginTop: value,
    },
  };

  return obj;
}, {} as any as G);

const StyledOutlet = styled("div", {
  display: "flex",
  variants: {
    horizontal: horizontalGaps,
    vertical: verticalGaps,
    justify: {
      center: {
        justifyContent: "center",
      },
      start: {
        justifyContent: "flex-start",
      },
      end: {
        justifyContent: "flex-end",
      },
      spaceBetween: {
        justifyContent: "space-between",
      },
    },
  },
});

type OutletProps = WithChildren<
  VariantProps<typeof StyledOutlet> & {
    as?: ElementType;
  }
>;

export function Outlet({ children, ...rest }: OutletProps) {
  return <StyledOutlet {...rest}>{children}</StyledOutlet>;
}
