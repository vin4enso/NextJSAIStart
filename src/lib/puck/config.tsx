import type { Config } from "@puckeditor/core";
import type { PuckComponents } from "./types";

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
} as const;

export const config: Config<PuckComponents> = {
  components: {
    SectionBlock: {
      label: "Section",
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
      },
      defaultProps: {
        title: "Section Title",
      },
      render: ({ title, subtitle, puck: { renderDropZone } }) => (
        <section>
          {title ? <h2>{title}</h2> : null}
          {subtitle ? <p>{subtitle}</p> : null}
          {renderDropZone({ zone: "content" })}
        </section>
      ),
    },

    HeadingBlock: {
      label: "Heading",
      fields: {
        text: { type: "text" },
        level: {
          type: "number",
          min: 1,
          max: 4,
        },
        alignment: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        text: "Heading",
        level: 2,
        alignment: "left",
      },
      render: ({ text, level, alignment }) => {
        const Tag = headingTags[level as keyof typeof headingTags] ?? "h2";
        return (
          <Tag className={alignment ? `text-${alignment}` : undefined}>
            {text}
          </Tag>
        );
      },
    },

    ParagraphBlock: {
      label: "Paragraph",
      fields: {
        html: { type: "textarea" },
        alignment: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        html: "Enter text here...",
        alignment: "left",
      },
      render: ({ html, alignment }) => (
        <div
          className={alignment ? `text-${alignment}` : undefined}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ),
    },

    ImageBlock: {
      label: "Image",
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
        caption: { type: "text" },
        sizing: {
          type: "select",
          options: [
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
            { label: "Fill", value: "fill" },
          ],
        },
      },
      defaultProps: {
        src: "",
        alt: "Image",
        sizing: "cover",
      },
      render: ({ src, alt, caption, sizing }) => (
        <figure>
          <img
            src={src}
            alt={alt}
            className={sizing ? `object-${sizing}` : undefined}
          />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      ),
    },

    CtaBlock: {
      label: "CTA",
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        buttonText: { type: "text" },
        buttonUrl: { type: "text" },
        buttonVariant: {
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
          ],
        },
      },
      defaultProps: {
        buttonText: "Get Started",
        buttonUrl: "#",
        buttonVariant: "primary",
      },
      render: ({ title, description, buttonText, buttonUrl }) => (
        <div>
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
          <a href={buttonUrl}>{buttonText}</a>
        </div>
      ),
    },

    ColumnsBlock: {
      label: "Columns",
      fields: {
        columnsCount: {
          type: "number",
          min: 1,
          max: 4,
        },
      },
      defaultProps: {
        columnsCount: 2,
      },
      render: ({ columnsCount, puck: { renderDropZone } }) => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
            gap: "1rem",
          }}
        >
          {Array.from({ length: columnsCount }, (_, i) => (
            <div key={i}>
              {renderDropZone({
                zone: `column-${i}`,
                allow: ["ColumnBlock"],
              })}
            </div>
          ))}
        </div>
      ),
    },

    ColumnBlock: {
      label: "Column",
      fields: {
        width: { type: "number", min: 1 },
      },
      defaultProps: {
        width: 1,
      },
      render: ({ width, puck: { renderDropZone } }) => (
        <div style={{ flex: width }}>{renderDropZone({ zone: "content" })}</div>
      ),
    },

    FaqBlock: {
      label: "FAQ",
      fields: {
        items: {
          type: "array",
          arrayFields: {
            question: { type: "text" },
            answer: { type: "textarea" },
          },
          defaultItemProps: {
            question: "",
            answer: "",
          },
          getItemSummary: (item) => item.question || "New item",
        },
      },
      defaultProps: {
        items: [{ question: "", answer: "" }],
      },
      render: ({ items }) => (
        <dl>
          {items?.map((item, i) => (
            <div key={i}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      ),
    },

    DividerBlock: {
      label: "Divider",
      fields: {
        style: {
          type: "select",
          options: [
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" },
            { label: "Dotted", value: "dotted" },
          ],
        },
        color: { type: "text" },
        thickness: { type: "number", min: 1 },
      },
      defaultProps: {
        style: "solid",
        thickness: 1,
      },
      render: ({ style, color, thickness }) => (
        <hr
          style={{
            borderStyle: style ?? "solid",
            borderColor: color ?? undefined,
            borderWidth: thickness ? `${thickness}px` : undefined,
          }}
        />
      ),
    },

    VideoBlock: {
      label: "Video",
      fields: {
        url: { type: "text" },
        autoplay: {
          type: "select",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        controls: {
          type: "select",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      defaultProps: {
        url: "",
        autoplay: false,
        controls: true,
      },
      render: ({ url, controls }) => (
        <div>
          <iframe
            src={url}
            allow="autoplay; fullscreen"
            allowFullScreen={!!controls}
            className="aspect-video w-full"
          />
        </div>
      ),
    },

    GalleryBlock: {
      label: "Gallery",
      fields: {
        images: {
          type: "array",
          arrayFields: {
            src: { type: "text" },
            alt: { type: "text" },
          },
          defaultItemProps: {
            src: "",
            alt: "",
          },
          getItemSummary: (item) => item.alt || "Image",
        },
        layout: {
          type: "select",
          options: [
            { label: "Grid", value: "grid" },
            { label: "Masonry", value: "masonry" },
            { label: "Carousel", value: "carousel" },
          ],
        },
      },
      defaultProps: {
        images: [{ src: "", alt: "" }],
        layout: "grid",
      },
      render: ({ images, layout }) => (
        <div
          className={layout === "grid" ? "grid grid-cols-3 gap-2" : undefined}
        >
          {images?.map((img, i) => (
            <img key={i} src={img.src} alt={img.alt} className="object-cover" />
          ))}
        </div>
      ),
    },

    PricingBlock: {
      label: "Pricing",
      fields: {
        plans: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            price: { type: "number", min: 0 },
            currency: { type: "text" },
            period: { type: "text" },
            features: { type: "textarea" },
            ctaText: { type: "text" },
            ctaUrl: { type: "text" },
          },
          defaultItemProps: {
            name: "",
            price: 0,
            currency: "$",
            period: "month",
            features: "",
          },
          getItemSummary: (item) => item.name || "Plan",
        },
      },
      defaultProps: {
        plans: [
          {
            name: "Basic",
            price: 0,
            currency: "$",
            period: "month",
            features: "Feature 1\nFeature 2",
          },
        ],
      },
      render: ({ plans }) => (
        <div className="grid grid-cols-3 gap-4">
          {plans?.map((plan, i) => (
            <div key={i} className="rounded-lg border p-4">
              <h3>{plan.name}</h3>
              <p>
                {plan.currency ?? "$"}
                {plan.price}
                {plan.period ? `/${plan.period}` : ""}
              </p>
              {plan.features ? (
                <ul>
                  {plan.features.split("\n").map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
              ) : null}
              {plan.ctaText && plan.ctaUrl ? (
                <a href={plan.ctaUrl}>{plan.ctaText}</a>
              ) : null}
            </div>
          ))}
        </div>
      ),
    },

    FormBlock: {
      label: "Form",
      fields: {
        fields: {
          type: "array",
          arrayFields: {
            type: {
              type: "select",
              options: [
                { label: "Text", value: "text" },
                { label: "Email", value: "email" },
                { label: "Textarea", value: "textarea" },
                { label: "Select", value: "select" },
                { label: "Checkbox", value: "checkbox" },
              ],
            },
            label: { type: "text" },
            placeholder: { type: "text" },
            required: {
              type: "select",
              options: [
                { label: "Yes", value: true },
                { label: "No", value: false },
              ],
            },
            options: { type: "textarea" },
          },
          defaultItemProps: {
            type: "text",
            label: "",
            required: false,
            options: "",
          },
          getItemSummary: (item) => item.label || "Field",
        },
        submitLabel: { type: "text" },
      },
      defaultProps: {
        fields: [{ type: "text", label: "Name", required: false, options: "" }],
        submitLabel: "Submit",
      },
      render: ({ fields, submitLabel }) => (
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
      ),
    },
  },
};
