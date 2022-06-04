import type { ComponentProps, ElementType } from "react";
import { styled } from "~/styles/theme";
import type { WithChildren } from "~/types/utils";

export const StyledContainer = styled("div", {
  maxWidth: "calc(80rem - 3.2rem)",
  width: "100%",
  margin: "0 auto",
  padding: "0 1.6rem",
});

type ContainerProps = WithChildren<
  ComponentProps<typeof StyledContainer> & {
    as?: ElementType;
  }
>;

export function Container({ children, ...rest }: ContainerProps) {
  return <StyledContainer {...rest}>{children}</StyledContainer>;
}
