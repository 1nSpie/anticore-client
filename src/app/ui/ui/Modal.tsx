'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "src/shadcn/dialog"
import { ReactNode } from "react"

interface ModalProps {
  trigger: ReactNode // любая кнопка или элемент, который открывает модалку
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ trigger, title, description, children, footer }: ModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        {footer && (
          <DialogFooter className="pt-2">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}