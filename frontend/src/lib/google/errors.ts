export class GoogleAuthError extends Error {
  constructor(message: string = 'Google authentication required') {
    super(message);
    this.name = 'GoogleAuthError';
  }
}

export class GoogleApiError extends Error {
  constructor(message: string = 'Google API error') {
    super(message);
    this.name = 'GoogleApiError';
  }
}


