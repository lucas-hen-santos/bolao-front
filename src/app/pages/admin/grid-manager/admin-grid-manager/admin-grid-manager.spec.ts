import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGridManager } from './admin-grid-manager';

describe('AdminGridManager', () => {
  let component: AdminGridManager;
  let fixture: ComponentFixture<AdminGridManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGridManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminGridManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
