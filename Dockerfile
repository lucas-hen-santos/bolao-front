# --- Estágio 1: Construção (Build) ---
FROM node:20-alpine as build

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia todo o código fonte
COPY . .

# Compila o projeto para produção
# O resultado vai para a pasta dist/bolao-ta-potente/browser
RUN npm run build

# --- Estágio 2: Servidor (Nginx) ---
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia os arquivos compilados do estágio anterior para a pasta pública do Nginx
# CONFIRA SE O NOME DO PROJETO NO angular.json É "bolao-ta-potente"
COPY --from=build /app/dist/bolao-ta-potente/browser /usr/share/nginx/html

# Copia nossa configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]