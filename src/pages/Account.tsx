import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useEasterEggs } from "../contexts/EasterEggContext";
import { useToast } from "../contexts/ToastContext";
import { authService } from "../services/auth.service";
import { extractError } from "../services/http";
import {
  Button,
  Card,
  Container,
  Divider,
  Field,
  Input,
  Label,
  Loading,
  Modal,
  Section,
  Stack,
} from "../components/ui";
import { maskDocument, maskPhone, maskZipCode } from "../utils/format";
import type { Address } from "../types";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(5)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Head = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};

  h1 {
    font-size: 1.8rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }

  p {
    color: ${({ theme }) => theme.colors.textSoft};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const Stat = styled(Card)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(5)};

  strong {
    display: block;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.7rem;
    color: ${({ theme }) => theme.colors.accent};
  }

  small {
    font-size: 0.78rem;
    color: ${({ theme }) => theme.colors.textSoft};
  }
`;

const AddressItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSoft};

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 3px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 ${({ theme }) => theme.spacing(4)};
`;

const EMPTY_ADDRESS = {
  label: "Casa",
  recipient: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  isDefault: false,
};

export default function Account() {
  const { user, loading, refresh } = useAuth();
  const { progress } = useEasterEggs();
  const { push } = useToast();

  const [profile, setProfile] = useState({ name: "", phone: "", document: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name,
      phone: maskPhone(user.phone ?? ""),
      document: maskDocument(user.document ?? ""),
    });
    setAddresses(user.addresses ?? []);
  }, [user]);

  if (loading) return <Loading />;

  if (!user) {
    return (
      <Container>
        <Section $tight>
          <Card
            style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}
          >
            <p style={{ marginBottom: 16 }}>
              Você precisa entrar para ver sua conta.
            </p>
            <Button as={Link} to="/entrar" style={{ textDecoration: "none" }}>
              Entrar
            </Button>
          </Card>
        </Section>
      </Container>
    );
  }

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile({
        name: profile.name.trim(),
        phone: profile.phone.replace(/\D/g, "") || undefined,
        document: profile.document.replace(/\D/g, "") || undefined,
      });
      await refresh();
      push({ variant: "success", title: "Perfil atualizado" });
    } catch (error) {
      push({ variant: "error", title: "Perfil", message: extractError(error) });
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await authService.createAddress({
        ...newAddress,
        zipCode: newAddress.zipCode.replace(/\D/g, ""),
        state: newAddress.state.toUpperCase(),
      });
      setAddresses(await authService.listAddresses());
      setNewAddress(EMPTY_ADDRESS);
      setModalOpen(false);
      push({ variant: "success", title: "Endereço salvo" });
    } catch (error) {
      push({
        variant: "error",
        title: "Endereço",
        message: extractError(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    try {
      await authService.removeAddress(id);
      setAddresses((current) => current.filter((a) => a.id !== id));
    } catch (error) {
      push({
        variant: "error",
        title: "Endereço",
        message: extractError(error),
      });
    }
  };

  const updateNew = (
    key: keyof typeof EMPTY_ADDRESS,
    value: string | boolean,
  ) => setNewAddress((current) => ({ ...current, [key]: value }));

  return (
    <Section $tight>
      <Container>
        <Head>
          <h1>Olá, {user.name.split(" ")[0]}</h1>
          <p>{user.email}</p>
        </Head>

        <Stats>
          <Stat>
            <strong>{user.stats?.orders ?? 0}</strong>
            <small>pedidos feitos</small>
          </Stat>
          <Stat>
            <strong>
              {progress ? `${progress.found}/${progress.total}` : "0/9"}
            </strong>
            <small>easter eggs</small>
          </Stat>
          <Stat>
            <strong>{user.humorLevel}</strong>
            <small>nível de humor ácido</small>
          </Stat>
        </Stats>

        <Grid>
          <Card>
            <h2 style={{ fontSize: "1.1rem", marginBottom: 20 }}>Perfil</h2>
            <form onSubmit={saveProfile}>
              <Field>
                <Label htmlFor="acc-name">Nome</Label>
                <Input
                  id="acc-name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </Field>
              <Field>
                <Label htmlFor="acc-phone">Telefone</Label>
                <Input
                  id="acc-phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: maskPhone(e.target.value) })
                  }
                />
              </Field>
              <Field>
                <Label htmlFor="acc-doc">CPF</Label>
                <Input
                  id="acc-doc"
                  value={profile.document}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      document: maskDocument(e.target.value),
                    })
                  }
                />
              </Field>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 style={{ fontSize: "1.1rem", marginBottom: 20 }}>Endereços</h2>

            {addresses.length === 0 && (
              <p
                style={{ fontSize: "0.88rem", marginBottom: 16, opacity: 0.7 }}
              >
                Nenhum endereço salvo ainda.
              </p>
            )}

            {addresses.map((address) => (
              <AddressItem key={address.id}>
                <strong>
                  {address.label} {address.isDefault && "· padrão"}
                </strong>
                {address.street}, {address.number}
                {address.complement ? ` - ${address.complement}` : ""}
                <br />
                {address.district} · {address.city}/{address.state} ·{" "}
                {maskZipCode(address.zipCode)}
                <Divider style={{ margin: "12px 0" }} />
                <Button
                  $variant="ghost"
                  $size="sm"
                  onClick={() => void removeAddress(address.id)}
                >
                  Remover
                </Button>
              </AddressItem>
            ))}

            <Button $variant="secondary" onClick={() => setModalOpen(true)}>
              Adicionar endereço
            </Button>
          </Card>
        </Grid>

        <Stack $row $wrap $gap={3} style={{ marginTop: 32 }}>
          <Button
            as={Link}
            to="/conta/pedidos"
            style={{ textDecoration: "none" }}
          >
            Meus pedidos
          </Button>
          <Button
            as={Link}
            to="/trofeus"
            $variant="secondary"
            style={{ textDecoration: "none" }}
          >
            Meus troféus
          </Button>
        </Stack>

        <Modal
          open={modalOpen}
          title="Novo endereço"
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={saveAddress}>
            <FormGrid>
              <Field>
                <Label htmlFor="ad-label">Apelido</Label>
                <Input
                  id="ad-label"
                  value={newAddress.label}
                  onChange={(e) => updateNew("label", e.target.value)}
                />
              </Field>
              <Field>
                <Label htmlFor="ad-zip">CEP</Label>
                <Input
                  id="ad-zip"
                  value={newAddress.zipCode}
                  onChange={(e) =>
                    updateNew("zipCode", maskZipCode(e.target.value))
                  }
                  required
                />
              </Field>
              <Field $span={2}>
                <Label htmlFor="ad-recipient">Quem recebe</Label>
                <Input
                  id="ad-recipient"
                  value={newAddress.recipient}
                  onChange={(e) => updateNew("recipient", e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="ad-street">Rua</Label>
                <Input
                  id="ad-street"
                  value={newAddress.street}
                  onChange={(e) => updateNew("street", e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="ad-number">Número</Label>
                <Input
                  id="ad-number"
                  value={newAddress.number}
                  onChange={(e) => updateNew("number", e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="ad-complement">Complemento</Label>
                <Input
                  id="ad-complement"
                  value={newAddress.complement}
                  onChange={(e) => updateNew("complement", e.target.value)}
                />
              </Field>
              <Field>
                <Label htmlFor="ad-district">Bairro</Label>
                <Input
                  id="ad-district"
                  value={newAddress.district}
                  onChange={(e) => updateNew("district", e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="ad-city">Cidade</Label>
                <Input
                  id="ad-city"
                  value={newAddress.city}
                  onChange={(e) => updateNew("city", e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Label htmlFor="ad-state">UF</Label>
                <Input
                  id="ad-state"
                  maxLength={2}
                  value={newAddress.state}
                  onChange={(e) =>
                    updateNew("state", e.target.value.toUpperCase())
                  }
                  required
                />
              </Field>
            </FormGrid>

            <Button $full type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar endereço"}
            </Button>
          </form>
        </Modal>
      </Container>
    </Section>
  );
}
