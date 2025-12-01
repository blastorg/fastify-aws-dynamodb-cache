import { hasQueryParam } from "./hasQueryParams";

describe("hasQueryParam", () => {
  it("should return true when the object contains the specified key", () => {
    const query = { id: 123, name: "test" };
    expect(hasQueryParam(query, "id")).toBe(true);
  });

  it("should return true even if the value of the key is null", () => {
    // The key exists, even if the value is null
    const query = { filter: null };
    expect(hasQueryParam(query, "filter")).toBe(true);
  });

  it("should return true even if the value of the key is undefined", () => {
    // The key exists explicitly, even if undefined
    const query = { sort: undefined };
    expect(hasQueryParam(query, "sort")).toBe(true);
  });

  it("should return false if the query is null", () => {
    // typeof null is 'object', so this checks the query !== null logic
    expect(hasQueryParam(null, "id")).toBe(false);
  });

  it("should return false if the query is undefined", () => {
    expect(hasQueryParam(undefined, "id")).toBe(false);
  });

  it("should return false if the query is an array", () => {
    // Arrays are objects in JS, so this checks the !Array.isArray logic
    const query = ["id", "value"];
    expect(hasQueryParam(query, "0")).toBe(false);
    expect(hasQueryParam(query, "id")).toBe(false);
  });

  it("should return false if the query is a primitive string", () => {
    expect(hasQueryParam("some-string", "length")).toBe(false);
  });

  it("should return false if the query is a primitive number", () => {
    expect(hasQueryParam(12345, "toFixed")).toBe(false);
  });

  it("should return false if the object does not contain the key", () => {
    const query = { name: "test" };
    expect(hasQueryParam(query, "age")).toBe(false);
  });

  it("should be case-sensitive regarding the key", () => {
    const query = { ID: 123 };
    expect(hasQueryParam(query, "id")).toBe(false);
  });
});
