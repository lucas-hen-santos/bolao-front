import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast';
import { AchievementNotification } from './components/achievement-notification/achievement-notification';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, AchievementNotification],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bolao-ta-potente');
}
