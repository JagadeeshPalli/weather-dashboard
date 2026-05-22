import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-card flex flex-col items-center gap-5 py-10 text-center"
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <AlertCircle className="w-10 h-10 text-red-400" />
      </motion.div>
      <p className="font-sans text-dim text-sm max-w-xs leading-relaxed">{message}</p>
      {onRetry && (
        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 font-code text-xs px-4 py-2 rounded-lg border border-[rgba(128,128,128,0.2)] text-[#3B82F6] hover:bg-[rgba(128,128,128,0.08)] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </motion.button>
      )}
    </motion.div>
  )
}
