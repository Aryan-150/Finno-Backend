import { z } from "zod";
import { hasLowerCase, hasNumber, hasSpecialChar, hasUpperCase } from "./zodChecks";

// zod validation object for /user/signup
export const requiredSignUpBody = z.object({
    username: z.string().min(3).max(30).toLowerCase().trim(),
    firstName: z.string().max(50).trim(),
    lastName: z.string().max(50).trim(),
    password: z.string().min(8)
        .refine(hasLowerCase, 'password must contain atleast a lowercase letter')
        .refine(hasUpperCase, "password must contain atleast a uppercase letter")
        .refine(hasSpecialChar, "password must contain atleast a special character")
        .refine(hasNumber, "password must contain atleast a number")
})

// zod validation object for /user/signin
export const requiredSignInBody = z.object({
    username: z.string().min(3).max(30).toLowerCase().trim(),
    password: z.string().min(8)
    .refine(hasLowerCase, '')
    .refine(hasUpperCase, '')
    .refine(hasSpecialChar, '')
    .refine(hasNumber, '')
})

// zod validation object for /user/update-info
export const requiredUpdateInfoBody = z.object({
    firstName: z.string().max(50).trim().optional(),
    lastName: z.string().max(50).trim().optional(),
    password: z.string().min(8)
    .refine(hasLowerCase, '')
    .refine(hasUpperCase, '')
    .refine(hasSpecialChar, '')
    .refine(hasNumber, '')
    .optional()
})