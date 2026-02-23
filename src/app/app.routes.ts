import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { BetMaker } from './pages/bet-maker/bet-maker';
import { Ranking } from './pages/ranking/ranking';
import { MyTeam } from './pages/my-team/my-team';
import { Profile } from './pages/profile/profile';
import { Register } from './pages/register/register';
import { authGuard } from './guards/auth.guard';

// Importações do Admin
import { AdminLayout } from './pages/admin/admin-layout/admin-layout';
import { AdminDashboard } from './pages/admin/dashboard/admin-dashboard/admin-dashboard';
import { adminGuard } from './guards/admin.guard';
import { AdminRaces } from './pages/admin/races/admin-races/admin-races';
import { AdminResults } from './pages/admin/results/admin-results/admin-results';
import { AdminGridManager } from './pages/admin/grid-manager/admin-grid-manager/admin-grid-manager';
import { AdminUsers } from './pages/admin/users/admin-users/admin-users';
import { AdminTeams } from './pages/admin/teams/admin-teams/admin-teams';
import { AdminAnnouncements } from './pages/admin/announcements/admin-announcements/admin-announcements';
import { ForgotPassword } from './pages/login/forgot-password/forgot-password';
import { ResetPassword } from './pages/login/reset-password/reset-password';
import { Rules } from './pages/rules/rules';
import { HowToPlay } from './pages/how-to-play/how-to-play';
import { Privacy } from './pages/privacy/privacy';
import { NotFound } from './pages/not-found/not-found';
import { AdminAchievements } from './pages/admin/achievements/admin-achievements/admin-achievements';
import { PublicProfile } from './pages/public-profile/public-profile';
import { PublicTeam } from './pages/public-team/public-team';
import { F1Grid } from './pages/f1-grid/f1-grid';
import { Rivals } from './pages/rivals/rivals';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rotas Públicas
  { path: 'login', component: Login, title: 'Login' },
  { path: 'register', component: Register, title: 'Novo Piloto' },
  { path: 'forgot-password', component: ForgotPassword, title: 'Recuperar Senha' },
  { path: 'reset-password', component: ResetPassword, title: 'Nova Senha' },


  // Rotas do Jogador (Protegidas)
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard, title: 'Dashboard' },
      { path: 'bet-maker', component: BetMaker, title: 'Fazer Palpite' },
      { path: 'ranking', component: Ranking, title: 'Ranking Oficial' },
      { path: 'my-team', component: MyTeam, title: 'Minha Equipe' },
      { path: 'profile', component: Profile, title: 'Meu Perfil' },
      { path: 'rules', component: Rules, title: 'Regulamento' },
      { path: 'how-to-play', component: HowToPlay, title: 'Como Jogar' },
      { path: 'privacy', component: Privacy, title: 'Privacidade' },
      { path: 'u/:id', component: PublicProfile, title: 'Perfil de Piloto' },
      { path: 't/:id', component: PublicTeam, title: 'Perfil de Equipe' },
      { path: 'grid', component: F1Grid, title: 'Grid F1 Oficial' },
      { path: 'rivals', component: Rivals, title: 'Rivais' },
    ]
  },

  // Rotas do Admin (Proteção Extra)
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard, title: 'Admin Dashboard' },
      { path: 'races', component: AdminRaces, title: 'Gestão de Corridas' },
      { path: 'results', component: AdminResults, title: 'Lançar Resultados' },
      { path: 'users', component: AdminUsers, title: 'Gestão de Usuários' },
      { path: 'teams', component: AdminTeams, title: 'Moderação de Equipes' },
      { path: 'announcements', component: AdminAnnouncements, title: 'Enviar Avisos' },
      { path: 'achievements', component: AdminAchievements, title: 'Gestão de Medalhas' },
      { path:'grid-manager', component: AdminGridManager, title: 'Gestão do Grid F1' }
    ]
  },

  { path: '**', component: NotFound, title: '404 - Fora da Pista' }
];