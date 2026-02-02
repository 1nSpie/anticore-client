"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/shadcn/dialog";
import { Button } from "src/shadcn/button";
import { AlertTriangle } from "lucide-react";

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  minutesAgo: number;
}

export function DuplicateWarningModal({
  isOpen,
  onConfirm,
  onCancel,
  minutesAgo,
}: DuplicateWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md bg-white border-orange-600 rounded-xl shadow-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <DialogTitle className="text-black">
              Вы уже отправляли заявку
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 pt-2">
            Вы уверены, что хотите отправить еще одну заявку?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4 gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-orange-600 text-gray-700 hover:bg-orange-50 bg-white"
          >
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-[#EF9147] to-[#FF6B35] hover:opacity-90 text-white shadow-orange-500"
          >
            Да, отправить еще раз
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

