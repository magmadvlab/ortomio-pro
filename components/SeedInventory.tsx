import React, { useState, useEffect } from 'react';
import { SeedPacket, Garden } from '../types';
import { 
  addSeedPacket, 
  getSeedPackets, 
  updateSeedPacket, 
  deleteSeedPacket, 
  getExpiringSeeds, 
  getLowStockSeeds,
  getExpiredSeeds,
  shouldShowJanuaryAlert
} from '../services/seedInventoryService';
import { varietyMappings } from '../data/varietyMappings';
import { 
  Package, Plus, X, Edit2, Trash2, AlertTriangle, CheckCircle, 
  Filter, Search, Calendar, TrendingDown, Box
} from 'lucide-react';

interface SeedInventoryProps {
  garden: Garden;
}

const SeedInventory: React.FC<SeedInventoryProps> = ({ garden }) => {
  const [packets, setPackets] = useState<SeedPacket[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'expiring' | 'low' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newPacket, setNewPacket] = useState<Partial<SeedPacket>>({
    varietyName: '',
    speciesName: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryYear: new Date().getFullYear() + 2,
    isOpen: false,
    quantityRemaining: 'High',
    gardenId: garden.id
  });

  useEffect(() => {
    loadPackets();
  }, [garden.id]);

  const loadPackets = () => {
    const loaded = getSeedPackets(garden.id);
    setPackets(loaded);
  };

  const handleAdd = () => {
    if (!newPacket.varietyName || !newPacket.speciesName) return;
    
    const packet: SeedPacket = {
      id: crypto.randomUUID(),
      varietyId: newPacket.varietyName.toLowerCase(),
      varietyName: newPacket.varietyName,
      speciesName: newPacket.speciesName,
      purchaseDate: newPacket.purchaseDate || new Date().toISOString().split('T')[0],
      expiryYear: newPacket.expiryYear || new Date().getFullYear() + 2,
      isOpen: newPacket.isOpen || false,
      quantityRemaining: newPacket.quantityRemaining || 'High',
      initialQuantity: newPacket.initialQuantity,
      currentQuantity: newPacket.currentQuantity !== undefined ? newPacket.currentQuantity : newPacket.initialQuantity,
      notes: newPacket.notes,
      gardenId: garden.id
    };
    
    addSeedPacket(packet);
    loadPackets();
    setIsAdding(false);
    setNewPacket({
      varietyName: '',
      speciesName: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryYear: new Date().getFullYear() + 2,
      isOpen: false,
      quantityRemaining: 'High',
      initialQuantity: undefined,
      currentQuantity: undefined,
      gardenId: garden.id
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Eliminare questo pacchetto di semi?')) {
      deleteSeedPacket(garden.id, id);
      loadPackets();
    }
  };

  const handleUpdate = (id: string, updates: Partial<SeedPacket>) => {
    updateSeedPacket(garden.id, id, updates);
    loadPackets();
    setEditingId(null);
  };

  const currentYear = new Date().getFullYear();
  const showJanuaryAlert = shouldShowJanuaryAlert();
  const expiredSeeds = getExpiredSeeds(garden.id, currentYear);
  const expiringSeeds = getExpiringSeeds(garden.id, currentYear);
  const lowStockSeeds = getLowStockSeeds(garden.id);

  // Filtra i pacchetti
  let filteredPackets = packets;
  
  if (filter === 'expiring') {
    filteredPackets = expiringSeeds;
  } else if (filter === 'low') {
    filteredPackets = lowStockSeeds;
  } else if (filter === 'expired') {
    filteredPackets = expiredSeeds;
  }
  
  if (searchTerm) {
    filteredPackets = filteredPackets.filter(p => 
      p.varietyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.speciesName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Ottieni specie uniche per autocompletamento
  const uniqueSpecies = Array.from(new Set(varietyMappings.map(v => {
    const masterSheet = varietyMappings.find(m => m.speciesId === v.speciesId);
    return masterSheet?.speciesId || '';
  }))).filter(Boolean);

  const getQuantityColor = (qty: SeedPacket['quantityRemaining']) => {
    switch (qty) {
      case 'High': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-orange-100 text-orange-700';
      case 'Empty': return 'bg-gray-100 text-gray-500';
    }
  };

  const getExpiryStatus = (expiryYear: number) => {
    if (expiryYear < currentYear) return { status: 'Scaduto', color: 'text-red-600' };
    if (expiryYear === currentYear) return { status: 'Scade quest\'anno', color: 'text-orange-600' };
    if (expiryYear === currentYear + 1) return { status: 'Scade l\'anno prossimo', color: 'text-yellow-600' };
    return { status: `Valido fino al ${expiryYear}`, color: 'text-green-600' };
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <Package size={24} />
            Banca dei Semi
          </h1>
          <p className="text-green-600 text-sm">Gestisci l'inventario dei tuoi semi</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          {isAdding ? <X size={18}/> : <><Plus size={18}/> Aggiungi</>}
        </button>
      </header>

      {/* January Alert */}
      {showJanuaryAlert && expiredSeeds.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-orange-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-orange-900 mb-1">È ora di comprare i semi!</h3>
              <p className="text-sm text-orange-700 mb-2">Ecco la lista di quelli scaduti:</p>
              <ul className="text-sm text-orange-800 space-y-1">
                {expiredSeeds.map(p => (
                  <li key={p.id}>• {p.speciesName} - {p.varietyName} (scaduto nel {p.expiryYear})</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            filter === 'all' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Tutti
        </button>
        <button
          onClick={() => setFilter('expiring')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
            filter === 'expiring' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Calendar size={14} />
          In Scadenza ({expiringSeeds.length})
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
            filter === 'low' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <TrendingDown size={14} />
          Scarsa ({lowStockSeeds.length})
        </button>
        <button
          onClick={() => setFilter('expired')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
            filter === 'expired' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <AlertTriangle size={14} />
          Scaduti ({expiredSeeds.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cerca per varietà o specie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white p-5 rounded-2xl border-2 border-green-200 shadow-xl">
          <h3 className="font-bold text-lg mb-4">Nuovo Pacchetto di Semi</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specie</label>
              <input
                type="text"
                list="species-list"
                value={newPacket.speciesName || ''}
                onChange={(e) => {
                  setNewPacket({ ...newPacket, speciesName: e.target.value });
                  // Auto-complete varietà se trovata
                  const mapping = varietyMappings.find(v => 
                    v.speciesId.toLowerCase() === e.target.value.toLowerCase()
                  );
                  if (mapping) {
                    setNewPacket({ ...newPacket, speciesName: mapping.speciesId });
                  }
                }}
                placeholder="Es: POMODORO"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
              <datalist id="species-list">
                {uniqueSpecies.map(s => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Varietà</label>
              <input
                type="text"
                value={newPacket.varietyName || ''}
                onChange={(e) => setNewPacket({ ...newPacket, varietyName: e.target.value })}
                placeholder="Es: Datterino"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Acquisto</label>
                <input
                  type="date"
                  value={newPacket.purchaseDate}
                  onChange={(e) => setNewPacket({ ...newPacket, purchaseDate: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Anno Scadenza</label>
                <input
                  type="number"
                  min={currentYear}
                  value={newPacket.expiryYear}
                  onChange={(e) => setNewPacket({ ...newPacket, expiryYear: parseInt(e.target.value) || currentYear + 2 })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Quantità Iniziale (opzionale)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Es. 100"
                  value={newPacket.initialQuantity || ''}
                  onChange={(e) => {
                    const qty = e.target.value ? parseInt(e.target.value) : undefined;
                    setNewPacket({ 
                      ...newPacket, 
                      initialQuantity: qty,
                      currentQuantity: qty, // Imposta anche currentQuantity
                      quantityRemaining: qty 
                        ? (qty >= 50 ? 'High' : qty >= 20 ? 'Medium' : qty >= 1 ? 'Low' : 'Empty')
                        : newPacket.quantityRemaining || 'High'
                    });
                  }}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Inserisci il numero esatto di semi (es. 100). Se lasciato vuoto, usa solo categoria.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Categoria Scorta {newPacket.initialQuantity ? '(calcolata automaticamente)' : ''}
                  </label>
                  <select
                    value={newPacket.quantityRemaining}
                    onChange={(e) => {
                      if (!newPacket.initialQuantity) {
                        setNewPacket({ ...newPacket, quantityRemaining: e.target.value as SeedPacket['quantityRemaining'] });
                      }
                    }}
                    disabled={!!newPacket.initialQuantity}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="High">Alta</option>
                    <option value="Medium">Media</option>
                    <option value="Low">Bassa</option>
                    <option value="Empty">Vuoto</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPacket.isOpen}
                      onChange={(e) => setNewPacket({ ...newPacket, isOpen: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-gray-700">Busta aperta</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold"
              >
                Annulla
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {filteredPackets.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center">
          <Box size={48} className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">Nessun seme trovato. Aggiungi il primo pacchetto!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPackets.map(packet => {
            const expiryStatus = getExpiryStatus(packet.expiryYear);
            const isEditing = editingId === packet.id;
            
            return (
              <div key={packet.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={packet.varietyName}
                      onChange={(e) => handleUpdate(packet.id, { varietyName: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Anno scadenza"
                        value={packet.expiryYear}
                        onChange={(e) => handleUpdate(packet.id, { expiryYear: parseInt(e.target.value) || currentYear })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Quantità corrente (opzionale)"
                        value={packet.currentQuantity || ''}
                        onChange={(e) => {
                          const qty = e.target.value ? parseInt(e.target.value) : undefined;
                          handleUpdate(packet.id, { 
                            currentQuantity: qty,
                            quantityRemaining: qty 
                              ? (qty >= 50 ? 'High' : qty >= 20 ? 'Medium' : qty >= 1 ? 'Low' : 'Empty')
                              : packet.quantityRemaining
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                      {packet.initialQuantity && (
                        <p className="text-xs text-gray-500">
                          Quantità iniziale: {String(packet.initialQuantity)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold"
                      >
                        Salva
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{packet.speciesName}</h3>
                        <p className="text-sm text-gray-600 italic">{packet.varietyName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(packet.id)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(packet.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${getQuantityColor(packet.quantityRemaining)}`}>
                        {packet.quantityRemaining === 'High' ? 'Alta' : 
                         packet.quantityRemaining === 'Medium' ? 'Media' :
                         packet.quantityRemaining === 'Low' ? 'Bassa' : 'Vuoto'}
                      </span>
                      {packet.currentQuantity !== undefined && packet.currentQuantity !== null && (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {String(packet.currentQuantity)} {packet.currentQuantity === 1 ? 'seme' : 'semi'}
                          {packet.initialQuantity && packet.initialQuantity > 0 && (
                            <span className="text-gray-500"> / {String(packet.initialQuantity)}</span>
                          )}
                        </span>
                      )}
                      {packet.isOpen && (
                        <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">
                          Aperto
                        </span>
                      )}
                      <span className={`text-xs font-bold px-2 py-1 rounded ${expiryStatus.color.includes('red') ? 'bg-red-100' : expiryStatus.color.includes('orange') ? 'bg-orange-100' : expiryStatus.color.includes('yellow') ? 'bg-yellow-100' : 'bg-green-100'} ${expiryStatus.color}`}>
                        {expiryStatus.status}
                      </span>
                    </div>
                    {packet.notes && (
                      <p className="text-xs text-gray-500 mt-2">{packet.notes}</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeedInventory;





