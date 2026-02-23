import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultViewer } from './result-viewer';

describe('ResultViewer', () => {
  let component: ResultViewer;
  let fixture: ComponentFixture<ResultViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
