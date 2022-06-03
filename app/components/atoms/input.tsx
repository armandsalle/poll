import { forwardRef } from "react";

type InputProps = {
  name: string;
  hasError?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, hasError }, ref) => {
    return (
      <div>
        <label>
          <span>{name}: </span>
          <input
            ref={ref}
            name={name}
            aria-invalid={hasError ? true : undefined}
            aria-errormessage={hasError ? "title-error" : undefined}
          />
        </label>
        {hasError && <div id="title-error">{hasError}</div>}
      </div>
    );
  }
);

Input.displayName = "input";
