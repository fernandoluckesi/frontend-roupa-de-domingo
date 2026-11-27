import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface CartDrawerContextValue {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

/**
 * Estado da gaveta do carrinho. Fica fora do CartContext porque é só UI:
 * quem adiciona um item (página de produto) abre a gaveta, quem mexe no
 * carrinho (gaveta, página do carrinho) continua usando o CartContext.
 */
export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openCart, closeCart }),
    [open, openCart, closeCart],
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer(): CartDrawerContextValue {
  const context = useContext(CartDrawerContext);
  if (!context)
    throw new Error("useCartDrawer precisa estar dentro de CartDrawerProvider");
  return context;
}
