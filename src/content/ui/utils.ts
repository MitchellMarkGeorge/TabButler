export function isInvalidatedContextError(error: Error) {
  return error.message.includes("context invalidated");
}


