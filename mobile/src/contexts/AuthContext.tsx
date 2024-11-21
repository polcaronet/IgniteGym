import { UserDTO } from "@dtos/UserDTO";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "@services/api";
import {
  storageUserSave,
  storageUserGet,
  storageUserRemove,
} from "@storage/storageUser";
import {
  storageAuthTokenSave,
  storageAuthTokenGet,
  storageAuthTokenRemove,
} from "@storage/storageAuthToken";

export type AuthContextDataProps = {
  user: UserDTO;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
  isLoadingUserStorageData: boolean;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps
);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] =
    useState(true);

  /**
   * Atualiza o token no cabeçalho e o estado do usuário.
   */
  async function userAndTokenUpdate(userData: UserDTO, token: string) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  }

  /**
   * Salva o usuário e os tokens no armazenamento.
   */
  async function storageUserAndTokenSave(
    userData: UserDTO,
    token: string,
    refresh_token: string
  ) {
    try {
      await storageUserSave(userData);
      await storageAuthTokenSave({ token, refresh_token });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Realiza o login do usuário e salva os dados localmente.
   */
  async function signIn(email: string, password: string): Promise<void> {
    try {
      const { data } = await api.post("/sessions", { email, password });

      if (data.user && data.token && data.refresh_token) {
        await storageUserAndTokenSave(data.user, data.token, data.refresh_token);
        userAndTokenUpdate(data.user, data.token);
      } else {
        throw new Error("Dados de autenticação incompletos.");
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Carrega os dados do usuário do armazenamento local.
   */
  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true);

      const userLogged = await storageUserGet();
      const { token } = await storageAuthTokenGet();

      if (token && userLogged) {
        userAndTokenUpdate(userLogged, token);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  /**
   * Realiza o logout do usuário, removendo os dados locais.
   */
  async function signOut() {
    try {
      setIsLoadingUserStorageData(true);

      setUser({} as UserDTO);
      await storageUserRemove();
      await storageAuthTokenRemove();

      api.defaults.headers.common["Authorization"] = "";
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  /**
   * Atualiza o perfil do usuário localmente.
   */
  async function updateUserProfile(userUpdated: UserDTO) {
    try {
      setUser((prevState) => ({ ...prevState, ...userUpdated }));
      await storageUserSave(userUpdated);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Carrega os dados do usuário ao inicializar.
   */
  useEffect(() => {
    loadUserData();
  }, []);

  /**
   * Registra o interceptor para atualizar tokens automaticamente.
   */
  useEffect(() => {
    const unsubscribe = api.registerInterceptTokenManager(signOut);

    return () => {
      unsubscribe();
    };
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        updateUserProfile,
        isLoadingUserStorageData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
