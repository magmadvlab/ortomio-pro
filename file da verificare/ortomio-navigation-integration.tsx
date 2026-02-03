// Integrazione Navigazione OrtoMio Pro - Sistema Semina/Trapianto
// Questo file mostra come aggiungere i link di navigazione nel menu OrtoMio

// 1. AGGIUNGERE AL MENU PRINCIPALE
// Nel file di navigazione principale di OrtoMio (es. components/Navigation.tsx o layout.tsx)

const navigationItems = [
  // ... altri item esistenti
  {
    name: 'Pianifica',
    href: '/app/pianifica',
    icon: '📅',
    description: 'Pianifica semina o trapianto'
  },
  {
    name: 'Semenzaio',
    href: '/app/semenzaio', 
    icon: '🌱',
    description: 'Gestisci batch di semenzaio'
  },
  // ... altri item esistenti
];

// 2. AGGIUNGERE ALLA SIDEBAR (se presente)
const sidebarItems = [
  // ... altri item
  {
    section: 'Coltivazione Avanzata',
    items: [
      {
        name: 'Pianifica Coltivazione',
        href: '/app/pianifica',
        icon: '📅'
      },
      {
        name: 'Semenzaio Pro',
        href: '/app/semenzaio',
        icon: '🌱'
      }
    ]
  }
];

// 3. AGGIUNGERE AL DASHBOARD PRINCIPALE
// Nel dashboard principale, aggiungere card di accesso rapido

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ... altre card esistenti */}
      
      {/* Card Pianifica */}
      <Link href="/app/pianifica" className="block">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <h3 className="font-semibold">Pianifica</h3>
              <p className="text-sm text-gray-600">Seme o piantina?</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Card Semenzaio */}
      <Link href="/app/semenzaio" className="block">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <h3 className="font-semibold">Semenzaio</h3>
              <p className="text-sm text-gray-600">Gestisci piantine</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// 4. AGGIORNARE IL WIZARD DI PIANIFICAZIONE ESISTENTE
// Nel componente SimplifiedPlantingForm esistente, sostituire la selezione metodo

import CultivationMethodSelector from '@/components/planner/CultivationMethodSelector';

export function SimplifiedPlantingFormUpdated({ plant, onComplete }) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleMethodSelect = (method, data) => {
    setSelectedMethod({ method, data });
    
    // Integra con il flusso esistente
    if (method === 'seed') {
      // Reindirizza al semenzaio per creare batch
      router.push(`/app/semenzaio?create=true&plant=${plant.name}`);
    } else {
      // Continua con il flusso trapianto esistente
      onComplete({ method: 'transplant', ...data });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Come vuoi coltivare {plant.name}?</h2>
      
      <CultivationMethodSelector
        plant={plant}
        onSelect={handleMethodSelect}
        userLevel="intermedio" // Prendi dal profilo utente
        currentSeason="primavera" // Calcola dalla data
      />
      
      {selectedMethod && (
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800">
            Metodo selezionato: {selectedMethod.method === 'seed' ? 'Dal Seme' : 'Dalla Piantina'}
          </p>
        </div>
      )}
    </div>
  );
}

// 5. BREADCRUMB NAVIGATION
export function BreadcrumbNavigation({ currentPage }) {
  const breadcrumbs = {
    '/app/pianifica': [
      { name: 'Dashboard', href: '/app' },
      { name: 'Pianifica', href: '/app/pianifica' }
    ],
    '/app/semenzaio': [
      { name: 'Dashboard', href: '/app' },
      { name: 'Semenzaio', href: '/app/semenzaio' }
    ]
  };

  const currentBreadcrumbs = breadcrumbs[currentPage] || [];

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {currentBreadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index > 0 && <span>›</span>}
          <Link 
            href={crumb.href}
            className={index === currentBreadcrumbs.length - 1 
              ? 'font-medium text-gray-900' 
              : 'hover:text-green-600'
            }
          >
            {crumb.name}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}

// 6. NOTIFICHE E PROMEMORIA
// Aggiungere al sistema di notifiche esistente

export function SeedlingNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Carica notifiche semenzaio
    loadSeedlingNotifications();
  }, []);

  const loadSeedlingNotifications = async () => {
    // Query per batch pronti per trapianto
    const { data } = await supabase
      .from('seedling_batches')
      .select('*')
      .eq('current_phase', 'ready');

    const notifications = data?.map(batch => ({
      id: batch.id,
      type: 'seedling_ready',
      title: 'Piantine Pronte',
      message: `${batch.plant_name} (${batch.variety}) è pronto per il trapianto`,
      href: `/app/semenzaio?batch=${batch.id}`,
      priority: 'high'
    })) || [];

    setNotifications(notifications);
  };

  return (
    <div className="space-y-2">
      {notifications.map(notification => (
        <Link 
          key={notification.id}
          href={notification.href}
          className="block p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
        >
          <div className="flex items-center gap-2">
            <span className="text-orange-600">🌱</span>
            <div>
              <p className="font-medium text-orange-900">{notification.title}</p>
              <p className="text-sm text-orange-700">{notification.message}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default {
  navigationItems,
  sidebarItems,
  DashboardQuickActions,
  SimplifiedPlantingFormUpdated,
  BreadcrumbNavigation,
  SeedlingNotifications
};