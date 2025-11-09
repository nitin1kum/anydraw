import { z } from 'zod';

// This schema matches the backend's `CreateUserSchema`
export const CreateUserSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
  username: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});
export const SigninSchema = z.object({
  username: z.string().email({ message: "Please enter a valid email address." }),
  // For sign-in, we just need to know the password exists. The server will validate it.
  password: z.string().min(1, { message: "Password is required." }), 
});
