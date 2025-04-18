import { z } from "zod";
import { hasLowerCase, hasNumber, hasSpecialChar, hasUpperCase } from "./zodChecks";

// zod validation object for /user/signup
export const requiredSignUpBody = z.object({
    username: z.string().min(3, "username/email must contain atleast 3 characters")
        .max(30, "username/email must contain at max 30 characters")
        .toLowerCase().trim(),

    firstName: z.string().min(3, "firstName must contain atleast 3 characters")
        .max(50, "firstName must contain at max 30 characters").trim(),

    lastName: z.string().min(3, "lastName must contain atleast 3 characters")
        .max(50, "lastName must contain at max 30 characters").trim(),

    password: z.string().min(8, "password must contain 8 characters")
        .refine(hasLowerCase, 'password must contain atleast a lowercase letter')
        .refine(hasUpperCase, "password must contain atleast a uppercase letter")
        .refine(hasSpecialChar, "password must contain atleast a special character")
        .refine(hasNumber, "password must contain atleast a number")
})

// zod validation object for /user/signin
export const requiredSignInBody = z.object({
    username: z.string().min(3, "username/email must contain atleast 3 characters")
        .max(30, "username/email must contain at max 30 characters")
        .toLowerCase().trim(),

    password: z.string().min(8, "password must contain 8 characters")
        .refine(hasLowerCase, 'password must contain atleast a lowercase letter')
        .refine(hasUpperCase, 'password must contain atleast a uppercase letter')
        .refine(hasSpecialChar, 'password must contain atleast a special character')
        .refine(hasNumber, 'password must contain atleast a number')
})

// zod validation object for /user/update-info
export const requiredUpdateInfoBody = z.object({
    firstName: z.string().min(3, "firstName must contain atleast 3 characters")
        .max(50, "firstName must contain at max 30 characters")
        .trim().optional(),

    lastName: z.string().min(3, "lastName must contain atleast 3 characters")
        .max(50, "lastName must contain at max 30 characters")
        .trim().optional(),

    password: z.string().min(8, "password must contain 8 characters")
        .refine(hasLowerCase, 'password must contain atleast a lowercase letter')
        .refine(hasUpperCase, 'password must contain atleast a uppercase letter')
        .refine(hasSpecialChar, 'password must contain atleast a special character')
        .refine(hasNumber, 'password must contain atleast a number')
        .optional()
})

// zod validation object for /account/transfer
export const requiredTransferBody = z.object({
    to: z.string().trim(),
    amount: z.number().max(100000)
})