import { z } from "zod";

const productoSchema = z.object({
    cantidad: z.number(),
    item: z.string().min(2, "El nombre del producto debe tener al menos 2 caracteres").max(100, "Máximo 100 caracteres para el nombre del producto"),
    precio: z.number(),
    variacion: z.number().optional(),
});

export const orderSchema = z.object({
  cliente: z.string().max(50, "Máximo 50 caracteres para el cliente"),
  itinerario: z.string().max(100, "Máximo 100 caracteres para el itinerario"),
  productos: z.array(productoSchema).min(1, "Debe haber al menos un producto"),
  avion: z.boolean(),
  fecha: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato de fecha inválido (debe ser dd/mm/yyyy)"),

  // campos opcionales
  direccion: z.string().optional(),
  localidad: z.string().optional(),
});

