import type { PageBlock } from "@/schemas/page-block";

type BlockWithChildren = PageBlock & { children?: PageBlock[] };

interface FormBlockProps {
  block: BlockWithChildren;
}

export function FormBlock({ block }: FormBlockProps) {
  const config = block.config as Record<string, unknown>;
  const fields = config.fields as
    | Array<{
        type: string;
        label: string;
        placeholder?: string;
        required?: boolean;
        options?: string[];
      }>
    | undefined;
  return (
    <form>
      {fields?.map((field, i) => (
        <div key={i}>
          <label>{field.label}</label>
          {field.type === "textarea" ? (
            <textarea
              placeholder={field.placeholder}
              required={field.required}
            />
          ) : field.type === "select" && field.options ? (
            <select required={field.required}>
              {field.options.map((opt, j) => (
                <option key={j} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
            />
          )}
        </div>
      ))}
      {config.submitLabel ? (
        <button type="submit">{config.submitLabel as string}</button>
      ) : null}
    </form>
  );
}
