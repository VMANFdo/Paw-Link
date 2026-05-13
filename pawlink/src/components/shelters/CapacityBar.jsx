export default function CapacityBar({ current, max, mini = false }) {
  const percentage = Math.min(100, Math.round((current / max) * 100)) || 0
  const isFull = percentage >= 100
  
  // Color logic
  let barColor = 'bg-primary-500'
  if (percentage > 90) barColor = 'bg-red-500'
  else if (percentage > 70) barColor = 'bg-orange-500'

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1.5">
        <span className={`font-black uppercase tracking-widest text-gray-400 ${mini ? 'text-[9px]' : 'text-[11px]'}`}>
          Shelter Capacity
        </span>
        <span className={`font-bold ${mini ? 'text-xs' : 'text-sm'} ${isFull ? 'text-red-600' : 'text-gray-900'}`}>
          {current} / {max}
        </span>
      </div>
      <div className={`w-full ${mini ? 'h-1.5' : 'h-3'} bg-gray-100 rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${barColor} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {!mini && (
        <p className="text-[10px] text-gray-400 mt-2 font-medium">
          {isFull ? '⚠️ Currently full' : `${max - current} spaces available`}
        </p>
      )}
    </div>
  )
}
