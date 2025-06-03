import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A custom hook that debounces a value with optional callback
 * @template T
 * @param {T} value - The value to debounce
 * @param {number} delay - The delay in milliseconds (default: 300)
 * @param {((debouncedValue: T) => void) | null} callback - Optional callback function to be called with debounced value
 * @returns {T} The debounced value
 * @throws {Error} If delay is not a positive number
 */
function useDebounce(value, delay = 300, callback = null) {
  // Validate delay parameter
  if (typeof delay !== 'number' || delay < 0) {
    throw new Error('Delay must be a positive number');
  }

  // Use refs to store the latest value and callback
  const valueRef = useRef(value);
  const callbackRef = useRef(callback);

  // Update refs when props change
  useEffect(() => {
    valueRef.current = value;
    callbackRef.current = callback;
  }, [value, callback]);

  const [debouncedValue, setDebouncedValue] = useState(value);

  // Memoize the debounce function to prevent unnecessary re-renders
  const debounce = useCallback(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(valueRef.current);
      if (callbackRef.current) {
        try {
          callbackRef.current(valueRef.current);
        } catch (error) {
          console.error('Error in debounce callback:', error);
        }
      }
    }, delay);

    return timer;
  }, [delay]);

  useEffect(() => {
    const timer = debounce();

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(timer);
    };
  }, [debounce]);

  return debouncedValue;
}

export default useDebounce; 