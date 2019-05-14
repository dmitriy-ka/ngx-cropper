import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ngx-cropper',
  templateUrl: './ngx-cropper.component.html',
  styleUrls: ['./ngx-cropper.component.scss']
})
export class NgxCropperComponent implements OnInit, OnChanges {
  private originalImage: any;
  private originalBase64: string;

  @Input() format: 'png' | 'jpeg' = 'png';
  @Input() aspectRatio = 1;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log({ changes });
  }
}
