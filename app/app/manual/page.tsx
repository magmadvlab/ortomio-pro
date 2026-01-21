'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Book, ChevronRight, Home, Search } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Input } from '@/components/ui/input'

interface ManualModule {
  id: string
  title: string
  file: string
  category: string
}

const manualModules: ManualModule[] = [
  // Funzionalità Principali
  { id: '01', title: 'Predizioni AI Avanzate', file: '01-ai-predictions.md', category: 'Principali' },
  { id: '02', title: 'Operazioni Drone', file: '02-drone-operations.md', category: 'Principali' },
  { id: '03', title: 'Tracciabilità Integrata', file: '03-traceability.md', category: 'Principali' },
  { id: '04', title: 'Centro Certificazioni', file: '04-certifications.md', category: 'Principali' },
  { id: '05', title: 'NDVI Satellitare', file: '05-ndvi-satellite.md', category: 'Principali' },
  { id: '06', title: 'Prescription Maps', file: '06-prescription-maps.md', category: 'Principali' },
  
  // Funzionalità Potenziate
  { id: '08', title: 'Chat AI Globale', file: '08-global-ai-chat.md', category: 'Potenziate' },
  { id: '09', title: 'Chat AI Planner', file: '09-planner-ai-chat.md', category: 'Potenziate' },
  { id: '10', title: 'Registro Attività', file: '10-activity-registry.md', category: 'Potenziate' },
  { id: '11', title: 'Consultazioni Agronomo', file: '11-agronomist-consultations.md', category: 'Potenziate' },
  { id: '14', title: 'Smart Hub Integrato', file: '14-smart-hub.md', category: 'Potenziate' },
  
  // Funzionalità Professionali
  { id: '15', title: 'Sistema Irrigazione', file: '15-irrigation-system.md', category: 'Professionali' },
  { id: '16', title: 'Nutrizione e Trattamenti', file: '16-nutrition-treatments.md', category: 'Professionali' },
  { id: '17', title: 'Lavorazioni Meccaniche', file: '17-mechanical-operations.md', category: 'Professionali' },
  { id: '18', title: 'Gestione Frutteto', file: '18-orchard-management.md', category: 'Professionali' },
  { id: '19', title: 'Gestione Oliveto', file: '19-olive-management.md', category: 'Professionali' },
  { id: '20', title: 'Gestione Vigneto', file: '20-vineyard-management.md', category: 'Professionali' },
  { id: '21', title: 'Gestione Piante Individuali', file: '21-individual-plants.md', category: 'Professionali' },
  
  // Analytics e Business
  { id: '22', title: 'Business Intelligence', file: '22-business-intelligence.md', category: 'Analytics' },
  { id: '23', title: 'Sistema Export', file: '23-export-system.md', category: 'Analytics' },
  { id: '24', title: 'Sostenibilità', file: '24-sustainability.md', category: 'Analytics' },
  { id: '25', title: 'Ricerca e Sviluppo', file: '25-research-development.md', category: 'Analytics' },
  { id: '26', title: 'Integrazione e API', file: '26-integration-api.md', category: 'Analytics' },
  
  // Guide e Supporto
  { id: '27', title: 'Guida Rapida', file: '27-quick-start.md', category: 'Guide' },
  { id: '28', title: 'Vantaggi Economici', file: '28-economic-benefits.md', category: 'Guide' },
  { id: '29', title: 'Interfaccia e Navigazione', file: '29-interface-navigation.md', category: 'Guide' },
  { id: '30', title: 'Casi d\'Uso', file: '30-use-cases.md', category: 'Guide' },
  { id: '31', title: 'Success Stories', file: '31-success-stories.md', category: 'Guide' },
  { id: '32', title: 'Roadmap Futuro', file: '32-roadmap.md', category: 'Guide' },
  { id: '33', title: 'Supporto e Contatti', file: '33-support-contacts.md', category: 'Guide' },
  
  // Sistemi Intelligenti Avanzati
  { id: '34', title: 'Director Orchestrator', file: '34-director-orchestrator.md', category: 'Avanzati' },
  { id: '35', title: 'Diario Automatico', file: '35-automated-diary.md', category: 'Avanzati' },
]

export default function ManualPage() {
  const [selectedModule, setSelectedModule] = useState<ManualModule | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (selectedModule) {
      loadModule(selectedModule.file)
    }
  }, [selectedModule])

  const loadModule = async (filename: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/docs/manual/${filename}`)
      if (response.ok) {
        const text = await response.text()
        setContent(text)
      } else {
        setContent(`# Errore\n\nImpossibile caricare il modulo. Il file potrebbe non essere disponibile.`)
      }
    } catch (error) {
      setContent(`# Errore\n\nErrore durante il caricamento: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredModules = manualModules.filter(module =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedModules = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = []
    }
    acc[module.category].push(module)
    return acc
  }, {} as Record<string, ManualModule[]>)

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Book className="h-8 w-8" />
          Manuale Utente OrtoMio 2026
        </h1>
        <p className="text-muted-foreground">
          Documentazione completa di tutte le funzionalità della piattaforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar con indice */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Indice Moduli</CardTitle>
            <div className="mt-2">
              <Input
                placeholder="Cerca modulo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-4 space-y-4">
                {!selectedModule && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setSelectedModule(null)}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                )}

                {Object.entries(groupedModules).map(([category, modules]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2 px-2">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {modules.map((module) => (
                        <Button
                          key={module.id}
                          variant={selectedModule?.id === module.id ? 'secondary' : 'ghost'}
                          className="w-full justify-start text-left"
                          onClick={() => setSelectedModule(module)}
                        >
                          <span className="text-xs text-muted-foreground mr-2">{module.id}</span>
                          <span className="flex-1 truncate">{module.title}</span>
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Contenuto principale */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {!selectedModule ? (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <h2>Benvenuto nel Manuale OrtoMio</h2>
                  <p>
                    Seleziona un modulo dalla barra laterale per visualizzare la documentazione completa.
                  </p>
                  
                  <h3>📚 Struttura Documentazione</h3>
                  <ul>
                    <li><strong>Funzionalità Principali</strong>: AI, Droni, Satelliti, Certificazioni</li>
                    <li><strong>Funzionalità Potenziate</strong>: Chat AI, Smart Hub, Registro Attività</li>
                    <li><strong>Funzionalità Professionali</strong>: Irrigazione, Nutrizione, Gestione Colture</li>
                    <li><strong>Analytics e Business</strong>: BI, Export, Sostenibilità, API</li>
                    <li><strong>Guide e Supporto</strong>: Quick Start, Casi d'Uso, Supporto</li>
                    <li><strong>Sistemi Avanzati</strong>: Director Orchestrator, Diario Automatico</li>
                  </ul>

                  <h3>🚀 Accesso Rapido</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => setSelectedModule(manualModules.find(m => m.id === '27')!)}
                    >
                      <span className="font-semibold">Guida Rapida</span>
                      <span className="text-sm text-muted-foreground">Setup in 5 minuti</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => setSelectedModule(manualModules.find(m => m.id === '14')!)}
                    >
                      <span className="font-semibold">Smart Hub</span>
                      <span className="text-sm text-muted-foreground">IoT e Droni</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => setSelectedModule(manualModules.find(m => m.id === '04')!)}
                    >
                      <span className="font-semibold">Certificazioni</span>
                      <span className="text-sm text-muted-foreground">Compliance automatica</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start"
                      onClick={() => setSelectedModule(manualModules.find(m => m.id === '33')!)}
                    >
                      <span className="font-semibold">Supporto</span>
                      <span className="text-sm text-muted-foreground">Contatti e assistenza</span>
                    </Button>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
