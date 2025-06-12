export const hasQueryParam = (
  query: unknown,
  key: string
): query is Record<string, unknown> => {
  return (
    typeof query === "object" &&
    query !== null &&
    !Array.isArray(query) &&
    key in query
  );
};
