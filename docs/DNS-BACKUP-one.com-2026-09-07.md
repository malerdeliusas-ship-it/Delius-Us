# Backup DNS malerdelius.no (one.com), 7 septembrie 2026

Copiat din one.com > Manage DNS > DNS records > "Personal DNS settings".
Astea sunt SINGURELE inregistrari adaugate manual. Daca se pierd, site-ul si
formularul de contact cad. Se reintroduc exact asa.

| Tip   | Nume                                      | Valoare |
|-------|-------------------------------------------|---------|
| A     | malerdelius.no                            | 216.198.79.1 |
| CNAME | www.malerdelius.no                        | a2e1f7bebd522c8f.vercel-dns-017.com |
| MX    | send.send.malerdelius.no                  | 10 feedback-smtp.eu-west-1.amazonses.com |
| TXT   | resend._domainkey.send.malerdelius.no     | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDO9m5np1M45ii7x70fXlJ/2P83hqaJxx8Jhfg+gVS0SuJVZL5UWxbcTWx69HnPWEIBJTX/Nrf+4IVD2Tr4M0l/+qfNnJG6fIQeYa3/jlHx2fk6fKjNl5vn48fxZ/mohTbQqg6udTHE0FHHwPQuLQREOHsX1Qu/0e5wo+ADFYzuMQIDAQAB |
| TXT   | send.send.malerdelius.no                  | v=spf1 include:amazonses.com ~all |

Primele doua tin site-ul de pe Vercel. Ultimele trei tin formularul de contact
(verificarea Resend pentru send.malerdelius.no).

MX-urile normale (mx1..mx4.pub.mailpod13-cph3.one.com) vin din "Standard DNS
settings", nu sunt adaugate de mana. Ele servesc casuta info@malerdelius.no.

NU se apasa niciodata "Reset DNS records".

## Stare cont one.com la data asta
- Plan: Beginner, 74 NOK/luna platit anual (888 NOK/an), 1 domeniu atasat.
- Factura 42083900 din 14.09.2025: "Hosting plan Beginner 12 luni" +
  "Annual domain fee renewal (.no)", total 1.897 NOK, platita.
- Deci domeniul .no SE PLATESTE prin one.com, nu separat.
- Data innoirii domeniului: 13.11.2026. Ciclul de hosting se reinnoieste ~14.09.
- Casuta info@malerdelius.no exista, 20,43 MB din 3 GB folositi.
- one.com ofera in panou "Downgrade to Domain only" pentru malerdelius.no.
- Email Essential (fara hosting web, 5 casute, 15 GB) = 52 NOK/luna = 624 NOK/an.
