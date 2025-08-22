import z from "zod";
import { UserStatus, Role } from "./user.interface";

const bangladeshMobilePhoneRegex = /^(?:\+880|00880|0)?1[3-9]\d{8}$/;
export const createUserZodSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Name is required" : "Name must be string",
    })
    .min(3, {
      message: "Name is too short. Name must be minimum 3 charecters",
    }),
  email: z.email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/\d/, { message: "Password must contain at least one number." })
    .regex(/[!@#$%^&*()_+={}[\]:;"'<>,.?/`~-]/, {
      message: "Password must contain at least one special character.",
    }),
  phone: z
    .string({
      error: (issue) =>
        issue.input === undefined || issue.input === null || issue.input === ""
          ? "Phone number is required"
          : "Not a string",
    })

    .refine(
      (val) => {
        if (val === undefined || val === null || val === "") {
          return true;
        }
        // Use the comprehensive regex
        return bangladeshMobilePhoneRegex.test(val);
      },
      {
        message:
          "Invalid Bangladeshi phone number format. Examples: 01xxxxxxxxx, +8801xxxxxxxxx, 8801xxxxxxxxx",
      }
    ),
});
export const updateUserZodSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "Name is required" : "Name must be string",
    })
    .min(3, {
      message: "Name is too short. Name must be minimum 3 charecters",
    })
    .optional(),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/\d/, { message: "Password must contain at least one number." })
    .regex(/[!@#$%^&*()_+={}[\]:;"'<>,.?/`~-]/, {
      message: "Password must contain at least one special character.",
    })
    .optional(),

  status: z.enum(Object.values(UserStatus) as [string]).optional(),

  isVerified: z
    .boolean({
      error: () => "isVerified must be true or false or boolean data type",
    })
    .optional(),

  role: z.enum(Object.values(Role) as [string]).optional(),
  commissionRate: z.number().optional(),
  isApproved: z.boolean().optional(),
});
