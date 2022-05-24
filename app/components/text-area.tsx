import { forwardRef } from "react";

type TextAreaProps = {
  name: string;
  hasError?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ name, hasError }, ref) => {
    return (
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>{name}: </span>
          <textarea
            ref={ref}
            name="body"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            aria-invalid={hasError ? true : undefined}
            aria-errormessage={hasError ? "body-error" : undefined}
          />
        </label>
        {hasError && (
          <div className="pt-1 text-red-700" id="body-error">
            {hasError}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = "textarea";
