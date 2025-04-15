
import { AppError } from "./app-error";

export class ValidationError extends AppError {
    constructor(message = "Invalid request") {
      super(message, 400);
    }
  }