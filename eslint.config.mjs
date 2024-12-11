import tseslint from "typescript-eslint";

export default tseslint.config(
  tseslint.configs.eslintRecommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNullish: true,
          allowBoolean: true,
          allowNumber: true,
        },
      ],
    },
  },
);
