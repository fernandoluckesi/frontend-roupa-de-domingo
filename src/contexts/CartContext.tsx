import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cartService } from "../services/cart.service";
import { extractError } from "../services/http";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";
import { useEasterEggs } from "./EasterEggContext";
import { hasConsent } from "./ConsentContext";
import type { Cart } from "../types";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  zipCode: string;
  shippingMethod: "economico" | "expresso";
  addItem: (
    variantId: string,
    quantity?: number,
    options?: { silent?: boolean },
  ) => Promise<boolean>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
  setShipping: (
    zipCode: string,
    method?: "economico" | "expresso",
  ) => Promise<void>;
  reload: () => Promise<void>;
  registerEmptyCartView: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_VIEWS_KEY = "rd:emptyCartViews";

export function CartProvider({ children }: { children: ReactNode }) {
  const { push } = useToast();
  const { isAuthenticated } = useAuth();
  const { discover } = useEasterEggs();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [zipCode, setZipCode] = useState(
    () => localStorage.getItem("rd:zipCode") ?? "",
  );
  const emptyViewsMemory = useRef(0);
  const [shippingMethod, setShippingMethod] = useState<
    "economico" | "expresso"
  >("economico");

  const reload = useCallback(async () => {
    try {
      setCart(await cartService.get(zipCode || undefined, shippingMethod));
    } catch (error) {
      push({
        variant: "error",
        title: "Carrinho",
        message: extractError(error),
      });
    } finally {
      setLoading(false);
    }
  }, [zipCode, shippingMethod, push]);

  // Recarrega no login/logout: o backend faz o merge do carrinho anônimo
  useEffect(() => {
    void reload();
  }, [reload, isAuthenticated]);

  const handleResult = useCallback(
    (result: Cart) => {
      setCart(result);
      if (result.easterEggTrigger) void discover(result.easterEggTrigger);
    },
    [discover],
  );

  const addItem = useCallback(
    async (
      variantId: string,
      quantity = 1,
      options?: { silent?: boolean },
    ) => {
      try {
        handleResult(await cartService.addItem(variantId, quantity));
        if (options?.silent) return true;
        push({
          variant: "success",
          title: "Adicionado ao carrinho",
          message: "Decisão questionável, mas respeitamos.",
        });
        return true;
      } catch (error) {
        push({
          variant: "error",
          title: "Não deu",
          message: extractError(error),
        });
        return false;
      }
    },
    [handleResult, push],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        handleResult(await cartService.updateItem(itemId, quantity));
      } catch (error) {
        push({
          variant: "error",
          title: "Não deu",
          message: extractError(error),
        });
      }
    },
    [handleResult, push],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        handleResult(await cartService.removeItem(itemId));
      } catch (error) {
        push({
          variant: "error",
          title: "Não deu",
          message: extractError(error),
        });
      }
    },
    [handleResult, push],
  );

  const clear = useCallback(async () => {
    try {
      handleResult(await cartService.clear());
    } catch (error) {
      push({
        variant: "error",
        title: "Não deu",
        message: extractError(error),
      });
    }
  }, [handleResult, push]);

  const applyCoupon = useCallback(
    async (code: string) => {
      try {
        handleResult(await cartService.applyCoupon(code));
        push({
          variant: "success",
          title: `Cupom ${code.toUpperCase()} aplicado`,
        });
        return true;
      } catch (error) {
        push({
          variant: "error",
          title: "Cupom",
          message: extractError(error),
        });
        return false;
      }
    },
    [handleResult, push],
  );

  const removeCoupon = useCallback(async () => {
    try {
      handleResult(await cartService.removeCoupon());
    } catch (error) {
      push({
        variant: "error",
        title: "Não deu",
        message: extractError(error),
      });
    }
  }, [handleResult, push]);

  const setShipping = useCallback(
    async (
      nextZip: string,
      method: "economico" | "expresso" = shippingMethod,
    ) => {
      const digits = nextZip.replace(/\D/g, "");
      setZipCode(digits);
      setShippingMethod(method);
      localStorage.setItem("rd:zipCode", digits);

      if (digits.length === 8) {
        try {
          setCart(await cartService.get(digits, method));
        } catch (error) {
          push({
            variant: "error",
            title: "Frete",
            message: extractError(error),
          });
        }
      }
    },
    [shippingMethod, push],
  );

  /** Easter egg #4: carrinho vazio aberto três vezes na mesma sessão. */
  const registerEmptyCartView = useCallback(() => {
    // Sem consentimento de preferências, a contagem fica só na memória da aba
    const stored = hasConsent("preferences") ? Number(sessionStorage.getItem(EMPTY_VIEWS_KEY) ?? "0") : emptyViewsMemory.current;
    const views = stored + 1;
    emptyViewsMemory.current = views;
    if (hasConsent("preferences")) sessionStorage.setItem(EMPTY_VIEWS_KEY, String(views));
    if (views === 3) void discover("CARRINHO_VAZIO_TRES_VEZES");
  }, [discover]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      itemCount: cart?.totals.itemCount ?? 0,
      zipCode,
      shippingMethod,
      addItem,
      updateItem,
      removeItem,
      clear,
      applyCoupon,
      removeCoupon,
      setShipping,
      reload,
      registerEmptyCartView,
    }),
    [
      cart,
      loading,
      zipCode,
      shippingMethod,
      addItem,
      updateItem,
      removeItem,
      clear,
      applyCoupon,
      removeCoupon,
      setShipping,
      reload,
      registerEmptyCartView,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de CartProvider");
  return context;
}
