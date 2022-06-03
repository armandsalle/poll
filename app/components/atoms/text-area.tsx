import { forwardRef } from "react";

type TextAreaProps = {
  name: string;
  hasError?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ name, hasError }, ref) => {
    return (
      <div>
        <label>
          <span>{name}: </span>
          <textarea
            ref={ref}
            name="body"
            rows={8}
            aria-invalid={hasError ? true : undefined}
            aria-errormessage={hasError ? "body-error" : undefined}
          />
        </label>
        {hasError && <div id="body-error">{hasError}</div>}
      </div>
    );
  }
);

TextArea.displayName = "textarea";
