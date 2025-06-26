import {z} from 'zod';

export const productSchema = z.object({
    name: z.string({ required_error: 'El nombre del producto es obligatorio.' })
              .min(1, { message: 'El nombre del producto no puede estar vacío.' })
              .max(100, { message: 'El nombre del producto no puede exceder los 100 caracteres.' }),
    price: z.number({ required_error: 'El precio del producto es obligatorio.' })
              .positive({ message: 'El precio debe ser un número positivo.' }),
    category: z.string().optional(),
    providers: z.array(z.string()).optional(),
    stock: z.number().int().nonnegative().optional()
});