export async function readJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as unknown;
  }

  const text = await response.text();
  return {
    error:
      response.status === 401
        ? "Authentication required. Please sign in again."
        : `The server returned an unexpected response (${response.status}).`,
    details: text.slice(0, 200),
  };
}
