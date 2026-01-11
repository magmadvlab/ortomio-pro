/**
 * Fertilizer Inventory Component
 * Visualizza e gestisce inventario prodotti fertilizzanti
 */

import React, { useState, useEffect } from 'react';
import { Garden } from '../../types';
import {
  getFertilizerInventory,
  addFertilizerProduct,
  updateFertilizerQuantity,
  checkLowStock,
} from '../../services/fertilizerInventoryService';
import { FertilizerInventoryItem } from '../../services/fertilizerInventoryService';
import { allFertilizers, FertilizerProduct } from '../../data/fertilizers';
import { Package, Plus, AlertTriangle, TrendingDown, Calendar } from 'lucide-react';

interface FertilizerInventoryProps {
  garden: Garden;
}

const FertilizerInventory: React.FC<FertilizerInventoryProps> = ({ garden }) => {
  const [inventory, setInventory] = useState<FertilizerInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState<
    Array<{ item: FertilizerInventoryItem; reason: string; urgency: 'low' | 'medium' | 'high' }>
  >([]);

  useEffect(() => {
    loadInventory();
  }, [garden.id]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const inv = await getFertilizerInventory(garden.id);
      setInventory(inv);

      const alerts = await checkLowStock(garden.id, 'Summer');
      setLowStockAlerts(alerts);
    } catch (error) {
      console.error('Error loading fertilizer inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (
    product: FertilizerProduct,
    quantity: number,
    cost?: number,
    expiryDate?: Date
  ) => {
    try {
      await addFertilizerProduct(garden.id, product, quantity, cost, expiryDate);
      await loadInventory();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
          <Package size={20} />
          Inventario Fertilizzanti
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3 text-sm"
        >
          <Plus size={16} />
          Aggiungi Prodotto
        </button>
      </div>

      {/* Alert Scorte Basse */}
      {lowStockAlerts.length > 0 && (
        <div className="space-y-2">
          {lowStockAlerts
            .filter((a) => a.urgency === 'high')
            .map((alert, idx) => (
              <div
                key={idx}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
              >
                <AlertTriangle size={18} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{alert.item.productName}</p>
                  <p className="text-xs text-red-700">{alert.reason}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Form Aggiunta */}
      {showAddForm && (
        <AddProductForm
          onAdd={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Lista Inventario */}
      {inventory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package size={48} className="mx-auto mb-2 opacity-50" />
          <p>Nessun prodotto in inventario</p>
          <p className="text-sm mt-1">Aggiungi prodotti per gestire scorte e costi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-800">{item.productName}</h4>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {item.category}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      <b className="text-gray-800">{item.quantity}</b> {item.unit}
                    </span>
                    {item.costPerUnit && (
                      <span>
                        Costo: <b className="text-gray-800">€{item.costPerUnit.toFixed(2)}</b>/{item.unit}
                      </span>
                    )}
                    {item.expiryDate && (
                      <span className="flex items-center gap-3">
                        <Calendar size={14} />
                        Scadenza: {item.expiryDate.toLocaleDateString('it-IT')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {lowStockAlerts.find((a) => a.item.id === item.id) && (
                    <TrendingDown size={16} className="text-red-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Form Aggiunta Prodotto
interface AddProductFormProps {
  onAdd: (product: FertilizerProduct, quantity: number, cost?: number, expiryDate?: Date) => void;
  onCancel: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAdd, onCancel }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = allFertilizers.find((p) => p.id === selectedProductId);
    if (!product || !quantity) return;

    onAdd(
      product,
      parseFloat(quantity),
      cost ? parseFloat(cost) : undefined,
      expiryDate ? new Date(expiryDate) : undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prodotto</label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="">Seleziona prodotto...</option>
          {allFertilizers.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.type})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantità</label>
        <input
          type="number"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Es. 10"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Costo (€/kg o €/L)</label>
        <input
          type="number"
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Opzionale"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data Scadenza</label>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Aggiungi
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Annulla
        </button>
      </div>
    </form>
  );
};

export default FertilizerInventory;

