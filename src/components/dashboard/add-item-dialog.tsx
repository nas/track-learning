'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AddItemForm } from './add-item-form'

export function AddItemDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
      >
        Add Item
      </button>
      
      {isOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-foreground">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Add New Learning Item</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 p-1">✕</button>
            </div>
            <AddItemForm onSuccess={() => setIsOpen(false)} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}