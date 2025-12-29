'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { LearningItem } from '@/lib/schemas/learning-item'
import { Button } from '@/components/ui/button'
import { Pencil, X } from 'lucide-react'
import { EditItemChat } from './edit-item-chat'

interface EditItemDialogProps {
  item: LearningItem
  trigger?: React.ReactNode
}

export function EditItemDialog({ item, trigger }: EditItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-blue-600">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>
      
      {isOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-foreground">
          <div className="bg-background p-7 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold tracking-tight">Edit Learning Item</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
            </div>
            <EditItemChat item={item} onSuccess={() => setIsOpen(false)} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
