"use client";

import { useEffect, useState } from "react";
import { trackService } from "@/services/trackService";

export default function DebugSelections() {
  const [selections, setSelections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelections();
  }, []);

  const loadSelections = async () => {
    try {
      const data = await trackService.getAllSelections();
      setSelections(data);
    } catch (error) {
      console.error('Error loading selections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: '20px', background: '#181818', color: 'white' }}>
      <h2>Все подборки из API ({selections.length}):</h2>
      {selections.map((selection, index) => (
        <div key={selection.id || selection._id || index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #444' }}>
          <p><strong>ID:</strong> {selection.id || selection._id || 'Нет ID'}</p>
          <p><strong>Название:</strong> {selection.name || 'Без названия'}</p>
          <p><strong>Треков:</strong> {selection.items?.length || selection.tracks?.length || 0}</p>
          <p><strong>Данные:</strong> {JSON.stringify(selection).substring(0, 200)}...</p>
        </div>
      ))}
    </div>
  );
}