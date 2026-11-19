import { API_URL } from "./api-url.js";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}/api/rooms${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export async function createRoom() {
  return request("/", { method: "POST" }); // Returns { id } -> then call navigate(`/dashboard/${room.id}`)
}

export async function updateRoomTitle(title, id) {
  return request(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteRoom(id) {
  return request(`/${id}`, { method: "DELETE" });
}

export async function shareRoom(id, inviteEmail) {
  try {
    await request(`/${id}/share`, {
      method: "POST",
      body: JSON.stringify({ inviteEmail }),
    });
    return null; // Matches original behavior (returns undefined/null on success)
  } catch (error) {
    return error.message; // Returns "User not found." if 404
  }
}

export async function deleteInvitation(id, inviteEmail) {
  return request(`/${id}/share`, {
    method: "DELETE",
    body: JSON.stringify({ inviteEmail }),
  });
}
