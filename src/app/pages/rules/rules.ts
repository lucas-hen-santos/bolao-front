import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, RouterLink],
  templateUrl: './rules.html',
  styleUrl: './rules.css'
})
export class Rules {
  activeFaqIndex: number | null = null;

  faqs = [
    {
      q: "O que acontece se eu esquecer de apostar?",
      a: "Você marca 0 pontos na etapa. O sistema fecha as apostas automaticamente no horário programado, sem exceções."
    },
    {
      q: "Posso mudar meu palpite depois de salvar?",
      a: "Sim! Você pode editar seu grid quantas vezes quiser enquanto o cronômetro estiver rodando (Status 'ABERTA')."
    },
    {
      q: "Como funciona a pontuação de Equipe?",
      a: "É a soma simples: Seus Pontos + Pontos do Parceiro. Se você estiver sozinho, conta apenas os seus."
    },
    {
      q: "Se eu sair da equipe, levo meus pontos?",
      a: "Não. Os pontos conquistados ficam com a equipe (Campeonato de Construtores). Ao sair, eles são debitados do total da equipe, mas não são transferidos para uma nova."
    }
  ];

  toggleFaq(index: number) {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }
}