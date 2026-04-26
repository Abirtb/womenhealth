import { X, MapPin, Calendar, Badge, Award } from 'lucide-react'

export function BlockchainVerificationModal({ isOpen, onClose, data, productName }) {
  if (!isOpen || !data) return null

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  const getEventTypeColor = (eventType) => {
    const colors = {
      harvest: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      packaging: 'bg-purple-100 text-purple-800',
      transport: 'bg-yellow-100 text-yellow-800',
      inspection: 'bg-orange-100 text-orange-800',
      storage: 'bg-gray-100 text-gray-800',
      recall: 'bg-red-100 text-red-800',
      delivery: 'bg-indigo-100 text-indigo-800',
      default: 'bg-gray-100 text-gray-800',
    }
    return colors[eventType] || colors.default
  }

  const getCertificationIcon = (certType) => {
    if (!certType || certType === 'none') return null
    return (
      <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
        {certType.toUpperCase()}
      </span>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl max-h-[90vh] w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 p-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-rose-900">Blockchain Verification</h2>
              <p className="text-sm text-rose-700 mt-1">{productName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-rose-100 rounded-lg transition"
            >
              <X className="w-6 h-6 text-rose-600" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-700 font-semibold">VERIFICATION STATUS</p>
                <p className="text-lg font-bold text-green-900 mt-1">✓ Verified</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-700 font-semibold">TOTAL EVENTS</p>
                <p className="text-lg font-bold text-blue-900 mt-1">{data.total_events}</p>
              </div>
            </div>

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-purple-700" />
                  <p className="font-semibold text-purple-900">Certifications</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-200 text-purple-900"
                    >
                      {cert.toUpperCase().replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            {data.locations && data.locations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-700" />
                  <p className="font-semibold text-blue-900">Locations Involved</p>
                </div>
                <div className="space-y-2">
                  {data.locations.map((loc, idx) => {
                    const locStr = typeof loc === 'string' ? loc : `${loc.name}, ${loc.city}, ${loc.state}`
                    return (
                      <p key={idx} className="text-sm text-blue-900">
                        • {locStr}
                      </p>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Supply Chain Events Timeline */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-lg text-gray-900">Supply Chain Timeline</h3>
              </div>

              <div className="space-y-4">
                {data.events && data.events.map((event, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline line */}
                    {idx < data.events.length - 1 && (
                      <div className="absolute left-4 top-12 w-0.5 h-8 bg-gray-200" />
                    )}

                    {/* Event card */}
                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-rose-200 border-2 border-rose-500 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-rose-500" />
                        </div>
                      </div>

                      {/* Event details */}
                      <div className="flex-grow pb-2 pt-1">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          {/* Event type and time */}
                          <div className="flex items-start justify-between mb-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold capitalize ${getEventTypeColor(
                                event.event_type,
                              )}`}
                            >
                              {event.event_type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(event.timestamp)}
                            </span>
                          </div>

                          {/* Event notes */}
                          <p className="text-sm text-gray-700 mb-3">{event.event_notes}</p>

                          {/* Actor and location */}
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-semibold text-gray-900">Actor:</span>{' '}
                              <span className="text-gray-700">
                                {event.actor_role}
                                {event.actor_id ? ` (${event.actor_id})` : ''}
                              </span>
                            </p>
                            {(event.location_name || event.location?.name) && (
                              <p>
                                <span className="font-semibold text-gray-900">Location:</span>{' '}
                                <span className="text-gray-700">
                                  {event.location_name || event.location?.name}
                                  {event.location_city ? `, ${event.location_city}` : ''}
                                  {event.location_state ? `, ${event.location_state}` : ''}
                                </span>
                              </p>
                            )}
                            {event.quantity && event.quantity > 0 && (
                              <p>
                                <span className="font-semibold text-gray-900">Quantity:</span>{' '}
                                <span className="text-gray-700">
                                  {event.quantity} {event.unit_of_measure || ''}
                                </span>
                              </p>
                            )}
                            {event.certification_type && event.certification_type !== 'none' && (
                              <p>
                                <span className="font-semibold text-gray-900">Certification:</span>{' '}
                                {getCertificationIcon(event.certification_type)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
              <p>
                ✓ All information on this product has been verified and recorded on the blockchain.
                This ensures complete traceability from farm to consumer.
              </p>
            </div>
          </div>

          {/* Close button */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
