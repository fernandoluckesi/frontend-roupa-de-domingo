import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { consumeAfterAuth } from "../../utils/authRedirect";
import { Button } from "../ui";

const Box = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSoft};
    font-size: 0.92rem;
    line-height: 1.5;
  }

  strong {
    color: ${({ theme }) => theme.colors.text};
  }

  .warn {
    font-size: 0.84rem;
    color: ${({ theme }) => theme.colors.textFaint};
  }
`;

/**
 * Login e cadastro com alguém já conectado: em vez de trocar de conta em silêncio
 * (o carrinho é da conta, então ele "sumiria"), mostra quem está conectado e
 * deixa a troca explícita.
 */
export function AlreadySignedIn({ action }: { action: string }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [leaving, setLeaving] = useState(false);
  if (!user) return null;

  const switchAccount = async () => {
    setLeaving(true);
    await logout();
    setLeaving(false);
  };

  return (
    <Box>
      <p>
        Você já está conectado como <strong>{user.name}</strong> ({user.email}).
      </p>
      <Button $full $size="lg" type="button" onClick={() => navigate(consumeAfterAuth("/conta"))}>
        Continuar como {user.name.split(" ")[0]}
      </Button>
      <Button $full $variant="secondary" type="button" onClick={() => void switchAccount()} disabled={leaving}>
        {leaving ? "Saindo..." : `Sair e ${action} com outra conta`}
      </Button>
      {itemCount > 0 && (
        <p className="warn">
          {itemCount === 1 ? "O item do carrinho fica" : `Os ${itemCount} itens do carrinho ficam`} guardados
          nesta conta e voltam quando você entrar nela de novo.
        </p>
      )}
    </Box>
  );
}
