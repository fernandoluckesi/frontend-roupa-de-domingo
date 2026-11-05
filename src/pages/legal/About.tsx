import { Link } from "react-router-dom";
import { LegalPage } from "../../components/legal/LegalPage";
import { COMPANY, COMPANY_ADDRESS_LINE } from "../../config/company";

export default function About() {
  return (
    <LegalPage
      title="Quem somos"
      description="A Roupa de Domingo faz camisetas, moletons, canecas, capas e garrafas com estampas de humor ácido, produzidas sob demanda. Conheça a empresa e seus dados de identificação."
      path="/quem-somos"
    >
      <p>
        A Roupa de Domingo nasceu de uma constatação simples: domingo à noite é o momento mais
        honesto da semana. É quando todo mundo admite que não está bem, que a reunião podia ser
        um e-mail e que a bateria social está em 2%. A gente só passou isso para o algodão.
      </p>
      <p>
        Criamos estampas próprias de humor ácido — sem palavrão, sem ofender ninguém além da
        segunda-feira — e vendemos em camisetas, moletons, canecas, capas de celular e garrafas.
      </p>

      <h2 id="como-funciona">Como funciona</h2>
      <ul>
        <li>
          <strong>Produção sob demanda:</strong> cada peça é estampada depois que você compra,
          pelo nosso parceiro de produção (Printful). Nada fica encalhado em estoque, e não
          produzimos sobra que vira lixo.
        </li>
        <li>
          <strong>Estampas fechadas:</strong> todas as artes são criadas por nós. Você escolhe o
          produto, a cor e o tamanho.
        </li>
        <li>
          <strong>Pagamento seguro:</strong> pelo Mercado Pago, sem que dados de cartão passem
          pelos nossos servidores.
        </li>
        <li>
          <strong>Prazo real:</strong> o frete e o prazo aparecem pelo seu CEP antes da compra. Veja{" "}
          <Link to="/entrega">Entrega</Link>.
        </li>
      </ul>

      <h2 id="identificacao">Identificação do fornecedor</h2>
      <p>Informações exigidas pelo Decreto 7.962/2013 (art. 2º) para o comércio eletrônico:</p>
      <table>
        <tbody>
          <tr>
            <th>Razão social</th>
            <td>{COMPANY.legalName}</td>
          </tr>
          <tr>
            <th>Nome fantasia</th>
            <td>{COMPANY.tradeName}</td>
          </tr>
          <tr>
            <th>CNPJ</th>
            <td>{COMPANY.cnpj}</td>
          </tr>
          <tr>
            <th>Inscrição estadual</th>
            <td>{COMPANY.stateRegistration}</td>
          </tr>
          <tr>
            <th>Endereço</th>
            <td>{COMPANY_ADDRESS_LINE}</td>
          </tr>
          <tr>
            <th>E-mail (SAC)</th>
            <td>
              <a href={`mailto:${COMPANY.sacEmail}`}>{COMPANY.sacEmail}</a>
            </td>
          </tr>
          <tr>
            <th>Telefone</th>
            <td>{COMPANY.phone}</td>
          </tr>
          <tr>
            <th>WhatsApp</th>
            <td>{COMPANY.whatsapp}</td>
          </tr>
          <tr>
            <th>Atendimento</th>
            <td>
              {COMPANY.sacHours}. Resposta em até {COMPANY.sacResponseBusinessDays} dias úteis.
            </td>
          </tr>
          <tr>
            <th>Encarregado de dados (LGPD)</th>
            <td>
              {COMPANY.dpo.name} — <a href={`mailto:${COMPANY.dpo.email}`}>{COMPANY.dpo.email}</a>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Precisa falar com a gente? Use a página de <Link to="/contato">contato</Link>.
      </p>
    </LegalPage>
  );
}
