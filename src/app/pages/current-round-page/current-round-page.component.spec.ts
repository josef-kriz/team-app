import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentRoundPageComponent } from './current-round-page.component';

describe('CurrentRoundPageComponent', () => {
  let component: CurrentRoundPageComponent;
  let fixture: ComponentFixture<CurrentRoundPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentRoundPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentRoundPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
