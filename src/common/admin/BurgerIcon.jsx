import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export const BurgerIcon = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 lg:hidden"
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <Menu className="w-6 h-6" />
      )}
    </button>
  )
}
