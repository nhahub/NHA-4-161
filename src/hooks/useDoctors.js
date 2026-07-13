import { useCallback, useEffect, useState } from "react";
import { fetchDoctors } from "../services/patientApi";

export default function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDoctors(await fetchDoctors());
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { doctors, loading, error, refresh };
}