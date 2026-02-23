import { Injectable, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    
    if (title) {
      this.title.setTitle(`${title} | Bolão Tá Potente`);
    } else {
      this.title.setTitle('Bolão Tá Potente');
    }
  }
}