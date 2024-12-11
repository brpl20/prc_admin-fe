import { z } from "zod";

export const requiredField = () => z.string({ required_error: 'Há campos obrigatórios vazios.' });
