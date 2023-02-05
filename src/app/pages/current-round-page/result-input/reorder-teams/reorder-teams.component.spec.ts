import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderTeamsComponent } from './reorder-teams.component';

describe('ReorderTeamsComponent', () => {
  let component: ReorderTeamsComponent;
  let fixture: ComponentFixture<ReorderTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReorderTeamsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReorderTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
