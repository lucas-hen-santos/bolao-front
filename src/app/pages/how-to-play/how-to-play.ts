import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-how-to-play',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterModule],
  templateUrl: './how-to-play.html',
  styleUrl: './how-to-play.css' // Vínculo com o novo CSS
})
export class HowToPlay {}