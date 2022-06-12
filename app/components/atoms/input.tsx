import type { ComponentProps } from "react";
import { forwardRef } from "react";

import { Outlet } from "./outlet";

type InputProps = ComponentProps<"input"> & {
  label: string;
  name: string;
  hasError?: string;
  required?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, hasError, ...rest }, ref) => {
    return (
      <div>
        <Outlet as="label" vertical={4} align="start">
          <span>{label}: </span>
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
