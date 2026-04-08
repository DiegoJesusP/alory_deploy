import { useState } from "react";
import { createClient, updateClient } from "../../services/clientService";
import type { Client } from "../../types/clients.types";

interface Props {
  client?: Client;
  onSuccess: () => void;
}

const ClientForm = ({ client, onSuccess }: Props) => {
  const initialBirthDate = client?.birth_date ? client.birth_date.split("T")[0] : "";

  const [full_name, setFullName] = useState(client?.full_name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [birth_date, setBirthDate] = useState(initialBirthDate);
  const [allergies, setAllergies] = useState(client?.allergies ?? "");
  const [preferences, setPreferences] = useState(client?.preferences ?? "");
  const [clinical_data, setClinicalData] = useState(client?.clinical_data ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      full_name,
      email,
      phone,
      birth_date,
      allergies,
      preferences,
      clinical_data,
    };

    try {
      if (client) {
        await updateClient(client.id, payload);
      } else {
        await createClient(payload);
      }

      onSuccess();
    } catch {
      alert("Error guardando cliente");
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <h2>{client ? "Editar Cliente" : "Nuevo Cliente"}</h2>

      <input
        placeholder="Nombre completo"
        value={full_name}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="date"
        value={birth_date}
        onChange={(e) => setBirthDate(e.target.value)}
      />

      <input
        placeholder="Alergias"
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
      />

      <input
        placeholder="Preferencias"
        value={preferences}
        onChange={(e) => setPreferences(e.target.value)}
      />

      <input
        placeholder="Datos clínicos"
        value={clinical_data}
        onChange={(e) => setClinicalData(e.target.value)}
      />

      <button type="submit">
        {client ? "Actualizar" : "Guardar"}
      </button>

    </form>
  );
};

export default ClientForm;
