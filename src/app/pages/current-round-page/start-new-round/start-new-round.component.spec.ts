import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartNewRoundComponent } from './start-new-round.component';

describe('StartNewRoundComponent', () => {
  let component: StartNewRoundComponent;
  let fixture: ComponentFixture<StartNewRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StartNewRoundComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartNewRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
