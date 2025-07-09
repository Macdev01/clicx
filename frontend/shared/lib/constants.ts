// ==============================================================================
// Authentication Constants
// ==============================================================================

export const AUTH_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 2,
  USERNAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  SEARCH_QUERY_MAX_LENGTH: 100,
} as const

export const AUTH_ERRORS = {
  EMAIL_ALREADY_IN_USE: "This email is already registered. Please sign in instead.",
  WEAK_PASSWORD: "Please choose a stronger password (at least 6 characters).",
  INVALID_EMAIL: "Please enter a valid email address.",
  NETWORK_REQUEST_FAILED: "Network error. Please check your internet connection and try again.",
  OPERATION_NOT_ALLOWED: "Email/password sign up is not enabled. Please contact support.",
  INTERNAL_ERROR: "An internal error occurred. Please try again later.",
  WRONG_PASSWORD: "Current password is incorrect",
  REQUIRES_RECENT_LOGIN: "Please sign out and sign in again before changing your password",
  EXPIRED_ACTION_CODE: "Reset link has expired. Please request a new one.",
  INVALID_ACTION_CODE: "Invalid reset link. Please request a new one.",
  USER_NOT_FOUND: "No account found with this email address.",
  TOO_MANY_REQUESTS: "Too many attempts. Please try again later.",
} as const

// ==============================================================================
// Cookie Constants
// ==============================================================================

export const COOKIE_CONSTANTS = {
  AGE_VERIFIED: "age-verified",
  SESSION_TOKEN: "session-token",
  THEME_PREFERENCE: "theme-preference",
  LANGUAGE_PREFERENCE: "language-preference",
} as const

export const COOKIE_OPTIONS = {
  AGE_VERIFICATION_EXPIRES: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
  SESSION_EXPIRES: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  THEME_EXPIRES: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
} as const

// ==============================================================================
// UI Constants
// ==============================================================================

export const UI_CONSTANTS = {
  TOAST_DURATION: {
    SHORT: 2000,
    MEDIUM: 4000,
    LONG: 6000,
    PERSISTENT: 10000,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 50,
    MIN_PAGE_SIZE: 1,
  },
  SKELETON_LOADING_COUNT: 6,
  MAX_TOAST_COUNT: 1,
  DEBOUNCE_DELAY: 300,
  SEARCH_MIN_CHARACTERS: 2,
} as const

export const DEVICE_BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const

// ==============================================================================
// API Constants
// ==============================================================================

export const API_CONSTANTS = {
  BASE_URL: process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:8080",
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

export const API_ROUTES = {
  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
    SIGNOUT: "/auth/signout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    DELETE_ACCOUNT: "/users/delete",
  },
  MODELS: {
    LIST: "/models",
    DETAIL: (id: string) => `/models/${id}`,
    SEARCH: "/models/search",
  },
  VIDEOS: {
    LIST: "/videos",
    DETAIL: (id: string) => `/videos/${id}`,
    USER_VIDEOS: "/videos/user",
    PURCHASE: "/videos/purchase",
  },
  POSTS: {
    LIST: "/posts",
    DETAIL: (id: string) => `/posts/${id}`,
    CREATE: "/posts",
    UPDATE: (id: string) => `/posts/${id}`,
    DELETE: (id: string) => `/posts/${id}`,
  },
} as const

// ==============================================================================
// File and Media Constants
// ==============================================================================

export const MEDIA_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/avi"],
  THUMBNAIL_SIZES: {
    SMALL: { width: 150, height: 150 },
    MEDIUM: { width: 300, height: 300 },
    LARGE: { width: 600, height: 600 },
  },
} as const

// ==============================================================================
// Firebase Constants
// ==============================================================================

export const FIREBASE_CONSTANTS = {
  AUTH_ERRORS: {
    "auth/email-already-in-use": AUTH_ERRORS.EMAIL_ALREADY_IN_USE,
    "auth/weak-password": AUTH_ERRORS.WEAK_PASSWORD,
    "auth/invalid-email": AUTH_ERRORS.INVALID_EMAIL,
    "auth/network-request-failed": AUTH_ERRORS.NETWORK_REQUEST_FAILED,
    "auth/operation-not-allowed": AUTH_ERRORS.OPERATION_NOT_ALLOWED,
    "auth/internal-error": AUTH_ERRORS.INTERNAL_ERROR,
    "auth/wrong-password": AUTH_ERRORS.WRONG_PASSWORD,
    "auth/requires-recent-login": AUTH_ERRORS.REQUIRES_RECENT_LOGIN,
    "auth/expired-action-code": AUTH_ERRORS.EXPIRED_ACTION_CODE,
    "auth/invalid-action-code": AUTH_ERRORS.INVALID_ACTION_CODE,
    "auth/user-not-found": AUTH_ERRORS.USER_NOT_FOUND,
    "auth/too-many-requests": AUTH_ERRORS.TOO_MANY_REQUESTS,
  },
} as const

// ==============================================================================
// Feature Flags and Environment Constants
// ==============================================================================

export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NODE_ENV === "production",
  ENABLE_DEVTOOLS: process.env.NODE_ENV === "development",
  ENABLE_PWA: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
} as const

export const ENVIRONMENT = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_TEST: process.env.NODE_ENV === "test",
} as const

// ==============================================================================
// Route Constants
// ==============================================================================

export const ROUTES = {
  HOME: "/",
  MODELS: "/models",
  MODEL_DETAIL: (id: string) => `/models/${id}`,
  MY_CONTENT: "/mycontent",
  PROFILE: "/profile",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  AGE_RESTRICTION: "/age-restriction",
  NOT_FOUND: "/404",
  ERROR: "/error",
} as const

export const PROTECTED_ROUTES = [ROUTES.MY_CONTENT, ROUTES.PROFILE] as const

export const AUTH_ROUTES = [
  ROUTES.SIGNIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
] as const

// ==============================================================================
// Animation and Transition Constants
// ==============================================================================

export const ANIMATION_CONSTANTS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: "ease-in",
    EASE_OUT: "ease-out",
    EASE_IN_OUT: "ease-in-out",
  },
} as const

// ==============================================================================
// Regex Patterns
// ==============================================================================

export const REGEX_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/.+/,
  VIDEO_DURATION: /^\d{2}:\d{2}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const

// ==============================================================================
// SEO and Meta Constants
// ==============================================================================

export const SEO_CONSTANTS = {
  DEFAULT_TITLE: "Clixxx.me - Premium AI Models Platform",
  DEFAULT_DESCRIPTION:
    "Discover and interact with premium AI models. Access exclusive content, engage with creators, and explore the future of AI entertainment.",
  DEFAULT_KEYWORDS: ["AI models", "premium content", "creators", "entertainment", "interactive"],
  DEFAULT_OG_IMAGE: "/og-image.jpg",
  SITE_NAME: "Clixxx.me",
  TWITTER_HANDLE: "@clixxxme",
} as const

// ==============================================================================
// Error Messages
// ==============================================================================

export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You must be signed in to access this feature.",
  FORBIDDEN: "You don't have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  SERVER: "Server error. Please try again later.",
  UPLOAD_FAILED: "File upload failed. Please try again.",
  PURCHASE_FAILED: "Purchase failed. Please try again.",
} as const

// ==============================================================================
// Success Messages
// ==============================================================================

export const SUCCESS_MESSAGES = {
  SIGNIN: "Signed in successfully!",
  SIGNUP: "Account created successfully!",
  SIGNOUT: "Signed out successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  PASSWORD_CHANGED: "Password changed successfully!",
  PURCHASE_SUCCESS: "Purchase completed successfully!",
  UPLOAD_SUCCESS: "File uploaded successfully!",
  SAVED: "Changes saved successfully!",
} as const
