
# Deploy do Proxy Netlify para Adobe PDF Upload

## Passo 1: Deploy no Netlify

1. Vá para [netlify.com](https://netlify.com) e faça login
2. Conecte este repositório Git ao Netlify
3. Configure o build:
   - Build command: (deixe vazio)
   - Publish directory: (deixe vazio)
4. Deploy o site

## Passo 2: Atualizar URL do Proxy

Após o deploy, você receberá uma URL como: `https://seu-app.netlify.app`

1. Abra o arquivo `supabase/functions/extract-pdf-data/adobe-client.ts`
2. Na linha 45, substitua:
   ```javascript
   const proxyUrl = 'https://your-netlify-app.netlify.app/.netlify/functions/adobe-upload-proxy';
   ```
   Por:
   ```javascript
   const proxyUrl = 'https://SEU-APP-REAL.netlify.app/.netlify/functions/adobe-upload-proxy';
   ```

## Passo 3: Testar

1. Faça upload de um PDF na aplicação
2. Verifique os logs do Netlify Functions em: Netlify Dashboard > Functions > adobe-upload-proxy > Logs
3. Verifique os logs do Supabase Edge Function

## Troubleshooting

- Se o proxy falhar, o sistema automaticamente tentará o upload direto (fallback)
- Todos os logs estão disponíveis tanto no Netlify quanto no Supabase
- O erro 415 deve ser resolvido com o proxy funcionando
