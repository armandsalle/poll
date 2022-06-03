import { styled, theme } from "~/styles/theme";
import type { WithChildren } from "~/types/utils";

const StyledH = styled("h1", {
  fontSize: theme.fontSizes.heading1,
});

type HProps = WithChildren<{}>;

export function H({ children }: HProps) {
  return <StyledH>{children}</StyledH>;
}
