/**
 * Helper utility for robust database interactions with Supabase.
 * Implements retry logic, error logging, and timeout handling.
 */

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second
const TIMEOUT_MS = 10000; // 10 seconds

/**
 * Executes a database operation with retry logic and error handling.
 * 
 * @param {Function} operation - A function that returns a Promise (the DB query).
 * @param {string} context - A description of the operation for logging (e.g., "Fetch Routes").
 * @returns {Promise<{data: any, error: any}>} - The result of the operation.
 */
export const executeWithRetry = async (operation, context = 'Database Operation') => {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS)
      );

      // Race the operation against the timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);

      // Check for Supabase-style errors
      if (result.error) {
        throw result.error;
      }

      return { data: result.data, error: null };

    } catch (error) {
      lastError = error;
      
      const isRetryable = isRetryableError(error);
      const delay = BASE_DELAY * Math.pow(2, attempt - 1); // Exponential backoff

      console.warn(
        `[${context}] Attempt ${attempt}/${MAX_RETRIES} failed:`,
        error.message || error
      );

      if (attempt < MAX_RETRIES && isRetryable) {
        console.log(`[${context}] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break; // Don't retry if not retryable or max retries reached
      }
    }
  }

  // Log the final failure
  logError(context, lastError);
  
  // Return a standardized error object
  return { 
    data: null, 
    error: {
      message: lastError.message || 'Unknown error occurred',
      details: lastError,
      context
    }
  };
};

/**
 * Determines if an error is transient and should be retried.
 * 
 * @param {Error|object} error 
 * @returns {boolean}
 */
const isRetryableError = (error) => {
  // Network errors, timeouts, or 5xx server errors are usually retryable
  if (!error) return false;
  
  const msg = (error.message || '').toLowerCase();
  const code = error.code || error.status;

  if (msg.includes('network') || msg.includes('timeout') || msg.includes('fetch failed')) return true;
  if (code === '500' || code === '502' || code === '503' || code === '504') return true;
  
  // Supabase specific codes (e.g., specific Postgres errors might be transient)
  // For now, assume most "unexpected" errors might be transient unless it's a permission/validation error (4xx)
  if (code && code.toString().startsWith('4')) return false; // 4xx are usually client errors (not retryable)

  return true;
};

/**
 * Structured error logging.
 * In a real app, this would send data to Sentry, Datadog, etc.
 * 
 * @param {string} context 
 * @param {Error|object} error 
 */
const logError = (context, error) => {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    context,
    message: error.message || 'No error message',
    code: error.code || error.status || 'UNKNOWN',
    stack: error.stack,
    raw: error
  };

  console.error(`🚨 [DB Error] ${context} failed permanently.`, errorDetails);
  
  // Optional: Add to a global error monitoring queue or window object for debugging
  if (typeof window !== 'undefined') {
    window.__DB_ERRORS = window.__DB_ERRORS || [];
    window.__DB_ERRORS.push(errorDetails);
  }
};
