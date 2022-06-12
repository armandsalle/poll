import { forwardRef } from "react";

import { Stack } from "./stack";

type TextAreaProps = {
  name: string;
  label: string;
  hasError?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, name, hasError }, ref) => {
    return (
      <div>
        <Stack as="label" vertical={4} align="start">
          <span>{label}: </span>
          <textarea
            ref={ref}
            name="body"
            rows={8}
            aria-invalid={hasError ? true : undefined}
            aria-errormessage={hasError ? "body-error" : undefined}
          />
        </Stack>
        {hasError && <div id="body-error">{hasError}</div>}
      </div>
    );
  }
);

TextArea.displayName = "textarea";
