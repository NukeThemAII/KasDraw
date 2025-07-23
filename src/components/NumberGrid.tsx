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
              aspect-square rounded-lg font-semibold text-sm md:text-base transition-all duration-200 transform hover:scale-105
              ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
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