import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicTeam } from './public-team';

describe('PublicTeam', () => {
  let component: PublicTeam;
  let fixture: ComponentFixture<PublicTeam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicTeam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicTeam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
