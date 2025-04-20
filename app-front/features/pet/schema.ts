import { z } from "zod";

export const petSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["dog", "cat"], { required_error: "種類は必須です" }),
  species: z.string().min(1),
  birthDay: z.string().min(1),
});

export type Pet = z.infer<typeof petSchema>;
