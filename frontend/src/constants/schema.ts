
/**
 * CMS 小工具模板 schema
 */
export const TOOL_TEMPLATE_SCHEMA = {
  seo_data: [
    {
      title: "string",
      description: "string",
    },
  ],
  tool_operation_area: [
    {
      title: "string",
      description: "string",
      steps: [
        {
          label: "string",
        },
      ],
    },
  ],
  show_of_strength: "string",
  how_to: [
    {
      title: "string",
      step: [
        {
          title: "string",
          description: "string",
        },
      ],
      btn: [
        {
          label: "string",
        },
      ],
    },
  ],
  why_choose: [
    {
      title: "string",
      left_text: "string",
      right_text: "string",
    },
  ],
  feature_list: [
    {
      list: [
        {
          title: "string",
          description: "string",
          btn: [
            {
              label: "string",
            },
          ],
        },
      ],
    },
  ],
  enterprise_security: [
    {
      title: "string",
      description: "string",
      link: [
        {
          label: "string",
        },
      ],
    },
  ],
  customer_reviews: [
    {
      title: "string",
      customer_evaluation: [
        {
          evaluation: [
            {
              comment_text: "string",
              job: "string",
            },
          ],
        },
      ],
    },
  ],
  faq: [
    {
      title: "string",
      subtitle: "doc",
      faqs_list: [
        {
          title: "string",
          description: "doc",
        },
      ],
    },
  ],
  explore_more: [
    {
      title: "string",
      explore_more: [
        {
          text: "string",
        },
      ],
    },
  ],
  cta: [
    {
      title: "string",
      description: "string",
      advantage: [
        {
          label: "string",
        },
      ],
      button: [
        {
          label: "string",
        },
      ],
    },
  ],
};

export const SCHEMA_MAP = {
    'tools_template': TOOL_TEMPLATE_SCHEMA,
}