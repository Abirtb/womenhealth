import { CheckCircle, Loader } from 'lucide-react'

export function BlockchainVerificationBadge({ isVerified, isLoading, onClick }) {
  if (isLoading) {
    return (
      <button
        className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-rose-600 shadow-md backdrop-blur-sm hover:bg-white transition flex items-center gap-1"
        disabled
      >
        <Loader className="w-3 h-3 animate-spin" />
        Verifying...
      </button>
    )
  }

  if (!isVerified) {
    return (
      <button
        className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-500 shadow-md backdrop-blur-sm hover:bg-white transition"
        onClick={onClick}
      >
        Not Verified
      </button>
    )
  }

  return (
    <button
      className="absolute right-3 top-3 rounded-full bg-green-100/95 px-3 py-1 text-xs font-semibold text-green-700 shadow-md backdrop-blur-sm hover:bg-green-100 transition flex items-center gap-1"
      onClick={onClick}
      title="Click to see blockchain verification details"
    >
      <CheckCircle className="w-3 h-3" />
      Verified
    </button>
  )
}
