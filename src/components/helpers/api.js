export const deleteAccount = async (token) => {
  if (!token) throw new Error("No access token found");

  const res = await fetch(
    "https://yyyrzagqzncyxhsjwprm.supabase.co/functions/v1/delete-user",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to delete user");
  }

  return data;
};
