import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAchievements } from './admin-achievements';

describe('AdminAchievements', () => {
  let component: AdminAchievements;
  let fixture: ComponentFixture<AdminAchievements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAchievements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAchievements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
