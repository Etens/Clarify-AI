import { z } from 'zod';

export const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }).max(50),
  // Ajoutez d'autres champs ici si nécessaire
});

export type FormValues = z.infer<typeof formSchema>;
