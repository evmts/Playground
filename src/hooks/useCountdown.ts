import { useRuggedStore } from "@/State"
import { useEffect } from "react"

export const useCountDown = () => {
  const [countdown, setCountdown] = useRuggedStore(state => [state.countdown, state.setCountdown])
  const isCommitted = useRuggedStore(state => state.isCommitted)
  useEffect(() => {
    if (!isCommitted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, isCommitted, setCountdown])
}