import { z } from "zod"

export const connexionSchema = z.object({
    email: z
        .string()
        .min(1, "L'email est requis")
        .email("Adresse email invalide"),
    password: z
        .string()
        .min(1, "Le mot de passe est requis")
        .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})

export const inscriptionSchema = z.object({
    pseudo: z
        .string()
        .min(2, "Le pseudo doit contenir au moins 2 caractères")
        .max(15, "Le pseudo ne peut pas dépasser 15 caractères"),
    email: z
        .string()
        .min(1, "L'email est requis")
        .email("Adresse email invalide"),
    password: z
        .string()
        .min(1, "Le mot de passe est requis")
        .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})

export type ConnexionForm = z.infer<typeof connexionSchema>
export type InscriptionForm = z.infer<typeof inscriptionSchema>