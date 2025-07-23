interface NumberGridProps {
  selectedNumbers: number[]
  onNumberSelect: (number: number) => void
  maxNumbers: number
}

const NumberGrid = ({ selectedNumbers, onNumberSelect, maxNumbers }: NumberGridProps) => {
  const numbers = Array.from({ length: maxNumbers }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-7 gap-2 md:gap-3">
      {numbers.map((number) => {
        const isSelected = selectedNumbers.includes(number)
        return (
          <button
            key={number}
            onClick={() => onNumberSelect(number)}
            className={`
              aspect-square rounded-lg font-semibold text-sm md:text-base transition-all duration-300 transform
              ${
                isSelected
                  ? 'kaspa-number'
                  : 'bg-gradient-to-br from-slate-100 to-cyan-50 text-slate-700 hover:from-cyan-100 hover:to-teal-100 border-2 border-cyan-200 hover:border-cyan-400 hover:scale-105 ghost-glow'
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