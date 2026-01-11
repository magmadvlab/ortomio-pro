/**
 * Fix Mobile Modals Script
 * Identifica e aggiorna automaticamente tutti i modal per renderli mobile-friendly
 */

import fs from 'fs'
import path from 'path'

// Pattern per identificare modal non ottimizzati
const MODAL_PATTERNS = [
  /fixed inset-0.*?bg-black.*?flex.*?items-center.*?justify-center/g,
  /className=".*?fixed.*?inset-0.*?"/g,
  /max-w-\w+.*?w-full.*?max-h-\[90vh\]/g
]

// Problemi comuni nei modal mobile
const MOBILE_ISSUES = {
  // Dimensioni non responsive
  fixedWidth: /max-w-\d+xl/g,
  
  // Padding insufficiente
  noPadding: /p-4(?!\s+sm:p-6)/g,
  
  // Bottoni troppo piccoli
  smallButtons: /px-\d+\s+py-\d+(?!\s+.*?min-h-\[44px\])/g,
  
  // Overflow non gestito
  noOverflow: /max-h-\[90vh\](?!\s+.*?overflow-y-auto)/g,
  
  // Z-index troppo basso
  lowZIndex: /z-\d{1,2}(?!\d)/g
}

class MobileModalFixer {
  constructor() {
    this.componentsDir = './components'
    this.appDir = './app'
    this.issues = []
    this.fixes = []
  }

  // Scansiona tutti i file per trovare modal
  async scanForModals() {
    console.log('🔍 Scanning for modal components...')
    
    const files = await this.getAllTsxFiles()
    
    for (const file of files) {
      await this.analyzeFile(file)
    }
    
    console.log(`📊 Found ${this.issues.length} files with modal issues`)
    return this.issues
  }

  // Ottieni tutti i file TSX
  async getAllTsxFiles() {
    const files = []
    
    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return
      
      const items = fs.readdirSync(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDir(fullPath)
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(fullPath)
        }
      }
    }
    
    scanDir(this.componentsDir)
    scanDir(this.appDir)
    
    return files
  }

  // Analizza un file per problemi modal
  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Controlla se il file contiene modal
      const hasModal = MODAL_PATTERNS.some(pattern => pattern.test(content))
      
      if (!hasModal) return
      
      console.log(`📱 Found modal in: ${filePath}`)
      
      const fileIssues = []
      
      // Controlla ogni tipo di problema
      for (const [issueType, pattern] of Object.entries(MOBILE_ISSUES)) {
        const matches = content.match(pattern)
        if (matches) {
          fileIssues.push({
            file: filePath,
            type: issueType,
            matches: matches.length,
            pattern: pattern.toString()
          })
        }
      }
      
      if (fileIssues.length > 0) {
        this.issues.push({
          file: filePath,
          issues: fileIssues,
          content: content
        })
      }
      
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message)
    }
  }

  // Genera report dettagliato
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: this.issues.length,
      totalIssues: this.issues.reduce((sum, file) => sum + file.issues.length, 0),
      issuesByType: {},
      files: this.issues.map(file => ({
        path: file.file,
        issues: file.issues.map(issue => ({
          type: issue.type,
          matches: issue.matches
        }))
      }))
    }
    
    // Conta issues per tipo
    for (const file of this.issues) {
      for (const issue of file.issues) {
        report.issuesByType[issue.type] = (report.issuesByType[issue.type] || 0) + issue.matches
      }
    }
    
    return report
  }

  // Crea componenti di esempio ottimizzati
  async createExamples() {
    console.log('📝 Creating mobile-optimized modal examples...')
    
    // Crea directory se non esiste
    const examplesDir = './components/examples'
    if (!fs.existsSync(examplesDir)) {
      fs.mkdirSync(examplesDir, { recursive: true })
    }
    
    const examples = `/**
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
}`
    
    fs.writeFileSync('./components/examples/MobileModalExamples.tsx', examples)
    console.log('✅ Created mobile modal examples')
  }
}

// Esegui il fix
async function main() {
  console.log('🚀 Starting Mobile Modal Analysis...\n')
  
  const fixer = new MobileModalFixer()
  
  try {
    // Scansiona per problemi
    await fixer.scanForModals()
    
    if (fixer.issues.length === 0) {
      console.log('✅ No modal issues found!')
      return
    }
    
    // Genera report
    const report = fixer.generateReport()
    console.log('\n📊 Modal Issues Summary:')
    console.log(`Total files with modals: ${report.totalFiles}`)
    console.log(`Total issues found: ${report.totalIssues}`)
    console.log('\nIssues by type:')
    for (const [type, count] of Object.entries(report.issuesByType)) {
      console.log(`  ${type}: ${count}`)
    }
    
    console.log('\n📋 Files with modal issues:')
    for (const file of report.files) {
      console.log(`  ${file.path}`)
      for (const issue of file.issues) {
        console.log(`    - ${issue.type}: ${issue.matches} occurrences`)
      }
    }
    
    // Crea esempi
    await fixer.createExamples()
    
    // Salva report
    fs.writeFileSync('./mobile-modal-analysis-report.json', JSON.stringify(report, null, 2))
    
    console.log('\n🎉 Mobile Modal Analysis Complete!')
    console.log(`📋 Report saved to: mobile-modal-analysis-report.json`)
    
  } catch (error) {
    console.error('❌ Error during analysis:', error)
  }
}

// Esegui se chiamato direttamente
main()