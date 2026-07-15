interface FormField {
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  label: string;
  placeholder?: string;
  required?: boolean;
  options: string;
}

interface FormBlockProps {
  fields: FormField[];
  submitLabel?: string;
}

export function FormBlock({ fields, submitLabel }: FormBlockProps) {
  return (
    <form>
      {fields?.map((field, i) => (
        <div key={i}>
          <label>{field.label}</label>
          {field.type === "textarea" ? (
            <textarea
              placeholder={field.placeholder}
              required={!!field.required}
            />
          ) : field.type === "select" ? (
            <select required={!!field.required}>
              {field.options
                ? field.options.split("\n").map((opt, j) => (
                    <option key={j} value={opt}>
                      {opt}
                    </option>
                  ))
                : null}
            </select>
          ) : field.type === "checkbox" ? (
            <input type="checkbox" required={!!field.required} />
          ) : (
            <input
              type={field.type}
              placeholder={field.placeholder}
              required={!!field.required}
            />
          )}
        </div>
      ))}
      {submitLabel ? <button type="submit">{submitLabel}</button> : null}
    </form>
  );
}
