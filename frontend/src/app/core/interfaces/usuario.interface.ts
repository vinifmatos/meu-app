export interface Usuario {
  id: number;
  username: string;
  email: string;
  nome: string;
  unconfirmedEmail?: string;
  created_at: string;
}

export interface PerfilResposta {
  usuario: Usuario;
}
