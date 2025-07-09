// ==============================================================================
// Date Formatting Utilities
// ==============================================================================

export const formatDate = {
  /**
   * Format date to relative time (e.g., "2 hours ago", "Yesterday")
   */
  relative(date: Date | string | number): string {
    const now = new Date()
    const target = new Date(date)
    const diffInMs = now.getTime() - target.getTime()
    const diffInSeconds = Math.floor(diffInMs / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    const diffInWeeks = Math.floor(diffInDays / 7)
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`
    } else {
      return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`
    }
  },

  /**
   * Format date to readable string (e.g., "Jan 15, 2024")
   */
  readable(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
    const target = new Date(date)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
    return target.toLocaleDateString("en-US", { ...defaultOptions, ...options })
  },

  /**
   * Format date to time string (e.g., "2:30 PM")
   */
  time(date: Date | string | number, format24h = false): string {
    const target = new Date(date)
    return target.toLocaleTimeString("en-US", {
      hour12: !format24h,
      hour: "numeric",
      minute: "2-digit",
    })
  },

  /**
   * Format date to full datetime (e.g., "Jan 15, 2024 at 2:30 PM")
   */
  full(date: Date | string | number): string {
    const target = new Date(date)
    return `${this.readable(target)} at ${this.time(target)}`
  },

  /**
   * Format date to ISO string for API calls
   */
  iso(date: Date | string | number): string {
    return new Date(date).toISOString()
  },

  /**
   * Format date for input[type="date"] fields (YYYY-MM-DD)
   */
  inputDate(date: Date | string | number): string {
    const target = new Date(date)
    const isoString = target.toISOString()
    const datePart = isoString.split("T")[0]
    return datePart || ""
  },

  /**
   * Format date for input[type="datetime-local"] fields
   */
  inputDateTime(date: Date | string | number): string {
    const target = new Date(date)
    const isoString = target.toISOString()
    return isoString.slice(0, 16) // Remove seconds and timezone
  },
}

// ==============================================================================
// Number Formatting Utilities
// ==============================================================================

export const formatNumber = {
  /**
   * Format number with commas (e.g., 1,234,567)
   */
  comma(value: number): string {
    return value.toLocaleString("en-US")
  },

  /**
   * Format number as currency (e.g., $12.34)
   */
  currency(value: number, currency = "USD", locale = "en-US"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value)
  },

  /**
   * Format number as percentage (e.g., 12.34%)
   */
  percentage(value: number, decimals = 1): string {
    return `${(value * 100).toFixed(decimals)}%`
  },

  /**
   * Format large numbers with suffixes (e.g., 1.2K, 1.5M)
   */
  compact(value: number): string {
    if (value < 1000) return value.toString()
    if (value < 1000000) return `${(value / 1000).toFixed(1)}K`
    if (value < 1000000000) return `${(value / 1000000).toFixed(1)}M`
    return `${(value / 1000000000).toFixed(1)}B`
  },

  /**
   * Format file size in bytes to human readable (e.g., 1.2 MB)
   */
  fileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  },

  /**
   * Format number with specified decimal places
   */
  decimal(value: number, places = 2): string {
    return value.toFixed(places)
  },

  /**
   * Format number as ordinal (e.g., 1st, 2nd, 3rd)
   */
  ordinal(value: number): string {
    const j = value % 10
    const k = value % 100
    if (j === 1 && k !== 11) return `${value}st`
    if (j === 2 && k !== 12) return `${value}nd`
    if (j === 3 && k !== 13) return `${value}rd`
    return `${value}th`
  },

  /**
   * Format duration in seconds to human readable (e.g., "2h 30m", "1m 45s")
   */
  duration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`
    }

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }

    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  },

  /**
   * Format video duration from seconds to MM:SS format
   */
  videoDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  },
}

// ==============================================================================
// Text Formatting Utilities
// ==============================================================================

export const formatText = {
  /**
   * Truncate text with ellipsis
   */
  truncate(text: string, length: number, suffix = "..."): string {
    if (text.length <= length) return text
    return text.slice(0, length - suffix.length) + suffix
  },

  /**
   * Truncate text by word boundary
   */
  truncateWords(text: string, wordCount: number, suffix = "..."): string {
    const words = text.split(/\s+/)
    if (words.length <= wordCount) return text
    return words.slice(0, wordCount).join(" ") + suffix
  },

  /**
   * Convert text to title case
   */
  titleCase(text: string): string {
    return text.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  },

  /**
   * Convert text to sentence case
   */
  sentenceCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  /**
   * Convert text to kebab-case
   */
  kebabCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase()
  },

  /**
   * Convert text to camelCase
   */
  camelCase(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, "")
  },

  /**
   * Convert text to snake_case
   */
  snakeCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase()
  },

  /**
   * Capitalize first letter of each word
   */
  capitalize(text: string): string {
    return text.replace(/\b\w/g, (l) => l.toUpperCase())
  },

  /**
   * Extract initials from name (e.g., "John Doe" -> "JD")
   */
  initials(name: string, maxInitials = 2): string {
    return name
      .split(/\s+/)
      .slice(0, maxInitials)
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
  },

  /**
   * Pluralize word based on count
   */
  pluralize(word: string, count: number, plural?: string): string {
    if (count === 1) return word
    return plural || `${word}s`
  },

  /**
   * Clean and normalize text for search/comparison
   */
  normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .trim()
  },

  /**
   * Highlight search terms in text
   */
  highlight(text: string, searchTerm: string, className = "highlight"): string {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.replace(regex, `<span class="${className}">$1</span>`)
  },

  /**
   * Generate URL-friendly slug from text
   */
  slug(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  },

  /**
   * Mask sensitive text (e.g., email, phone)
   */
  mask(text: string, visibleStart = 2, visibleEnd = 2, maskChar = "*"): string {
    if (text.length <= visibleStart + visibleEnd) return text

    const start = text.slice(0, visibleStart)
    const end = text.slice(-visibleEnd)
    const middle = maskChar.repeat(text.length - visibleStart - visibleEnd)

    return start + middle + end
  },
}

// ==============================================================================
// Validation Utilities
// ==============================================================================

export const formatValidation = {
  /**
   * Check if string is valid email format
   */
  isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Check if string is valid URL format
   */
  isUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Check if string contains only alphanumeric characters
   */
  isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str)
  },

  /**
   * Check if string is a valid hex color
   */
  isHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
  },

  /**
   * Check if string is a valid phone number (basic)
   */
  isPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  },
}

// ==============================================================================
// Array and Object Formatting Utilities
// ==============================================================================

export const formatCollection = {
  /**
   * Join array with proper grammar (e.g., "A, B, and C")
   */
  joinWithAnd(items: string[], conjunction = "and"): string {
    if (items.length === 0) return ""
    if (items.length === 1) return items[0] || ""
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`

    const allButLast = items.slice(0, -1).join(", ")
    const last = items[items.length - 1]
    return `${allButLast}, ${conjunction} ${last}`
  },

  /**
   * Group array by a key function
   */
  groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const key = keyFn(item)
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(item)
        return groups
      },
      {} as Record<string, T[]>
    )
  },

  /**
   * Sort array by multiple criteria
   */
  sortBy<T>(array: T[], ...criteria: Array<(item: T) => any>): T[] {
    return [...array].sort((a, b) => {
      for (const criterion of criteria) {
        const aVal = criterion(a)
        const bVal = criterion(b)

        if (aVal < bVal) return -1
        if (aVal > bVal) return 1
      }
      return 0
    })
  },

  /**
   * Remove duplicates from array
   */
  unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
    if (!keyFn) {
      return [...new Set(array)]
    }

    const seen = new Set()
    return array.filter((item) => {
      const key = keyFn(item)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  },
}

// ==============================================================================
// Color Utilities
// ==============================================================================

export const formatColor = {
  /**
   * Convert hex color to RGB values
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1]!, 16),
          g: parseInt(result[2]!, 16),
          b: parseInt(result[3]!, 16),
        }
      : null
  },

  /**
   * Convert RGB values to hex color
   */
  rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
  },

  /**
   * Get contrasting text color for background
   */
  getContrastColor(hexColor: string): string {
    const rgb = this.hexToRgb(hexColor)
    if (!rgb) return "#000000"

    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    return luminance > 0.5 ? "#000000" : "#ffffff"
  },
}

// ==============================================================================
// Export All Formatters
// ==============================================================================

export const formatters = {
  date: formatDate,
  number: formatNumber,
  text: formatText,
  validation: formatValidation,
  collection: formatCollection,
  color: formatColor,
}
