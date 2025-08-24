import React, { createContext } from "react";

// Importa o hook personalizado que lida com autenticação
import useAuth from "../hooks/useAuth";

// Cria um contexto para compartilhar dados entre componentes
const Context = createContext();

// Componente responsável por fornecer os dados do usuário para toda a aplicação
function UserProvider({ children }) {
  // Pega do hook useAuth os dados e funções de autenticação
  const { authenticated, loading, register, login, logout } = useAuth();

  return (
    // Context.Provider compartilha os valores abaixo com todos os componentes que usam o contexto
    <Context.Provider
      value={{ loading, authenticated, register, login, logout }}
    >
      {/* Renderiza todos os filhos que estarão dentro do UserProvider */}
      {children}
    </Context.Provider>
  );
}

// Exporta o Context para ser usado com useContext
// e o UserProvider para envolver a aplicação
export { Context, UserProvider };
