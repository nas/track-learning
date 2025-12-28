'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AddItemChat } from './add-item-chat'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

export function AddItemDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </Button>
      
      {isOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-foreground">
          <div className="bg-background p-7 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold tracking-tight">Add Learning Item</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
            </div>
            <AddItemChat onSuccess={() => setIsOpen(false)} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
