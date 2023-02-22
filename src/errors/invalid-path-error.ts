export class InvalidPathError extends Error {
  constructor(message?: string) {
    super(message || 'The path provided does not exist.');
  }
}
