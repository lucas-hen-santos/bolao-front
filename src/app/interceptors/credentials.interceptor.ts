import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Verifica se a requisição é para a nossa API
  const isApiUrl = req.url.includes(environment.apiUrl) || req.url.includes('localhost:8000');

  if (isApiUrl) {
    // Clona a requisição e adiciona a flag para enviar Cookies
    const authReq = req.clone({
      withCredentials: true
    });
    return next(authReq);
  }

  // Se for para fora (ex: via cep), segue normal
  return next(req);
};