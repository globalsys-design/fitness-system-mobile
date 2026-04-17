"use client";

import { useState, useEffect } from "react";

interface IbgeMunicipio {
  id: number;
  nome: string;
}

export interface UseIbgeCitiesResult {
  cities: string[];
  loading: boolean;
}

/**
 * Busca municípios do estado selecionado via API pública do IBGE.
 * Retorna nomes ordenados. Cancela fetch automático ao trocar UF.
 *
 * API: GET /api/v1/localidades/estados/{UF}/municipios?orderBy=nome
 *
 * @param uf — Sigla do estado (ex: "SP"). null/undefined limpa a lista.
 *
 * @example
 * const { cities, loading } = useIbgeCities(selectedState);
 */
export function useIbgeCities(uf: string | undefined | null): UseIbgeCitiesResult {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uf) {
      setCities([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
    )
      .then((r) => {
        if (!r.ok) throw new Error("IBGE API error");
        return r.json() as Promise<IbgeMunicipio[]>;
      })
      .then((data) => {
        if (!cancelled) setCities(data.map((m) => m.nome));
      })
      .catch(() => {
        // Falha silenciosa — o campo city fica habilitado como texto livre
        if (!cancelled) setCities([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uf]);

  return { cities, loading };
}
