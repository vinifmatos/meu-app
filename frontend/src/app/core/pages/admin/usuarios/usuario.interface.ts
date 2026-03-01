export interface IUsuario {
  id: number;
  username: string;
  nome: string;
  role: 'admin' | 'usuario';
}
