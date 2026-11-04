export interface IErrorBackend {
  readonly statusCode: number;
  readonly message: string;
  readonly error: string;
}

export interface IErrorDtoBackend {
  readonly statusCode: number;
  readonly message: {
    readonly field: string;
    readonly error: string[];
  }[];
  readonly error: string;
}
