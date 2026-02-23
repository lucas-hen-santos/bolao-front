import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminResults } from './admin-results';

describe('AdminResults', () => {
  let component: AdminResults;
  let fixture: ComponentFixture<AdminResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
