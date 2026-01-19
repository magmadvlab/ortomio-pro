'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Grid, Layers, AlertTriangle } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';

interface Zone {
  id: string;
  name: string;
  description?: string;
  area_sqm?: number;
  garden_id: string;
  created_at: string;
  updated_at: string;
}

interface Field {
  id: string;
  name: string;
  zone_id: string;
  area_sqm?: number;
  created_at: string;
  updated_at: string;
}

interface Row {
  id: string;
  name: string;
  field_id: string;
  length_m?: number;
  width_m?: number;
  created_at: string;
  updated_at: string;
}

export const ZoneFieldRowManager: React.FC = () => {
  const { supabase, user } = useSupabase();
  const [zones, setZones] = useState<Zone[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showRowForm, setShowRowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [zoneName, setZoneName] = useState('');
  const [zoneDescription, setZoneDescription] = useState('');
  const [zoneArea, setZoneArea] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldArea, setFieldArea] = useState('');
  const [rowName, setRowName] = useState('');
  const [rowLength, setRowLength] = useState('');
  const [rowWidth, setRowWidth] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load zones
      const { data: zonesData, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .order('created_at', { ascending: true });

      if (zonesError) throw zonesError;
      setZones(zonesData || []);

      // Load fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('zone_fields')
        .select('*')
        .order('created_at', { ascending: true });

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);

      // Load rows
      const { data: rowsData, error: rowsError } = await supabase
        .from('zone_rows')
        .select('*')
        .order('created_at', { ascending: true });

      if (rowsError) throw rowsError;
      setRows(rowsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async () => {
    if (!zoneName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('zones')
        .insert([{
          name: zoneName,
          description: zoneDescription,
          area_sqm: zoneArea ? parseFloat(zoneArea) : null,
          garden_id: user?.id // Simplified - in real app would be actual garden ID
        }])
        .select()
        .single();

      if (error) throw error;

      setZones([...zones, data]);
      resetZoneForm();
    } catch (error) {
      console.error('Error creating zone:', error);
      alert('Errore nella creazione della zona');
    }
  };

  const handleCreateField = async () => {
    if (!fieldName.trim() || !selectedZone) return;

    try {
      const { data, error } = await supabase
        .from('zone_fields')
        .insert([{
          name: fieldName,
          zone_id: selectedZone.id,
          area_sqm: fieldArea ? parseFloat(fieldArea) : null
        }])
        .select()
        .single();

      if (error) throw error;

      setFields([...fields, data]);
      resetFieldForm();
    } catch (error) {
      console.error('Error creating field:', error);
      alert('Errore nella creazione del campo');
    }
  };

  const handleCreateRow = async () => {
    if (!rowName.trim() || !selectedField) return;

    try {
      const { data, error } = await supabase
        .from('zone_rows')
        .insert([{
          name: rowName,
          field_id: selectedField.id,
          length_m: rowLength ? parseFloat(rowLength) : null,
          width_m: rowWidth ? parseFloat(rowWidth) : null
        }])
        .select()
        .single();

      if (error) throw error;

      setRows([...rows, data]);
      resetRowForm();
    } catch (error) {
      console.error('Error creating row:', error);
      alert('Errore nella creazione del filare');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa zona? Verranno eliminati anche tutti i campi e filari associati.')) return;

    try {
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      setZones(zones.filter(z => z.id !== zoneId));
      setFields(fields.filter(f => f.zone_id !== zoneId));
      // Rows will be deleted by cascade
      setRows(rows.filter(r => !fields.some(f => f.zone_id === zoneId && f.id === r.field_id)));
      
      if (selectedZone?.id === zoneId) {
        setSelectedZone(null);
        setSelectedField(null);
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert('Errore nell\'eliminazione della zona');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo campo? Verranno eliminati anche tutti i filari associati.')) return;

    try {
      const { error } = await supabase
        .from('zone_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      setFields(fields.filter(f => f.id !== fieldId));
      setRows(rows.filter(r => r.field_id !== fieldId));
      
      if (selectedField?.id === fieldId) {
        setSelectedField(null);
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Errore nell\'eliminazione del campo');
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo filare?')) return;

    try {
      const { error } = await supabase
        .from('zone_rows')
        .delete()
        .eq('id', rowId);

      if (error) throw error;

      setRows(rows.filter(r => r.id !== rowId));
    } catch (error) {
      console.error('Error deleting row:', error);
      alert('Errore nell\'eliminazione del filare');
    }
  };

  const resetZoneForm = () => {
    setZoneName('');
    setZoneDescription('');
    setZoneArea('');
    setShowZoneForm(false);
    setEditingItem(null);
  };

  const resetFieldForm = () => {
    setFieldName('');
    setFieldArea('');
    setShowFieldForm(false);
    setEditingItem(null);
  };

  const resetRowForm = () => {
    setRowName('');
    setRowLength('');
    setRowWidth('');
    setShowRowForm(false);
    setEditingItem(null);
  };

  const getFieldsForZone = (zoneId: string) => {
    return fields.filter(f => f.zone_id === zoneId);
  };

  const getRowsForField = (fieldId: string) => {
    return rows.filter(r => r.field_id === fieldId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-blue-600">{zones.length}</div>
              <div className="text-sm text-gray-600">Zone</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Grid className="text-green-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-green-600">{fields.length}</div>
              <div className="text-sm text-gray-600">Campi</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Layers className="text-purple-600" size={24} />
            <div>
              <div className="text-2xl font-bold text-purple-600">{rows.length}</div>
              <div className="text-sm text-gray-600">Filari</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin size={20} />
              Zone
            </h3>
            <button
              onClick={() => setShowZoneForm(true)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus size={16} />
              Nuova
            </button>
          </div>

          {showZoneForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome zona"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <textarea
                  placeholder="Descrizione (opzionale)"
                  value={zoneDescription}
                  onChange={(e) => setZoneDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={2}
                />
                <input
                  type="number"
                  placeholder="Area (m²)"
                  value={zoneArea}
                  onChange={(e) => setZoneArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateZone}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Crea
                  </button>
                  <button
                    onClick={resetZoneForm}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {zones.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin size={48} className="mx-auto mb-2 text-gray-300" />
                <p>Nessuna zona creata</p>
                <p className="text-sm">Crea la prima zona per organizzare il tuo giardino</p>
              </div>
            ) : (
              zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedZone?.id === zone.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedZone(zone);
                    setSelectedField(null);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{zone.name}</h4>
                      {zone.description && (
                        <p className="text-sm text-gray-600">{zone.description}</p>
                      )}
                      {zone.area_sqm && (
                        <p className="text-xs text-gray-500">{zone.area_sqm} m²</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {getFieldsForZone(zone.id).length} campi
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteZone(zone.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Grid size={20} />
              Campi
              {selectedZone && (
                <span className="text-sm text-gray-500">({selectedZone.name})</span>
              )}
            </h3>
            <button
              onClick={() => selectedZone && setShowFieldForm(true)}
              disabled={!selectedZone}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Nuovo
            </button>
          </div>

          {!selectedZone ? (
            <div className="text-center py-8 text-gray-500">
              <Grid size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Seleziona una zona</p>
              <p className="text-sm">per visualizzare i campi</p>
            </div>
          ) : (
            <>
              {showFieldForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nome campo"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Area (m²)"
                      value={fieldArea}
                      onChange={(e) => setFieldArea(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateField}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Crea
                      </button>
                      <button
                        onClick={resetFieldForm}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {getFieldsForZone(selectedZone.id).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Grid size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>Nessun campo in questa zona</p>
                    <p className="text-sm">Crea il primo campo</p>
                  </div>
                ) : (
                  getFieldsForZone(selectedZone.id).map((field) => (
                    <div
                      key={field.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedField?.id === field.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedField(field)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{field.name}</h4>
                          {field.area_sqm && (
                            <p className="text-xs text-gray-500">{field.area_sqm} m²</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {getRowsForField(field.id).length} filari
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteField(field.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Rows */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layers size={20} />
              Filari
              {selectedField && (
                <span className="text-sm text-gray-500">({selectedField.name})</span>
              )}
            </h3>
            <button
              onClick={() => selectedField && setShowRowForm(true)}
              disabled={!selectedField}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Nuovo
            </button>
          </div>

          {!selectedField ? (
            <div className="text-center py-8 text-gray-500">
              <Layers size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Seleziona un campo</p>
              <p className="text-sm">per visualizzare i filari</p>
            </div>
          ) : (
            <>
              {showRowForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nome filare"
                      value={rowName}
                      onChange={(e) => setRowName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Lunghezza (m)"
                        value={rowLength}
                        onChange={(e) => setRowLength(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Larghezza (m)"
                        value={rowWidth}
                        onChange={(e) => setRowWidth(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateRow}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Crea
                      </button>
                      <button
                        onClick={resetRowForm}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {getRowsForField(selectedField.id).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Layers size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>Nessun filare in questo campo</p>
                    <p className="text-sm">Crea il primo filare</p>
                  </div>
                ) : (
                  getRowsForField(selectedField.id).map((row) => (
                    <div
                      key={row.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{row.name}</h4>
                          {(row.length_m || row.width_m) && (
                            <p className="text-xs text-gray-500">
                              {row.length_m && `${row.length_m}m`}
                              {row.length_m && row.width_m && ' × '}
                              {row.width_m && `${row.width_m}m`}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-blue-900">Organizzazione Gerarchica</h4>
            <p className="text-sm text-blue-800 mt-1">
              Le <strong>Zone</strong> rappresentano aree macro del giardino (es. "Orto Nord", "Serra").
              I <strong>Campi</strong> sono suddivisioni delle zone (es. "Campo A", "Settore 1").
              I <strong>Filari</strong> sono le file di coltivazione all'interno dei campi.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Questa organizzazione ti permette di pianificare irrigazione, trattamenti e rotazioni in modo preciso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};