import { useCallback, useEffect, useState } from "react";
import { fetchDepartments } from "../services/patientApi";

export default function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDepartments(await fetchDepartments());
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { departments, loading, error, refresh };
}