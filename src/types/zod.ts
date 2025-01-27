export interface ZodFormError {
  code: string;
  message: string;
  path: (string | number)[]; // Path is an array of field name and index
}

export interface ZodFormErrors {
  [key: string]: string[]; // The structure of result (field -> array of error messages)
}
