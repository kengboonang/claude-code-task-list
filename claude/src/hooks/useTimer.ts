import { useState, useEffect, useCallback, useRef } from 'react'

export interface TimerState {
  minutes: number
  seconds: number
  isRunning: boolean
  isPaused: boolean
  totalSeconds: number
  remainingSeconds: number
}

export function useTimer(initialMinutes: number = 25) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60)
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const onCompleteRef = useRef<(() => void) | null>(null)

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  const start = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    if (isPaused) {
      setIsRunning(true)
      setIsPaused(false)
    }
  }, [isPaused])

  const stop = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setRemainingSeconds(totalSeconds)
  }, [totalSeconds])

  const reset = useCallback((newMinutes?: number) => {
    const newTotal = (newMinutes || initialMinutes) * 60
    setTotalSeconds(newTotal)
    setRemainingSeconds(newTotal)
    setIsRunning(false)
    setIsPaused(false)
  }, [initialMinutes])

  const extend = useCallback((extraMinutes: number) => {
    const extraSeconds = extraMinutes * 60
    setTotalSeconds(prev => prev + extraSeconds)
    setRemainingSeconds(prev => prev + extraSeconds)
  }, [])

  const onComplete = useCallback((callback: () => void) => {
    onCompleteRef.current = callback
  }, [])

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsPaused(false)
            if (onCompleteRef.current) {
              onCompleteRef.current()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, remainingSeconds])

  return {
    minutes,
    seconds,
    isRunning,
    isPaused,
    totalSeconds,
    remainingSeconds,
    start,
    pause,
    resume,
    stop,
    reset,
    extend,
    onComplete,
    progress: totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0,
    isCompleted: remainingSeconds === 0 && totalSeconds > 0,
  }
}