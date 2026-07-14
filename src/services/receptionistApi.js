import api from "./api";

export const receptionistApi = {
  getAppointments: async () => {
    const res = await api.get("/appointments?limit=200");
    return res.data.appointments;
  },
  createAppointment: async (data) => {
    const res = await api.post("/appointments", data);
    return res.data;
  },
  updateAppointment: async (id, data) => {
    const res = await api.put(`/appointments/${id}`, data);
    return res.data;
  },
  cancelAppointment: async (id) => {
    const res = await api.put(`/appointments/${id}`, { status: "cancelled" });
    return res.data;
  },
  updateAppointmentStatus: async (id, status) => {
    const res = await api.put(`/appointments/${id}`, { status });
    return res.data;
  },
  getDoctors: async () => {
    const res = await api.get("/staff?role=doctor&limit=200");
    return res.data.users;
  },
  getPatients: async () => {
    const res = await api.get("/staff?role=patient&limit=200");
    return res.data.users;
  },
};
