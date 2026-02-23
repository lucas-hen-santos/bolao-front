import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRaces } from './admin-races';

describe('AdminRaces', () => {
  let component: AdminRaces;
  let fixture: ComponentFixture<AdminRaces>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRaces]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRaces);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
