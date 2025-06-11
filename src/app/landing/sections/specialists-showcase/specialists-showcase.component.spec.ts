import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistsShowcaseComponent } from './specialists-showcase.component';

describe('SpecialistsShowcaseComponent', () => {
  let component: SpecialistsShowcaseComponent;
  let fixture: ComponentFixture<SpecialistsShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistsShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialistsShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
