/**
 * Mobile Modal Examples
 * Esempi di utilizzo dei modal ottimizzati per mobile
 */

import React, { useState } from 'react'
import MobileOptimizedModal, { 
  MobileBottomSheet, 
  MobileConfirmDialog, 
  MobileActionSheet 
} from '../shared/MobileOptimizedModal'
import { Settings, Share, Trash, Edit } from 'lucide-react'

export function MobileModalExamples() {
  const [showModal, setShowModal] = useState(false)
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Mobile Modal Examples</h2>
      
      {/* Trigger Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="p-4 bg-blue-600 text-white rounded-lg min-h-[44px] touch-manipulation"
        >
          Standard Modal
        </button>
        
        <button
          onClick={() => setShowBottomSheet(true)}
          className="p-4 bg-green-600 text-white rounded-lg min-h-[44px] touch-manipulation"
        >
          Bottom Sheet
        </button>
        
        <button
          onClick={() => setShowConfirm(true)}
          className="p-4 bg-red-600 text-white rounded-lg min-h-[44px] touch-manipulation"
        >
          Confirm Dialog
        </button>
        
        <button
          onClick={() => setShowActions(true)}
          className="p-4 bg-purple-600 text-white rounded-lg min-h-[44px] touch-manipulation"
        >
          Action Sheet
        </button>
      </div>

      {/* Standard Modal */}
      <MobileOptimizedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Standard Modal"
        size="md"
      >
        <div className="space-y-4">
          <p>Questo è un modal standard ottimizzato per mobile.</p>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Campo di input"
              className="w-full p-3 border rounded-lg min-h-[44px] touch-manipulation"
            />
            <textarea
              placeholder="Area di testo"
              className="w-full p-3 border rounded-lg min-h-[88px] touch-manipulation"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 p-3 border rounded-lg min-h-[44px] touch-manipulation">
              Annulla
            </button>
            <button className="flex-1 p-3 bg-blue-600 text-white rounded-lg min-h-[44px] touch-manipulation">
              Salva
            </button>
          </div>
        </div>
      </MobileOptimizedModal>

      {/* Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Bottom Sheet"
        snapPoints={[40, 80]}
      >
        <div className="space-y-4">
          <p>Questo è un bottom sheet che si apre dal basso.</p>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg">
                Item {i}
              </div>
            ))}
          </div>
        </div>
      </MobileBottomSheet>

      {/* Confirm Dialog */}
      <MobileConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => console.log('Confirmed!')}
        title="Conferma Azione"
        message="Sei sicuro di voler procedere con questa azione? L'operazione non può essere annullata."
        variant="danger"
        confirmText="Elimina"
        cancelText="Annulla"
      />

      {/* Action Sheet */}
      <MobileActionSheet
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        onAction={(actionId) => console.log('Action:', actionId)}
        title="Scegli un'azione"
        actions={[
          {
            id: 'edit',
            label: 'Modifica',
            icon: <Edit size={20} />,
            variant: 'primary'
          },
          {
            id: 'share',
            label: 'Condividi',
            icon: <Share size={20} />
          },
          {
            id: 'settings',
            label: 'Impostazioni',
            icon: <Settings size={20} />
          },
          {
            id: 'delete',
            label: 'Elimina',
            icon: <Trash size={20} />,
            variant: 'danger'
          }
        ]}
      />
    </div>
  )
}