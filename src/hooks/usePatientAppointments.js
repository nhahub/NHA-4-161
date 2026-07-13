import { useCallback, useEffect, useState } from "react";
import {
  fetchMyAppointments,
  bookAppointment as apiBookAppointment,
  cancelAppointment as apiCancelAppointment,
} from "../services/patientApi";

export default function usePatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyAppointments();
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load your appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const bookAppointment = useCallback(async (payload) => {
    const appt = await apiBookAppointment(payload);
    await refresh();
    return appt;
  }, [refresh]);

  const cancelAppointment = useCallback(async (id) => {
    await apiCancelAppointment(id);
    await refresh();
  }, [refresh]);

  return { appointments, loading, error, bookAppointment, cancelAppointment, refresh };
}