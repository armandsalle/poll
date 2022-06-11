import type { ComponentProps } from "react";
import { forwardRef } from "react";

import { Outlet } from "./outlet";

type InputProps = ComponentProps<"input"> & {
  name: string;
  hasError?: string;
  required?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, hasError, ...rest }, ref) => {
    return (
      <div>
        <Outlet as="label" vertical={4} align="start">
          <span>{name}: </span>
          <input
            ref={ref}
            name={name}
            aria-invalid={hasError ? true : undefined}
            aria-errormessage={hasError ? "title-error" : undefined}
            {...rest}
          />
        </Outlet>
        {hasError && <div id="title-error">{hasError}</div>}
      </div>
    );
  }
);

Input.displayName = "input";
