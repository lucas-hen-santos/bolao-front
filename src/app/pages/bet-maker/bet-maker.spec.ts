import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetMaker } from './bet-maker';

describe('BetMaker', () => {
  let component: BetMaker;
  let fixture: ComponentFixture<BetMaker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetMaker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetMaker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
