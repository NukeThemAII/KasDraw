interface NumberGridProps {
  selectedNumbers: number[]
  onNumberSelect: (number: number) => void
  maxNumbers: number
}

const NumberGrid = ({ selectedNumbers, onNumberSelect, maxNumbers }: NumberGridProps) => {
  const numbers = Array.from({ length: maxNumbers }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-7 gap-2 md:gap-3 max-w-2xl mx-auto">
      {numbers.map((number) => {
        const isSelected = selectedNumbers.includes(number)
        return (
          <button
            key={number}
            onClick={() => onNumberSelect(number)}
            className={`
              aspect-square rounded-lg font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-105
              ${
                isSelected
                  ? 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/25 kaspa-glow'
                  : 'bg-gradient-to-br from-slate-100 to-cyan-50 text-slate-700 hover:from-cyan-100 hover:to-teal-100 border-2 border-cyan-200 hover:border-cyan-400 ghost-glow'
              }
            `}
          >
            {number}
          </button>
        )
      })}
    </div>
  )
}

export default NumberGrid