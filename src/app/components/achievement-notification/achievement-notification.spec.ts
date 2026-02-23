import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementNotification } from './achievement-notification';

describe('AchievementNotification', () => {
  let component: AchievementNotification;
  let fixture: ComponentFixture<AchievementNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchievementNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
