import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function EventRegistrationModal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[101] w-full max-w-2xl bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Dialog.Title className="text-xl font-bold text-gray-900">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
