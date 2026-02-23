import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './privacy.html'
})
export class Privacy {}