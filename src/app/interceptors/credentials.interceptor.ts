import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Verifica se a requisição é para a nossa API
  const isApiUrl = req.url.includes(environment.apiUrl) || req.url.includes('localhost:8000');

  if (isApiUrl) {
    // Tenta buscar o token no localStorage
    const token = localStorage.getItem('access_token');
    
    // Clona a requisição adicionando o cabeçalho Authorization
    const authReq = req.clone({
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    return next(authReq);
  }

  // Se for para fora (ex: via cep), segue normal
  return next(req);
};