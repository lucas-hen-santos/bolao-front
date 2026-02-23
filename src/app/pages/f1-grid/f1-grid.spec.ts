import { ComponentFixture, TestBed } from '@angular/core/testing';

import { F1Grid } from './f1-grid';

describe('F1Grid', () => {
  let component: F1Grid;
  let fixture: ComponentFixture<F1Grid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [F1Grid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(F1Grid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
