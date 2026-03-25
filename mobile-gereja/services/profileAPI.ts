import { API_URL } from "../utils/api";

// 1. Fungsi Ambil Data Profil
export const fetchUserProfileAPI = async (email: string, token: string) => {
  const query = {
    query: `
      query GetUserProfile($email: String!) {
        users(where: { emailUser: { equals: $email } }) {
          id
          namaUser
          emailUser
          profile {
            id
            nama
            alamat
            domisili
            nomorWa
            jenisKelamin
            pendidikan
            pekerjaan
            tanggalLahir
            statusPernikahan
            statusKeanggotaan
          }
        }
      }
    `,
    variables: { email },
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(query),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  
  return json?.data?.users?.[0]; // Mengembalikan data user pertama yang ketemu
};

// 2. Fungsi Simpan / Update Profil
export const saveUserProfileAPI = async (
  userId: string, 
  profileId: string | null, 
  data: any, 
  token: string
) => {
  const profileMutationAction = profileId ? `update: {` : `create: {`;

  const mutation = {
    query: `
      mutation UpdateUserAndProfile($userId: ID!, $nama: String!, $alamat: String, $domisili: String, $noWa: String, $jk: String, $pendidikan: String, $pekerjaan: String, $statusKawin: String, $statusKeanggotaan: String, $tglLahir: String) {
        updateUser(
          where: { id: $userId }
          data: {
            namaUser: $nama
            profile: {
              ${profileMutationAction}
                alamat: $alamat
                domisili: $domisili
                nomorWa: $noWa
                jenisKelamin: $jk
                pendidikan: $pendidikan
                pekerjaan: $pekerjaan
                statusPernikahan: $statusKawin
                statusKeanggotaan: $statusKeanggotaan
                tanggalLahir: $tglLahir
              }
            }
          }
        ) {
          id
          profile { id }
        }
      }
    `,
    variables: { userId, ...data }, // Sebar data parameter ke variables
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(mutation),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.updateUser;
};

// 3. Fungsi Hapus Data Backend (Soft & Hard Delete)
export const deleteBackendDataAPI = async (userId: string | null, profileId: string | null, token: string) => {
  // Soft Delete User
  if (userId) {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query: `mutation SoftDeleteUser($id: ID!) { updateUser(where: { id: $id }, data: { statusAktivasi: "nonaktif" }) { id } }`,
        variables: { id: userId },
      }),
    });
  }

  // Hard Delete Profile
  if (profileId) {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query: `mutation DeleteProfile($id: ID!) { deleteProfile(where: { id: $id }) { id } }`,
        variables: { id: profileId },
      }),
    });
  }
};