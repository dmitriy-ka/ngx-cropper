import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxCropperComponent } from './components/ngx-cropper/ngx-cropper.component';

@NgModule({
  declarations: [NgxCropperComponent],
  imports: [CommonModule],
  exports: [NgxCropperComponent]
})
export class NgxCropperModule {}
