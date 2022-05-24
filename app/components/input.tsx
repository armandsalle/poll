import { forwardRef } from "react";

type InputProps = {
  name: string;
  hasError?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, hasError }, ref) => {
    return (
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>{name}: </span>
          <input
            ref={ref}
            name={name}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={hasError ? true : undefined}
            aria-errormessage={hasError ? "title-error" : undefined}
          />
        </label>
        {hasError && (
          <div className="pt-1 text-red-700" id="title-error">
            {hasError}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "input";
