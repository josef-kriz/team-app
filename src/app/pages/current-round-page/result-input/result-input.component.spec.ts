import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultInputComponent } from './result-input.component';

describe('ResultInputComponent', () => {
  let component: ResultInputComponent;
  let fixture: ComponentFixture<ResultInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
