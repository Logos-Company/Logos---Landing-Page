import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpAreasComponent } from './help-areas.component';

describe('HelpAreasComponent', () => {
  let component: HelpAreasComponent;
  let fixture: ComponentFixture<HelpAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
