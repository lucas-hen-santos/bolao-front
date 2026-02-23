import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rivals } from './rivals';

describe('Rivals', () => {
  let component: Rivals;
  let fixture: ComponentFixture<Rivals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rivals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rivals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
