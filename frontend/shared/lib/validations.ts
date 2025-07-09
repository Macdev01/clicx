import { z } from "zod"

// ==============================================================================
// Authentication Schemas
// ==============================================================================

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .max(128, "Password must be less than 128 characters")

export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required")

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

// ==============================================================================
// Profile Schemas
// ==============================================================================

export const usernameSchema = z
  .string()
  .min(2, "Username must be at least 2 characters")
  .max(50, "Username must be less than 50 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores")

export const profileUpdateSchema = z.object({
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})

// ==============================================================================
// Model Schemas
// ==============================================================================

export const modelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Model name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Invalid image URL"),
  downloads: z.number().min(0),
  rating: z.number().min(0).max(5),
  views: z.number().min(0),
  avatar: z.string().url("Invalid avatar URL"),
  authorName: z.string().min(1, "Author name is required"),
  authorNick: z.string().min(1, "Author nickname is required"),
  isVerified: z.boolean(),
  isOnline: z.boolean(),
  likes: z.number().min(0),
})

export const modelDetailSchema = modelSchema.extend({
  videos: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      thumbnail: z.string().url(),
      duration: z.string(),
      isPaid: z.boolean(),
      price: z.number().optional(),
    })
  ),
})

// ==============================================================================
// Video Schemas
// ==============================================================================

export const videoSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  thumbnail: z.string().url("Invalid thumbnail URL"),
  duration: z.string().regex(/^\d{2}:\d{2}$/, "Duration must be in MM:SS format"),
  isPaid: z.boolean(),
  price: z.number().min(0).optional(),
  modelId: z.string(),
  views: z.number().min(0),
  likes: z.number().min(0),
})

// ==============================================================================
// Post Schemas
// ==============================================================================

export const postSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  nickname: z.string().min(1, "Nickname is required"),
  avatar: z.string().url("Invalid avatar URL"),
  content: z.string().min(1, "Content is required"),
  media: z.string().url("Invalid media URL"),
  likes: z.number().min(0),
  comments: z.number().min(0),
  timestamp: z.string(),
  tags: z.array(z.string()),
})

// ==============================================================================
// Search and Filter Schemas
// ==============================================================================

export const searchSchema = z.object({
  query: z.string().max(100, "Search query must be less than 100 characters"),
  category: z.enum(["all", "models", "videos", "posts"]).optional(),
  sortBy: z.enum(["relevance", "date", "popularity", "rating"]).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional(),
})

export const videoFilterSchema = z.object({
  type: z.enum(["all", "free", "paid"]),
  modelId: z.string().optional(),
  minDuration: z.number().min(0).optional(),
  maxDuration: z.number().min(0).optional(),
})

// ==============================================================================
// API Response Schemas
// ==============================================================================

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
})

export const paginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1),
  total: z.number().min(0),
  totalPages: z.number().min(0),
})

export const apiSuccessSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  pagination: paginationSchema.optional(),
})

// ==============================================================================
// Environment and Config Schemas
// ==============================================================================

export const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
})

// ==============================================================================
// Type Exports
// ==============================================================================

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type VideoFilterData = z.infer<typeof videoFilterSchema>
export type Model = z.infer<typeof modelSchema>
export type ModelDetail = z.infer<typeof modelDetailSchema>
export type Video = z.infer<typeof videoSchema>
export type Post = z.infer<typeof postSchema>
export type ApiError = z.infer<typeof apiErrorSchema>
export type ApiSuccess = z.infer<typeof apiSuccessSchema>
export type Pagination = z.infer<typeof paginationSchema>
