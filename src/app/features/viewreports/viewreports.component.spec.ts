import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewreportsComponent } from './viewreports.component';

describe('ViewreportsComponent', () => {
  let component: ViewreportsComponent;
  let fixture: ComponentFixture<ViewreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewreportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
